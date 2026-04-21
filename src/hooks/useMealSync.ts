import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface MealUploadRow {
  id: string;
  athlete_id: string;
  image_url: string | null;
  status: "pending" | "approved" | "rejected";
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
  const [meals, setMeals] = useState<MealUploadRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = useCallback(async () => {
    const { data, error } = await supabase
      .from("meal_uploads")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMeals(data as MealUploadRow[]);
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

// Hook for trainer: view all meals, approve/reject, override
export function useTrainerMealSync() {
  const [meals, setMeals] = useState<(MealUploadRow & { analysis?: MealAnalysisRow; override?: TrainerOverrideRow })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = useCallback(async () => {
    const { data: uploads } = await supabase
      .from("meal_uploads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!uploads) { setLoading(false); return; }

    const ids = uploads.map((u) => u.id);

    const [analysisRes, overrideRes] = await Promise.all([
      supabase.from("meal_analysis_results").select("*").in("meal_upload_id", ids),
      supabase.from("trainer_overrides").select("*").in("meal_upload_id", ids),
    ]);

    const analysisMap = new Map((analysisRes.data ?? []).map((a) => [a.meal_upload_id, a]));
    const overrideMap = new Map((overrideRes.data ?? []).map((o) => [o.meal_upload_id, o]));

    const enriched = uploads.map((u) => ({
      ...u,
      analysis: analysisMap.get(u.id) as MealAnalysisRow | undefined,
      override: overrideMap.get(u.id) as TrainerOverrideRow | undefined,
    }));

    setMeals(enriched as any);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMeals();

    const channel = supabase
      .channel("trainer-meal-watch")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "meal_uploads" },
        () => {
          toast.info("New meal uploaded by an athlete!");
          fetchMeals();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMeals]);

  const approveMeal = useCallback(async (mealId: string, athleteId: string) => {
    const { error } = await supabase
      .from("meal_uploads")
      .update({ status: "approved" as any })
      .eq("id", mealId);
    if (error) { toast.error("Failed to approve"); return; }

    await supabase.from("notifications").insert({
      user_id: athleteId,
      type: "meal_approved",
      title: "Meal Approved ✅",
      message: "Coach Sachin approved your meal log.",
      meal_upload_id: mealId,
    } as any);

    toast.success("Meal approved");
    fetchMeals();
  }, [fetchMeals]);

  const rejectMeal = useCallback(async (mealId: string, athleteId: string, reason: string) => {
    const { error } = await supabase
      .from("meal_uploads")
      .update({ status: "rejected" as any, rejection_reason: reason })
      .eq("id", mealId);
    if (error) { toast.error("Failed to reject"); return; }

    await supabase.from("notifications").insert({
      user_id: athleteId,
      type: "meal_rejected",
      title: "Meal Rejected ❌",
      message: reason || "Please review trainer notes.",
      meal_upload_id: mealId,
    } as any);

    toast.success("Meal rejected with feedback");
    fetchMeals();
  }, [fetchMeals]);

  const saveOverride = useCallback(async (
    mealId: string,
    trainerId: string,
    nutrientNotes: Record<string, string>,
    editedFoods?: any,
    editedTotals?: any
  ) => {
    // Upsert override
    const existing = meals.find((m) => m.id === mealId)?.override;
    if (existing) {
      await supabase
        .from("trainer_overrides")
        .update({
          nutrient_notes: nutrientNotes as any,
          ...(editedFoods ? { edited_foods: editedFoods } : {}),
          ...(editedTotals ? { edited_totals: editedTotals } : {}),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("trainer_overrides").insert({
        meal_upload_id: mealId,
        trainer_id: trainerId,
        nutrient_notes: nutrientNotes as any,
        ...(editedFoods ? { edited_foods: editedFoods } : {}),
        ...(editedTotals ? { edited_totals: editedTotals } : {}),
      } as any);
    }

    toast.success("Trainer notes saved");
    fetchMeals();
  }, [fetchMeals, meals]);

  return { meals, loading, approveMeal, rejectMeal, saveOverride, refetch: fetchMeals };
}