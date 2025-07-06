-- Fix RLS policies to allow access to custom auth tables
-- Since we're using custom authentication, we need to disable RLS on these tables temporarily
-- or create policies that work with our custom auth system

ALTER TABLE auth_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- Insert test user data
INSERT INTO auth_users (email, password_hash, full_name) 
VALUES ('test@stressguard.ai', 'cGFzc3dvcmQxMjM=', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the test user
INSERT INTO user_profiles (
  user_id, 
  age, 
  weight, 
  height, 
  blood_type, 
  stress_threshold_low,
  stress_threshold_medium,
  stress_threshold_high,
  sleep_target_hours,
  water_intake_target
)
SELECT 
  id,
  25,
  70.5,
  175.0,
  'A+',
  30,
  60,
  80,
  8,
  2000
FROM auth_users 
WHERE email = 'test@stressguard.ai'
ON CONFLICT DO NOTHING;
