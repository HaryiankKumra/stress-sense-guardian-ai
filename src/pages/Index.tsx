
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Zap, 
  Brain, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import SignalChart from "@/components/SignalChart";
import StressMetrics from "@/components/StressMetrics";
import ModelExplainer from "@/components/ModelExplainer";
import HistoricalData from "@/components/HistoricalData";

const Index = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentStressLevel, setCurrentStressLevel] = useState(0.23);
  const [stressStatus, setStressStatus] = useState<'low' | 'moderate' | 'high'>('low');
  const [signalQuality, setSignalQuality] = useState({ bvp: 95, eda: 88, temp: 92, hr: 97 });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newStressLevel = Math.max(0, Math.min(1, currentStressLevel + (Math.random() - 0.5) * 0.1));
      setCurrentStressLevel(newStressLevel);
      
      if (newStressLevel < 0.3) setStressStatus('low');
      else if (newStressLevel < 0.7) setStressStatus('moderate');
      else setStressStatus('high');

      setSignalQuality({
        bvp: 90 + Math.random() * 10,
        eda: 85 + Math.random() * 15,
        temp: 88 + Math.random() * 12,
        hr: 92 + Math.random() * 8
      });

      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring, currentStressLevel]);

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStressIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'moderate': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Stress Detection System
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time physiological monitoring with AI-powered stress detection and explainable insights
          </p>
        </div>

        {/* Control Panel */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Monitoring Controls
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  className={`${isMonitoring ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {isMonitoring ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Monitoring
                    </>
                  )}
                </Button>
                <Button variant="outline" className="border-gray-300">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{(currentStressLevel * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Stress Level</div>
                <Progress value={currentStressLevel * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <Badge className={`${getStressColor(stressStatus)} flex items-center gap-1 justify-center`}>
                  {getStressIcon(stressStatus)}
                  {stressStatus.toUpperCase()}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Current Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {Math.round((signalQuality.bvp + signalQuality.eda + signalQuality.temp + signalQuality.hr) / 4)}%
                </div>
                <div className="text-sm text-gray-600">Signal Quality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {lastUpdate.toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600">Last Update</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard */}
        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Real-time Signals
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="explainer" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Explainer
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SignalChart 
                title="Blood Volume Pulse (BVP)" 
                icon={<Heart className="w-5 h-5" />}
                color="rgb(239, 68, 68)"
                quality={signalQuality.bvp}
                isActive={isMonitoring}
              />
              <SignalChart 
                title="Electrodermal Activity (EDA)" 
                icon={<Zap className="w-5 h-5" />}
                color="rgb(59, 130, 246)"
                quality={signalQuality.eda}
                isActive={isMonitoring}
              />
              <SignalChart 
                title="Skin Temperature" 
                icon={<Thermometer className="w-5 h-5" />}
                color="rgb(16, 185, 129)"
                quality={signalQuality.temp}
                isActive={isMonitoring}
              />
              <SignalChart 
                title="Heart Rate Variability" 
                icon={<Activity className="w-5 h-5" />}
                color="rgb(139, 92, 246)"
                quality={signalQuality.hr}
                isActive={isMonitoring}
              />
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <StressMetrics 
              stressLevel={currentStressLevel}
              stressStatus={stressStatus}
              signalQuality={signalQuality}
              isMonitoring={isMonitoring}
            />
          </TabsContent>

          <TabsContent value="explainer">
            <ModelExplainer 
              stressLevel={currentStressLevel}
              signalContributions={{
                bvp: Math.random() * 0.4 + 0.1,
                eda: Math.random() * 0.3 + 0.2,
                temp: Math.random() * 0.2 + 0.1,
                hr: Math.random() * 0.35 + 0.15
              }}
            />
          </TabsContent>

          <TabsContent value="history">
            <HistoricalData />
          </TabsContent>
        </Tabs>

        {/* Status Alert */}
        {stressStatus === 'high' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              High stress level detected. Consider taking a break or practicing relaxation techniques.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Index;
