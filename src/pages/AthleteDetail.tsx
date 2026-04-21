import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Flame, Beef, Wheat, Droplets, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type ViewMode = "daily" | "weekly" | "monthly";

export default function AthleteDetail() {
  const { athleteId } = useParams<{ athleteId: string }>();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  // Fetch athlete profile
  const { data: athlete } = useQuery({
    queryKey: ["athlete-profile", athleteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", athleteId!)
        .maybeSingle();
      return data;
    },
    enabled: !!athleteId,
  });

  // Fetch meals for the selected date range
  const dateRange = useMemo(() => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    if (viewMode === "weekly") {
      start.setDate(start.getDate() - 6);
    } else if (viewMode === "monthly") {
      start.setDate(start.getDate() - 29);
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }, [selectedDate, viewMode]);

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ["athlete-meals", athleteId, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!athleteId) return [];
      const { data: uploads } = await supabase
        .from("meal_uploads")
        .select("*")
        .eq("athlete_id", athleteId)
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)
        .order("created_at", { ascending: false });

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
          ...u,
          analysis: a ? {
            foods: a.foods as any[],
            totals: a.totals as any,
            micronutrients: a.micronutrients as any,
          } : null,
        };
      });
    },
    enabled: !!athleteId,
  });

  // Compute daily totals
  const dailyTotals = useMemo(() => {
    return meals.reduce(
      (acc, m) => {
        if (m.analysis?.totals) {
          acc.calories += m.analysis.totals.calories || 0;
          acc.protein += m.analysis.totals.protein || 0;
          acc.carbs += m.analysis.totals.carbs || 0;
          acc.fats += m.analysis.totals.fats || 0;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [meals]);

  // Build chart data for weekly/monthly views
  const chartData = useMemo(() => {
    if (viewMode === "daily") return [];

    const days = viewMode === "weekly" ? 7 : 30;
    const data: { day: string; calories: number; protein: number; carbs: number; fats: number; mealCount: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", viewMode === "weekly" ? { weekday: "short" } : { month: "short", day: "numeric" });

      const dayMeals = meals.filter((m) => m.created_at.startsWith(dateStr));
      const totals = dayMeals.reduce(
        (acc, m) => {
          if (m.analysis?.totals) {
            acc.calories += m.analysis.totals.calories || 0;
            acc.protein += m.analysis.totals.protein || 0;
            acc.carbs += m.analysis.totals.carbs || 0;
            acc.fats += m.analysis.totals.fats || 0;
          }
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

      data.push({ day: label, mealCount: dayMeals.length, ...totals });
    }
    return data;
  }, [meals, viewMode, selectedDate]);

  // Pie chart data
  const pieData = [
    { name: "Protein", value: Math.round(dailyTotals.protein), color: "hsl(340,80%,75%)" },
    { name: "Carbs", value: Math.round(dailyTotals.carbs), color: "hsl(200,70%,75%)" },
    { name: "Fats", value: Math.round(dailyTotals.fats), color: "hsl(120,30%,72%)" },
  ];

  const athleteName = athlete?.display_name || "Athlete";
  const avatar = athleteName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/coach/athletes">
            <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="w-14 h-14 rounded-full bg-pastel-lavender flex items-center justify-center text-lg font-bold flex-shrink-0">
            {avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-heading">{athleteName}</h1>
            <p className="text-muted-foreground text-sm">Detailed meal analysis & performance tracking</p>
          </div>
        </div>

        {/* View Mode & Date Picker */}
        <div className="flex flex-wrap items-center gap-3">
          {(["daily", "weekly", "monthly"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all capitalize ${
                viewMode === mode ? "bg-primary text-primary-foreground" : "bg-card border border-border"
              }`}
            >
              {mode}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-xl w-auto"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Calories", value: Math.round(dailyTotals.calories), icon: Flame, bg: "bg-pastel-yellow" },
            { label: "Protein", value: `${Math.round(dailyTotals.protein)}g`, icon: Beef, bg: "bg-pastel-pink" },
            { label: "Carbs", value: `${Math.round(dailyTotals.carbs)}g`, icon: Wheat, bg: "bg-pastel-sky" },
            { label: "Fats", value: `${Math.round(dailyTotals.fats)}g`, icon: Droplets, bg: "bg-pastel-sage" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${stat.bg} pastel-card`}>
              <stat.icon className="w-5 h-5 mb-2 opacity-60" />
              <p className="text-2xl font-bold font-heading">{stat.value}</p>
              <p className="text-xs text-foreground/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts (Weekly/Monthly) */}
        {viewMode !== "daily" && chartData.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-3xl p-6 border border-border">
              <h3 className="font-bold font-heading mb-4">Calorie Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="calGradDetail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(48,100%,75%)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(48,100%,75%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                  <Area type="monotone" dataKey="calories" stroke="hsl(48,80%,55%)" fill="url(#calGradDetail)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-3xl p-6 border border-border">
              <h3 className="font-bold font-heading mb-4">Protein Intake</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                  <Bar dataKey="protein" fill="hsl(340,80%,80%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Macro Distribution Pie (daily view) */}
        {viewMode === "daily" && dailyTotals.calories > 0 && (
          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-4">Macro Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}: {d.value}g
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meal List */}
        <div>
          <h3 className="font-bold font-heading text-lg mb-4">
            {viewMode === "daily" ? "Meals on " + new Date(selectedDate).toLocaleDateString() : `All Meals (${meals.length})`}
          </h3>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading meals...</p>
          ) : meals.length === 0 ? (
            <div className="bg-card rounded-3xl p-10 border border-border text-center">
              <p className="text-muted-foreground">No meals recorded for this period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => {
                const totals = meal.analysis?.totals;
                return (
                  <div key={meal.id} className="bg-card rounded-3xl border border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                      className="w-full p-5 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
                    >
                      {meal.image_url ? (
                        <img src={meal.image_url} alt="Meal" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-pastel-yellow rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Flame className="w-6 h-6 opacity-50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{meal.meal_type || "Meal"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(meal.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {totals && (
                          <>
                            <span className="text-xs px-2 py-1 rounded-full bg-pastel-yellow font-medium">{Math.round(totals.calories)} cal</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-pastel-pink font-medium">{Math.round(totals.protein)}g pro</span>
                          </>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          meal.status === "approved" ? "bg-pastel-sage" : meal.status === "rejected" ? "bg-pastel-coral" : "bg-pastel-yellow"
                        }`}>{meal.status}</span>
                      </div>
                    </button>

                    {expandedMeal === meal.id && meal.analysis && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border p-5">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                          <div className="bg-pastel-yellow/50 rounded-xl p-2"><p className="font-bold">{Math.round(totals?.calories || 0)}</p><p className="text-foreground/50">cal</p></div>
                          <div className="bg-pastel-pink/50 rounded-xl p-2"><p className="font-bold">{Math.round(totals?.protein || 0)}g</p><p className="text-foreground/50">pro</p></div>
                          <div className="bg-pastel-sky/50 rounded-xl p-2"><p className="font-bold">{Math.round(totals?.carbs || 0)}g</p><p className="text-foreground/50">carb</p></div>
                          <div className="bg-pastel-sage/50 rounded-xl p-2"><p className="font-bold">{Math.round(totals?.fats || 0)}g</p><p className="text-foreground/50">fat</p></div>
                        </div>
                        {Array.isArray(meal.analysis.foods) && meal.analysis.foods.map((food: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between py-2 text-sm border-b border-border/50 last:border-0">
                            <span className="font-medium">{food.name} <span className="text-foreground/50">({food.grams}g)</span></span>
                            <span className="text-xs text-muted-foreground">{food.calories} cal · {food.protein}g P · {food.carbs}g C · {food.fats}g F</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
