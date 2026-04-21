
-- Create enum for meal status
CREATE TYPE public.meal_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for user role
CREATE TYPE public.app_role AS ENUM ('trainer', 'athlete');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  trainer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Trainers can view assigned athlete profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'trainer') AND trainer_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meal uploads table
CREATE TABLE public.meal_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  status meal_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  meal_type TEXT,
  day TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meal_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own meals" ON public.meal_uploads FOR SELECT USING (auth.uid() = athlete_id);
CREATE POLICY "Athletes can create own meals" ON public.meal_uploads FOR INSERT WITH CHECK (auth.uid() = athlete_id);
CREATE POLICY "Trainers can view all meals" ON public.meal_uploads FOR SELECT USING (public.has_role(auth.uid(), 'trainer'));
CREATE POLICY "Trainers can update meal status" ON public.meal_uploads FOR UPDATE USING (public.has_role(auth.uid(), 'trainer'));

-- Meal analysis results
CREATE TABLE public.meal_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_upload_id UUID REFERENCES public.meal_uploads(id) ON DELETE CASCADE NOT NULL UNIQUE,
  foods JSONB NOT NULL DEFAULT '[]',
  totals JSONB NOT NULL DEFAULT '{}',
  micronutrients JSONB NOT NULL DEFAULT '{}',
  suggestions JSONB NOT NULL DEFAULT '[]',
  confidence INTEGER DEFAULT 0,
  meal_type TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meal_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own analysis" ON public.meal_analysis_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.meal_uploads WHERE id = meal_upload_id AND athlete_id = auth.uid()));
CREATE POLICY "Athletes can insert own analysis" ON public.meal_analysis_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.meal_uploads WHERE id = meal_upload_id AND athlete_id = auth.uid()));
CREATE POLICY "Trainers can view all analysis" ON public.meal_analysis_results FOR SELECT
  USING (public.has_role(auth.uid(), 'trainer'));

-- Trainer overrides
CREATE TABLE public.trainer_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_upload_id UUID REFERENCES public.meal_uploads(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES auth.users(id) NOT NULL,
  edited_foods JSONB,
  edited_totals JSONB,
  nutrient_notes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trainer_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage overrides" ON public.trainer_overrides FOR ALL
  USING (public.has_role(auth.uid(), 'trainer'));
CREATE POLICY "Athletes can view overrides on own meals" ON public.trainer_overrides FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.meal_uploads WHERE id = meal_upload_id AND athlete_id = auth.uid()));

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  meal_upload_id UUID REFERENCES public.meal_uploads(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Trainers can create notifications" ON public.notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'trainer'));
-- Also allow system/service role inserts via edge functions

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_meal_uploads_updated_at BEFORE UPDATE ON public.meal_uploads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trainer_overrides_updated_at BEFORE UPDATE ON public.trainer_overrides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_uploads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainer_overrides;

-- Storage bucket for meal images
INSERT INTO storage.buckets (id, name, public) VALUES ('meal-images', 'meal-images', true);

CREATE POLICY "Athletes can upload meal images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Meal images are publicly readable" ON storage.objects FOR SELECT
  USING (bucket_id = 'meal-images');
