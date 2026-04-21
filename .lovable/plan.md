## Plan: Full Real-Time Sync

### Step 1: Database tables (migration)
Create new tables:
- `chat_messages` — real-time chat between trainer & athlete
- `schedules` — weekly schedule set by trainer per athlete  
- `diet_plans` + `diet_plan_meals` — trainer-created diet plans per athlete
- `meal_logs` — athlete marks diet meals as completed/skipped
- `streak_data` — daily consistency tracking per athlete
- Enable realtime on all new + existing tables

### Step 2: Wire real authentication
- Update `authContext` to use Supabase auth (signup/login/logout)
- Auto-create profile + role on signup
- Update Login/Signup pages

### Step 3: Real-time chat
- Replace dummy chat with Supabase realtime
- Messages persist and sync between trainer & athlete

### Step 4: Schedule sync
- Trainer creates/edits schedule per athlete
- Athlete sees their assigned schedule in real-time

### Step 5: Diet plan sync
- Trainer's DietPlanner saves to DB per athlete
- Athlete's "My Diet" reads from DB
- Athlete can mark meals completed/skipped → syncs to trainer

### Step 6: Meal logging ("Log This Meal")
- Wire MealScanner's "Log This Meal" button to save to `meal_uploads`
- Trainer sees new uploads in real-time

### Step 7: Streak heatmap from real data
- Track daily completion in `streak_data`
- Both trainer and athlete see real heatmap data
