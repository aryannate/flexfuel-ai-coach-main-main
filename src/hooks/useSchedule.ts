import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { useRealtimeSync } from "./useRealtimeSync";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ScheduleEntry {
  id: string;
  athlete_id: string;
  trainer_id: string;
  day: string;
  workout_type: string;
  workout_name: string;
  target_calories: number;
  target_carbs: number;
  notes: string | null;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function useSchedule(athleteId?: string) {
  const { user, role } = useAuth();
  const targetId = athleteId || user?.id;

  useRealtimeSync("schedules", ["schedules", targetId || ""]);

  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ["schedules", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data } = await supabase
        .from("schedules")
        .select("*")
        .eq("athlete_id", targetId)
        .order("day");
      return (data || []) as ScheduleEntry[];
    },
    enabled: !!targetId,
  });

  const upsertDay = useCallback(async (day: string, entry: Partial<ScheduleEntry>) => {
    if (!user || !targetId) return;
    const existing = schedule.find((s) => s.day === day);
    if (existing) {
      await supabase
        .from("schedules")
        .update(entry as any)
        .eq("id", existing.id);
    } else {
      await supabase.from("schedules").insert({
        athlete_id: targetId,
        trainer_id: user.id,
        day,
        ...entry,
      } as any);
    }
    toast.success(`${day} schedule updated`);
  }, [user, targetId, schedule]);

  // Build a full week view with defaults
  const weekSchedule = DAYS.map((day) => {
    const entry = schedule.find((s) => s.day === day);
    return entry || {
      id: "",
      athlete_id: targetId || "",
      trainer_id: "",
      day,
      workout_type: "rest",
      workout_name: "Not set",
      target_calories: 0,
      target_carbs: 0,
      notes: null,
    };
  });

  return { schedule: weekSchedule, loading: isLoading, upsertDay };
}
