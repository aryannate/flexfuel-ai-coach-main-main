import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useAuth } from "@/lib/authContext";

export interface MealUploadRow {
  id: string;
  athlete_id: string;
  image_url: string | null;
  status: "logged" | "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  meal_type: string | null;
  day: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealAnalysisRow {
  id: string;
  meal_upload_id: string;
  foods: any;
  totals: any;
  micronutrients: any;
  suggestions: any;
  confidence: number | null;
  meal_type: string | null;
  created_at: string;
}

export interface TrainerOverrideRow {
  id: string;
  meal_upload_id: string;
  trainer_id: string;
  edited_foods: any;
  edited_totals: any;
  nutrient_notes: any;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  meal_upload_id: string | null;
  is_read: boolean;
  created_at: string;
}

// Hook for athlete: subscribe to own meal status changes & notifications
export function useAthleteMealSync() {
  const [meals, setMeals] = useState<(MealUploadRow & { analysis?: MealAnalysisRow })[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = useCallback(async () => {
    const { data: uploads, error } = await supabase
      .from("meal_uploads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && uploads) {
      const ids = uploads.map((u) => u.id);
      const { data: analysisData } = await supabase
        .from("meal_analysis_results")
        .select("*")
        .in("meal_upload_id", ids);

      const analysisMap = new Map((analysisData || []).map(a => [a.meal_upload_id, a]));
      
      const enriched = uploads.map(u => ({
        ...u,
        analysis: analysisMap.get(u.id) as MealAnalysisRow | undefined
      }));

      setMeals(enriched as any);
    }
    setLoading(false);
  }, []);

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("is_read", false)
      .order("created_at", { ascending: false });
    if (data) setNotifications(data as NotificationRow[]);
  }, []);

  useEffect(() => {
    fetchMeals();
    fetchNotifications();

    const mealChannel = supabase
      .channel("athlete-meal-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "meal_uploads" },
        (payload: RealtimePostgresChangesPayload<MealUploadRow>) => {
          const updated = payload.new as MealUploadRow;
          setMeals((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
          if (updated.status === "approved") {
            toast.success("Meal approved by Coach Sachin! ✅");
          } else if (updated.status === "rejected") {
            toast.error(`Meal rejected: ${updated.rejection_reason || "See trainer notes"}`);
          }
        }
      )
      .subscribe();

    const notifChannel = supabase
      .channel("athlete-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
          const notif = payload.new as NotificationRow;
          setNotifications((prev) => [notif, ...prev]);
          toast.info(notif.title);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mealChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [fetchMeals, fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { meals, notifications, loading, refetchMeals: fetchMeals, markRead };
}

// Hook for trainer: view meals from assigned athletes only
export function useTrainerMealSync() {
  const { user, role } = useAuth();
  const [meals, setMeals] = useState<(MealUploadRow & { analysis?: MealAnalysisRow; athlete_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin";

  const fetchMeals = useCallback(async () => {
    if (!user) return;

    let athleteIds: string[] = [];

    // Step 1: If coach/trainer, get ONLY assigned athletes
    if (!isAdmin) {
      const { data: myAthletes } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("trainer_id", user.id);
      
      athleteIds = myAthletes?.map((a) => a.user_id) || [];
      
      // If we have no athletes assigned, we can't see any meals
      if (athleteIds.length === 0) {
        setMeals([]);
        setLoading(false);
        return;
      }
    }

    // Step 2: Fetch meals
    let query = supabase
      .from("meal_uploads")
      .select("*")
      .order("created_at", { ascending: false });

    // Step 3: Enforce scoping on frontend (RLS enforces on backend)
    if (!isAdmin) {
      query = query.in("athlete_id", athleteIds);
    }

    const { data: uploads } = await query;

    if (!uploads || uploads.length === 0) {
      setMeals([]);
      setLoading(false);
      return;
    }

    const ids = uploads.map((u) => u.id);
    const uids = [...new Set(uploads.map((u) => u.athlete_id))];

    const [analysisRes, profilesRes] = await Promise.all([
      supabase.from("meal_analysis_results").select("*").in("meal_upload_id", ids),
      supabase.from("profiles").select("user_id, display_name").in("user_id", uids),
    ]);

    const analysisMap = new Map((analysisRes.data ?? []).map((a) => [a.meal_upload_id, a]));
    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.user_id, p.display_name]));

    const enriched = uploads.map((u) => ({
      ...u,
      analysis: analysisMap.get(u.id) as MealAnalysisRow | undefined,
      athlete_name: profileMap.get(u.athlete_id) || "Unknown Athlete",
    }));

    setMeals(enriched as any);
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    fetchMeals();

    const channel = supabase
      .channel("trainer-meal-watch")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "meal_uploads" },
        () => {
          toast.info("🍽️ An athlete just logged a meal!");
          fetchMeals();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMeals]);

  return { meals, loading, refetch: fetchMeals };
}