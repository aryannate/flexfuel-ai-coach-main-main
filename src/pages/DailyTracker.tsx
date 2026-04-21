import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Beef, Wheat, Droplets, Plus, Minus, Camera, Sparkles, TrendingUp, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/authContext";
import { useDailyTracker } from "@/hooks/useDailyTracker";

export default function DailyTracker() {
  const { role } = useAuth();
  const { meals, macroTotals, microTotals, waterGlasses, setWater, loading, mealCount } = useDailyTracker();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const scanRoute = role === "athlete" ? "/athlete/scan" : "/coach/scan";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-20 text-center text-muted-foreground">Loading your daily tracker...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">Daily Tracker</h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {mealCount} meal{mealCount !== 1 ? "s" : ""} logged
            </p>
          </div>
          <Link to={scanRoute}>
            <Button className="rounded-full gap-2 h-12 px-6">
              <Camera className="w-5 h-5" /> Scan Meal
            </Button>
          </Link>
        </div>

        {/* Macro Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Calories", value: Math.round(macroTotals.calories), icon: Flame, bg: "bg-pastel-yellow" },
            { label: "Protein", value: `${Math.round(macroTotals.protein)}g`, icon: Beef, bg: "bg-pastel-pink" },
            { label: "Carbs", value: `${Math.round(macroTotals.carbs)}g`, icon: Wheat, bg: "bg-pastel-sky" },
            { label: "Fats", value: `${Math.round(macroTotals.fats)}g`, icon: Droplets, bg: "bg-pastel-sage" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${stat.bg} pastel-card`}>
              <stat.icon className="w-5 h-5 mb-2 opacity-60" />
              <p className="text-3xl font-bold font-heading">{stat.value}</p>
              <p className="text-xs text-foreground/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-3xl p-5 border border-border">
            <h3 className="font-bold font-heading text-sm mb-3 flex items-center gap-2"><Leaf className="w-4 h-4" /> Fat Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Good Fats</span><span className="font-bold">{Math.round(macroTotals.goodFat)}g</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Bad Fats</span><span className="font-bold">{Math.round(macroTotals.badFat)}g</span></div>
            </div>
          </div>
          <div className="bg-card rounded-3xl p-5 border border-border">
            <h3 className="font-bold font-heading text-sm mb-3 flex items-center gap-2"><Wheat className="w-4 h-4" /> Carb Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Complex Carbs</span><span className="font-bold">{Math.round(macroTotals.complexCarbs)}g</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Simple Carbs</span><span className="font-bold">{Math.round(macroTotals.simpleCarbs)}g</span></div>
            </div>
          </div>
          <div className="bg-card rounded-3xl p-5 border border-border">
            <h3 className="font-bold font-heading text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Scores</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Avg Meal Score</span><span className="font-bold">{macroTotals.avgMealScore}/100</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fiber</span><span className="font-bold">{Math.round(macroTotals.fiber)}g</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Glycemic Load</span><span className="font-bold">{macroTotals.avgGlycemicLoad}</span></div>
            </div>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-pastel-sky pastel-card">
          <h3 className="font-bold font-heading mb-4 flex items-center gap-2"><Droplets className="w-5 h-5" /> Water Intake</h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 flex-wrap flex-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <button key={i} onClick={() => setWater(i + 1)} className={`w-8 h-8 rounded-xl text-sm transition-all ${i < waterGlasses ? "bg-foreground/20" : "bg-foreground/5"}`}>💧</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-xl w-8 h-8 p-0" onClick={() => setWater(Math.max(0, waterGlasses - 1))}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-bold text-lg min-w-[2rem] text-center">{waterGlasses}</span>
              <Button size="sm" className="rounded-xl w-8 h-8 p-0" onClick={() => setWater(waterGlasses + 1)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-foreground/60 mt-2">{waterGlasses} / 10 glasses · {waterGlasses * 250}ml consumed</p>
        </div>

        {/* Micronutrient Summary */}
        {Object.keys(microTotals).length > 0 && (
          <div className="bg-card rounded-3xl p-5 border border-border">
            <h3 className="font-bold font-heading mb-4">Micronutrients (% DV Today)</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(microTotals).map(([key, val]) => (
                <div key={key} className="text-center">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mx-auto mb-1 ${
                    val >= 100 ? "border-green-400 bg-green-50" : val >= 50 ? "border-yellow-400 bg-yellow-50" : "border-foreground/15"
                  }`}>
                    <span className="text-sm font-bold">{Math.min(Math.round(val), 999)}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground capitalize">{key.replace("vitamin", "Vit ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meal Timeline */}
        <div>
          <h3 className="font-bold font-heading text-lg mb-4">Today's Meals</h3>
          {meals.length === 0 ? (
            <div className="bg-card rounded-3xl p-12 border border-border text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold font-heading text-lg mb-2">No meals logged today</p>
              <p className="text-sm text-muted-foreground mb-4">Scan your first meal to start tracking</p>
              <Link to={scanRoute}>
                <Button className="rounded-full gap-2"><Camera className="w-4 h-4" /> Scan Now</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="bg-card rounded-3xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                    className="w-full p-5 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
                  >
                    {meal.image_url && (
                      <img src={meal.image_url} alt="Meal" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{meal.meal_type || "Meal"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(meal.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {meal.confidence && ` · ${meal.confidence}% confidence`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-pastel-yellow font-medium">{Math.round(meal.totals.calories)} cal</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-pastel-pink font-medium">{Math.round(meal.totals.protein)}g pro</span>
                    </div>
                  </button>

                  {expandedMeal === meal.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-border p-5 space-y-4"
                    >
                      {/* Food breakdown */}
                      {meal.foods.map((food: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium">{food.name}</p>
                            <p className="text-xs text-muted-foreground">{food.grams}g</p>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="bg-pastel-yellow/50 px-2 py-1 rounded-lg">{food.calories} cal</span>
                            <span className="bg-pastel-pink/50 px-2 py-1 rounded-lg">{food.protein}g P</span>
                            <span className="bg-pastel-sky/50 px-2 py-1 rounded-lg">{food.carbs}g C</span>
                            <span className="bg-pastel-sage/50 px-2 py-1 rounded-lg">{food.fats}g F</span>
                          </div>
                        </div>
                      ))}

                      {/* Suggestions */}
                      {meal.suggestions.length > 0 && (
                        <div className="bg-pastel-yellow/30 rounded-2xl p-4">
                          <p className="font-bold text-xs flex items-center gap-1 mb-2"><Sparkles className="w-3 h-3" /> AI Suggestions</p>
                          <ul className="space-y-1">
                            {meal.suggestions.map((s: string, i: number) => (
                              <li key={i} className="text-xs text-foreground/70">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
