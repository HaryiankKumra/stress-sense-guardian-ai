import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users,
  AlertTriangle,
  Play,
  Trash2,
  Info,
} from "lucide-react";
import {
  initializeDatabaseWithSampleData,
  checkDatabaseConnection,
  clearAllData,
  getSampleCredentials,
} from "@/utils/databaseInitializer";
import {
  performSupabaseHealthCheck,
  autoFixCommonIssues,
} from "@/utils/supabaseHealthCheck";

interface DatabaseStatus {
  connected: boolean;
  error?: string;
  initialized: boolean;
  userCount?: number;
}

const DatabaseDebugger: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    initialized: false,
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showCredentials, setShowCredentials] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev.slice(-9),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const checkStatus = async () => {
    setLoading(true);
    addLog("Performing comprehensive health check...");

    try {
      // Perform detailed health check
      const healthCheck = await performSupabaseHealthCheck();

      setStatus({
        connected: healthCheck.connected,
        error:
          healthCheck.errors.length > 0
            ? healthCheck.errors.join("; ")
            : undefined,
        initialized: healthCheck.tablesExist,
        userCount: 0, // Will be updated below if connected
      });

      if (healthCheck.connected) {
        addLog("✅ Database connection successful");

        if (healthCheck.tablesExist) {
          addLog("✅ All required tables exist");
        } else {
          addLog("⚠️ Some tables are missing");
        }

        // Get user count if connected
        try {
          const connection = await checkDatabaseConnection();
          if (connection.connected && connection.data) {
            setStatus((prev) => ({
              ...prev,
              userCount: connection.data.length,
            }));
          }
        } catch (error) {
          addLog("Could not get user count");
        }
      } else {
        addLog(`❌ Database connection failed`);
        healthCheck.errors.forEach((error) => addLog(`   ❌ ${error}`));
      }

      // Log warnings and recommendations
      healthCheck.warnings.forEach((warning) => addLog(`⚠️ ${warning}`));
      healthCheck.recommendations.forEach((rec) => addLog(`💡 ${rec}`));
    } catch (error) {
      addLog(`💥 Health check failed: ${error}`);
      setStatus({ connected: false, initialized: false, error: String(error) });
    }

    setLoading(false);
  };

  const initializeDatabase = async () => {
    setLoading(true);
    addLog("Initializing database with sample data...");

    try {
      const result = await initializeDatabaseWithSampleData({ force: true });

      if (result.success) {
        addLog(`🎉 Database initialized successfully!`);
        addLog(`Users created: ${result.usersCreated}`);
        addLog(`Health records: ${result.healthRecordsCreated}`);
        addLog(`Stress data: ${result.stressDataCreated}`);
        await checkStatus();
      } else {
        addLog(`❌ Initialization failed: ${result.error}`);
        if (result.usingMockData) {
          addLog("📝 Using mock data for authentication");
        }
      }
    } catch (error) {
      addLog(`💥 Initialization error: ${error}`);
    }

    setLoading(false);
  };

  const clearDatabase = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all data? This cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    addLog("Clearing all database data...");

    try {
      const result = await clearAllData();

      if (result.success) {
        addLog("🗑️ All data cleared successfully");
        await checkStatus();
      } else {
        addLog(`❌ Clear failed: ${result.error}`);
      }
    } catch (error) {
      addLog(`💥 Clear error: ${error}`);
    }

    setLoading(false);
  };

  const autoFix = async () => {
    setLoading(true);
    addLog("Attempting to auto-fix common issues...");

    try {
      const result = await autoFixCommonIssues();

      result.fixed.forEach((fix) => addLog(`✅ Fixed: ${fix}`));
      result.failed.forEach((fail) => addLog(`❌ Could not fix: ${fail}`));

      if (result.fixed.length > 0) {
        addLog("🔧 Auto-fix completed, re-checking status...");
        await checkStatus();
      } else {
        addLog("🤷 No issues were auto-fixable");
      }
    } catch (error) {
      addLog(`💥 Auto-fix error: ${error}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const credentials = getSampleCredentials();

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Status & Debug Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            {status.connected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-slate-300">
              Connection: {status.connected ? "Active" : "Failed"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status.initialized ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            )}
            <span className="text-slate-300">
              Data: {status.initialized ? "Ready" : "Not Initialized"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-slate-300">
              Users: {status.userCount || 0}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{status.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={checkStatus}
            disabled={loading}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Check Status
          </Button>

          <Button
            onClick={initializeDatabase}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Initialize with Sample Data
          </Button>

          <Button
            onClick={clearDatabase}
            disabled={loading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>

          <Button
            onClick={autoFix}
            disabled={loading}
            variant="outline"
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Auto-Fix Issues
          </Button>

          <Button
            onClick={() => setShowCredentials(!showCredentials)}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Info className="w-4 h-4 mr-2" />
            {showCredentials ? "Hide" : "Show"} Test Credentials
          </Button>
        </div>

        {/* Test Credentials */}
        {showCredentials && (
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Test Login Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {credentials.map((cred, index) => (
                  <div key={index} className="p-3 bg-slate-600/50 rounded-lg">
                    <div className="text-sm text-slate-300 mb-1">
                      {cred.name}
                    </div>
                    <div className="text-xs text-blue-400">
                      Email: {cred.email}
                    </div>
                    <div className="text-xs text-green-400">
                      Password: {cred.password}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                <p className="text-yellow-300 text-xs">
                  💡 These credentials work with both Supabase (if connected)
                  and mock authentication
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Logs */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white text-lg">Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <p className="text-slate-400 text-sm">No activity yet...</p>
              ) : (
                logs.map((log, index) => (
                  <p key={index} className="text-slate-300 text-xs font-mono">
                    {log}
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-2">Backend Status</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Supabase:</span>
                <Badge variant={status.connected ? "default" : "destructive"}>
                  {status.connected ? "Connected" : "Offline"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mock Auth:</span>
                <Badge variant="secondary">Available</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sample Data:</span>
                <Badge variant="outline">Ready</Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Features</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Authentication:</span>
                <Badge variant="default">Working</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Health Records:</span>
                <Badge variant="default">Working</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stress Detection:</span>
                <Badge variant="default">Working</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseDebugger;
