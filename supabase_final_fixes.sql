-- 1. FIX Srijith's Admin Role (So the Backend Recognizes Him)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, app_metadata, user_metadata, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, confirmation_token, email_change, email_change_token_new, recovery_token)
SELECT '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'libernest05@gmail.com', '', now(), null, now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now(), null, null, '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'libernest05@gmail.com');

DO $$
DECLARE
    srijith_id UUID;
BEGIN
    SELECT id INTO srijith_id FROM auth.users WHERE email = 'libernest05@gmail.com' LIMIT 1;
    
    IF srijith_id IS NOT NULL THEN
        -- Upsert Role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (srijith_id, 'admin') 
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

        -- Upsert Profile
        INSERT INTO public.profiles (user_id, display_name)
        VALUES (srijith_id, 'Coach Sreejith')
        ON CONFLICT (user_id) DO UPDATE SET display_name = 'Coach Sreejith';
    END IF;
END $$;


-- 2. FIX ATHLETE O-CALORIE BUG (Allow athletes to read their own meal analysis)
DROP POLICY IF EXISTS "Athletes can view their own meal analysis" ON meal_analysis_results;
CREATE POLICY "Athletes can view their own meal analysis" ON meal_analysis_results 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_uploads
      WHERE meal_uploads.id = meal_analysis_results.meal_upload_id
      AND meal_uploads.athlete_id = auth.uid()
    )
  );

-- 3. CREATE DAILY LOGS TABLE (For permantent archiving)
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_calories INT DEFAULT 0,
    total_protein NUMERIC DEFAULT 0,
    total_carbs NUMERIC DEFAULT 0,
    total_fats NUMERIC DEFAULT 0,
    water_glasses INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(athlete_id, date)
);

-- RLS for Daily Logs
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view their own logs" ON daily_logs FOR SELECT USING (athlete_id = auth.uid());
CREATE POLICY "Trainers can view assigned athlete logs" ON daily_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = daily_logs.athlete_id AND profiles.trainer_id = auth.uid())
);


-- 4. PG_CRON FUNCTION (2 AM Daily Summary Logging)
CREATE OR REPLACE FUNCTION generate_daily_summaries() RETURNS void AS $$
DECLARE
    target_date DATE := (CURRENT_DATE - INTERVAL '1 day')::DATE;
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT 
            u.athlete_id,
            SUM(COALESCE((m.totals->>'calories')::int, 0)) as total_calories,
            SUM(COALESCE((m.totals->>'protein')::numeric, 0)) as total_protein,
            SUM(COALESCE((m.totals->>'carbs')::numeric, 0)) as total_carbs,
            SUM(COALESCE((m.totals->>'fats')::numeric, 0)) as total_fats
        FROM meal_uploads u
        JOIN meal_analysis_results m ON m.meal_upload_id = u.id
        WHERE DATE(u.created_at AT TIME ZONE 'UTC') = target_date
        GROUP BY u.athlete_id
    LOOP
        INSERT INTO daily_logs (athlete_id, date, total_calories, total_protein, total_carbs, total_fats)
        VALUES (rec.athlete_id, target_date, rec.total_calories, rec.total_protein, rec.total_carbs, rec.total_fats)
        ON CONFLICT (athlete_id, date) DO UPDATE 
        SET total_calories = EXCLUDED.total_calories,
            total_protein = EXCLUDED.total_protein,
            total_carbs = EXCLUDED.total_carbs,
            total_fats = EXCLUDED.total_fats;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. SCHEDULE THE CRON JOB 
-- Need to run as superuser postgres, so we use pg_cron (ensure the extension is enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule it to run at 2:00 AM every day
-- Note: Supabase free tier requires the pg_cron extension, otherwise use standard cron if available.
SELECT cron.schedule('generate_daily_summaries_job', '0 2 * * *', $$SELECT generate_daily_summaries();$$);
