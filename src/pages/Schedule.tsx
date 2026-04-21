import DashboardLayout from "@/components/DashboardLayout";
import { CalendarDays, Dumbbell, BedDouble } from "lucide-react";
import { useState } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import { useAuth } from "@/lib/authContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Schedule() {
  const { role } = useAuth();
  const { schedule, loading, upsertDay } = useSchedule();
  const [selected, setSelected] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    workout_type: "",
    workout_name: "",
    target_calories: 0,
    target_carbs: 0,
    notes: "",
  });

  const current = schedule[selected];

  const startEdit = () => {
    setEditForm({
      workout_type: current.workout_type,
      workout_name: current.workout_name,
      target_calories: current.target_calories,
      target_carbs: current.target_carbs,
      notes: current.notes || "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    await upsertDay(current.day, editForm);
    setEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-20 text-center text-muted-foreground">Loading schedule...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
          <CalendarDays className="w-8 h-8" /> Weekly Schedule
        </h1>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {schedule.map((d, i) => (
            <button
              key={d.day}
              onClick={() => { setSelected(i); setEditing(false); }}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl text-sm font-medium transition-all ${
                i === selected ? "bg-primary text-primary-foreground" : "bg-card border border-border"
              }`}
            >
              {d.day.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className={`pastel-card ${current.workout_type === "training" ? "bg-pastel-yellow" : "bg-pastel-lavender"}`}>
          <div className="flex items-center gap-3 mb-4">
            {current.workout_type === "training" ? <Dumbbell className="w-6 h-6" /> : <BedDouble className="w-6 h-6" />}
            <div>
              <h2 className="text-xl font-bold font-heading">{current.day}</h2>
              <p className="text-sm text-foreground/60">{current.workout_name || "Not set"}</p>
            </div>
            <span className="ml-auto text-xs px-3 py-1 rounded-full bg-foreground/10 capitalize">
              {current.workout_type} day
            </span>
          </div>

          {editing ? (
            <div className="space-y-3 mt-4">
              <div className="flex gap-2">
                <select
                  value={editForm.workout_type}
                  onChange={(e) => setEditForm({ ...editForm, workout_type: e.target.value })}
                  className="rounded-xl border border-border px-3 py-2 text-sm bg-card"
                >
                  <option value="training">Training</option>
                  <option value="rest">Rest</option>
                </select>
                <Input
                  placeholder="Workout name"
                  value={editForm.workout_name}
                  onChange={(e) => setEditForm({ ...editForm, workout_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Target calories"
                  value={editForm.target_calories || ""}
                  onChange={(e) => setEditForm({ ...editForm, target_calories: +e.target.value })}
                  className="rounded-xl"
                />
                <Input
                  type="number"
                  placeholder="Target carbs (g)"
                  value={editForm.target_carbs || ""}
                  onChange={(e) => setEditForm({ ...editForm, target_carbs: +e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Input
                placeholder="Notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="rounded-xl"
              />
              <div className="flex gap-2">
                <Button onClick={saveEdit} size="sm" className="rounded-xl">Save</Button>
                <Button onClick={() => setEditing(false)} size="sm" variant="outline" className="rounded-xl">Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-card rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold font-heading">{current.target_calories || "—"}</p>
                  <p className="text-xs text-muted-foreground">Target Calories</p>
                </div>
                <div className="bg-card rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold font-heading">{current.target_carbs ? `${current.target_carbs}g` : "—"}</p>
                  <p className="text-xs text-muted-foreground">Target Carbs</p>
                </div>
              </div>
              {current.notes && (
                <p className="text-sm text-foreground/70 mt-4 bg-card rounded-2xl p-3">📝 {current.notes}</p>
              )}
              {role === "trainer" && (
                <Button onClick={startEdit} size="sm" variant="outline" className="rounded-xl mt-4">
                  Edit Schedule
                </Button>
              )}
            </>
          )}
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border">
          <h3 className="font-bold font-heading mb-3">Nutrition Split Guide</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            On <strong>training days</strong>, carbs are elevated to fuel performance and recovery. 
            Pre-workout meal should be consumed 90 minutes before, with fast-digesting carbs post-workout. 
            On <strong>rest days</strong>, carbs are reduced and fats slightly increased to maintain hormonal balance during recovery.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
