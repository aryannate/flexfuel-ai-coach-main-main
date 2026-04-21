import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { useRealtimeSync } from "./useRealtimeSync";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export interface DietPlanMeal {
  id: string;
  diet_plan_id: string;
  meal_order: number;
  time: string;
  name: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietPlan {
  id: string;
  athlete_id: string;
  trainer_id: string;
  name: string;
  total_calories: number;
  is_active: boolean;
  meals: DietPlanMeal[];
}

export function useDietPlan(athleteId?: string) {
  const { user, role } = useAuth();
  const targetId = athleteId || user?.id;

  useRealtimeSync("diet_plans", ["diet-plan", targetId || ""]);
  useRealtimeSync("diet_plan_meals", ["diet-plan", targetId || ""]);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["diet-plan", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data: plans } = await supabase
        .from("diet_plans")
        .select("*")
        .eq("athlete_id", targetId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!plans || plans.length === 0) return null;
      const p = plans[0];

      const { data: meals } = await supabase
        .from("diet_plan_meals")
        .select("*")
        .eq("diet_plan_id", p.id)
        .order("meal_order");

      return {
        ...p,
        meals: (meals || []).map((m: any) => ({
          ...m,
          foods: Array.isArray(m.foods) ? m.foods : [],
        })),
      } as DietPlan;
    },
    enabled: !!targetId,
  });

  const savePlan = useCallback(async (
    name: string,
    totalCalories: number,
    meals: Omit<DietPlanMeal, "id" | "diet_plan_id">[],
    forAthleteId: string
  ) => {
    if (!user) return;

    // Deactivate old plans
    await supabase
      .from("diet_plans")
      .update({ is_active: false } as any)
      .eq("athlete_id", forAthleteId)
      .eq("is_active", true);

    // Create new plan
    const { data: newPlan, error } = await supabase
      .from("diet_plans")
      .insert({
        athlete_id: forAthleteId,
        trainer_id: user.id,
        name,
        total_calories: totalCalories,
      } as any)
      .select()
      .single();

    if (error || !newPlan) {
      toast.error("Failed to save diet plan");
      return;
    }

    // Insert meals
    const mealInserts = meals.map((m, i) => ({
      diet_plan_id: (newPlan as any).id,
      meal_order: i,
      time: m.time,
      name: m.name,
      foods: m.foods,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fats: m.fats,
    }));

    await supabase.from("diet_plan_meals").insert(mealInserts as any);
    toast.success("Diet plan saved and synced to athlete!");
  }, [user]);

  return { plan, loading: isLoading, savePlan };
}
