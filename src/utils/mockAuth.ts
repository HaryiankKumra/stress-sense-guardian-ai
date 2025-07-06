// Mock authentication data for testing when Supabase is not accessible
export const mockUsers = [
  {
    id: "1",
    email: "test@stressguard.ai",
    password_hash: "cGFzc3dvcmQxMjM=", // base64 of "password123"
    full_name: "Test User",
  },
  {
    id: "2",
    email: "demo@stressguard.ai",
    password_hash: "ZGVtbzEyMw==", // base64 of "demo123"
    full_name: "Demo User",
  },
];

export const mockProfiles = [
  {
    id: "1",
    user_id: "1",
    age: 25,
    weight: 70.5,
    height: 175.0,
    blood_type: "A+",
    stress_threshold_low: 30,
    stress_threshold_medium: 60,
    stress_threshold_high: 80,
    sleep_target_hours: 8,
    water_intake_target: 2000,
    activity_level: "moderately_active",
  },
  {
    id: "2",
    user_id: "2",
    age: 30,
    weight: 65.0,
    height: 168.0,
    blood_type: "O+",
    stress_threshold_low: 25,
    stress_threshold_medium: 55,
    stress_threshold_high: 75,
    sleep_target_hours: 7,
    water_intake_target: 2500,
    activity_level: "very_active",
  },
];
