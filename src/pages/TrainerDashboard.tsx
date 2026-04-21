import { motion } from "framer-motion";
import { Users, TrendingUp, Flame, Beef, Wheat, Droplets, AlertTriangle, Clock, Star, CheckCircle } from "lucide-react";
import { mockWeeklyData } from "@/lib/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import StreakHeatmap from "@/components/StreakHeatmap";
import TrainerMealReview from "@/components/TrainerMealReview";
import { useTrainerMealSync } from "@/hooks/useMealSync";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/integrations/supabase/client";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { meals, loading: mealsLoading, approveMeal, rejectMeal } = useTrainerMealSync();
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);

  // Load assigned athletes
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .eq("trainer_id", user.id)
      .then(({ data }) => {
        if (data) setAthletes(data);
      });
  }, [user]);

  const pendingMeals = meals.filter((m) => m.status === "pending");

  const statCards = [
    { label: "Active Athletes", value: String(athletes.length), icon: Users, bg: "bg-pastel-yellow" },
    { label: "Pending Reviews", value: String(pendingMeals.length), icon: Clock, bg: "bg-pastel-coral" },
    { label: "Total Meals", value: String(meals.length), icon: Flame, bg: "bg-pastel-pink" },
    { label: "Approved", value: String(meals.filter(m => m.status === "approved").length), icon: CheckCircle, bg: "bg-pastel-sage" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Coach Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name || "Coach"} — monitor your athletes in real-time</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${card.bg} pastel-card`}>
              <card.icon className="w-6 h-6 mb-3 opacity-70" />
              <p className="text-2xl font-bold font-heading">{card.value}</p>
              <p className="text-xs text-foreground/60 mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-4">Weekly Compliance Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mockWeeklyData}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(120,30%,70%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(120,30%,70%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis domain={[70, 100]} axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="compliance" stroke="hsl(120,40%,55%)" fill="url(#compGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-4">Daily Calorie Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockWeeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="calories" fill="hsl(48,100%,75%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Streak Heatmap */}
        <div>
          <h3 className="font-bold font-heading text-lg mb-4">🔥 Consistency Tracker</h3>
          <StreakHeatmap showAthleteComparison />
        </div>

        {/* Meal Reviews */}
        <TrainerMealReview />

        {/* Pending Meals from DB */}
        {pendingMeals.length > 0 && (
          <div>
            <h3 className="font-bold font-heading text-lg mb-4">Pending Meal Reviews ({pendingMeals.length})</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingMeals.map((meal) => {
                const analysis = meal.analysis;
                const totals = analysis?.totals as any;
                return (
                  <div key={meal.id} className="bg-card rounded-3xl p-5 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-pastel-pink flex items-center justify-center text-xs font-bold">
                        {meal.athlete_id.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{meal.meal_type || "Meal"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(meal.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {meal.image_url && (
                      <img src={meal.image_url} alt="Meal" className="w-full h-32 object-cover rounded-2xl mb-3" />
                    )}
                    {totals && (
                      <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                        <div className="bg-pastel-yellow rounded-xl p-2"><p className="font-bold">{totals.calories}</p><p className="text-foreground/60">cal</p></div>
                        <div className="bg-pastel-pink rounded-xl p-2"><p className="font-bold">{Math.round(totals.protein)}g</p><p className="text-foreground/60">pro</p></div>
                        <div className="bg-pastel-sky rounded-xl p-2"><p className="font-bold">{Math.round(totals.carbs)}g</p><p className="text-foreground/60">carb</p></div>
                        <div className="bg-pastel-sage rounded-xl p-2"><p className="font-bold">{Math.round(totals.fats)}g</p><p className="text-foreground/60">fat</p></div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 rounded-xl h-9 gap-1"
                        onClick={() => approveMeal(meal.id, meal.athlete_id)}
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl h-9"
                        onClick={() => rejectMeal(meal.id, meal.athlete_id, "Needs adjustment")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Athletes List */}
        <div>
          <h3 className="font-bold font-heading text-lg mb-4">Your Athletes</h3>
          {athletes.length === 0 ? (
            <div className="bg-card rounded-3xl p-8 border border-border text-center">
              <p className="text-muted-foreground">No athletes assigned yet. Athletes need to set you as their trainer during signup.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {athletes.map((athlete) => (
                <div key={athlete.user_id} className="bg-card rounded-3xl p-5 border border-border flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-pastel-lavender flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {(athlete.display_name || "A").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{athlete.display_name || "Athlete"}</p>
                    <p className="text-sm text-muted-foreground">Assigned athlete</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
