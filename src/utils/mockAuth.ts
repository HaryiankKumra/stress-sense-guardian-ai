
// Mock authentication data for testing when Supabase is not accessible
export const mockUsers = [
  {
    id: "1",
    email: "test@stressguard.ai",
    password_hash: "cGFzc3dvcmQxMjM=", // base64 of "password123"
    full_name: "John Doe",
  },
  {
    id: "2", 
    email: "demo@stressguard.ai",
    password_hash: "ZGVtbzEyMw==", // base64 of "demo123"
    full_name: "Jane Smith",
  },
  {
    id: "3",
    email: "admin@stressguard.ai", 
    password_hash: "YWRtaW4xMjM=", // base64 of "admin123"
    full_name: "Admin User",
  },
  {
    id: "4",
    email: "patient@stressguard.ai",
    password_hash: "cGF0aWVudDEyMw==", // base64 of "patient123" 
    full_name: "Sarah Johnson",
  },
];

export const mockProfiles = [
  {
    id: "1",
    user_id: "1",
    age: 28,
    weight: 75.5,
    height: 180.0,
    blood_type: "A+",
    medical_conditions: ["Hypertension", "Anxiety"],
    medications: ["Lisinopril", "Sertraline"],
    allergies: ["Peanuts", "Shellfish"],
    emergency_contact_name: "Mary Doe",
    emergency_contact_phone: "+1-555-0123",
    stress_threshold_low: 25,
    stress_threshold_medium: 55,
    stress_threshold_high: 80,
    sleep_target_hours: 8,
    water_intake_target: 2500,
    activity_level: "moderately_active",
  },
  {
    id: "2",
    user_id: "2", 
    age: 32,
    weight: 68.0,
    height: 165.0,
    blood_type: "O+",
    medical_conditions: ["Diabetes Type 2"],
    medications: ["Metformin"],
    allergies: ["Lactose"],
    emergency_contact_name: "Bob Smith",
    emergency_contact_phone: "+1-555-0456",
    stress_threshold_low: 30,
    stress_threshold_medium: 60,
    stress_threshold_high: 85,
    sleep_target_hours: 7,
    water_intake_target: 2000,
    activity_level: "very_active",
  },
  {
    id: "3",
    user_id: "3",
    age: 45,
    weight: 82.0,
    height: 175.0, 
    blood_type: "B+",
    medical_conditions: ["High Cholesterol"],
    medications: ["Atorvastatin"],
    allergies: [],
    emergency_contact_name: "Admin Emergency",
    emergency_contact_phone: "+1-555-0789",
    stress_threshold_low: 35,
    stress_threshold_medium: 65,
    stress_threshold_high: 90,
    sleep_target_hours: 7,
    water_intake_target: 3000,
    activity_level: "lightly_active",
  },
  {
    id: "4",
    user_id: "4",
    age: 26,
    weight: 62.0,
    height: 168.0,
    blood_type: "AB+", 
    medical_conditions: ["Asthma", "Seasonal Allergies"],
    medications: ["Albuterol", "Claritin"],
    allergies: ["Pollen", "Dust"],
    emergency_contact_name: "Tom Johnson",
    emergency_contact_phone: "+1-555-0321",
    stress_threshold_low: 20,
    stress_threshold_medium: 50,
    stress_threshold_high: 75,
    sleep_target_hours: 9,
    water_intake_target: 2200,
    activity_level: "extremely_active",
  },
];

// Mock sensor data for testing
export const mockSensorData = [
  {
    id: "sensor-1",
    user_id: "1",
    heart_rate: 72,
    temperature: 36.5,
    gsr_value: 0.45,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  },
  {
    id: "sensor-2", 
    user_id: "1",
    heart_rate: 78,
    temperature: 36.7,
    gsr_value: 0.52,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
  },
  {
    id: "sensor-3",
    user_id: "2",
    heart_rate: 65,
    temperature: 36.3,
    gsr_value: 0.38,
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 minutes ago
  },
];

// Mock stress predictions
export const mockStressPredictions = [
  {
    id: "pred-1",
    user_id: "1", 
    stress_level: "moderate",
    confidence: 0.78,
    physiological_score: 0.65,
    facial_score: 0.42,
    combined_score: 0.58,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "pred-2",
    user_id: "1",
    stress_level: "high", 
    confidence: 0.82,
    physiological_score: 0.75,
    facial_score: 0.68,
    combined_score: 0.72,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "pred-3", 
    user_id: "2",
    stress_level: "low",
    confidence: 0.89,
    physiological_score: 0.25,
    facial_score: 0.18,
    combined_score: 0.22,
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];
