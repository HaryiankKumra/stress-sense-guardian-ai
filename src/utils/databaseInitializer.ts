import { supabase } from "@/integrations/supabase/client";
// import {
//   mockUsers,
//   mockHealthRecords,
//   mockStressData,
//   mockChatHistory,
//   mockBiometricReadings,
// } from "./mockHealthData";

interface InitializeOptions {
  force?: boolean;
  includeHealthRecords?: boolean;
  includeStressData?: boolean;
  includeChatHistory?: boolean;
  includeBiometricData?: boolean;
}

export const initializeDatabaseWithSampleData = async (
  options: InitializeOptions = {},
) => {
  const {
    force = false,
    includeHealthRecords = true,
    includeStressData = true,
    includeChatHistory = true,
    includeBiometricData = true,
  } = options;

  try {
    console.log("🔄 Initializing database with sample data...");

    // Check if we can connect to Supabase
    const { error: connectionError } = await supabase
      .from("auth_users")
      .select("count")
      .limit(1);

    if (connectionError) {
      console.warn(
        "⚠️ Supabase connection failed, using mock data only:",
        connectionError.message,
      );
      return {
        success: false,
        error: "Database connection failed",
        usingMockData: true,
      };
    }

    // Check if data already exists (unless force is true)
    if (!force) {
      const { data: existingUsers, error } = await supabase
        .from("auth_users")
        .select("count")
        .limit(1);

      if (!error && existingUsers && existingUsers.length > 0) {
        console.log("✅ Database already has data, skipping initialization");
        return { success: true, message: "Database already initialized" };
      }
    }

    // Initialize users
    console.log("👥 Creating sample users...");
    const userInserts = mockUsers.map((user) => ({
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      full_name: user.full_name,
      created_at: user.created_at,
      updated_at: user.created_at,
    }));

    const { error: usersError } = await supabase
      .from("auth_users")
      .upsert(userInserts, { onConflict: "email" });

    if (usersError) {
      console.error("❌ Failed to create users:", usersError);
      return {
        success: false,
        error: `Failed to create users: ${usersError.message}`,
      };
    }

    // Initialize user profiles
    console.log("📋 Creating user profiles...");
    const profileInserts = mockUsers.map((user) => ({
      user_id: user.id,
      age: user.age,
      weight: user.weight,
      height: user.height,
      blood_type: user.blood_type,
      medical_conditions: user.medical_conditions,
      medications: user.medications,
      allergies: user.allergies,
      stress_threshold_low: user.stress_threshold_low,
      stress_threshold_medium: user.stress_threshold_medium,
      stress_threshold_high: user.stress_threshold_high,
      activity_level: user.activity_level,
      sleep_target_hours: 8,
      water_intake_target: 2000,
      created_at: user.created_at,
    }));

    const { error: profilesError } = await supabase
      .from("user_profiles")
      .upsert(profileInserts, { onConflict: "user_id" });

    if (profilesError) {
      console.error("❌ Failed to create profiles:", profilesError);
    } else {
      console.log("✅ User profiles created successfully");
    }

    // Initialize health records
    if (includeHealthRecords) {
      console.log("🏥 Creating health records...");
      const { error: healthError } = await supabase
        .from("health_records")
        .upsert(mockHealthRecords, { onConflict: "id" });

      if (healthError) {
        console.error("❌ Failed to create health records:", healthError);
      } else {
        console.log("✅ Health records created successfully");
      }
    }

    // Initialize stress data
    if (includeStressData) {
      console.log("📊 Creating stress detection data...");
      const { error: stressError } = await supabase
        .from("stress_detections")
        .upsert(mockStressData, { onConflict: "id" });

      if (stressError) {
        console.error("❌ Failed to create stress data:", stressError);
      } else {
        console.log("✅ Stress data created successfully");
      }
    }

    // Initialize chat history
    if (includeChatHistory) {
      console.log("💬 Creating chat history...");
      const { error: chatError } = await supabase
        .from("chat_history")
        .upsert(mockChatHistory, { onConflict: "id" });

      if (chatError) {
        console.error("❌ Failed to create chat history:", chatError);
      } else {
        console.log("✅ Chat history created successfully");
      }
    }

    // Initialize biometric readings
    if (includeBiometricData) {
      console.log("📈 Creating biometric readings...");
      const { error: biometricError } = await supabase
        .from("biometric_readings")
        .upsert(mockBiometricReadings, { onConflict: "id" });

      if (biometricError) {
        console.error("❌ Failed to create biometric data:", biometricError);
      } else {
        console.log("✅ Biometric data created successfully");
      }
    }

    console.log("🎉 Database initialization completed!");
    return {
      success: true,
      message: "Database initialized with sample data",
      usersCreated: mockUsers.length,
      healthRecordsCreated: includeHealthRecords ? mockHealthRecords.length : 0,
      stressDataCreated: includeStressData ? mockStressData.length : 0,
      chatHistoryCreated: includeChatHistory ? mockChatHistory.length : 0,
      biometricReadingsCreated: includeBiometricData
        ? mockBiometricReadings.length
        : 0,
    };
  } catch (error) {
    console.error("💥 Database initialization failed:", error);
    return {
      success: false,
      error: `Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("auth_users")
      .select("count")
      .limit(1);

    if (error) {
      return { connected: false, error: error.message };
    }

    return { connected: true, data };
  } catch (error) {
    return {
      connected: false,
      error:
        error instanceof Error ? error.message : "Unknown connection error",
    };
  }
};

export const clearAllData = async () => {
  try {
    console.log("🗑️ Clearing all data...");

    // Clear in reverse order due to foreign key constraints
    await supabase.from("chat_history").delete().neq("id", "");
    await supabase.from("biometric_readings").delete().neq("id", "");
    await supabase.from("stress_detections").delete().neq("id", "");
    await supabase.from("health_records").delete().neq("id", "");
    await supabase.from("user_profiles").delete().neq("id", "");
    await supabase.from("user_sessions").delete().neq("id", "");
    await supabase.from("auth_users").delete().neq("id", "");

    console.log("✅ All data cleared successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to clear data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Function to get sample login credentials for testing
export const getSampleCredentials = () => {
  return [
    {
      email: "john.doe@example.com",
      password: "password123",
      name: "John Doe (Hypertension, Anxiety)",
    },
    {
      email: "sarah.smith@example.com",
      password: "demo123",
      name: "Sarah Smith (Diabetes, Migraines)",
    },
    {
      email: "mike.johnson@example.com",
      password: "admin123",
      name: "Mike Johnson (High Cholesterol, Sleep Apnea)",
    },
    {
      email: "emily.brown@example.com",
      password: "patient123",
      name: "Emily Brown (Asthma, Allergies)",
    },
    {
      email: "david.wilson@example.com",
      password: "test123",
      name: "David Wilson (Arthritis, Depression)",
    },
    // Legacy accounts
    {
      email: "test@stressguard.ai",
      password: "password123",
      name: "Test User",
    },
    { email: "demo@stressguard.ai", password: "demo123", name: "Demo User" },
    { email: "admin@stressguard.ai", password: "admin123", name: "Admin User" },
    {
      email: "patient@stressguard.ai",
      password: "patient123",
      name: "Patient User",
    },
  ];
};
