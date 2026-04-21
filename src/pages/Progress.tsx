import DashboardLayout from "@/components/DashboardLayout";
import { mockWeeklyData } from "@/lib/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Scale, TrendingDown, Camera, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import PoseUploader from "@/components/PoseUploader";

const weightData = [
  { week: "W1", weight: 220 },
  { week: "W2", weight: 219.2 },
  { week: "W3", weight: 218.1 },
  { week: "W4", weight: 217.5 },
  { week: "W5", weight: 216.8 },
  { week: "W6", weight: 216.2 },
  { week: "W7", weight: 215.8 },
  { week: "W8", weight: 215.4 },
];

const measurements = [
  { part: "Chest", value: "48.5\"", change: "-0.2\"" },
  { part: "Waist", value: "32.0\"", change: "-0.5\"" },
  { part: "Arms", value: "18.2\"", change: "+0.1\"" },
  { part: "Quads", value: "27.8\"", change: "+0.3\"" },
  { part: "Calves", value: "17.0\"", change: "0\"" },
];

export default function Progress() {
  const [newWeight, setNewWeight] = useState("");

  const logWeight = () => {
    if (!newWeight) return;
    toast.success(`Weight logged: ${newWeight} lbs`);
    setNewWeight("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold font-heading">Progress Reports</h1>

        {/* Current Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-pastel-yellow pastel-card text-center">
            <Scale className="w-5 h-5 mx-auto mb-2 opacity-60" />
            <p className="text-2xl font-bold font-heading">215.4</p>
            <p className="text-xs text-foreground/60">Current Weight</p>
          </div>
          <div className="bg-pastel-sage pastel-card text-center">
            <TrendingDown className="w-5 h-5 mx-auto mb-2 opacity-60" />
            <p className="text-2xl font-bold font-heading">-4.6</p>
            <p className="text-xs text-foreground/60">lbs Lost (8 weeks)</p>
          </div>
          <div className="bg-pastel-pink pastel-card text-center">
            <p className="text-2xl font-bold font-heading">94%</p>
            <p className="text-xs text-foreground/60">Avg Compliance</p>
          </div>
          <div className="bg-pastel-sky pastel-card text-center">
            <p className="text-2xl font-bold font-heading">92</p>
            <p className="text-xs text-foreground/60">Avg Meal Score</p>
          </div>
        </div>

        {/* Log Weight */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h3 className="font-bold font-heading mb-4">Log Today's Weight</h3>
          <div className="flex gap-3">
            <Input value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Enter weight in lbs" className="h-12 rounded-2xl" type="number" />
            <Button onClick={logWeight} className="rounded-2xl h-12 px-6">Log</Button>
          </div>
        </div>

        {/* Weight Chart */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h3 className="font-bold font-heading mb-4">Weight Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="wtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270,60%,80%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(270,60%,80%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis domain={[212, 222]} axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="weight" stroke="hsl(270,50%,60%)" fill="url(#wtGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Measurements */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h3 className="font-bold font-heading mb-4 flex items-center gap-2"><Ruler className="w-5 h-5" /> Body Measurements</h3>
          <div className="space-y-3">
            {measurements.map((m) => (
              <div key={m.part} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="font-medium text-sm">{m.part}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{m.value}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.change.startsWith("-") ? "bg-pastel-sage" : m.change === "0\"" ? "bg-secondary" : "bg-pastel-yellow"}`}>
                    {m.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pose Uploader component */}
        <PoseUploader />
      </div>
    </DashboardLayout>
  );
}
