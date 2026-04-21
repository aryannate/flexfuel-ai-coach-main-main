import DashboardLayout from "@/components/DashboardLayout";
import { UtensilsCrossed, Check, X as XIcon } from "lucide-react";
import { useDietPlan } from "@/hooks/useDietPlan";
import { useMealLogs } from "@/hooks/useMealLogs";
import { Button } from "@/components/ui/button";

export default function AthleteDiet() {
  const { plan, loading } = useDietPlan();
  const { logs, logMeal } = useMealLogs();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-20 text-center text-muted-foreground">Loading diet plan...</div>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-20 text-center">
          <h1 className="text-3xl font-bold font-heading mb-4">My Diet Plan</h1>
          <p className="text-muted-foreground">No diet plan assigned yet. Ask Coach Sachin to create one for you!</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalProtein = plan.meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = plan.meals.reduce((s, m) => s + m.carbs, 0);
  const totalFats = plan.meals.reduce((s, m) => s + m.fats, 0);

  const isMealLogged = (mealId: string) => logs.some((l) => l.diet_plan_meal_id === mealId);
  const getMealStatus = (mealId: string) => logs.find((l) => l.diet_plan_meal_id === mealId)?.status;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">My Diet Plan</h1>
          <p className="text-muted-foreground mt-1">{plan.name}</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-pastel-yellow pastel-card text-center">
            <p className="text-2xl font-bold font-heading">{plan.total_calories}</p>
            <p className="text-xs text-foreground/60">Daily Cal</p>
          </div>
          <div className="bg-pastel-pink pastel-card text-center">
            <p className="text-2xl font-bold font-heading">{totalProtein}g</p>
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

        <div className="space-y-4">
          {plan.meals.map((meal) => {
            const logged = isMealLogged(meal.id);
            const status = getMealStatus(meal.id);
            return (
              <div key={meal.id} className="bg-card rounded-3xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-pastel-peach flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{meal.name}</p>
                    <p className="text-xs text-muted-foreground">{meal.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold">{meal.calories} cal</p>
                    {logged && (
                      <span className={`text-xs px-2 py-1 rounded-full ${status === "completed" ? "bg-pastel-sage" : "bg-pastel-coral"}`}>
                        {status === "completed" ? "✓ Done" : "⊘ Skipped"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {meal.foods.map((food, fi) => (
                    <span key={fi} className="text-xs bg-secondary px-3 py-1 rounded-full">{food}</span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="bg-pastel-pink/50 rounded-xl p-2"><p className="font-bold">{meal.protein}g</p><p className="text-foreground/50">protein</p></div>
                  <div className="bg-pastel-sky/50 rounded-xl p-2"><p className="font-bold">{meal.carbs}g</p><p className="text-foreground/50">carbs</p></div>
                  <div className="bg-pastel-sage/50 rounded-xl p-2"><p className="font-bold">{meal.fats}g</p><p className="text-foreground/50">fats</p></div>
                </div>
                {!logged && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl gap-1"
                      onClick={() => logMeal(meal.id, null, "completed")}
                    >
                      <Check className="w-4 h-4" /> Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl gap-1"
                      onClick={() => logMeal(meal.id, null, "skipped")}
                    >
                      <XIcon className="w-4 h-4" /> Skipped
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
