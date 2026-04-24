// Demo data for sales/presentation purposes — shown when Supabase has no real data

const daysAgo = (n: number, hour = 8, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// ─── Athletes ───────────────────────────────────────────────────────────────

export const demoAthletes = [
  {
    user_id: "demo-1",
    display_name: "Marcus Thompson",
    avatar_url: null,
    trainer_id: "demo-coach",
    created_at: daysAgo(38),
  },
  {
    user_id: "demo-2",
    display_name: "Priya Kapoor",
    avatar_url: null,
    trainer_id: "demo-coach",
    created_at: daysAgo(25),
  },
  {
    user_id: "demo-3",
    display_name: "Jake Rivera",
    avatar_url: null,
    trainer_id: "demo-coach",
    created_at: daysAgo(19),
  },
];

// ─── Meals feed (recent 3 weeks, mixed statuses) ─────────────────────────────

export const demoMeals: {
  id: string;
  athlete_id: string;
  athlete_name: string;
  meal_type: string;
  image_url: null;
  created_at: string;
  status: "approved" | "pending" | "rejected";
  day: string;
  analysis: { totals: { calories: number; protein: number; carbs: number; fats: number } };
}[] = [
  // ── Today ──
  {
    id: "dm-01", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Pre-Workout Meal", image_url: null, created_at: daysAgo(0, 6, 30),
    status: "approved", day: "Today",
    analysis: { totals: { calories: 450, protein: 38, carbs: 62, fats: 7 } },
  },
  {
    id: "dm-02", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Post-Workout Shake", image_url: null, created_at: daysAgo(0, 9, 15),
    status: "approved", day: "Today",
    analysis: { totals: { calories: 510, protein: 52, carbs: 55, fats: 6 } },
  },
  {
    id: "dm-03", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Breakfast – Oats & Eggs", image_url: null, created_at: daysAgo(0, 7, 45),
    status: "pending", day: "Today",
    analysis: { totals: { calories: 540, protein: 34, carbs: 72, fats: 14 } },
  },
  {
    id: "dm-04", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Breakfast – Pancakes & Syrup", image_url: null, created_at: daysAgo(0, 8, 0),
    status: "rejected", day: "Today",
    analysis: { totals: { calories: 820, protein: 18, carbs: 145, fats: 22 } },
  },
  {
    id: "dm-05", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Mid-Morning Snack", image_url: null, created_at: daysAgo(0, 10, 30),
    status: "approved", day: "Today",
    analysis: { totals: { calories: 210, protein: 22, carbs: 18, fats: 6 } },
  },

  // ── Yesterday ──
  {
    id: "dm-06", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Chicken & Rice – Lunch", image_url: null, created_at: daysAgo(1, 12, 30),
    status: "approved", day: "Yesterday",
    analysis: { totals: { calories: 720, protein: 58, carbs: 84, fats: 14 } },
  },
  {
    id: "dm-07", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Lunch – Biryani", image_url: null, created_at: daysAgo(1, 13, 0),
    status: "approved", day: "Yesterday",
    analysis: { totals: { calories: 680, protein: 42, carbs: 76, fats: 20 } },
  },
  {
    id: "dm-08", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Afternoon Snack – Paneer", image_url: null, created_at: daysAgo(1, 15, 30),
    status: "approved", day: "Yesterday",
    analysis: { totals: { calories: 380, protein: 38, carbs: 8, fats: 20 } },
  },
  {
    id: "dm-09", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Post-Workout – Whey & Banana", image_url: null, created_at: daysAgo(1, 10, 0),
    status: "approved", day: "Yesterday",
    analysis: { totals: { calories: 430, protein: 40, carbs: 52, fats: 5 } },
  },
  {
    id: "dm-10", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Dinner – Salmon & Asparagus", image_url: null, created_at: daysAgo(1, 18, 45),
    status: "approved", day: "Yesterday",
    analysis: { totals: { calories: 580, protein: 52, carbs: 18, fats: 28 } },
  },
  {
    id: "dm-11", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Pre-Bed – Casein Shake", image_url: null, created_at: daysAgo(1, 21, 30),
    status: "approved", day: "Yesterday",
    analysis: { totals: { calories: 290, protein: 40, carbs: 12, fats: 5 } },
  },

  // ── 2 days ago ──
  {
    id: "dm-12", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Lunch – Dal Tadka & Brown Rice", image_url: null, created_at: daysAgo(2, 12, 0),
    status: "approved", day: "2 days ago",
    analysis: { totals: { calories: 610, protein: 28, carbs: 88, fats: 12 } },
  },
  {
    id: "dm-13", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Pre-Workout – Oatmeal", image_url: null, created_at: daysAgo(2, 6, 0),
    status: "approved", day: "2 days ago",
    analysis: { totals: { calories: 420, protein: 32, carbs: 60, fats: 6 } },
  },
  {
    id: "dm-14", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Breakfast – Skipped", image_url: null, created_at: daysAgo(2, 9, 0),
    status: "rejected", day: "2 days ago",
    analysis: { totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } },
  },
  {
    id: "dm-15", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Evening Snack – Greek Yoghurt", image_url: null, created_at: daysAgo(2, 17, 0),
    status: "approved", day: "2 days ago",
    analysis: { totals: { calories: 180, protein: 18, carbs: 14, fats: 4 } },
  },

  // ── 3–5 days ago ──
  {
    id: "dm-16", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Lunch – Turkey Wrap", image_url: null, created_at: daysAgo(3, 13, 0),
    status: "approved", day: "3 days ago",
    analysis: { totals: { calories: 640, protein: 55, carbs: 62, fats: 18 } },
  },
  {
    id: "dm-17", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Lunch – Grilled Chicken & Sweet Potato", image_url: null, created_at: daysAgo(3, 12, 30),
    status: "approved", day: "3 days ago",
    analysis: { totals: { calories: 570, protein: 48, carbs: 58, fats: 10 } },
  },
  {
    id: "dm-18", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Pre-Workout – Banana & PB", image_url: null, created_at: daysAgo(4, 7, 0),
    status: "approved", day: "4 days ago",
    analysis: { totals: { calories: 310, protein: 10, carbs: 42, fats: 12 } },
  },
  {
    id: "dm-19", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Dinner – Egg Whites & Salad", image_url: null, created_at: daysAgo(4, 19, 0),
    status: "approved", day: "4 days ago",
    analysis: { totals: { calories: 320, protein: 42, carbs: 12, fats: 8 } },
  },
  {
    id: "dm-20", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Cheat Meal – Pizza (2 slices)", image_url: null, created_at: daysAgo(5, 20, 0),
    status: "rejected", day: "5 days ago",
    analysis: { totals: { calories: 980, protein: 34, carbs: 112, fats: 40 } },
  },
  {
    id: "dm-21", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Post-Workout Shake", image_url: null, created_at: daysAgo(5, 10, 0),
    status: "approved", day: "5 days ago",
    analysis: { totals: { calories: 460, protein: 44, carbs: 50, fats: 6 } },
  },
  {
    id: "dm-22", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Pre-Workout Meal", image_url: null, created_at: daysAgo(5, 6, 30),
    status: "approved", day: "5 days ago",
    analysis: { totals: { calories: 440, protein: 36, carbs: 60, fats: 6 } },
  },

  // ── 6–10 days ago ──
  {
    id: "dm-23", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Lunch – Grilled Chicken & Rice", image_url: null, created_at: daysAgo(6, 12, 0),
    status: "approved", day: "6 days ago",
    analysis: { totals: { calories: 700, protein: 60, carbs: 80, fats: 12 } },
  },
  {
    id: "dm-24", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Dinner – Paneer Tikka", image_url: null, created_at: daysAgo(6, 19, 30),
    status: "approved", day: "6 days ago",
    analysis: { totals: { calories: 480, protein: 36, carbs: 22, fats: 28 } },
  },
  {
    id: "dm-25", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Breakfast – Eggs & Toast", image_url: null, created_at: daysAgo(7, 7, 30),
    status: "approved", day: "7 days ago",
    analysis: { totals: { calories: 490, protein: 28, carbs: 48, fats: 18 } },
  },
  {
    id: "dm-26", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Post-Workout – Whey & Oats", image_url: null, created_at: daysAgo(7, 9, 0),
    status: "approved", day: "7 days ago",
    analysis: { totals: { calories: 530, protein: 50, carbs: 58, fats: 7 } },
  },
  {
    id: "dm-27", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Lunch – Chole Rice", image_url: null, created_at: daysAgo(8, 13, 0),
    status: "pending", day: "8 days ago",
    analysis: { totals: { calories: 660, protein: 26, carbs: 100, fats: 16 } },
  },
  {
    id: "dm-28", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Pre-Workout – Black Coffee & Bar", image_url: null, created_at: daysAgo(8, 6, 0),
    status: "approved", day: "8 days ago",
    analysis: { totals: { calories: 280, protein: 18, carbs: 34, fats: 8 } },
  },
  {
    id: "dm-29", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Dinner – Beef Stir Fry", image_url: null, created_at: daysAgo(9, 19, 0),
    status: "approved", day: "9 days ago",
    analysis: { totals: { calories: 640, protein: 55, carbs: 44, fats: 26 } },
  },
  {
    id: "dm-30", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Post-Workout Shake", image_url: null, created_at: daysAgo(10, 10, 0),
    status: "approved", day: "10 days ago",
    analysis: { totals: { calories: 420, protein: 42, carbs: 46, fats: 5 } },
  },
  {
    id: "dm-31", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Lunch – Subway 6-inch", image_url: null, created_at: daysAgo(10, 13, 30),
    status: "rejected", day: "10 days ago",
    analysis: { totals: { calories: 540, protein: 28, carbs: 72, fats: 14 } },
  },
  {
    id: "dm-32", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Pre-Bed Casein", image_url: null, created_at: daysAgo(10, 22, 0),
    status: "approved", day: "10 days ago",
    analysis: { totals: { calories: 290, protein: 40, carbs: 10, fats: 5 } },
  },

  // ── 11–21 days ago ──
  {
    id: "dm-33", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Lunch – Tuna & Veg", image_url: null, created_at: daysAgo(12, 12, 0),
    status: "approved", day: "12 days ago",
    analysis: { totals: { calories: 520, protein: 58, carbs: 30, fats: 14 } },
  },
  {
    id: "dm-34", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Pre-Workout – Dates & Whey", image_url: null, created_at: daysAgo(13, 7, 0),
    status: "approved", day: "13 days ago",
    analysis: { totals: { calories: 340, protein: 30, carbs: 44, fats: 4 } },
  },
  {
    id: "dm-35", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Dinner – Dal & Roti", image_url: null, created_at: daysAgo(13, 20, 0),
    status: "approved", day: "13 days ago",
    analysis: { totals: { calories: 580, protein: 26, carbs: 82, fats: 14 } },
  },
  {
    id: "dm-36", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Post-Workout – Rice Cakes & Protein", image_url: null, created_at: daysAgo(14, 9, 0),
    status: "approved", day: "14 days ago",
    analysis: { totals: { calories: 480, protein: 46, carbs: 54, fats: 5 } },
  },
  {
    id: "dm-37", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Lunch – Rajma Rice", image_url: null, created_at: daysAgo(15, 13, 0),
    status: "approved", day: "15 days ago",
    analysis: { totals: { calories: 650, protein: 30, carbs: 96, fats: 10 } },
  },
  {
    id: "dm-38", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Pre-Workout Meal", image_url: null, created_at: daysAgo(16, 6, 30),
    status: "approved", day: "16 days ago",
    analysis: { totals: { calories: 420, protein: 34, carbs: 54, fats: 8 } },
  },
  {
    id: "dm-39", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Dinner – Grilled Prawns", image_url: null, created_at: daysAgo(17, 19, 30),
    status: "approved", day: "17 days ago",
    analysis: { totals: { calories: 420, protein: 54, carbs: 10, fats: 16 } },
  },
  {
    id: "dm-40", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Snack – Almonds & Fruit", image_url: null, created_at: daysAgo(18, 16, 0),
    status: "approved", day: "18 days ago",
    analysis: { totals: { calories: 240, protein: 8, carbs: 26, fats: 14 } },
  },
  {
    id: "dm-41", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Cheat – Ice Cream", image_url: null, created_at: daysAgo(19, 21, 0),
    status: "rejected", day: "19 days ago",
    analysis: { totals: { calories: 620, protein: 8, carbs: 88, fats: 28 } },
  },
  {
    id: "dm-42", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Post-Workout Shake", image_url: null, created_at: daysAgo(20, 9, 0),
    status: "approved", day: "20 days ago",
    analysis: { totals: { calories: 510, protein: 50, carbs: 56, fats: 6 } },
  },
  {
    id: "dm-43", athlete_id: "demo-2", athlete_name: "Priya Kapoor",
    meal_type: "Dinner – Chicken Curry", image_url: null, created_at: daysAgo(20, 20, 0),
    status: "approved", day: "20 days ago",
    analysis: { totals: { calories: 560, protein: 44, carbs: 36, fats: 24 } },
  },
  {
    id: "dm-44", athlete_id: "demo-3", athlete_name: "Jake Rivera",
    meal_type: "Lunch – Egg Fried Rice", image_url: null, created_at: daysAgo(21, 13, 0),
    status: "approved", day: "21 days ago",
    analysis: { totals: { calories: 620, protein: 24, carbs: 90, fats: 18 } },
  },
  {
    id: "dm-45", athlete_id: "demo-1", athlete_name: "Marcus Thompson",
    meal_type: "Pre-Bed Casein", image_url: null, created_at: daysAgo(21, 22, 0),
    status: "approved", day: "21 days ago",
    analysis: { totals: { calories: 290, protein: 40, carbs: 10, fats: 5 } },
  },
];

// ─── 14-day chart data ────────────────────────────────────────────────────────

export const demoChartData = [
  { day: "Apr 11", calories: 3050, protein: 268, carbs: 310, fats: 78, compliance: 88 },
  { day: "Apr 12", calories: 3180, protein: 275, carbs: 318, fats: 82, compliance: 92 },
  { day: "Apr 13", calories: 3220, protein: 282, carbs: 325, fats: 85, compliance: 97 },
  { day: "Apr 14", calories: 2940, protein: 255, carbs: 290, fats: 76, compliance: 84 },
  { day: "Apr 15", calories: 3200, protein: 280, carbs: 320, fats: 84, compliance: 95 },
  { day: "Apr 16", calories: 3260, protein: 288, carbs: 332, fats: 86, compliance: 98 },
  { day: "Apr 17", calories: 2880, protein: 252, carbs: 278, fats: 74, compliance: 80 },
  { day: "Apr 18", calories: 3150, protein: 272, carbs: 314, fats: 80, compliance: 91 },
  { day: "Apr 19", calories: 3210, protein: 280, carbs: 322, fats: 83, compliance: 94 },
  { day: "Apr 20", calories: 3240, protein: 284, carbs: 328, fats: 85, compliance: 96 },
  { day: "Apr 21", calories: 3100, protein: 270, carbs: 308, fats: 81, compliance: 90 },
  { day: "Apr 22", calories: 3280, protein: 290, carbs: 335, fats: 87, compliance: 98 },
  { day: "Apr 23", calories: 3190, protein: 278, carbs: 320, fats: 83, compliance: 93 },
  { day: "Apr 24", calories: 3220, protein: 282, carbs: 324, fats: 85, compliance: 95 },
];

// ─── Demo stat overrides ──────────────────────────────────────────────────────

export const demoStats = {
  totalAthletes: 3,
  totalMeals: 45,
  mealsToday: 5,
  trainers: 1,
  avgCompliance: 91,
};
