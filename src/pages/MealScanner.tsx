import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Edit3, Check, AlertTriangle, Sparkles, Image as ImageIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMealAnalysis } from "@/hooks/useMealAnalysis";
import { useMealLogs } from "@/hooks/useMealLogs";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MealScanner() {
  const { phase, result, error, imagePreview, imageFile, selectImage, analyze, reset } = useMealAnalysis();
  const { logMeal } = useMealLogs();
  const { user } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [editingFood, setEditingFood] = useState<number | null>(null);
  const [logging, setLogging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [editedFoods, setEditedFoods] = useState<any[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectImage(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      selectImage(file);
    } else {
      toast.error("Please drop a valid image file");
    }
  }, [selectImage]);

  const handleAnalyze = () => {
    if (phase !== "image_selected") {
      toast.error("Please upload or capture a meal image first");
      return;
    }
    analyze();
  };

  const handleLogMeal = async () => {
    if (!user || !result || !imageFile) return;
    setLogging(true);
    try {
      // Upload image to storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { data: uploadData } = await supabase.storage
        .from("meal-images")
        .upload(fileName, imageFile);

      const imageUrl = uploadData?.path
        ? supabase.storage.from("meal-images").getPublicUrl(uploadData.path).data.publicUrl
        : null;

      // Create meal_upload
      const { data: upload } = await supabase
        .from("meal_uploads")
        .insert({
          athlete_id: user.id,
          image_url: imageUrl,
          meal_type: result.mealType,
          day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
          status: "logged" as any,
        })
        .select()
        .single();

      if (upload) {
        // Save analysis
        await supabase.from("meal_analysis_results").insert({
          meal_upload_id: upload.id,
          foods: result.foods as any,
          totals: result.totals as any,
          micronutrients: result.micronutrients as any,
          suggestions: result.suggestions as any,
          confidence: result.confidence,
          meal_type: result.mealType,
        });

        // Log the meal
        await logMeal(null, upload.id, "completed");

        toast.success("Meal logged successfully! 🎯");
        reset();
      }
    } catch (err) {
      toast.error("Failed to log meal");
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const updateFood = (idx: number, field: string, value: string) => {
    const src = result?.foods ?? [];
    const updated = [...src];
    updated[idx] = { ...updated[idx], [field]: field === "name" ? value : Number(value) || 0 };
    setEditedFoods(updated as any);
  };

  const displayFoods = result?.foods ?? [];
  const totals = result?.totals ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">AI Meal Scanner</h1>
          <p className="text-muted-foreground mt-1">Upload a meal photo for instant nutrition analysis</p>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

        <AnimatePresence mode="wait">
          {(phase === "idle" || phase === "image_selected") && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-3xl p-16 text-center transition-colors ${
                  dragOver ? "border-foreground bg-secondary" : "border-border"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Meal preview" className="max-h-64 mx-auto rounded-2xl object-cover" />
                    <p className="text-sm text-muted-foreground">Image selected ✓</p>
                    <Button variant="ghost" size="sm" onClick={reset} className="rounded-full gap-1">
                      <X className="w-4 h-4" /> Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-pastel-yellow flex items-center justify-center mx-auto mb-6">
                      <Camera className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-2">Drop your meal photo here</h3>
                    <p className="text-muted-foreground text-sm mb-6">or click to browse files</p>
                  </>
                )}
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="rounded-full gap-2 h-12 px-6">
                    <Upload className="w-5 h-5" /> Upload Photo
                  </Button>
                  <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="rounded-full gap-2 h-12 px-6">
                    <Camera className="w-5 h-5" /> Take Photo
                  </Button>
                </div>
              </div>

              {phase === "image_selected" && (
                <Button onClick={handleAnalyze} className="w-full rounded-2xl h-14 text-base gap-2">
                  <Sparkles className="w-5 h-5" /> Analyze with AI
                </Button>
              )}
            </motion.div>
          )}

          {phase === "failed" && error && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-pastel-coral pastel-card text-center py-16 space-y-4">
              <AlertTriangle className="w-12 h-12 mx-auto opacity-70" />
              <h3 className="text-xl font-bold font-heading">Analysis Failed</h3>
              <p className="text-sm text-foreground/60">{error}</p>
              <Button onClick={reset} variant="outline" className="rounded-full">Try Again</Button>
            </motion.div>
          )}

          {phase === "analyzing" && (
            <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-pastel-lavender pastel-card text-center py-20">
              {imagePreview && (
                <img src={imagePreview} alt="Analyzing" className="w-32 h-32 mx-auto rounded-2xl object-cover mb-6 opacity-70" />
              )}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 rounded-full border-4 border-foreground/20 border-t-foreground mx-auto mb-6" />
              <h3 className="text-xl font-bold font-heading mb-2">Analyzing your meal...</h3>
              <p className="text-sm text-foreground/60">Detecting food items, estimating portions, calculating macros</p>
            </motion.div>
          )}

          {phase === "completed" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Meal" className="w-full max-h-64 object-cover rounded-3xl" />
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                    {result.confidence}% confidence
                  </div>
                  <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
                    {result.mealType} · {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-pastel-yellow pastel-card text-center">
                  <p className="text-3xl font-bold font-heading">{totals.calories}</p>
                  <p className="text-xs text-foreground/60">Calories</p>
                </div>
                <div className="bg-pastel-pink pastel-card text-center">
                  <p className="text-3xl font-bold font-heading">{totals.protein.toFixed(1)}g</p>
                  <p className="text-xs text-foreground/60">Protein</p>
                </div>
                <div className="bg-pastel-sky pastel-card text-center">
                  <p className="text-3xl font-bold font-heading">{totals.carbs.toFixed(1)}g</p>
                  <p className="text-xs text-foreground/60">Carbs</p>
                </div>
                <div className="bg-pastel-sage pastel-card text-center">
                  <p className="text-3xl font-bold font-heading">{totals.fats.toFixed(1)}g</p>
                  <p className="text-xs text-foreground/60">Fats</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-pastel-mint pastel-card text-center">
                  <Sparkles className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-3xl font-bold font-heading">{result.totals.mealScore}</p>
                  <p className="text-xs text-foreground/60">Meal Score</p>
                </div>
                <div className="bg-pastel-peach pastel-card text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-xl font-bold font-heading capitalize">{result.totals.insulinSpike}</p>
                  <p className="text-xs text-foreground/60">Insulin Spike</p>
                </div>
                <div className="bg-pastel-lavender pastel-card text-center">
                  <Check className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-3xl font-bold font-heading">{result.totals.suitabilityScore}</p>
                  <p className="text-xs text-foreground/60">BB Suitability</p>
                </div>
              </div>

              <div className="bg-card rounded-3xl border border-border overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold font-heading">Detected Foods</h3>
                  <p className="text-xs text-muted-foreground">Tap edit to adjust portions</p>
                </div>
                {result.foods.map((food, idx) => (
                  <div key={idx} className="p-5 border-b border-border last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      {editingFood === idx ? (
                        <div className="flex gap-2 flex-1 mr-4">
                          <Input value={food.name} onChange={(e) => updateFood(idx, "name", e.target.value)} className="h-9 rounded-xl flex-1" />
                          <Input value={food.grams} onChange={(e) => updateFood(idx, "grams", e.target.value)} className="h-9 rounded-xl w-20" placeholder="g" type="number" />
                          <Button size="sm" onClick={() => setEditingFood(null)} className="rounded-xl"><Check className="w-4 h-4" /></Button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="font-medium">{food.name}</p>
                            <p className="text-xs text-muted-foreground">{food.grams}g</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setEditingFood(idx)} className="rounded-xl gap-1">
                            <Edit3 className="w-3 h-3" /> Edit
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 text-center text-xs">
                      <div className="bg-pastel-yellow/50 rounded-xl p-2"><p className="font-bold">{food.calories}</p><p className="text-foreground/50">cal</p></div>
                      <div className="bg-pastel-pink/50 rounded-xl p-2"><p className="font-bold">{food.protein}g</p><p className="text-foreground/50">pro</p></div>
                      <div className="bg-pastel-sky/50 rounded-xl p-2"><p className="font-bold">{food.carbs}g</p><p className="text-foreground/50">carb</p></div>
                      <div className="bg-pastel-sage/50 rounded-xl p-2"><p className="font-bold">{food.fats}g</p><p className="text-foreground/50">fat</p></div>
                      <div className="hidden md:block bg-secondary rounded-xl p-2"><p className="font-bold">{food.goodFat}g</p><p className="text-foreground/50">good fat</p></div>
                      <div className="hidden md:block bg-secondary rounded-xl p-2"><p className="font-bold">{food.complexCarbs}g</p><p className="text-foreground/50">complex</p></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-3xl p-5 border border-border">
                <h3 className="font-bold font-heading mb-4">Micronutrients (% DV)</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(result.micronutrients).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-foreground/15 flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-bold">{val}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground capitalize">{key.replace("vitamin", "Vit ")}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-pastel-yellow pastel-card">
                <h3 className="font-bold font-heading mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5" /> AI Suggestions</h3>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 rounded-2xl h-12"
                  onClick={handleLogMeal}
                  disabled={logging}
                >
                  {logging ? "Logging..." : "Log This Meal"}
                </Button>
                <Button variant="outline" className="rounded-2xl h-12" onClick={reset}>
                  Scan Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
