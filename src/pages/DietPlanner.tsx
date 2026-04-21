import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, X, UtensilsCrossed } from "lucide-react";
import { useDietPlan } from "@/hooks/useDietPlan";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocalMeal {
  time: string;
  name: string;
  foods: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function DietPlanner() {
  const { user } = useAuth();
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<{ id: string; name: string }[]>([]);
  const { plan, savePlan } = useDietPlan(selectedAthlete || undefined);

  const [planName, setPlanName] = useState("Competition Prep");
  const [meals, setMeals] = useState<LocalMeal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState<LocalMeal>({ time: "", name: "", foods: "", calories: 0, protein: 0, carbs: 0, fats: 0 });

  // Load athletes
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("user_id, display_name")
      .eq("trainer_id", user.id)
      .then(({ data }) => {
        if (data) setAthletes(data.map((p) => ({ id: p.user_id, name: p.display_name || "Athlete" })));
      });
  }, [user]);

  // Load existing plan into editor
  useEffect(() => {
    if (plan) {
      setPlanName(plan.name);
      setMeals(plan.meals.map((m) => ({
        time: m.time,
        name: m.name,
        foods: m.foods.join(", "),
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
      })));
    } else {
      setMeals([]);
    }
  }, [plan]);

  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalPro = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFats = meals.reduce((s, m) => s + m.fats, 0);

  const addMeal = () => {
    if (!newMeal.name) return;
    setMeals([...meals, newMeal]);
    setNewMeal({ time: "", name: "", foods: "", calories: 0, protein: 0, carbs: 0, fats: 0 });
    setShowAdd(false);
  };

  const removeMeal = (idx: number) => setMeals(meals.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!selectedAthlete) {
      toast.error("Please select an athlete first");
      return;
    }
    if (meals.length === 0) {
      toast.error("Add at least one meal");
      return;
    }
    await savePlan(
      planName,
      totalCals,
      meals.map((m, i) => ({
        meal_order: i,
        time: m.time,
        name: m.name,
        foods: m.foods.split(",").map((f) => f.trim()),
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
      })),
      selectedAthlete
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">Diet Planner</h1>
            <p className="text-muted-foreground mt-1">Create and assign diet plans to athletes</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAdd(true)} variant="outline" className="rounded-full gap-2">
              <Plus className="w-4 h-4" /> Add Meal
            </Button>
            <Button onClick={handleSave} className="rounded-full gap-2">
              <Check className="w-4 h-4" /> Save & Sync
            </Button>
          </div>
        </div>

        {/* Athlete selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {athletes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No athletes assigned yet.</p>
          ) : (
            athletes.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAthlete(a.id)}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl text-sm font-medium transition-all ${
                  selectedAthlete === a.id ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}
              >
                {a.name}
              </button>
            ))
          )}
        </div>

        {/* Plan name */}
        <Input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          placeholder="Plan name"
          className="rounded-2xl h-12 text-lg font-heading font-bold"
        />

        {/* Totals */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-pastel-yellow pastel-card text-center">
            <p className="text-2xl font-bold font-heading">{totalCals}</p>
            <p className="text-xs text-foreground/60">Total Cal</p>
          </div>
          <div className="bg-pastel-pink pastel-card text-center">
            <p className="text-2xl font-bold font-heading">{totalPro}g</p>
            <p className="text-xs text-foreground/60">Protein</p>
          </div>
          <div className="bg-pastel-sky pastel-card text-center">
            <p className="text-2xl font-bold font-heading">{totalCarbs}g</p>
            <p className="text-xs text-foreground/60">Carbs</p>
          </div>
          <div className="bg-pastel-sage pastel-card text-center">
            <p className="text-2xl font-bold font-heading">{totalFats}g</p>
            <p className="text-xs text-foreground/60">Fats</p>
          </div>
        </div>

        {/* Add Meal Form */}
        {showAdd && (
          <div className="bg-pastel-lavender pastel-card space-y-4">
            <h3 className="font-bold font-heading">Add New Meal</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Time (e.g., 7:00 AM)" value={newMeal.time} onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })} className="rounded-xl" />
              <Input placeholder="Meal Name" value={newMeal.name} onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })} className="rounded-xl" />
            </div>
            <Input placeholder="Foods (comma separated)" value={newMeal.foods} onChange={(e) => setNewMeal({ ...newMeal, foods: e.target.value })} className="rounded-xl" />
            <div className="grid grid-cols-4 gap-3">
              <Input placeholder="Calories" type="number" value={newMeal.calories || ""} onChange={(e) => setNewMeal({ ...newMeal, calories: +e.target.value })} className="rounded-xl" />
              <Input placeholder="Protein" type="number" value={newMeal.protein || ""} onChange={(e) => setNewMeal({ ...newMeal, protein: +e.target.value })} className="rounded-xl" />
              <Input placeholder="Carbs" type="number" value={newMeal.carbs || ""} onChange={(e) => setNewMeal({ ...newMeal, carbs: +e.target.value })} className="rounded-xl" />
              <Input placeholder="Fats" type="number" value={newMeal.fats || ""} onChange={(e) => setNewMeal({ ...newMeal, fats: +e.target.value })} className="rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Button onClick={addMeal} className="rounded-xl gap-1"><Check className="w-4 h-4" /> Add</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl gap-1"><X className="w-4 h-4" /> Cancel</Button>
            </div>
          </div>
        )}

        {/* Meals */}
        <div className="space-y-4">
          {meals.map((meal, i) => (
            <div key={i} className="bg-card rounded-3xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pastel-peach flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{meal.name}</p>
                    <p className="text-xs text-muted-foreground">{meal.time}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => removeMeal(i)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {meal.foods.split(",").map((food, fi) => (
                  <span key={fi} className="text-xs bg-secondary px-3 py-1 rounded-full">{food.trim()}</span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-pastel-yellow/50 rounded-xl p-2"><p className="font-bold">{meal.calories}</p><p className="text-foreground/50">cal</p></div>
                <div className="bg-pastel-pink/50 rounded-xl p-2"><p className="font-bold">{meal.protein}g</p><p className="text-foreground/50">pro</p></div>
                <div className="bg-pastel-sky/50 rounded-xl p-2"><p className="font-bold">{meal.carbs}g</p><p className="text-foreground/50">carb</p></div>
                <div className="bg-pastel-sage/50 rounded-xl p-2"><p className="font-bold">{meal.fats}g</p><p className="text-foreground/50">fat</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
