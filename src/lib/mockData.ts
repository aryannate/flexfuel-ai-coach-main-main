export const mockAthletes = [
  { id: "1", name: "Rahul Sharma", avatar: "RS", goal: "Competition Prep", weight: 215, compliance: 94, calories: 3200, protein: 280, carbs: 320, fats: 85, status: "on-track" as const },
  { id: "2", name: "Priya Patel", avatar: "PP", goal: "Off-Season Bulk", weight: 145, compliance: 88, calories: 2800, protein: 200, carbs: 380, fats: 70, status: "needs-attention" as const },
  { id: "3", name: "Aarav Mehta", avatar: "AM", goal: "Competition Prep", weight: 235, compliance: 97, calories: 2600, protein: 310, carbs: 200, fats: 80, status: "on-track" as const },
  { id: "4", name: "Neha Gupta", avatar: "NG", goal: "Lean Bulk", weight: 135, compliance: 76, calories: 2400, protein: 180, carbs: 300, fats: 65, status: "at-risk" as const },
  { id: "5", name: "Kunal Singh", avatar: "KS", goal: "Maintenance", weight: 198, compliance: 91, calories: 3000, protein: 250, carbs: 340, fats: 78, status: "on-track" as const },
];

export const mockMeals = [
  { id: "m1", athleteId: "1", time: "7:30 AM", name: "Pre-Workout Meal", calories: 650, protein: 45, carbs: 80, fats: 15, status: "approved" as const, photo: null, insulinSpike: "low" as const },
  { id: "m2", athleteId: "1", time: "10:00 AM", name: "Post-Workout Shake", calories: 480, protein: 55, carbs: 50, fats: 8, status: "approved" as const, photo: null, insulinSpike: "medium" as const },
  { id: "m3", athleteId: "1", time: "1:00 PM", name: "Lunch - Chicken & Rice", calories: 820, protein: 65, carbs: 90, fats: 22, status: "pending" as const, photo: null, insulinSpike: "medium" as const },
  { id: "m4", athleteId: "2", time: "8:00 AM", name: "Oatmeal & Eggs", calories: 550, protein: 35, carbs: 65, fats: 18, status: "pending" as const, photo: null, insulinSpike: "low" as const },
  { id: "m5", athleteId: "3", time: "12:30 PM", name: "Dal & Brown Rice", calories: 750, protein: 60, carbs: 55, fats: 30, status: "rejected" as const, photo: null, insulinSpike: "high" as const },
];

export const mockDietPlan = {
  name: "Competition Prep - Week 8",
  totalCalories: 3200,
  meals: [
    { time: "6:30 AM", name: "Meal 1 - Pre-Workout", foods: ["6 egg whites", "1 cup oatmeal", "1 banana"], calories: 450, protein: 35, carbs: 65, fats: 6 },
    { time: "9:00 AM", name: "Meal 2 - Post-Workout", foods: ["2 scoops whey", "1 cup rice", "1 tbsp honey"], calories: 520, protein: 50, carbs: 70, fats: 5 },
    { time: "12:00 PM", name: "Meal 3 - Lunch", foods: ["200g chicken breast", "2 cups rice", "1 cup broccoli"], calories: 680, protein: 55, carbs: 80, fats: 12 },
    { time: "3:00 PM", name: "Meal 4 - Snack", foods: ["150g paneer tikka", "1 cup asparagus", "1 tbsp olive oil"], calories: 380, protein: 40, carbs: 8, fats: 18 },
    { time: "6:00 PM", name: "Meal 5 - Dinner", foods: ["200g chicken curry", "1 sweet potato", "mixed greens"], calories: 720, protein: 55, carbs: 60, fats: 28 },
    { time: "9:00 PM", name: "Meal 6 - Pre-Bed", foods: ["1 cup curd", "2 tbsp almond butter", "1 scoop casein"], calories: 450, protein: 45, carbs: 15, fats: 22 },
  ],
};

export const mockMessages = [
  { id: "c1", sender: "trainer", name: "Coach Sachin", text: "Great compliance this week Rahul! Let's bump up carbs by 20g on training days.", time: "2:30 PM" },
  { id: "c2", sender: "athlete", name: "Rahul Sharma", text: "Thanks Coach! I've been feeling strong. Should I adjust pre-workout timing too?", time: "2:35 PM" },
  { id: "c3", sender: "trainer", name: "Coach Sachin", text: "Yes, try eating 90 min before instead of 60. It'll help with digestion during heavy squats.", time: "2:38 PM" },
  { id: "c4", sender: "athlete", name: "Rahul Sharma", text: "Got it. Also, my weight was 215.4 this morning. Holding steady!", time: "2:40 PM" },
];

export const mockWeeklyData = [
  { day: "Mon", calories: 3180, protein: 275, carbs: 315, fats: 82, compliance: 95 },
  { day: "Tue", calories: 3220, protein: 282, carbs: 320, fats: 86, compliance: 97 },
  { day: "Wed", calories: 3050, protein: 268, carbs: 298, fats: 80, compliance: 88 },
  { day: "Thu", calories: 3200, protein: 280, carbs: 320, fats: 85, compliance: 94 },
  { day: "Fri", calories: 3250, protein: 285, carbs: 330, fats: 84, compliance: 96 },
  { day: "Sat", calories: 2900, protein: 260, carbs: 280, fats: 78, compliance: 82 },
  { day: "Sun", calories: 3100, protein: 272, carbs: 310, fats: 83, compliance: 90 },
];

export const mockScanResult = {
  foods: [
    { name: "Grilled Chicken Breast", grams: 200, calories: 330, protein: 62, carbs: 0, fats: 7.2, goodFat: 5.1, badFat: 2.1, simpleCarbs: 0, complexCarbs: 0 },
    { name: "Brown Rice", grams: 180, calories: 200, protein: 4.7, carbs: 43, fats: 1.6, goodFat: 1.2, badFat: 0.4, simpleCarbs: 2, complexCarbs: 41 },
    { name: "Steamed Broccoli", grams: 120, calories: 41, protein: 3.4, carbs: 7.9, fats: 0.5, goodFat: 0.4, badFat: 0.1, simpleCarbs: 1.7, complexCarbs: 6.2 },
    { name: "Olive Oil Drizzle", grams: 10, calories: 88, protein: 0, carbs: 0, fats: 10, goodFat: 8.5, badFat: 1.5, simpleCarbs: 0, complexCarbs: 0 },
  ],
  totals: { calories: 659, protein: 70.1, carbs: 50.9, fats: 19.3, fiber: 6.2, glycemicLoad: 18, insulinSpike: "moderate" as const, mealScore: 92, suitabilityScore: 95 },
  micronutrients: { vitaminA: 45, vitaminC: 135, iron: 22, calcium: 8, potassium: 28, magnesium: 18 },
  suggestions: [
    "Add 50g more chicken to hit protein target",
    "Consider swapping brown rice with jasmine rice post-workout for faster glycogen replenishment",
    "Great fiber content from broccoli - supports digestion",
  ],
};

export const pricingPlans = [
  { name: "Starter", price: 49, period: "/month", description: "For individual trainers", features: ["Up to 5 athletes", "AI Meal Scanner", "Basic analytics", "Chat support", "Diet plan templates"], color: "pastel-sage" as const },
  { name: "Pro", price: 129, period: "/month", description: "For serious coaches", features: ["Up to 25 athletes", "AI Meal Scanner", "Advanced analytics", "Priority support", "Custom diet plans", "Progress reports", "Insulin tracking"], color: "pastel-yellow" as const, popular: true },
  { name: "Elite", price: 299, period: "/month", description: "For coaching businesses", features: ["Unlimited athletes", "AI Meal Scanner", "Full analytics suite", "24/7 support", "White-label option", "API access", "PED notes", "Team management"], color: "pastel-pink" as const },
];
