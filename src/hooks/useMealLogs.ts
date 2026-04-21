import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { useRealtimeSync } from "./useRealtimeSync";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface MealLog {
  id: string;
  athlete_id: string;
  diet_plan_meal_id: string | null;
  meal_upload_id: string | null;
  date: string;
  status: "completed" | "skipped";
  notes: string | null;
  created_at: string;
}

export function useMealLogs(athleteId?: string) {
  const { user } = useAuth();
  const targetId = athleteId || user?.id;
  const queryClient = useQueryClient();

  useRealtimeSync("meal_logs", ["meal-logs", targetId || ""]);

  const today = new Date().toISOString().split("T")[0];

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["meal-logs", targetId, today],
    queryFn: async () => {
      if (!targetId) return [];
      const { data } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("athlete_id", targetId)
        .eq("date", today);
      return (data || []) as MealLog[];
    },
    enabled: !!targetId,
  });

  const logMeal = useCallback(async (
    dietPlanMealId: string | null,
    mealUploadId: string | null,
    status: "completed" | "skipped"
  ) => {
    if (!user) return;
    await supabase.from("meal_logs").insert({
      athlete_id: user.id,
      diet_plan_meal_id: dietPlanMealId,
      meal_upload_id: mealUploadId,
      date: today,
      status,
    } as any);

    // Update streak
    await supabase.from("streak_data").upsert({
      athlete_id: user.id,
      date: today,
      completed: true,
      details: status === "completed" ? "Meal logged" : "Meal skipped",
    } as any, { onConflict: "athlete_id,date" });

    queryClient.invalidateQueries({ queryKey: ["meal-logs"] });
    queryClient.invalidateQueries({ queryKey: ["streak-data"] });
    toast.success(status === "completed" ? "Meal logged ✅" : "Meal marked as skipped");
  }, [user, today, queryClient]);

  return { logs, loading: isLoading, logMeal };
}
