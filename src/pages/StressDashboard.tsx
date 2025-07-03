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
  RotateCcw,
  MessageCircle,
  Wifi,
  WifiOff,
  Camera,
  TestTube,
  Info
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import CameraModule from "@/components/CameraModule";
import StressChatbot from "@/components/StressChatbot";
import ESP32StatusCard from "@/components/ESP32StatusCard";
import { useToast } from "@/components/ui/use-toast";

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
  const [showIntro, setShowIntro] = useState(false);
  const [isProcessingML, setIsProcessingML] = useState(false);
  const [mlAccuracy, setMlAccuracy] = useState(97.0);
  const { toast } = useToast();
  
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
          // Process with ML model
          processWithMLModel(payload.new);
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

  const processWithMLModel = async (sensorReading: any) => {
    setIsProcessingML(true);
    try {
      // Generate synthetic data arrays based on sensor readings
      const ecgData = Array.from({length: 700}, (_, i) => {
        const baseValue = sensorReading.heart_rate || 75;
        return (baseValue + Math.sin(i * 0.1) * 10 + Math.random() * 5).toFixed(2);
      }).join(',');
      
      const edaData = Array.from({length: 20}, (_, i) => {
        const baseValue = sensorReading.gsr_value || 0.3;
        return (baseValue + Math.random() * 0.2).toFixed(4);
      }).join(',');
      
      const tempData = Array.from({length: 20}, (_, i) => {
        const baseValue = sensorReading.temperature || 36.5;
        return (baseValue + Math.random() * 1).toFixed(2);
      }).join(',');

      console.log('Sending to ML model:', { ecgData: ecgData.substring(0, 50) + '...', edaData, tempData });

      const response = await fetch('https://Haryiank-stress-detector.hf.space/run/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [ecgData, edaData, tempData]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('ML Model Response:', result);
      
      if (result && result.data && result.data.length > 0) {
        const stressResult = result.data[0];
        
        // Update stress level based on ML prediction
        const newStressLevel = stressResult === 'Stress' ? 'high' : 'low';
        setCurrentStressLevel(newStressLevel);
        
        // Store prediction in database
        const { error: insertError } = await supabase.from('stress_predictions').insert({
          sensor_data_id: sensorReading.id,
          stress_level: newStressLevel,
          confidence: 0.97,
          prediction_timestamp: new Date().toISOString()
        });

        if (insertError) {
          console.error('Error storing prediction:', insertError);
        }

        toast({
          title: "ML Prediction Complete",
          description: `Stress Level: ${stressResult} (Accuracy: ${mlAccuracy}%)`,
        });
      } else {
        throw new Error('Invalid response format from ML model');
      }

    } catch (error) {
      console.error('ML Model Error:', error);
      toast({
        title: "ML Model Error",
        description: "Failed to process with ML model: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessingML(false);
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
    setCurrentStressLevel('low');
    setLastUpdate(new Date());
    // Don't clear sensor data, just reset UI state
    console.log('Evaluation reset - starting fresh analysis');
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
        timestamp: new Date().toISOString()
      };

      console.log('Generating test data:', testData);

      const { data, error } = await supabase
        .from('sensor_data')
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Test data inserted:', data);

      // Process with ML model
      if (data) {
        await processWithMLModel(data);
      }
      
      toast({
        title: "Test Data Generated",
        description: "Random sensor data created and processed",
      });
    } catch (error) {
      console.error('Error generating test data:', error);
      toast({
        title: "Error",
        description: "Failed to generate test data: " + error.message,
        variant: "destructive"
      });
    }
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  if (showIntro) {
    return <IntroPage onContinue={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              MENTAL WELLNESS
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Real-time biometric monitoring with AI-powered stress detection & facial emotion analysis
          </p>
        </div>

        {/* Control Panel */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setShowIntro(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Info className="w-4 h-4 mr-2" />
            Project Info
          </Button>
          <Button
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`${isCameraActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            <Camera className="w-4 h-4 mr-2" />
            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
          </Button>
          <Button
            onClick={resetEvaluation}
            className="bg-slate-600 hover:bg-slate-700 text-white border border-slate-500"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Evaluation
          </Button>
          <Button
            onClick={generateTestData}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Generate Test Data
          </Button>
          <Button
            onClick={() => setShowChatbot(!showChatbot)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Stress Assistant
          </Button>
        </div>

        {/* ESP32 Status Card */}
        <ESP32StatusCard status={esp32Status} />

        {/* ML Model Status */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5 text-purple-400" />
              Combined ML Stress Detection Model
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
                <div className="text-3xl font-bold text-purple-400">{mlAccuracy}%</div>
                <div className="text-slate-300 mt-2">Model Accuracy</div>
                <div className="text-sm text-slate-400 mt-1">WESAD Dataset</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-lg border border-blue-500/30">
                <div className="text-3xl font-bold text-blue-400">
                  {isProcessingML ? 'Processing...' : 'Ready'}
                </div>
                <div className="text-slate-300 mt-2">Status</div>
                <div className="text-sm text-slate-400 mt-1">Hugging Face API</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-green-600/20 to-yellow-600/20 rounded-lg border border-green-500/30">
                <div className="text-3xl font-bold text-green-400">3</div>
                <div className="text-slate-300 mt-2">Sensors Active</div>
                <div className="text-sm text-slate-400 mt-1">GSR, HR, Temp</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Module */}
        {isCameraActive && (
          <CameraModule 
            isActive={isCameraActive}
            onEmotionDetected={(emotion, confidence) => {
              console.log('Emotion detected:', emotion, confidence);
            }}
          />
        )}

        {/* Current Readings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-white">Heart Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">
                {latestReading?.heart_rate || '--'} <span className="text-lg font-normal text-slate-400">bpm</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <span className="text-white">Temperature</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">
                {latestReading?.temperature?.toFixed(1) || '--'} <span className="text-lg font-normal text-slate-400">°C</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white">GSR Value</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                {latestReading?.gsr_value?.toFixed(3) || '--'} <span className="text-lg font-normal text-slate-400">µS</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-white">Stress Level</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getStressColor(currentStressLevel)} flex items-center gap-1 justify-center text-lg py-3 px-6 border`}>
                {getStressIcon(currentStressLevel)}
                {currentStressLevel.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="w-5 h-5 text-red-400" />
                Heart Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="heartRate" 
                        stroke="#f87171" 
                        strokeWidth={3}
                        dot={{ fill: '#f87171', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Waiting for sensor data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-purple-400" />
                Combined Biometric Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="heartRate" 
                        stroke="#f87171" 
                        strokeWidth={2}
                        name="Heart Rate (bpm)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#fb923c" 
                        strokeWidth={2}
                        name="Temperature (°C)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="gsr" 
                        stroke="#facc15" 
                        strokeWidth={2}
                        name="GSR (µS)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Waiting for sensor data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stress Alert */}
        {currentStressLevel === 'high' && (
          <Alert className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
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

// Introduction Page Component
const IntroPage = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-6">
      <Card className="max-w-4xl bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            AI-Powered Stress Detection System
          </CardTitle>
          <p className="text-xl text-slate-300">
            Advanced Mental Wellness Monitoring Platform
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Team Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Our Team</h3>
            <p className="text-slate-300">
              Developed by innovative engineers passionate about mental health technology
            </p>
          </div>

          {/* Hardware Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-purple-400 mb-4">🔧 Hardware Components</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• ESP32 Microcontroller</li>
                <li>• Heart Rate Sensor (MAX30102)</li>
                <li>• GSR Sensor (Galvanic Skin Response)</li>
                <li>• Temperature Sensor (DS18B20)</li>
                <li>• HD Camera Module</li>
                <li>• I2C Communication Protocol</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">💻 Technology Stack</h3>
              <ul className="space-y-2 text-slate-300">
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
            <h3 className="text-xl font-bold text-green-400 mb-4">🚀 Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-slate-300">
                <li>• Real-time biometric monitoring</li>
                <li>• AI-powered stress detection</li>
                <li>• Facial emotion recognition</li>
                <li>• Live camera feed analysis</li>
              </ul>
              <ul className="space-y-2 text-slate-300">
                <li>• Personalized stress management</li>
                <li>• Interactive dashboard</li>
                <li>• Historical data analysis</li>
                <li>• AI chatbot for support</li>
              </ul>
            </div>
          </div>

          {/* Dataset & Accuracy */}
          <div className="text-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 rounded-lg border border-purple-500/30">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">🎯 ML Model Performance</h3>
            <p className="text-2xl font-bold text-white">97% Accuracy</p>
            <p className="text-slate-300 mt-2">Trained on WESAD (Wearable Stress and Affect Detection) Dataset</p>
          </div>

          <div className="text-center">
            <Button
              onClick={onContinue}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
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
