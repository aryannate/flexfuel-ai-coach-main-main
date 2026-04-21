-- Apply strict data scoping so coaches can ONLY see their assigned athletes' data.

-- 1. MEAL UPLOADS
DROP POLICY IF EXISTS "Trainers can view all meals" ON meal_uploads;
CREATE POLICY "Trainers can view assigned athlete meals" ON meal_uploads 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = meal_uploads.athlete_id 
      AND profiles.trainer_id = auth.uid()
    )
  );

-- 2. MEAL ANALYSIS RESULTS
-- Ensure trainers can only see analysis for meals uploaded by their assigned athletes
DROP POLICY IF EXISTS "Trainers can view all analysis" ON meal_analysis_results;
CREATE POLICY "Trainers can view assigned athlete meal analysis" ON meal_analysis_results 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_uploads
      JOIN profiles ON profiles.user_id = meal_uploads.athlete_id
      WHERE meal_uploads.id = meal_analysis_results.meal_upload_id
      AND profiles.trainer_id = auth.uid()
    )
  );

-- 3. MEAL LOGS
DROP POLICY IF EXISTS "Trainers can view all logs" ON meal_logs;
CREATE POLICY "Trainers can view assigned athlete meal logs" ON meal_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = meal_logs.athlete_id 
      AND profiles.trainer_id = auth.uid()
    )
  );

-- 4. STREAK DATA
DROP POLICY IF EXISTS "Trainers can view all streaks" ON streak_data;
CREATE POLICY "Trainers can view assigned athlete streaks" ON streak_data 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = streak_data.athlete_id 
      AND profiles.trainer_id = auth.uid()
    )
  );

-- NOTE: The admin policies should still be in effect. Admin can view everything.
-- If any "God Mode" policy is missing, run:
-- CREATE POLICY "Admins can view everything" ON table_name FOR SELECT USING (has_role(auth.uid(), 'admin'));
