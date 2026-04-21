import DashboardLayout from "@/components/DashboardLayout";
import { mockAthletes } from "@/lib/mockData";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

export default function Athletes() {
  const [athletes, setAthletes] = useState(mockAthletes);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("");

  const filtered = athletes.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  const addAthlete = () => {
    if (!newName) return;
    setAthletes([
      ...athletes,
      {
        id: String(athletes.length + 1),
        name: newName,
        avatar: newName.split(" ").map((n) => n[0]).join("").slice(0, 2),
        goal: newGoal || "General",
        weight: 180,
        compliance: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        status: "needs-attention" as const,
      },
    ]);
    setNewName("");
    setNewGoal("");
    setShowAdd(false);
    toast.success("Athlete added!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-heading">Athletes</h1>
          <Button onClick={() => setShowAdd(true)} className="rounded-full gap-2">
            <Plus className="w-4 h-4" /> Add Athlete
          </Button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search athletes..." className="h-12 rounded-2xl pl-10" />
        </div>

        {showAdd && (
          <div className="bg-pastel-sky pastel-card flex flex-col md:flex-row gap-3">
            <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl flex-1" />
            <Input placeholder="Goal" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} className="rounded-xl flex-1" />
            <Button onClick={addAthlete} className="rounded-xl">Add</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="rounded-xl"><X className="w-4 h-4" /></Button>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="bg-card rounded-3xl p-5 border border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-pastel-lavender flex items-center justify-center font-bold text-sm flex-shrink-0">{a.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold">{a.name}</p>
                <p className="text-sm text-muted-foreground">{a.goal} · {a.weight} lbs</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${
                a.status === "on-track" ? "bg-pastel-sage" : a.status === "needs-attention" ? "bg-pastel-yellow" : "bg-pastel-coral"
              }`}>{a.status.replace("-", " ")}</span>
              <div className="text-right hidden md:block">
                <p className="font-bold text-sm">{a.compliance}%</p>
                <p className="text-xs text-muted-foreground">compliance</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
