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

  // Fetch initial data
  useEffect(() => {
    fetchLatestData();
    checkESP32Status();
  }, []);

  // Set up real-time subscription
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
          // Process with ML model
          processWithMLModel(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check ESP32 status periodically
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

        // Get latest stress prediction
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
      // Generate synthetic data arrays based on sensor readings
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

      console.log("Sending to ML model:", {
        ecgData: ecgData.substring(0, 50) + "...",
        edaData,
        tempData,
      });

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
      console.log("ML Model Response:", result);

      if (result && result.data && result.data.length > 0) {
        const stressResult = result.data[0];

        // Update stress level based on ML prediction
        const newStressLevel = stressResult === "Stress" ? "high" : "low";
        setCurrentStressLevel(newStressLevel);

        // Store prediction in database
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
    console.log("Evaluation reset - starting fresh analysis");
    toast({
      title: "Evaluation Reset",
      description: "System has been reset for new evaluation",
    });
  };

  const generateTestData = async () => {
    try {
      const testData = {
        heart_rate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
        temperature: Math.random() * 5 + 35, // 35-40°C
        gsr_value: Math.random() * 0.5 + 0.1, // 0.1-0.6 µS
        timestamp: new Date().toISOString(),
      };

      console.log("Generating test data:", testData);

      const { data, error } = await supabase
        .from("sensor_data")
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Test data inserted:", data);

      // Process with ML model
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
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStressIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="w-5 h-5" />;
      case "medium":
        return <AlertTriangle className="w-5 h-5" />;
      case "high":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-sky-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  StressGuard AI
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                Live Dashboard
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4" />
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="border-sky-300 dark:border-slate-600"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-sky-300 dark:border-slate-600"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sky-300 dark:border-slate-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Exit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => setShowIntro(true)}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-sky-200 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-700"
          >
            <Info className="w-4 h-4 mr-2" />
            Project Info
          </Button>
          <Button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`${isCameraActive ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"} text-white`}
          >
            <Camera className="w-4 h-4 mr-2" />
            {isCameraActive ? "Stop Camera" : "Start Camera"}
          </Button>
          <Button
            onClick={resetEvaluation}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={generateTestData}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Data
          </Button>
          <Button
            onClick={() => setShowChatbot(!showChatbot)}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection Status */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur border-sky-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Device Status
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {esp32Status.connected ? "Connected" : "Offline"}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${esp32Status.connected ? "bg-emerald-500/20" : "bg-red-500/20"}`}
                >
                  {esp32Status.connected ? (
                    <Wifi className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <WifiOff className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ML Model Status */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur border-sky-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    ML Accuracy
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mlAccuracy}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Stress Level */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur border-sky-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Stress Level
                  </p>
                  <Badge
                    className={`${getStressColor(currentStressLevel)} flex items-center gap-1 text-base py-2 px-4 border mt-2`}
                  >
                    {getStressIcon(currentStressLevel)}
                    {currentStressLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-3 rounded-full bg-purple-500/20">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Camera Module */}
        {isCameraActive && (
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur border-sky-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Camera className="w-5 h-5 text-sky-600 dark:text-sky-400" />
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

        {/* Sensor Readings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 dark:text-red-400 font-medium">
                      Heart Rate
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {latestReading?.heart_rate || "--"}
                    <span className="text-lg font-normal text-red-500 ml-1">
                      bpm
                    </span>
                  </p>
                </div>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    <span className="text-orange-700 dark:text-orange-400 font-medium">
                      Temperature
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {latestReading?.temperature?.toFixed(1) || "--"}
                    <span className="text-lg font-normal text-orange-500 ml-1">
                      °C
                    </span>
                  </p>
                </div>
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Thermometer className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                      GSR Value
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {latestReading?.gsr_value?.toFixed(3) || "--"}
                    <span className="text-lg font-normal text-yellow-500 ml-1">
                      µS
                    </span>
                  </p>
                </div>
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur border-sky-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Heart className="w-5 h-5 text-red-500" />
                Heart Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="heartRateGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ef4444"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fill="url(#heartRateGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Waiting for sensor data...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur border-sky-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Activity className="w-5 h-5 text-purple-500" />
                Multi-Sensor Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#ef4444"
                        strokeWidth={3}
                        name="Heart Rate (bpm)"
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f97316"
                        strokeWidth={3}
                        name="Temperature (°C)"
                        dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gsr"
                        stroke="#eab308"
                        strokeWidth={3}
                        name="GSR (µS)"
                        dot={{ fill: "#eab308", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Waiting for sensor data...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stress Alert */}
        {currentStressLevel === "high" && (
          <Alert className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <strong>High stress level detected!</strong> Consider taking a
              break or practicing relaxation techniques.
            </AlertDescription>
          </Alert>
        )}

        {/* Chatbot */}
        {showChatbot && (
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur border-sky-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                AI Stress Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StressChatbot />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
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
          {/* Team Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Our Team
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Developed by innovative engineers passionate about mental health
              technology
            </p>
          </div>

          {/* Hardware Section */}
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

          {/* Features Section */}
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

          {/* Dataset & Accuracy */}
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
