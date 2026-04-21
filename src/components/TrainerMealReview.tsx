import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MealLog {
  id: string;
  athleteName: string;
  athleteAvatar: string;
  timestamp: string;
  day: string;
  imageUrl: string | null;
  analysis: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    mealType: string;
    foods: string[];
    healthScore: number;
  };
  trainerNotes: Record<string, string>;
}

const mockMealLogs: MealLog[] = [
  {
    id: "ml1",
    athleteName: "Rahul",
    athleteAvatar: "R",
    timestamp: "Today, 12:30 PM",
    day: "Monday",
    imageUrl: null,
    analysis: { calories: 650, protein: 52, carbs: 70, fats: 18, fiber: 6, mealType: "Lunch", foods: ["Chicken curry", "Brown rice", "Dal", "Salad"], healthScore: 82 },
    trainerNotes: {},
  },
  {
    id: "ml2",
    athleteName: "Priya",
    athleteAvatar: "P",
    timestamp: "Today, 1:15 PM",
    day: "Monday",
    imageUrl: null,
    analysis: { calories: 480, protein: 35, carbs: 55, fats: 14, fiber: 8, mealType: "Lunch", foods: ["Paneer tikka", "Roti", "Raita", "Cucumber"], healthScore: 78 },
    trainerNotes: {},
  },
  {
    id: "ml3",
    athleteName: "Aarav",
    athleteAvatar: "A",
    timestamp: "Today, 8:00 AM",
    day: "Monday",
    imageUrl: null,
    analysis: { calories: 380, protein: 28, carbs: 40, fats: 12, fiber: 4, mealType: "Breakfast", foods: ["Oats", "Banana", "Protein shake", "Almonds"], healthScore: 88 },
    trainerNotes: {},
  },
];

const nutrientFields = [
  { key: "protein", label: "Protein", unit: "g", bg: "bg-pastel-pink" },
  { key: "carbs", label: "Carbs", unit: "g", bg: "bg-pastel-sky" },
  { key: "fats", label: "Fats", unit: "g", bg: "bg-pastel-sage" },
  { key: "fiber", label: "Fiber", unit: "g", bg: "bg-pastel-mint" },
];

export default function TrainerMealReview() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [logs, setLogs] = useState(mockMealLogs);

  const updateNote = (logId: string, nutrient: string, note: string) => {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? { ...l, trainerNotes: { ...l.trainerNotes, [nutrient]: note } }
          : l
      )
    );
  };

  const saveNotes = (logId: string) => {
    toast.success("Trainer notes saved successfully!");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold font-heading text-lg">Athlete Meal Reviews</h3>
      {logs.map((log) => (
        <div key={log.id} className="bg-card rounded-3xl border border-border overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            className="w-full p-5 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center font-bold text-sm">
              {log.athleteAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{log.athleteName}</p>
              <p className="text-xs text-muted-foreground">{log.timestamp} · {log.day} · {log.analysis.mealType}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded-full bg-pastel-yellow font-medium">{log.analysis.calories} cal</span>
              <span className="text-xs px-2 py-1 rounded-full bg-pastel-sage font-medium">Score: {log.analysis.healthScore}</span>
              {expanded === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Expanded content */}
          {expanded === log.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border"
            >
              {/* AI Analysis */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Detected Foods</p>
                  <div className="flex flex-wrap gap-2">
                    {log.analysis.foods.map((f) => (
                      <span key={f} className="text-xs px-3 py-1 rounded-full bg-secondary">{f}</span>
                    ))}
                  </div>
                </div>

                {/* Nutrient blocks with trainer notes */}
                <div className="space-y-3">
                  {nutrientFields.map((nf) => (
                    <div key={nf.key} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`${nf.bg} rounded-xl px-3 py-2 text-center min-w-[80px]`}>
                          <p className="text-sm font-bold">{(log.analysis as any)[nf.key]}{nf.unit}</p>
                          <p className="text-[10px] text-foreground/60">{nf.label}</p>
                        </div>
                        <div className="flex-1">
                          <Textarea
                            placeholder={`Coach Sachin's note on ${nf.label}...`}
                            value={log.trainerNotes[nf.key] || ""}
                            onChange={(e) => updateNote(log.id, nf.key, e.target.value)}
                            className="rounded-xl text-xs min-h-[40px] resize-none"
                            rows={1}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={() => saveNotes(log.id)} size="sm" className="rounded-xl gap-1 w-full">
                  <MessageSquare className="w-4 h-4" /> Save Notes
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
