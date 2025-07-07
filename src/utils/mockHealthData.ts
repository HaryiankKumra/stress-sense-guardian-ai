
// Mock health records for testing
export const mockHealthRecords = [
  {
    id: "health-1",
    user_id: "1",
    condition: "Hypertension",
    diagnosis_date: "2023-01-15",
    severity: "moderate",
    status: "active",
    symptoms: ["Headaches", "Dizziness", "Chest pain"],
    medications: ["Lisinopril 10mg", "Amlodipine 5mg"],
    notes: "Patient responds well to ACE inhibitors. Monitor blood pressure weekly.",
    created_at: "2023-01-15T10:00:00Z",
    updated_at: "2024-01-10T14:30:00Z"
  },
  {
    id: "health-2",
    user_id: "1", 
    condition: "Generalized Anxiety Disorder",
    diagnosis_date: "2023-03-20",
    severity: "mild",
    status: "active",
    symptoms: ["Excessive worry", "Restlessness", "Fatigue"],
    medications: ["Sertraline 50mg"],
    notes: "Stress management techniques and regular exercise recommended.",
    created_at: "2023-03-20T11:15:00Z",
    updated_at: "2023-12-05T09:45:00Z"
  },
  {
    id: "health-3",
    user_id: "2",
    condition: "Type 2 Diabetes",
    diagnosis_date: "2022-08-10", 
    severity: "moderate",
    status: "active",
    symptoms: ["Increased thirst", "Frequent urination", "Fatigue"],
    medications: ["Metformin 1000mg", "Glipizide 5mg"],
    notes: "HbA1c levels improving with medication and diet changes. Continue monitoring.",
    created_at: "2022-08-10T08:30:00Z",
    updated_at: "2024-01-05T16:20:00Z"
  },
  {
    id: "health-4",
    user_id: "4",
    condition: "Asthma", 
    diagnosis_date: "2020-05-12",
    severity: "mild",
    status: "active",
    symptoms: ["Shortness of breath", "Wheezing", "Chest tightness"],
    medications: ["Albuterol inhaler", "Fluticasone inhaler"],
    notes: "Exercise-induced asthma. Use rescue inhaler before physical activity.",
    created_at: "2020-05-12T13:45:00Z",
    updated_at: "2023-11-18T10:15:00Z"
  },
  {
    id: "health-5",
    user_id: "4",
    condition: "Seasonal Allergies",
    diagnosis_date: "2021-04-08",
    severity: "mild", 
    status: "seasonal",
    symptoms: ["Sneezing", "Runny nose", "Itchy eyes"],
    medications: ["Claritin 10mg", "Nasal spray"],
    notes: "Symptoms typically worsen in spring and fall. Preventive treatment effective.",
    created_at: "2021-04-08T14:20:00Z",
    updated_at: "2023-10-22T11:30:00Z"
  }
];

// Mock chat history for testing
export const mockChatHistory = [
  {
    id: "chat-1",
    user_id: "1",
    session_id: "session-1",
    message_type: "user",
    content: "I've been feeling really stressed lately. Can you help?",
    created_at: "2024-01-07T10:15:00Z"
  },
  {
    id: "chat-2", 
    user_id: "1",
    session_id: "session-1",
    message_type: "assistant",
    content: "I understand you're feeling stressed. Based on your recent data, I can see your stress levels have been elevated. Here are some techniques that might help: 1) Deep breathing exercises, 2) Progressive muscle relaxation, 3) Short walks outside. Would you like me to guide you through any of these?",
    created_at: "2024-01-07T10:15:30Z"
  },
  {
    id: "chat-3",
    user_id: "1", 
    session_id: "session-1",
    message_type: "user",
    content: "Yes, please guide me through deep breathing exercises.",
    created_at: "2024-01-07T10:16:00Z"
  },
  {
    id: "chat-4",
    user_id: "1",
    session_id: "session-1",
    message_type: "assistant", 
    content: "Great choice! Let's do a simple 4-7-8 breathing exercise: 1) Inhale through your nose for 4 counts, 2) Hold your breath for 7 counts, 3) Exhale through your mouth for 8 counts. Repeat this 3-4 times. Focus on making your exhale longer than your inhale - this activates your parasympathetic nervous system and helps reduce stress.",
    created_at: "2024-01-07T10:16:15Z"
  },
  {
    id: "chat-5",
    user_id: "2",
    session_id: "session-2",
    message_type: "user",
    content: "My heart rate seems higher than usual today. Should I be concerned?",
    created_at: "2024-01-07T14:30:00Z"
  },
  {
    id: "chat-6",
    user_id: "2",
    session_id: "session-2", 
    message_type: "assistant",
    content: "I can see your heart rate has been slightly elevated. A few factors could contribute to this: caffeine intake, physical activity, stress, or even room temperature. Your current reading of 78 bpm is still within normal range for your age group (60-100 bpm). However, if you're experiencing chest pain, dizziness, or shortness of breath, please consult a healthcare provider immediately.",
    created_at: "2024-01-07T14:30:25Z"
  }
];
```
