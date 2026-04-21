import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, AlertTriangle, X } from "lucide-react";
import { useStreakData, useAllAthletesStreaks } from "@/hooks/useStreakData";

interface DayData {
  date: string;
  completed: boolean;
  details: string | null;
}

function getIntensity(dayData: DayData[], weekIdx: number, dayIdx: number): number {
  const idx = weekIdx * 7 + dayIdx;
  if (idx >= dayData.length) return -1;
  if (!dayData[idx].completed) return 0;
  let streak = 1;
  for (let i = idx - 1; i >= Math.max(0, idx - 6); i--) {
    if (dayData[i].completed) streak++;
    else break;
  }
  if (streak >= 7) return 4;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

const intensityColors = [
  "bg-muted",
  "bg-emerald-200",
  "bg-emerald-300",
  "bg-emerald-400",
  "bg-emerald-500",
];

interface StreakHeatmapProps {
  showAthleteComparison?: boolean;
  athleteId?: string;
}

export default function StreakHeatmap({ showAthleteComparison, athleteId }: StreakHeatmapProps) {
  const { streaks: streakData, loading } = useStreakData(athleteId);
  const { athleteStreaks } = useAllAthletesStreaks();
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  if (loading) return <div className="text-center text-muted-foreground py-4">Loading streak data...</div>;

  const totalDays = streakData.length;
  const completedDays = streakData.filter((d) => d.completed).length;
  const missedDays = totalDays - completedDays;

  let currentStreak = 0;
  for (let i = streakData.length - 1; i >= 0; i--) {
    if (streakData[i].completed) currentStreak++;
    else break;
  }

  let longestStreak = 0;
  let temp = 0;
  for (const d of streakData) {
    if (d.completed) { temp++; longestStreak = Math.max(longestStreak, temp); }
    else temp = 0;
  }

  const last7 = streakData.slice(-7);
  const weeklyPct = Math.round((last7.filter((d) => d.completed).length / 7) * 100);

  const weeks = Math.ceil(totalDays / 7);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-pastel-sage pastel-card text-center p-4">
          <Flame className="w-5 h-5 mx-auto mb-1 opacity-70" />
          <p className="text-2xl font-bold font-heading">{currentStreak}</p>
          <p className="text-[10px] text-foreground/60">Current Streak</p>
        </div>
        <div className="bg-pastel-yellow pastel-card text-center p-4">
          <Trophy className="w-5 h-5 mx-auto mb-1 opacity-70" />
          <p className="text-2xl font-bold font-heading">{longestStreak}</p>
          <p className="text-[10px] text-foreground/60">Longest Streak</p>
        </div>
        <div className="bg-pastel-coral pastel-card text-center p-4">
          <AlertTriangle className="w-5 h-5 mx-auto mb-1 opacity-70" />
          <p className="text-2xl font-bold font-heading">{missedDays}</p>
          <p className="text-[10px] text-foreground/60">Missed Days</p>
        </div>
        <div className="bg-pastel-sky pastel-card text-center p-4">
          <p className="text-2xl font-bold font-heading">{weeklyPct}%</p>
          <p className="text-[10px] text-foreground/60">Weekly Completion</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-card rounded-3xl p-5 border border-border overflow-x-auto">
        <h3 className="font-bold font-heading mb-4">Consistency Heatmap</h3>
        <div className="flex gap-[3px] min-w-[700px]">
          {Array.from({ length: weeks }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const intensity = getIntensity(streakData, weekIdx, dayIdx);
                if (intensity === -1) return <div key={dayIdx} className="w-3 h-3" />;
                const idx = weekIdx * 7 + dayIdx;
                return (
                  <button
                    key={dayIdx}
                    onClick={() => setSelectedDay(streakData[idx])}
                    className={`w-3 h-3 rounded-sm ${intensityColors[intensity]} hover:ring-1 hover:ring-foreground/30 transition-all`}
                    title={streakData[idx]?.date}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          {intensityColors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Day detail popup */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-sm">{selectedDay.date}</p>
              <p className="text-xs text-muted-foreground">{selectedDay.details || (selectedDay.completed ? "Completed" : "No activity")}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${selectedDay.completed ? "bg-pastel-sage" : "bg-pastel-coral"}`}>
                {selectedDay.completed ? "Completed ✓" : "Missed ✗"}
              </span>
            </div>
            <button onClick={() => setSelectedDay(null)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trainer: athlete comparison */}
      {showAthleteComparison && (
        <div className="bg-card rounded-3xl p-5 border border-border">
          <h3 className="font-bold font-heading mb-4">Athlete Streak Comparison</h3>
          {athleteStreaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No athletes assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {[...athleteStreaks].sort((a, b) => b.streak - a.streak).map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pastel-lavender flex items-center justify-center text-xs font-bold">
                    {a.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{a.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "active" ? "bg-pastel-sage" : "bg-pastel-coral"}`}>
                        {a.status === "active" ? `${a.streak} days 🔥` : "Inactive"}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full bg-emerald-400 transition-all"
                        style={{ width: `${Math.min(100, (a.streak / 50) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
