import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface TrackedMeal {
  id: string;
  image_url: string | null;
  meal_type: string | null;
  status: string;
  created_at: string;
  foods: any[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    glycemicLoad: number;
    insulinSpike: string;
    mealScore: number;
    suitabilityScore: number;
    healthScore: number;
  };
  micronutrients: Record<string, number>;
  suggestions: string[];
  confidence: number | null;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  goodFat: number;
  badFat: number;
  simpleCarbs: number;
  complexCarbs: number;
  avgMealScore: number;
  avgGlycemicLoad: number;
}

export interface MicroTotals {
  [key: string]: number;
}

export function useDailyTracker(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  const queryClient = useQueryClient();

  // Today's date boundaries (local midnight to now)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  // Fetch today's meals
  const { data: meals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ["daily-tracker-meals", targetId, todayISO],
    queryFn: async () => {
      if (!targetId) return [];

      const { data: uploads } = await supabase
        .from("meal_uploads")
        .select("*")
        .eq("athlete_id", targetId)
        .gte("created_at", todayISO)
        .order("created_at", { ascending: true });

      if (!uploads || uploads.length === 0) return [];

      const ids = uploads.map((u) => u.id);
      const { data: analyses } = await supabase
        .from("meal_analysis_results")
        .select("*")
        .in("meal_upload_id", ids);

      const analysisMap = new Map((analyses || []).map((a) => [a.meal_upload_id, a]));

      return uploads.map((u) => {
        const a = analysisMap.get(u.id);
        return {
          id: u.id,
          image_url: u.image_url,
          meal_type: u.meal_type,
          status: u.status,
          created_at: u.created_at,
          foods: (a?.foods as any[]) || [],
          totals: (a?.totals as any) || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
          micronutrients: (a?.micronutrients as Record<string, number>) || {},
          suggestions: (a?.suggestions as string[]) || [],
          confidence: a?.confidence ?? null,
        } as TrackedMeal;
      });
    },
    enabled: !!targetId,
    refetchInterval: 30000,
  });

  // Compute macro totals
  const macroTotals: DailyTotals = meals.reduce(
    (acc, m) => {
      acc.calories += m.totals.calories || 0;
      acc.protein += m.totals.protein || 0;
      acc.carbs += m.totals.carbs || 0;
      acc.fats += m.totals.fats || 0;
      acc.fiber += m.totals.fiber || 0;
      acc.avgMealScore += m.totals.mealScore || 0;
      acc.avgGlycemicLoad += m.totals.glycemicLoad || 0;

      // Sum from individual foods
      m.foods.forEach((f: any) => {
        acc.goodFat += f.goodFat || 0;
        acc.badFat += f.badFat || 0;
        acc.simpleCarbs += f.simpleCarbs || 0;
        acc.complexCarbs += f.complexCarbs || 0;
      });

      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, goodFat: 0, badFat: 0, simpleCarbs: 0, complexCarbs: 0, avgMealScore: 0, avgGlycemicLoad: 0 }
  );

  if (meals.length > 0) {
    macroTotals.avgMealScore = Math.round(macroTotals.avgMealScore / meals.length);
    macroTotals.avgGlycemicLoad = Math.round(macroTotals.avgGlycemicLoad / meals.length);
  }

  // Compute micro totals
  const microTotals: MicroTotals = {};
  meals.forEach((m) => {
    Object.entries(m.micronutrients).forEach(([key, val]) => {
      microTotals[key] = (microTotals[key] || 0) + (val || 0);
    });
  });

  // Water tracking
  const todayDate = new Date().toISOString().split("T")[0];

  const { data: waterData } = useQuery({
    queryKey: ["water-log", targetId, todayDate],
    queryFn: async () => {
      if (!targetId) return null;
      const { data } = await supabase
        .from("water_logs")
        .select("*")
        .eq("user_id", targetId)
        .eq("date", todayDate)
        .maybeSingle();
      return data;
    },
    enabled: !!targetId,
  });

  const waterGlasses = (waterData as any)?.glasses || 0;

  const setWater = useCallback(
    async (glasses: number) => {
      if (!targetId) return;
      await supabase
        .from("water_logs")
        .upsert(
          { user_id: targetId, date: todayDate, glasses } as any,
          { onConflict: "user_id,date" }
        );
      queryClient.invalidateQueries({ queryKey: ["water-log", targetId, todayDate] });
    },
    [targetId, todayDate, queryClient]
  );

  return {
    meals,
    macroTotals,
    microTotals,
    waterGlasses,
    setWater,
    loading: mealsLoading,
    mealCount: meals.length,
  };
}
