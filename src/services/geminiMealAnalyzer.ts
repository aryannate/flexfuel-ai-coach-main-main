import { supabase } from "@/integrations/supabase/client";

export interface MealAnalysisResult {
  foods: {
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    goodFat: number;
    badFat: number;
    simpleCarbs: number;
    complexCarbs: number;
    fiber: number;
  }[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    glycemicLoad: number;
    insulinSpike: "low" | "moderate" | "high";
    mealScore: number;
    suitabilityScore: number;
    healthScore: number;
  };
  micronutrients: Record<string, number>;
  mealType: string;
  suggestions: string[];
  confidence: number;
  timestamp: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeMealImage(imageFile: File): Promise<MealAnalysisResult> {
  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || "image/jpeg";

  const { data, error } = await supabase.functions.invoke("analyze-meal", {
    body: { imageBase64: base64, mimeType },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Analysis failed");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as MealAnalysisResult;
}
