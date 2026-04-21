import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { useRealtimeSync } from "./useRealtimeSync";
import { useQuery } from "@tanstack/react-query";

export interface StreakEntry {
  date: string;
  completed: boolean;
  details: string | null;
}

export function useStreakData(athleteId?: string) {
  const { user } = useAuth();
  const targetId = athleteId || user?.id;

  useRealtimeSync("streak_data", ["streak-data", targetId || ""]);

  const { data: streaks = [], isLoading } = useQuery({
    queryKey: ["streak-data", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data } = await supabase
        .from("streak_data")
        .select("date, completed, details")
        .eq("athlete_id", targetId)
        .gte("date", oneYearAgo.toISOString().split("T")[0])
        .order("date");

      return (data || []) as StreakEntry[];
    },
    enabled: !!targetId,
  });

  // Build full 365-day array
  const fullData = (() => {
    const map = new Map(streaks.map((s) => [s.date, s]));
    const days: { date: string; completed: boolean; details: string | null }[] = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = map.get(dateStr);
      days.push({
        date: dateStr,
        completed: entry?.completed || false,
        details: entry?.details || null,
      });
    }
    return days;
  })();

  return { streaks: fullData, loading: isLoading };
}

// For trainer: get all athletes' streaks
export function useAllAthletesStreaks() {
  const { user, role } = useAuth();

  const { data: athleteStreaks = [], isLoading } = useQuery({
    queryKey: ["all-athlete-streaks"],
    queryFn: async () => {
      if (!user || role !== "trainer") return [];
      
      // Get assigned athletes
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .eq("trainer_id", user.id);

      if (!profiles || profiles.length === 0) return [];

      const result = [];
      for (const p of profiles) {
        const { data: streaks } = await supabase
          .from("streak_data")
          .select("completed")
          .eq("athlete_id", p.user_id)
          .eq("completed", true);
        
        // Calculate current streak
        const { data: recent } = await supabase
          .from("streak_data")
          .select("date, completed")
          .eq("athlete_id", p.user_id)
          .order("date", { ascending: false })
          .limit(60);

        let currentStreak = 0;
        if (recent) {
          for (const s of recent) {
            if (s.completed) currentStreak++;
            else break;
          }
        }

        result.push({
          name: p.display_name || "Athlete",
          id: p.user_id,
          streak: currentStreak,
          totalDays: streaks?.length || 0,
          status: currentStreak > 0 ? "active" : "inactive",
        });
      }
      return result;
    },
    enabled: !!user && role === "trainer",
  });

  return { athleteStreaks, loading: isLoading };
}
