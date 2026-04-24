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

const PROMPT = `
You are an expert AI sports nutritionist + computer vision meal analyzer.

TASK:
Analyze the uploaded meal image VERY PRECISELY.

CRITICAL RULES:
1. Detect EVERY visible ingredient separately from the plate/bowl/tray.
2. Include sauces, oil, toppings, vegetables, grains, fruits, nuts, seeds, side items.
3. DO NOT combine foods unless visually inseparable.
4. Portion sizes must be realistic in grams.
5. Macronutrients must match each individual ingredient.
6. Micronutrients should reflect visible foods only.
7. If multiple items exist in bowl, detect all layers.
8. Output ONLY pure JSON.
9. totals must equal sum of all foods.
10. Be highly accurate for professional bodybuilding nutrition.
11. Cover protein, carbs, fats, good/bad fats, simple/complex carbs, fiber.
12. Include only foods actually visible in image.

JSON STRUCTURE:
{
  "foods": [
    {
      "name": "string",
      "grams": 0,
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fats": 0,
      "goodFat": 0,
      "badFat": 0,
      "simpleCarbs": 0,
      "complexCarbs": 0,
      "fiber": 0
    }
  ],
  "totals": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "fiber": 0,
    "glycemicLoad": 0,
    "insulinSpike": "low",
    "mealScore": 0,
    "suitabilityScore": 0,
    "healthScore": 0
  },
  "micronutrients": {
    "vitaminA": 0,
    "vitaminC": 0,
    "vitaminD": 0,
    "B12": 0,
    "iron": 0,
    "calcium": 0,
    "potassium": 0,
    "magnesium": 0,
    "zinc": 0,
    "sodium": 0,
    "folate": 0,
    "omega3": 0
  },
  "mealType": "string",
  "suggestions": ["string"],
  "confidence": 0
}
`;

export async function analyzeMealImage(imageFile: File): Promise<MealAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in .env");
  }

  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || "image/jpeg";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: PROMPT }],
        },
        contents: [
          {
            parts: [
              { text: "Analyze this meal image. Return ONLY the JSON structure as specified." },
              {
                inlineData: {
                  mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API error:", response.status, errText);

    let errorDetail = `Gemini API error: ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson?.error?.message) {
        errorDetail = errJson.error.message;
      }
    } catch { /* use default message */ }

    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("No AI response returned");
  }

  // Clean and parse
  const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("JSON parse failed:", parseErr, "Raw:", cleaned.substring(0, 500));
    throw new Error("Failed to parse AI response");
  }

  // Recalculate totals from individual foods for accuracy
  if (parsed.foods && Array.isArray(parsed.foods)) {
    const corrected = parsed.foods.reduce(
      (acc: any, food: any) => {
        acc.calories += food.calories || 0;
        acc.protein += food.protein || 0;
        acc.carbs += food.carbs || 0;
        acc.fats += food.fats || 0;
        acc.fiber += food.fiber || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
    parsed.totals = { ...parsed.totals, ...corrected };
  }

  return { ...parsed, timestamp: new Date().toISOString() } as MealAnalysisResult;
}
