
-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Schedules
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id uuid NOT NULL,
  trainer_id uuid NOT NULL,
  day text NOT NULL,
  workout_type text NOT NULL DEFAULT 'training',
  workout_name text NOT NULL DEFAULT '',
  target_calories integer NOT NULL DEFAULT 0,
  target_carbs integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(athlete_id, day)
);
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes can view own schedule" ON public.schedules
  FOR SELECT USING (auth.uid() = athlete_id);
CREATE POLICY "Trainers can manage schedules" ON public.schedules
  FOR ALL USING (has_role(auth.uid(), 'trainer'));

-- Diet plans
CREATE TABLE public.diet_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id uuid NOT NULL,
  trainer_id uuid NOT NULL,
  name text NOT NULL,
  total_calories integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes can view own diet plans" ON public.diet_plans
  FOR SELECT USING (auth.uid() = athlete_id);
CREATE POLICY "Trainers can manage diet plans" ON public.diet_plans
  FOR ALL USING (has_role(auth.uid(), 'trainer'));

-- Diet plan meals
CREATE TABLE public.diet_plan_meals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diet_plan_id uuid NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  meal_order integer NOT NULL DEFAULT 0,
  time text NOT NULL,
  name text NOT NULL,
  foods jsonb NOT NULL DEFAULT '[]',
  calories integer NOT NULL DEFAULT 0,
  protein integer NOT NULL DEFAULT 0,
  carbs integer NOT NULL DEFAULT 0,
  fats integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.diet_plan_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes can view own diet meals" ON public.diet_plan_meals
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.diet_plans WHERE diet_plans.id = diet_plan_meals.diet_plan_id AND diet_plans.athlete_id = auth.uid()
  ));
CREATE POLICY "Trainers can manage diet meals" ON public.diet_plan_meals
  FOR ALL USING (has_role(auth.uid(), 'trainer'));

-- Meal logs
CREATE TABLE public.meal_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id uuid NOT NULL,
  diet_plan_meal_id uuid REFERENCES public.diet_plan_meals(id) ON DELETE SET NULL,
  meal_upload_id uuid REFERENCES public.meal_uploads(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'completed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes can manage own meal logs" ON public.meal_logs
  FOR ALL USING (auth.uid() = athlete_id);
CREATE POLICY "Trainers can view all meal logs" ON public.meal_logs
  FOR SELECT USING (has_role(auth.uid(), 'trainer'));

-- Streak data
CREATE TABLE public.streak_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id uuid NOT NULL,
  date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(athlete_id, date)
);
ALTER TABLE public.streak_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes can manage own streaks" ON public.streak_data
  FOR ALL USING (auth.uid() = athlete_id);
CREATE POLICY "Trainers can view all streaks" ON public.streak_data
  FOR SELECT USING (has_role(auth.uid(), 'trainer'));

-- Triggers
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON public.diet_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime (only new tables)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diet_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diet_plan_meals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.streak_data;

-- Allow user_roles insert for signup
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow athletes to create notifications for themselves
CREATE POLICY "Athletes can create own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
