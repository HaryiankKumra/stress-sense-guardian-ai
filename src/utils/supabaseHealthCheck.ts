import { supabase } from "@/integrations/supabase/client";

interface HealthCheckResult {
  connected: boolean;
  tablesExist: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

const requiredTables = [
  "user_profiles",
  "health_records", 
  "chat_history",
  "sensor_data",
  "stress_predictions",
  "notifications",
  "contact_messages",
  "biometric_data_enhanced",
  "daily_metrics",
  "device_configs",
  "stress_events",
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
        .from("user_profiles")
        .select("count")
        .limit(1);

      if (connectionError) {
        result.errors.push(`Connection failed: ${connectionError.message}`);

        if (
          connectionError.message.includes(
            'relation "user_profiles" does not exist',
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
            .from(table as any)
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
          .from("user_profiles")
          .select("count");

        if (!userError && userData && userData.length === 0) {
          result.warnings.push("No user profiles found in database");
          result.recommendations.push(
            "Initialize the database with sample data for testing.",
          );
        }
      } catch (error) {
        result.warnings.push("Could not check for sample data");
      }

      // Skip RLS check as the function doesn't exist
      result.warnings.push("Row Level Security status check skipped");
      result.recommendations.push("Verify RLS policies are properly configured for your tables.");

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
      heart_rate: 72,
      temperature: 36.5,
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
      .from("user_profiles")
      .select("count")
      .limit(1);

    return !error;
  } catch {
    return false;
  }
};
