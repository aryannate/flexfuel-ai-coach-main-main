import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const prompt = `
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this meal image. Return ONLY the JSON structure as specified." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 8192,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `AI gateway error: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "No AI response returned" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean and parse
    const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse failed:", parseErr, "Raw:", cleaned.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: cleaned.substring(0, 1000) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    const result = { ...parsed, timestamp: new Date().toISOString() };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-meal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
