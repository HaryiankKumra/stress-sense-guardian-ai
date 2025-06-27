import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Cpu
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch initial data
  useEffect(() => {
    fetchLatestData();
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
            Real-time biometric monitoring with AI-powered stress detection
          </p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-blue-600" />
                ESP32 Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isConnected ? 'Connected' : 'Waiting for data'}
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
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-purple-600" />
                ML Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                AI Active
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
                    Waiting for sensor data...
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

        {/* Stress Alert */}
        {currentStressLevel === 'high' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              High stress level detected! Consider taking a break or practicing relaxation techniques.
            </AlertDescription>
          </Alert>
        )}

        {/* Deployment & Next Steps */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              Deployment & Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-600">✅ What's Already Done</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Supabase backend with Edge Functions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Real-time database with live updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Basic ML stress prediction model
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Responsive React dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    ESP32 API endpoint ready
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-600">🚀 Deploy to Vercel</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>1. Connect to Vercel:</strong>
                    </p>
                    <p className="text-xs text-blue-700">
                      • Push your code to GitHub<br/>
                      • Connect GitHub repo to Vercel<br/>
                      • Auto-deploy on every push
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>2. Test ESP32 Connection:</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      Send POST to:<br/>
                      <code className="bg-white px-1 rounded">
                        https://unwxteyecpgcvrhqqbgz.supabase.co/functions/v1/receive-sensor-data
                      </code>
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-800 mb-2">
                      <strong>3. Upgrade ML Model:</strong>
                    </p>
                    <p className="text-xs text-purple-700">
                      Replace basic logic with your trained model<br/>
                      (TensorFlow.js, Python API, or Hugging Face)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ESP32 Integration Instructions */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>ESP32 Integration Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Hardware Setup</h3>
                <p className="text-gray-600 mb-2">Connect your sensors to ESP32:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li><strong>Heart Rate Sensor:</strong> Connect to analog pin A0</li>
                  <li><strong>Temperature Sensor (DS18B20):</strong> Connect to digital pin D2</li>
                  <li><strong>GSR Sensor:</strong> Connect to analog pin A1</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">2. WiFi Configuration</h3>
                <p className="text-gray-600">Configure your ESP32 to connect to WiFi and send POST requests to:</p>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mt-2">
                  POST https://unwxteyecpgcvrhqqbgz.supabase.co/functions/v1/receive-sensor-data
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3. JSON Payload Format</h3>
                <p className="text-gray-600">Send data in this format every 2-5 seconds:</p>
                <div className="bg-gray-100 p-4 rounded-lg mt-2">
                  <pre className="text-sm">{`{
  "heart_rate": 75,
  "temperature": 36.5,
  "gsr_value": 0.123456,
  "timestamp": "2024-01-01T12:00:00Z"
}`}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">4. Sample ESP32 Code Structure</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm">{`#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "https://unwxteyecpgcvrhqqbgz.supabase.co/functions/v1/receive-sensor-data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  // Initialize sensors
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read sensor values
    int heartRate = readHeartRate();
    float temperature = readTemperature();
    float gsrValue = readGSR();
    
    // Send data to server
    sendSensorData(heartRate, temperature, gsrValue);
  }
  delay(3000); // Send every 3 seconds
}`}</pre>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Pro Tip:</strong> The dashboard will automatically update in real-time when it receives data from your ESP32. 
                  No additional configuration needed on the web side!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StressDashboard;
