import React, { useState, useEffect, useRef } from "react";
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
import ESP32StatusCard from "@/components/ESP32StatusCard";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

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
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [currentStressLevel, setCurrentStressLevel] = useState<string>("low");
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isProcessingML, setIsProcessingML] = useState(false);
  const [mlAccuracy, setMlAccuracy] = useState(97.0);
  const { toast } = useToast();

  const [esp32Status, setEsp32Status] = useState({
    connected: false,
    deviceId: "ESP32_DEMO_001",
    lastSeen: null as Date | null,
    sensorsActive: 3,
    i2cEnabled: true,
  });

  // All the backend logic remains the same
  useEffect(() => {
    fetchLatestData();
    checkESP32Status();
  }, []);

  useEffect(() => {
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
  }, []);

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
      } else {
        throw new Error("Invalid response format from ML model");
      }
    } catch (error) {
      console.error("ML Model Error:", error);
      toast({
        title: "ML Model Error",
        description: "Failed to process with ML model: " + error.message,
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
        description: "Failed to generate test data: " + error.message,
        variant: "destructive",
      });
    }
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

  if (showIntro) {
    return <IntroPage onContinue={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">StressGuard</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="bg-blue-600 rounded-lg px-4 py-3 flex items-center gap-3">
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </div>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-700 flex items-center gap-3 text-slate-300">
            <FileText className="w-5 h-5" />
            <span>Health Reports</span>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-700 flex items-center gap-3 text-slate-300">
            <Target className="w-5 h-5" />
            <span>Goals</span>
            <Badge className="ml-auto bg-blue-600 text-white text-xs">3</Badge>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-700 flex items-center gap-3 text-slate-300">
            <Clock className="w-5 h-5" />
            <span>Reminders</span>
            <Plus className="ml-auto w-4 h-4" />
            <Badge className="bg-blue-600 text-white text-xs">4</Badge>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-700 flex items-center gap-3 text-slate-300">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 text-slate-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowIntro(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Get Started
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search any keywords"
                  className="bg-slate-700 border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 w-80"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <div className="flex items-center gap-2">
                <UserCircle className="w-8 h-8 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Main Dashboard */}
          <div className="flex-1 p-6 space-y-6">
            {/* Welcome Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-r from-blue-600 to-emerald-600 border-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Hello User,
                        </h2>
                        <p className="text-blue-100 mb-1">
                          Your health journey starts now—stay on track and
                          thrive every day!
                        </p>
                        <p className="text-blue-200 text-sm mb-4">
                          Great steps, big changes, let's go!
                        </p>
                        <Button
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          Learn more →
                        </Button>
                      </div>
                      <div className="hidden lg:block">
                        <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                          <Activity className="w-24 h-24 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">User</h3>
                      <p className="text-slate-400 text-sm">
                        21 years old • Non-smoker
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">AB+</div>
                      <div className="text-xs text-slate-400">Blood</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">176cm</div>
                      <div className="text-xs text-slate-400">Height</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">60kg</div>
                      <div className="text-xs text-slate-400">Weight</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-400 text-sm">
                          Steps taken
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {latestReading?.heart_rate || 340}
                      </div>
                      <div className="text-slate-400 text-sm">/1000</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-400 text-sm">
                          Calories burned
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">408</div>
                      <div className="text-slate-400 text-sm">kcal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-400 text-sm">
                          Water taken
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">100</div>
                      <div className="text-slate-400 text-sm">liters</div>
                    </div>
                    <Badge className="bg-emerald-600 text-white">
                      New Achievement!
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Fitness Progress
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
                    {chartData.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
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
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "8px",
                              color: "#ffffff",
                            }}
                          />
                          <Bar
                            dataKey="heartRate"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Sleep Quality and Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-white mb-2">
                      86%
                    </div>
                    <p className="text-slate-400 mb-4">
                      You have slept better than 86% of your goals this month
                    </p>
                    <div className="w-32 h-32 mx-auto relative">
                      <div className="w-full h-full rounded-full border-8 border-slate-700"></div>
                      <div
                        className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent"
                        style={{ transform: "rotate(310deg)" }}
                      ></div>
                      <div className="absolute inset-4 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          86%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">
                    Reminders & Habit Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">48min</div>
                        <div className="text-slate-400 text-sm">
                          Daily meditation
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">32min</div>
                        <div className="text-slate-400 text-sm">
                          Morning jog
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">
                    Health Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Weight loss</span>
                      <span className="text-emerald-400">Yes increase</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">General health</span>
                      <span className="text-emerald-400">Yes increase</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {currentStressLevel === "high" ? "68%" : "25%"}
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                      Current Stress Level: {currentStressLevel}
                    </p>
                    <p className="text-slate-500 text-xs">
                      Overall a positive stress level throughout the day
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`${isCameraActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
              >
                <Camera className="w-4 h-4 mr-2" />
                {isCameraActive ? "Stop Camera" : "Start Camera"}
              </Button>
              <Button
                onClick={resetEvaluation}
                className="bg-slate-700 hover:bg-slate-600 text-white"
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
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Facial Expression Analysis
                  </CardTitle>
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
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    AI Stress Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StressChatbot />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-slate-800 border-l border-slate-700 p-6 space-y-6">
            {/* User Info */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-white">User</h3>
              <p className="text-slate-400 text-sm">21 years old</p>
              <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add reminder
              </Button>
            </div>

            {/* Calendar */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between text-sm">
                  October
                  <ChevronDown className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div key={day} className="text-center p-1 text-slate-400">
                        {day}
                      </div>
                    ),
                  )}
                  {Array.from({ length: 31 }, (_, i) => (
                    <div
                      key={i}
                      className={`text-center p-1 ${i === 13 ? "bg-blue-600 text-white rounded" : "text-slate-300"}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Wellness Tracker */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  Weekly Wellness Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-20 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.slice(0, 7)}>
                      <Area
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div key={day} className="text-center text-slate-400">
                        {day}
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mental Well-being */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  Mental Well-being
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm mb-3">
                  How do you feel today?
                </p>
                <div className="flex justify-between">
                  <button className="p-2 rounded-full bg-red-600">
                    <Frown className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 rounded-full bg-slate-600">
                    <Meh className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 rounded-full bg-slate-600">
                    <Smile className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 rounded-full bg-slate-600">
                    <Smile className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 rounded-full bg-slate-600">
                    <Smile className="w-5 h-5 text-white" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Stress Tracker */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  Stress Tracker & Calming Meter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {currentStressLevel === "high" ? "68%" : "25%"}
                  </div>
                  <p className="text-slate-400 text-xs mb-4">
                    Current Stress Level: {currentStressLevel}
                  </p>
                  <p className="text-slate-500 text-xs">
                    Overall a positive stress level throughout the day
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Introduction Page Component (same as before)
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-4">
                🔧 Hardware Components
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• ESP32 Microcontroller</li>
                <li>• Heart Rate Sensor (MAX30102)</li>
                <li>• GSR Sensor (Galvanic Skin Response)</li>
                <li>• Temperature Sensor (DS18B20)</li>
                <li>• HD Camera Module</li>
                <li>• I2C Communication Protocol</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">
                💻 Technology Stack
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• React + TypeScript</li>
                <li>• Supabase (Backend & Database)</li>
                <li>• Hugging Face ML Models</li>
                <li>• TensorFlow.js</li>
                <li>• Real-time WebSocket</li>
                <li>• Vercel Deployment</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
              🚀 Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Real-time biometric monitoring</li>
                <li>• AI-powered stress detection</li>
                <li>• Facial emotion recognition</li>
                <li>• Live camera feed analysis</li>
              </ul>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Personalized stress management</li>
                <li>• Interactive dashboard</li>
                <li>• Historical data analysis</li>
                <li>• AI chatbot for support</li>
              </ul>
            </div>
          </div>

          <div className="text-center bg-gradient-to-r from-sky-100 to-cyan-100 dark:from-sky-900/20 dark:to-cyan-900/20 p-6 rounded-lg border border-sky-200 dark:border-sky-800/30">
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">
              🎯 ML Model Performance
            </h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              97% Accuracy
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Trained on WESAD (Wearable Stress and Affect Detection) Dataset
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
