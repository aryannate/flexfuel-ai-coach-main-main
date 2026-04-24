import { motion } from "framer-motion";
import { Flame, Beef, Wheat, Droplets, TrendingUp, Camera, Scale, Zap } from "lucide-react";
import { mockWeeklyData } from "@/lib/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import StreakHeatmap from "@/components/StreakHeatmap";
import { useAuth } from "@/lib/authContext";
import { useDietPlan } from "@/hooks/useDietPlan";
import { useMealLogs } from "@/hooks/useMealLogs";
import { useAthleteMealSync } from "@/hooks/useMealSync";

export default function AthleteDashboard() {
  const { user } = useAuth();
  const { plan } = useDietPlan();
  const { logs } = useMealLogs();
  const { meals, notifications } = useAthleteMealSync();
  const [waterGlasses, setWaterGlasses] = useState(5);

  // Calculate today's actual logged macros from 12 AM
  const todayMealUploads = meals.filter(m => {
    const mealDate = new Date(m.created_at);
    const today = new Date();
    // Compare dates locally to check if it's "today"
    return mealDate.getDate() === today.getDate() &&
           mealDate.getMonth() === today.getMonth() &&
           mealDate.getFullYear() === today.getFullYear() &&
           m.status !== "rejected";
  });

  const todayCalories = Math.round(todayMealUploads.reduce((acc, m) => acc + (m.analysis?.totals?.calories || 0), 0));
  const todayProtein = Math.round(todayMealUploads.reduce((acc, m) => acc + (m.analysis?.totals?.protein || 0), 0));
  const todayCarbs = Math.round(todayMealUploads.reduce((acc, m) => acc + (m.analysis?.totals?.carbs || 0), 0));
  const todayFats = Math.round(todayMealUploads.reduce((acc, m) => acc + (m.analysis?.totals?.fats || 0), 0));

  const targetPlanCal = plan?.total_calories || 0;

  const todayStats = [
    { label: "Daily Calories", value: `${todayCalories}`, target: targetPlanCal ? `${targetPlanCal}` : "—", pct: targetPlanCal ? Math.round((todayCalories / targetPlanCal) * 100) : 0, icon: Flame, bg: "bg-pastel-yellow" },
    { label: "Protein (g)", value: `${todayProtein}`, target: "", pct: 0, icon: Beef, bg: "bg-pastel-pink" },
    { label: "Carbs (g)", value: `${todayCarbs}`, target: "", pct: 0, icon: Wheat, bg: "bg-pastel-sky" },
    { label: "Fats (g)", value: `${todayFats}`, target: "", pct: 0, icon: Droplets, bg: "bg-pastel-sage" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">Hello, {user?.name || "Athlete"}!</h1>
            <p className="text-muted-foreground mt-1 text-sm">{plan?.name || "No plan assigned yet"}</p>
          </div>
          <Link to="/athlete/scan" className="self-start sm:self-auto">
            <Button className="rounded-full gap-2 h-11 px-5">
              <Camera className="w-5 h-5" /> Scan Meal
            </Button>
          </Link>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {todayStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`${stat.bg} pastel-card`}>
              <stat.icon className="w-5 h-5 mb-2 opacity-60" />
              <p className="text-2xl font-bold font-heading">{stat.value}</p>
              {stat.target && <p className="text-xs text-foreground/50 mt-0.5">of {stat.target}</p>}
              {stat.pct > 0 && (
                <div className="w-full bg-foreground/10 rounded-full h-2 mt-3">
                  <motion.div className="h-2 rounded-full bg-foreground/30" initial={{ width: 0 }} animate={{ width: `${Math.min(stat.pct, 100)}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-pastel-lavender pastel-card flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full border-4 border-foreground/20 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold font-heading">
                {plan?.meals.length ? Math.round((logs.filter(l => l.status === "completed").length / plan.meals.length) * 100) : 0}%
              </span>
            </div>
            <p className="font-bold font-heading">Today's Compliance</p>
            <p className="text-sm text-foreground/60 mt-1">Keep it up 💪</p>
          </div>
          <div className="bg-pastel-sky pastel-card">
            <h3 className="font-bold font-heading mb-4 flex items-center gap-2"><Droplets className="w-5 h-5" /> Water Intake</h3>
            <div className="flex gap-2 flex-wrap mb-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <button key={i} onClick={() => setWaterGlasses(i + 1)} className={`w-8 h-8 rounded-xl text-sm transition-all ${i < waterGlasses ? "bg-foreground/20" : "bg-foreground/5"}`}>💧</button>
              ))}
            </div>
            <p className="text-sm text-foreground/60">{waterGlasses} / 10 glasses today</p>
          </div>
          <div className="bg-pastel-peach pastel-card">
            <h3 className="font-bold font-heading mb-3 flex items-center gap-2"><Scale className="w-5 h-5" /> Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-foreground/60">No new notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="bg-card rounded-xl p-2 text-xs">
                    <p className="font-medium">{n.title}</p>
                    {n.message && <p className="text-foreground/60">{n.message}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Streak Heatmap */}
        <div>
          <h3 className="font-bold font-heading text-lg mb-4">🔥 Your Consistency</h3>
          <StreakHeatmap />
        </div>

        {/* Progress Chart */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h3 className="font-bold font-heading mb-4">Calorie Trend This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockWeeklyData}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(48,100%,75%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(48,100%,75%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="calories" stroke="hsl(48,80%,55%)" fill="url(#calGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Diet Plan Meals */}
        {plan && (
          <div>
            <h3 className="font-bold font-heading text-lg mb-4">Today's Meals</h3>
            <div className="space-y-3">
              {plan.meals.map((meal) => {
                const logged = logs.some(l => l.diet_plan_meal_id === meal.id);
                const logStatus = logs.find(l => l.diet_plan_meal_id === meal.id)?.status;
                return (
                  <div key={meal.id} className="bg-card rounded-3xl p-5 border border-border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pastel-yellow flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {meal.time.split(" ")[0].split(":")[0]}
                      <span className="text-[8px] ml-0.5">{meal.time.split(" ")[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{meal.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{meal.foods.join(", ")}</p>
                    </div>
                    <div className="hidden sm:grid grid-cols-3 gap-3 text-center text-xs">
                      <div><p className="font-bold">{meal.calories}</p><p className="text-foreground/50">cal</p></div>
                      <div><p className="font-bold">{meal.protein}g</p><p className="text-foreground/50">pro</p></div>
                      <div><p className="font-bold">{meal.carbs}g</p><p className="text-foreground/50">carb</p></div>
                    </div>
                    {logged ? (
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${logStatus === "completed" ? "bg-pastel-sage" : "bg-pastel-coral"}`}>
                        {logStatus === "completed" ? "✓ Done" : "⊘ Skip"}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-pastel-coral flex-shrink-0">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Meal Scans */}
        {meals.length > 0 && (
          <div>
            <h3 className="font-bold font-heading text-lg mb-4">Recent Meal Scans</h3>
            <div className="space-y-3">
              {meals.slice(0, 5).map((meal) => (
                <div key={meal.id} className="bg-card rounded-3xl p-4 border border-border flex items-center gap-4">
                  {meal.image_url && (
                    <img src={meal.image_url} alt="Meal" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{meal.meal_type || "Meal"} · {meal.day}</p>
                    <p className="text-xs text-muted-foreground">{new Date(meal.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    meal.status === "approved" ? "bg-pastel-sage" : meal.status === "rejected" ? "bg-pastel-coral" : "bg-pastel-yellow"
                  }`}>
                    {meal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
