import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Zap, 
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Cloud,
  Server,
  Cpu,
  Camera,
  RotateCcw,
  MessageCircle,
  Wifi,
  WifiOff,
  Play,
  Pause
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import CameraModule from "@/components/CameraModule";
import StressChatbot from "@/components/StressChatbot";
import MLModelStatus from "@/components/MLModelStatus";
import ESP32StatusCard from "@/components/ESP32StatusCard";
import SystemFlowChart from "@/components/SystemFlowChart";

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
  const [currentStressLevel, setCurrentStressLevel] = useState<string>('low');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [esp32Status, setEsp32Status] = useState({
    connected: false,
    deviceId: 'ESP32_DEMO_001',
    lastSeen: null as Date | null,
    sensorsActive: 3,
    i2cEnabled: true
  });

  // Fetch initial data
  useEffect(() => {
    fetchLatestData();
    checkESP32Status();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('sensor-data-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_data'
        },
        (payload) => {
          console.log('New sensor data:', payload);
          fetchLatestData();
          setIsConnected(true);
          setLastUpdate(new Date());
          updateESP32Status(true);
        }
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
        .from('sensor_data')
        .select(`
          *,
          stress_predictions (
            stress_level,
            confidence,
            prediction_timestamp
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching data:', error);
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
      console.error('Error:', error);
      setIsConnected(false);
    }
  };

  const checkESP32Status = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const { data, error } = await supabase
        .from('sensor_data')
        .select('timestamp')
        .gte('timestamp', fiveMinutesAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking ESP32 status:', error);
        return;
      }

      const isActive = data && data.length > 0;
      setEsp32Status(prev => ({
        ...prev,
        connected: isActive,
        lastSeen: isActive ? new Date(data[0].timestamp) : prev.lastSeen
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateESP32Status = (connected: boolean) => {
    setEsp32Status(prev => ({
      ...prev,
      connected,
      lastSeen: connected ? new Date() : prev.lastSeen
    }));
  };

  const resetEvaluation = () => {
    // Reset current display data but keep historical data
    setCurrentStressLevel('low');
    setLastUpdate(new Date());
    console.log('Evaluation reset - starting fresh analysis');
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStressIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  // Prepare chart data
  const chartData = sensorData.slice(0, 20).reverse().map((item, index) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    heartRate: item.heart_rate,
    temperature: item.temperature,
    gsr: item.gsr_value || 0
  }));

  const latestReading = sensorData[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Stress Monitoring System
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time biometric monitoring with AI-powered stress detection & facial emotion analysis
          </p>
        </div>

        {/* Control Panel */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`flex items-center gap-2 ${isCameraActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Camera className="w-4 h-4" />
            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
          </Button>
          <Button
            onClick={resetEvaluation}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Evaluation
          </Button>
          <Button
            onClick={() => setShowChatbot(!showChatbot)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <MessageCircle className="w-4 h-4" />
            AI Chatbot
          </Button>
        </div>

        {/* ESP32 Status */}
        <ESP32StatusCard status={esp32Status} />

        {/* ML Models Status */}
        <MLModelStatus />

        {/* Camera Module */}
        {isCameraActive && (
          <CameraModule 
            isActive={isCameraActive}
            onEmotionDetected={(emotion, confidence) => {
              console.log('Emotion detected:', emotion, confidence);
            }}
          />
        )}

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                {esp32Status.connected ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
                ESP32 Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${esp32Status.connected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${esp32Status.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {esp32Status.connected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Device: {esp32Status.deviceId}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server className="w-4 h-4 text-green-600" />
                Backend Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                Supabase Active
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Sensors: {esp32Status.sensorsActive} Active | I2C: {esp32Status.i2cEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-purple-600" />
                ML Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                5 Models Active
              </div>
              <div className="text-xs text-gray-500 mt-1">
                GSR | HR | Temp | Facial | Combined
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Readings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-red-500" />
                Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                {latestReading?.heart_rate || '--'} <span className="text-lg font-normal text-gray-600">bpm</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Thermometer className="w-5 h-5 text-orange-500" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                {latestReading?.temperature || '--'} <span className="text-lg font-normal text-gray-600">°C</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-500" />
                GSR Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                {latestReading?.gsr_value?.toFixed(3) || '--'} <span className="text-lg font-normal text-gray-600">µS</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Stress Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getStressColor(currentStressLevel)} flex items-center gap-1 justify-center text-lg py-2 px-4`}>
                {getStressIcon(currentStressLevel)}
                {currentStressLevel.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Heart Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="heartRate" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Waiting for sensor data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-500" />
                Temperature Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        dot={{ fill: '#f97316', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Waiting for data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Combined Chart */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Combined Biometric Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Heart Rate (bpm)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      name="Temperature (°C)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gsr" 
                      stroke="#eab308" 
                      strokeWidth={2}
                      name="GSR (µS)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Waiting for sensor data...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Flow Chart */}
        <SystemFlowChart />

        {/* Stress Alert */}
        {currentStressLevel === 'high' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              High stress level detected! Consider taking a break or practicing relaxation techniques.
            </AlertDescription>
          </Alert>
        )}

        {/* Chatbot */}
        {showChatbot && <StressChatbot />}
      </div>
    </div>
  );
};

export default StressDashboard;
