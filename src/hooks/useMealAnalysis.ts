import { useState, useCallback } from "react";
import { analyzeMealImage, type MealAnalysisResult } from "@/services/geminiMealAnalyzer";

export type AnalysisPhase = "idle" | "image_selected" | "analyzing" | "completed" | "failed";

export function useMealAnalysis() {
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [result, setResult] = useState<MealAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const selectImage = useCallback((file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setPhase("image_selected");
    setResult(null);
    setError(null);
  }, []);

  const analyze = useCallback(async () => {
    if (!imageFile) return;
    setPhase("analyzing");
    setError(null);

    try {
      const analysis = await analyzeMealImage(imageFile);
      setResult(analysis);
      setPhase("completed");
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
      setPhase("failed");
    }
  }, [imageFile]);

  const reset = useCallback(() => {
    setPhase("idle");
    setResult(null);
    setError(null);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }, [imagePreview]);

  return { phase, result, error, imageFile, imagePreview, selectImage, analyze, reset };
}
