import { motion } from "framer-motion";
import { Users, Clock, Flame, CheckCircle, UserPlus, Crown, Activity, TrendingUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import StreakHeatmap from "@/components/StreakHeatmap";
import { useTrainerMealSync } from "@/hooks/useMealSync";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/integrations/supabase/client";
import AddUserModal from "@/components/AddUserModal";
import AdminUserManager from "@/components/AdminUserManager";
import { Link } from "react-router-dom";
import { demoAthletes, demoMeals, demoChartData, demoStats } from "@/lib/demoData";

const avatarColors = ["bg-pastel-pink", "bg-pastel-lavender", "bg-pastel-sky", "bg-pastel-peach", "bg-pastel-sage", "bg-pastel-yellow"];

export default function CoachDashboard() {
  const { user, role } = useAuth();
  const { meals: realMeals, loading: mealsLoading } = useTrainerMealSync();
  const [realAthletes, setRealAthletes] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [addModal, setAddModal] = useState<"trainer" | "athlete" | null>(null);

  const isAdmin = role === "admin";
  const isCoach = role === "admin" || role === "coach";

  const loadUsers = async () => {
    if (!user) return;
    const { data: athleteData } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, created_at")
      .eq("trainer_id", user.id);
    if (athleteData) setRealAthletes(athleteData);

    if (isCoach) {
      const { data: trainerData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, created_at")
        .eq("coach_id", user.id);
      if (trainerData) setTrainers(trainerData);

      if (trainerData && trainerData.length > 0) {
        const trainerIds = trainerData.map(t => t.user_id);
        const { data: moreAthletes } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, trainer_id, created_at")
          .in("trainer_id", trainerIds);
        if (moreAthletes) {
          const existing = new Set(athleteData?.map(a => a.user_id) || []);
          const newAthletes = moreAthletes.filter(a => !existing.has(a.user_id));
          setRealAthletes(prev => [...prev, ...newAthletes]);
        }
      }
    }
  };

  useEffect(() => { loadUsers(); }, [user]);

  // Merge real data with demo data — demo fills the gap until real athletes exist
  const athletes = realAthletes.length > 0 ? realAthletes : demoAthletes;
  const meals = realMeals.length > 0 ? realMeals : demoMeals as any[];
  const chartData = demoChartData;

  const todayStr = new Date().toISOString().split("T")[0];
  const mealsToday = meals.filter((m: any) => m.created_at.startsWith(todayStr)).length || demoStats.mealsToday;

  const statCards = [
    { label: "Active Athletes", value: String(athletes.length || demoStats.totalAthletes), icon: Users, bg: "bg-pastel-yellow" },
    { label: "Total Meals Tracked", value: String(meals.length || demoStats.totalMeals), icon: Flame, bg: "bg-pastel-pink" },
    { label: "Meals Today", value: String(mealsToday), icon: CheckCircle, bg: "bg-pastel-sage" },
    { label: "Avg Compliance", value: `${demoStats.avgCompliance}%`, icon: TrendingUp, bg: "bg-pastel-sky" },
  ];

  if (isCoach) {
    statCards.push({ label: "Trainers", value: String(trainers.length || demoStats.trainers), icon: Crown, bg: "bg-pastel-lavender" });
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">
              {isAdmin ? "Admin Dashboard" : "Coach Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Welcome back, {user?.name || "Coach"} — {isAdmin ? "full system access" : "monitor your athletes in real-time"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isCoach && (
              <Button onClick={() => setAddModal("trainer")} variant="outline" className="rounded-full gap-2 flex-1 sm:flex-none">
                <UserPlus className="w-4 h-4" /> <span>Add Trainer</span>
              </Button>
            )}
            <Button onClick={() => setAddModal("athlete")} className="rounded-full gap-2 flex-1 sm:flex-none">
              <UserPlus className="w-4 h-4" /> <span>Add Athlete</span>
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${card.bg} pastel-card`}>
              <card.icon className="w-6 h-6 mb-3 opacity-70" />
              <p className="text-2xl font-bold font-heading">{card.value}</p>
              <p className="text-xs text-foreground/60 mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-1">14-Day Compliance Trend</h3>
            <p className="text-xs text-muted-foreground mb-4">Average across all athletes</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(120,30%,70%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(120,30%,70%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" tick={{ fontSize: 10 }} interval={2} />
                <YAxis domain={[70, 100]} axisLine={false} tickLine={false} className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="compliance" stroke="hsl(120,40%,55%)" fill="url(#compGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-1">Daily Calorie Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">Total calories across team</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" tick={{ fontSize: 10 }} interval={2} />
                <YAxis axisLine={false} tickLine={false} className="text-xs" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="calories" fill="hsl(48,100%,75%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Admin User Management Panel */}
        {isAdmin && <AdminUserManager />}

        {/* Streak Heatmap */}
        <div>
          <h3 className="font-bold font-heading text-lg mb-4">🔥 Consistency Tracker</h3>
          <StreakHeatmap showAthleteComparison />
        </div>

        {/* Recent Athlete Meals Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold font-heading text-lg">Recent Athlete Meals</h3>
            <span className="text-xs text-muted-foreground">{meals.length} total meals logged</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meals.slice(0, 9).map((meal: any, idx: number) => {
              const totals = meal.analysis?.totals;
              const name = meal.athlete_name || "Athlete";
              const avatar = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              const statusColor = meal.status === "approved" ? "bg-pastel-sage text-foreground" : meal.status === "rejected" ? "bg-pastel-coral text-foreground" : "bg-pastel-yellow text-foreground";

              return (
                <div key={meal.id} className="bg-card rounded-3xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(meal.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                      {meal.status}
                    </span>
                  </div>

                  <p className="font-medium text-sm mb-3">{meal.meal_type || "Meal"}</p>

                  {totals && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-pastel-yellow/50 rounded-xl p-2"><p className="font-bold">{totals.calories}</p><p className="text-foreground/60">cal</p></div>
                      <div className="bg-pastel-pink/50 rounded-xl p-2"><p className="font-bold">{Math.round(totals.protein)}g</p><p className="text-foreground/60">pro</p></div>
                      <div className="bg-pastel-sky/50 rounded-xl p-2"><p className="font-bold">{Math.round(totals.carbs)}g</p><p className="text-foreground/60">carb</p></div>
                      <div className="bg-pastel-sage/50 rounded-xl p-2"><p className="font-bold">{Math.round(totals.fats)}g</p><p className="text-foreground/60">fat</p></div>
                    </div>
                  )}

                  <Link to={`/coach/athlete/${meal.athlete_id}`} className="mt-3 block text-center text-xs font-medium text-primary hover:underline">
                    View Athlete Details →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trainers List (coach only) */}
        {isCoach && (
          <div>
            <h3 className="font-bold font-heading text-lg mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5" /> Your Trainers
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(trainers.length > 0 ? trainers : [{ user_id: "demo-t1", display_name: "Coach Sachin Verma", role: "Trainer" }]).map((trainer: any) => (
                <div key={trainer.user_id} className="bg-card rounded-3xl p-5 border border-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pastel-lavender flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {(trainer.display_name || "T").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{trainer.display_name || "Trainer"}</p>
                    <p className="text-xs text-muted-foreground">Senior Trainer · 3 athletes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Athletes Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold font-heading text-lg">Your Athletes</h3>
            <Link to="/coach/athletes">
              <Button variant="outline" size="sm" className="rounded-full">View All →</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {athletes.slice(0, 6).map((athlete: any, i: number) => {
              const name = athlete.display_name || "Athlete";
              const avatar = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              const goals = ["Competition Prep · 14 weeks out", "Off-Season Bulk · On track", "Post-Show Reverse Diet"];
              const compliances = ["97% compliance", "83% compliance", "71% compliance"];
              return (
                <Link key={athlete.user_id} to={`/coach/athlete/${athlete.user_id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-card rounded-3xl p-5 border border-border flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{goals[i] || "Active"}</p>
                      <p className="text-xs font-medium text-foreground/70 mt-0.5">{compliances[i] || ""}</p>
                    </div>
                    <Activity className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Add User Modal */}
        <AddUserModal
          open={addModal !== null}
          onClose={() => setAddModal(null)}
          onCreated={() => loadUsers()}
          accountType={addModal || "athlete"}
        />
      </div>
    </DashboardLayout>
  );
}
