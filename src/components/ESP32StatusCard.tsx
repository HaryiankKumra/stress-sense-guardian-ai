
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Activity, Zap, Thermometer, Heart } from "lucide-react";

interface ESP32Status {
  connected: boolean;
  deviceId: string;
  lastSeen: Date | null;
  sensorsActive: number;
  i2cEnabled: boolean;
}

interface ESP32StatusCardProps {
  status: ESP32Status;
}

const ESP32StatusCard: React.FC<ESP32StatusCardProps> = ({ status }) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.connected ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
          ESP32 Device Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connection Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Connection</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={status.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {status.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Device ID:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{status.deviceId}</code>
              </div>
              {status.lastSeen && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Seen:</span>
                  <span className="text-sm">{status.lastSeen.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sensors Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Sensors</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Sensors:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {status.sensorsActive}/3
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 bg-white rounded-lg">
                  <Heart className="w-4 h-4 text-red-500 mb-1" />
                  <span className="text-xs">Heart Rate</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex flex-col items-center p-2 bg-white rounded-lg">
                  <Thermometer className="w-4 h-4 text-orange-500 mb-1" />
                  <span className="text-xs">Temp</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex flex-col items-center p-2 bg-white rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-500 mb-1" />
                  <span className="text-xs">GSR</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* I2C Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Communication</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">I2C Protocol:</span>
                <Badge className={status.i2cEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {status.i2cEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Data Rate:</span>
                <span className="text-sm">
                  {status.connected ? '~3 samples/sec' : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Protocol:</span>
                <span className="text-sm">HTTP POST</span>
              </div>
            </div>
          </div>
        </div>

        {/* ESP32 Configuration Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📟 ESP32 Configuration</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Endpoint:</strong> <code>https://unwxteyecpgcvrhqqbgz.supabase.co/functions/v1/receive-sensor-data</code></p>
            <p><strong>Method:</strong> POST | <strong>Content-Type:</strong> application/json</p>
            <p><strong>Sensors:</strong> Heart Rate (A0) | Temperature (D2) | GSR (A1)</p>
            <p><strong>Sampling Rate:</strong> Every 3 seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ESP32StatusCard;
