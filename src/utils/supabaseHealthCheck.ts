import { supabase } from "@/integrations/supabase/client";

interface HealthCheckResult {
  connected: boolean;
  tablesExist: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

const requiredTables = [
  "auth_users",
  "user_profiles",
  "health_records",
  "stress_detections",
  "biometric_readings",
  "chat_history",
  "sensor_data",
  "stress_predictions",
  "notifications",
  "device_registrations",
];

export const performSupabaseHealthCheck =
  async (): Promise<HealthCheckResult> => {
    const result: HealthCheckResult = {
      connected: false,
      tablesExist: false,
      errors: [],
      warnings: [],
      recommendations: [],
    };

    try {
      // Test basic connection
      console.log("🔍 Testing Supabase connection...");
      const { data: connectionTest, error: connectionError } = await supabase
        .from("auth_users")
        .select("count")
        .limit(1);

      if (connectionError) {
        result.errors.push(`Connection failed: ${connectionError.message}`);

        if (
          connectionError.message.includes(
            'relation "auth_users" does not exist',
          )
        ) {
          result.recommendations.push(
            "Database tables need to be created. Run migrations or use the initializer.",
          );
        } else if (connectionError.message.includes("Invalid API key")) {
          result.recommendations.push(
            "Check your Supabase API key and URL in the environment variables.",
          );
        } else {
          result.recommendations.push(
            "Check your Supabase configuration and network connection.",
          );
        }

        return result;
      }

      result.connected = true;
      console.log("✅ Supabase connection successful");

      // Check if all required tables exist
      console.log("🔍 Checking required tables...");
      let allTablesExist = true;
      const missingTables: string[] = [];

      for (const table of requiredTables) {
        try {
          const { error: tableError } = await supabase
            .from(table)
            .select("count")
            .limit(1);

          if (tableError) {
            if (tableError.message.includes("does not exist")) {
              missingTables.push(table);
              allTablesExist = false;
            } else {
              result.warnings.push(`Table ${table}: ${tableError.message}`);
            }
          }
        } catch (error) {
          result.warnings.push(`Failed to check table ${table}: ${error}`);
        }
      }

      result.tablesExist = allTablesExist;

      if (missingTables.length > 0) {
        result.warnings.push(`Missing tables: ${missingTables.join(", ")}`);
        result.recommendations.push(
          "Use the database initializer to create missing tables and sample data.",
        );
      } else {
        console.log("✅ All required tables exist");
      }

      // Check for sample data
      try {
        const { data: userData, error: userError } = await supabase
          .from("auth_users")
          .select("count");

        if (!userError && userData && userData.length === 0) {
          result.warnings.push("No sample users found in database");
          result.recommendations.push(
            "Initialize the database with sample data for testing.",
          );
        }
      } catch (error) {
        result.warnings.push("Could not check for sample data");
      }

      // Check RLS policies
      try {
        const { data: rlsData, error: rlsError } =
          await supabase.rpc("check_rls_enabled");

        if (rlsError) {
          result.warnings.push("Could not verify Row Level Security status");
        }
      } catch (error) {
        // RLS check is optional
      }

      if (result.errors.length === 0 && result.warnings.length === 0) {
        console.log("🎉 Supabase health check passed completely!");
      }
    } catch (error) {
      result.errors.push(
        `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      result.recommendations.push(
        "Check your internet connection and Supabase service status.",
      );
    }

    return result;
  };

export const autoFixCommonIssues = async (): Promise<{
  fixed: string[];
  failed: string[];
}> => {
  const result = { fixed: [] as string[], failed: [] as string[] };

  try {
    console.log("🔧 Attempting to auto-fix common issues...");

    // Check if we can create a simple test record
    const testData = {
      id: "health-check-test",
      user_id: "test-user",
      timestamp: new Date().toISOString(),
    };

    // Try to insert and then delete a test record
    try {
      const { error: insertError } = await supabase
        .from("sensor_data")
        .insert(testData);

      if (!insertError) {
        // Clean up test data
        await supabase
          .from("sensor_data")
          .delete()
          .eq("id", "health-check-test");

        result.fixed.push("Database write permissions verified");
      }
    } catch (error) {
      result.failed.push("Database write test failed");
    }
  } catch (error) {
    result.failed.push(
      `Auto-fix failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return result;
};

export const getSupabaseStatus = async () => {
  const healthCheck = await performSupabaseHealthCheck();

  return {
    status: healthCheck.connected ? "connected" : "disconnected",
    health: healthCheck.errors.length === 0 ? "healthy" : "unhealthy",
    details: healthCheck,
    timestamp: new Date().toISOString(),
  };
};

// Quick connection test for immediate feedback
export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("auth_users")
      .select("count")
      .limit(1);

    return !error;
  } catch {
    return false;
  }
};
