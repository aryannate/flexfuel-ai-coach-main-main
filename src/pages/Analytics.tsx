import DashboardLayout from "@/components/DashboardLayout";
import { mockWeeklyData, mockAthletes } from "@/lib/mockData";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const pieData = [
  { name: "Protein", value: 280, color: "hsl(340,80%,75%)" },
  { name: "Carbs", value: 320, color: "hsl(200,70%,75%)" },
  { name: "Fats", value: 85, color: "hsl(120,30%,72%)" },
];

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold font-heading">Analytics</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-4">Calorie Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={mockWeeklyData}>
                <defs>
                  <linearGradient id="anCalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(48,100%,75%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(48,100%,75%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="calories" stroke="hsl(48,80%,55%)" fill="url(#anCalGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-4">Protein Weekly</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockWeeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="protein" fill="hsl(340,80%,80%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-4">Macro Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
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

          <div className="bg-card rounded-3xl p-6 border border-border">
            <h3 className="font-bold font-heading mb-4">Compliance by Day</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockWeeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis domain={[70, 100]} axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="compliance" fill="hsl(270,60%,80%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Athlete Comparison */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h3 className="font-bold font-heading mb-4">Athlete Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium">Athlete</th>
                  <th className="pb-3 font-medium">Goal</th>
                  <th className="pb-3 font-medium">Compliance</th>
                  <th className="pb-3 font-medium">Calories</th>
                  <th className="pb-3 font-medium">Protein</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockAthletes.map((a) => (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="py-3 font-medium">{a.name}</td>
                    <td className="py-3 text-muted-foreground">{a.goal}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div className="h-2 rounded-full bg-pastel-sage" style={{ width: `${a.compliance}%` }} />
                        </div>
                        {a.compliance}%
                      </div>
                    </td>
                    <td className="py-3">{a.calories}</td>
                    <td className="py-3">{a.protein}g</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        a.status === "on-track" ? "bg-pastel-sage" : a.status === "needs-attention" ? "bg-pastel-yellow" : "bg-pastel-coral"
                      }`}>{a.status.replace("-", " ")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
