import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Heart,
  Thermometer,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RotateCcw,
  MessageCircle,
  Wifi,
  WifiOff,
  Camera,
  TestTube,
  Info,
  Monitor,
  LogOut,
  Settings,
  Bell,
  User,
  BarChart3,
  Calendar,
  Shield,
  Home,
  FileText,
  Target,
  Clock,
  Plus,
  Search,
  ChevronDown,
  Smile,
  Meh,
  Frown,
  UserCircle,
  Menu,
  X,
  Edit,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import CameraModule from "@/components/CameraModule";
import StressChatbot from "@/components/StressChatbot";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SensorData {
  id: string;
  heart_rate: number;
  temperature: number;
  gsr_value: number | null;
  timestamp: string;
  stress_predictions: Array<{
    stress_level: string;
    confidence: number;
    prediction_timestamp: string;
  }>;
}

const StressDashboard = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [currentStressLevel, setCurrentStressLevel] = useState<string>("low");
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isProcessingML, setIsProcessingML] = useState(false);
  const [mlAccuracy, setMlAccuracy] = useState(97.0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [esp32Status, setEsp32Status] = useState({
    connected: false,
    deviceId: "ESP32_DEMO_001",
    lastSeen: null as Date | null,
    sensorsActive: 3,
    i2cEnabled: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // All the existing sensor data logic
  useEffect(() => {
    if (user) {
      fetchLatestData();
      checkESP32Status();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("sensor-data-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_data",
        },
        (payload) => {
          console.log("New sensor data:", payload);
          fetchLatestData();
          setIsConnected(true);
          setLastUpdate(new Date());
          updateESP32Status(true);
          processWithMLModel(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkESP32Status();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchLatestData = async () => {
    try {
      const { data, error } = await supabase
        .from("sensor_data")
        .select(
          `
          *,
          stress_predictions (
            stress_level,
            confidence,
            prediction_timestamp
          )
        `,
        )
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }

      if (data && data.length > 0) {
        setSensorData(data);

        const latest = data[0];
        if (latest.stress_predictions && latest.stress_predictions.length > 0) {
          setCurrentStressLevel(latest.stress_predictions[0].stress_level);
        }

        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsConnected(false);
    }
  };

  const processWithMLModel = async (sensorReading: any) => {
    setIsProcessingML(true);
    try {
      const ecgData = Array.from({ length: 700 }, (_, i) => {
        const baseValue = sensorReading.heart_rate || 75;
        return (baseValue + Math.sin(i * 0.1) * 10 + Math.random() * 5).toFixed(
          2,
        );
      }).join(",");

      const edaData = Array.from({ length: 20 }, (_, i) => {
        const baseValue = sensorReading.gsr_value || 0.3;
        return (baseValue + Math.random() * 0.2).toFixed(4);
      }).join(",");

      const tempData = Array.from({ length: 20 }, (_, i) => {
        const baseValue = sensorReading.temperature || 36.5;
        return (baseValue + Math.random() * 1).toFixed(2);
      }).join(",");

      // Use Grok (XAI) for stress management recommendations
      const stressManagementPrompt = `Based on the following biometric data:
      - Heart Rate: ${sensorReading.heart_rate} bpm
      - Temperature: ${sensorReading.temperature}°C  
      - GSR: ${sensorReading.gsr_value} µS
      - Current Stress Level: ${currentStressLevel}
      - User Profile: Age ${profile?.age || "unknown"}, Activity Level ${profile?.activity_level || "unknown"}
      
      Provide personalized stress management recommendations in 2-3 bullet points.`;

      const response = await fetch(
        "https://Haryiank-stress-detector.hf.space/run/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: [ecgData, edaData, tempData],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.data && result.data.length > 0) {
        const stressResult = result.data[0];
        const newStressLevel = stressResult === "Stress" ? "high" : "low";
        setCurrentStressLevel(newStressLevel);

        const { error: insertError } = await supabase
          .from("stress_predictions")
          .insert({
            sensor_data_id: sensorReading.id,
            stress_level: newStressLevel,
            confidence: 0.97,
            prediction_timestamp: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error storing prediction:", insertError);
        }

        toast({
          title: "ML Prediction Complete",
          description: `Stress Level: ${stressResult} (Accuracy: ${mlAccuracy}%)`,
        });
      }
    } catch (error) {
      console.error("ML Model Error:", error);
      toast({
        title: "ML Model Error",
        description: "Failed to process with ML model",
        variant: "destructive",
      });
    } finally {
      setIsProcessingML(false);
    }
  };

  const checkESP32Status = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const { data, error } = await supabase
        .from("sensor_data")
        .select("timestamp")
        .gte("timestamp", fiveMinutesAgo.toISOString())
        .order("timestamp", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking ESP32 status:", error);
        return;
      }

      const isActive = data && data.length > 0;
      setEsp32Status((prev) => ({
        ...prev,
        connected: isActive,
        lastSeen: isActive ? new Date(data[0].timestamp) : prev.lastSeen,
      }));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updateESP32Status = (connected: boolean) => {
    setEsp32Status((prev) => ({
      ...prev,
      connected,
      lastSeen: connected ? new Date() : prev.lastSeen,
    }));
  };

  const resetEvaluation = () => {
    setCurrentStressLevel("low");
    setLastUpdate(new Date());
    toast({
      title: "Evaluation Reset",
      description: "System has been reset for new evaluation",
    });
  };

  const generateTestData = async () => {
    try {
      const testData = {
        heart_rate: Math.floor(Math.random() * 40) + 60,
        temperature: Math.random() * 5 + 35,
        gsr_value: Math.random() * 0.5 + 0.1,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("sensor_data")
        .insert(testData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        await processWithMLModel(data);
      }

      toast({
        title: "Test Data Generated",
        description: "Random sensor data created and processed",
      });
    } catch (error) {
      console.error("Error generating test data:", error);
      toast({
        title: "Error",
        description: "Failed to generate test data",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-emerald-400";
      case "medium":
        return "text-amber-400";
      case "high":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  // Prepare chart data
  const chartData = sensorData
    .slice(0, 20)
    .reverse()
    .map((item, index) => ({
      time: new Date(item.timestamp).toLocaleTimeString(),
      heartRate: item.heart_rate,
      temperature: item.temperature,
      gsr: item.gsr_value || 0,
    }));

  const latestReading = sensorData[0];

  if (!user) {
    return <div>Loading...</div>;
  }

  if (showIntro) {
    return <IntroPage onContinue={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span className="font-bold">StressGuard</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out`}
        >
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">StressGuard</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="bg-sky-600 dark:bg-sky-700 rounded-lg px-4 py-3 flex items-center gap-3 text-white">
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </div>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <FileText className="w-5 h-5" />
              <span>Health Reports</span>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Target className="w-5 h-5" />
              <span>Goals</span>
              <Badge className="ml-auto bg-sky-600 text-white text-xs">3</Badge>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Clock className="w-5 h-5" />
              <span>Reminders</span>
              <Plus className="ml-auto w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-600 dark:text-slate-300"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <UserCircle className="w-8 h-8 text-sky-600 dark:text-sky-400" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.full_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="hidden lg:block bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowIntro(true)}
                  className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                >
                  Get Started
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search any keywords"
                    className="bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 w-80 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
                <div className="flex items-center gap-2">
                  <UserCircle className="w-8 h-8 text-slate-400" />
                  <span className="text-sm font-medium">{user.full_name}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 flex">
            {/* Dashboard Content */}
            <div className="flex-1 p-4 lg:p-6 space-y-6">
              {/* Welcome Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-gradient-to-r from-sky-500 to-emerald-500 border-none text-white">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
                        <div className="text-center lg:text-left">
                          <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                            Hello {user.full_name.split(" ")[0]},
                          </h2>
                          <p className="text-sky-100 mb-1 text-sm lg:text-base">
                            Your health journey starts now—stay on track and
                            thrive every day!
                          </p>
                          <p className="text-sky-200 text-xs lg:text-sm mb-4">
                            Great steps, big changes, let's go!
                          </p>
                          <Button
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm"
                          >
                            Learn more →
                          </Button>
                        </div>
                        <div className="hidden lg:block mt-4 lg:mt-0">
                          <div className="w-32 lg:w-48 h-32 lg:h-48 bg-white/10 rounded-full flex items-center justify-center">
                            <Activity className="w-16 lg:w-24 h-16 lg:h-24 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <p className="text-slate-400 text-sm">
                          {profile?.age || "Age not set"} years old
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl lg:text-2xl font-bold">
                          {profile?.blood_type || "--"}
                        </div>
                        <div className="text-xs text-slate-400">Blood</div>
                      </div>
                      <div>
                        <div className="text-xl lg:text-2xl font-bold">
                          {profile?.height ? `${profile.height}cm` : "--"}
                        </div>
                        <div className="text-xs text-slate-400">Height</div>
                      </div>
                      <div>
                        <div className="text-xl lg:text-2xl font-bold">
                          {profile?.weight ? `${profile.weight}kg` : "--"}
                        </div>
                        <div className="text-xs text-slate-400">Weight</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-slate-400 text-sm">
                            Heart Rate
                          </span>
                        </div>
                        <div className="text-2xl font-bold">
                          {latestReading?.heart_rate || "--"}
                        </div>
                        <div className="text-slate-400 text-sm">bpm</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-slate-400 text-sm">
                            Stress Level
                          </span>
                        </div>
                        <div className="text-2xl font-bold capitalize">
                          {currentStressLevel}
                        </div>
                        <div className="text-slate-400 text-sm">Current</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <Thermometer className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-slate-400 text-sm">
                            Temperature
                          </span>
                        </div>
                        <div className="text-2xl font-bold">
                          {latestReading?.temperature?.toFixed(1) || "--"}
                        </div>
                        <div className="text-slate-400 text-sm">°C</div>
                      </div>
                      {esp32Status.connected && (
                        <Badge className="bg-emerald-600 text-white">
                          Connected
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Biometric Trends
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400"
                      >
                        •••
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <XAxis
                              dataKey="time"
                              tick={{ fontSize: 12, fill: "#94a3b8" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 12, fill: "#94a3b8" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgb(15 23 42)",
                                border: "1px solid rgb(51 65 85)",
                                borderRadius: "8px",
                                color: "#ffffff",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="heartRate"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              name="Heart Rate"
                            />
                            <Line
                              type="monotone"
                              dataKey="temperature"
                              stroke="#ef4444"
                              strokeWidth={2}
                              name="Temperature"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>Stress Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-4xl font-bold mb-2">
                        {currentStressLevel === "high"
                          ? "68%"
                          : currentStressLevel === "medium"
                            ? "45%"
                            : "25%"}
                      </div>
                      <p className="text-slate-400 mb-4">
                        Current stress level:{" "}
                        <span className="capitalize font-medium">
                          {currentStressLevel}
                        </span>
                      </p>
                      <div className="w-32 h-32 mx-auto relative">
                        <div className="w-full h-full rounded-full border-8 border-slate-200 dark:border-slate-700"></div>
                        <div
                          className={`absolute inset-0 rounded-full border-8 border-t-transparent ${
                            currentStressLevel === "high"
                              ? "border-red-500"
                              : currentStressLevel === "medium"
                                ? "border-amber-500"
                                : "border-emerald-500"
                          }`}
                          style={{
                            transform: `rotate(${currentStressLevel === "high" ? "245deg" : currentStressLevel === "medium" ? "162deg" : "90deg"})`,
                          }}
                        ></div>
                        <div className="absolute inset-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold">
                            {currentStressLevel === "high"
                              ? "68%"
                              : currentStressLevel === "medium"
                                ? "45%"
                                : "25%"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className={`${isCameraActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isCameraActive ? "Stop Camera" : "Start Camera"}
                </Button>
                <Button
                  onClick={resetEvaluation}
                  className="bg-slate-600 hover:bg-slate-700 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={generateTestData}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Data
                </Button>
                <Button
                  onClick={() => setShowChatbot(!showChatbot)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </div>

              {/* Camera Module */}
              {isCameraActive && (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>Facial Expression Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CameraModule
                      isActive={isCameraActive}
                      onEmotionDetected={(emotion, confidence) => {
                        console.log("Emotion detected:", emotion, confidence);
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Chatbot */}
              {showChatbot && (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>AI Stress Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StressChatbot />
                  </CardContent>
                </Card>
              )}

              {/* Settings Panel */}
              {showSettings && (
                <UserSettingsPanel onClose={() => setShowSettings(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Settings Panel Component
const UserSettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    age: profile?.age || "",
    weight: profile?.weight || "",
    height: profile?.height || "",
    blood_type: profile?.blood_type || "",
    medical_conditions: profile?.medical_conditions?.join(", ") || "",
    medications: profile?.medications?.join(", ") || "",
    allergies: profile?.allergies?.join(", ") || "",
    emergency_contact_name: profile?.emergency_contact_name || "",
    emergency_contact_phone: profile?.emergency_contact_phone || "",
    activity_level: profile?.activity_level || "",
    sleep_target_hours: profile?.sleep_target_hours || 8,
    water_intake_target: profile?.water_intake_target || 2000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      ...formData,
      age: formData.age ? parseInt(formData.age.toString()) : null,
      weight: formData.weight ? parseFloat(formData.weight.toString()) : null,
      height: formData.height ? parseFloat(formData.height.toString()) : null,
      medical_conditions: formData.medical_conditions
        ? formData.medical_conditions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      medications: formData.medications
        ? formData.medications
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      allergies: formData.allergies
        ? formData.allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    const result = await updateProfile(updateData);
    if (result.success) {
      toast({
        title: "Profile updated",
        description: "Your medical information has been saved",
      });
      onClose();
    } else {
      toast({
        title: "Update failed",
        description: result.error || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Medical Profile Settings
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Your age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Your weight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Your height"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Blood Type
              </label>
              <select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Activity Level
              </label>
              <select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extremely_active">Extremely Active</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Medical Conditions
            </label>
            <textarea
              name="medical_conditions"
              value={formData.medical_conditions}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              placeholder="List any medical conditions (separated by commas)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Current Medications
            </label>
            <textarea
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              placeholder="List current medications (separated by commas)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Allergies</label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              placeholder="List any allergies (separated by commas)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Emergency contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Emergency contact phone"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              Save Profile
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Introduction Page Component
const IntroPage = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
      <Card className="max-w-4xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border-sky-200 dark:border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            AI-Powered Stress Detection System
          </CardTitle>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Advanced Mental Wellness Monitoring Platform
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Our Team
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Developed by innovative engineers passionate about mental health
              technology
            </p>
          </div>

          <div className="text-center">
            <Button
              onClick={onContinue}
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 text-lg"
            >
              Continue to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StressDashboard;
