
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Eye, AlertCircle } from "lucide-react";

interface CameraModuleProps {
  isActive: boolean;
  onEmotionDetected: (emotion: string, confidence: number) => void;
}

const CameraModule: React.FC<CameraModuleProps> = ({ isActive, onEmotionDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [confidence, setConfidence] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError('');
        
        // Start emotion detection
        setTimeout(() => {
          startEmotionDetection();
        }, 1000);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsProcessing(false);
  };

  const startEmotionDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    
    const detectEmotion = () => {
      if (!isActive || !videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx && videoRef.current.readyState === 4) {
        // Draw current frame to canvas
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        // Simulate emotion detection (replace with actual TensorFlow.js model)
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const randomConfidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0

        setCurrentEmotion(randomEmotion);
        setConfidence(randomConfidence);
        onEmotionDetected(randomEmotion, randomConfidence);
      }

      // Continue detection
      setTimeout(detectEmotion, 1000); // Analyze every second
    };

    detectEmotion();
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-green-100 text-green-800',
      sad: 'bg-blue-100 text-blue-800',
      angry: 'bg-red-100 text-red-800',
      surprised: 'bg-yellow-100 text-yellow-800',
      fearful: 'bg-purple-100 text-purple-800',
      disgusted: 'bg-orange-100 text-orange-800',
      neutral: 'bg-gray-100 text-gray-800'
    };
    return colors[emotion as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-500" />
          Facial Emotion Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {error ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>{error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {/* Live indicator */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>

                  {/* Current emotion overlay */}
                  {isProcessing && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className={`${getEmotionColor(currentEmotion)} text-lg py-2 px-4 w-full justify-center`}>
                        {currentEmotion.toUpperCase()} ({(confidence * 100).toFixed(1)}%)
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Emotion Analysis */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-800">
                  {isProcessing ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-gray-600">Detection Status</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">
                  {(confidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Current Analysis</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dominant Emotion:</span>
                  <Badge className={getEmotionColor(currentEmotion)}>
                    {currentEmotion}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stress Indicator:</span>
                  <Badge className={
                    currentEmotion === 'angry' || currentEmotion === 'fearful' 
                      ? 'bg-red-100 text-red-800' 
                      : currentEmotion === 'sad' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }>
                    {currentEmotion === 'angry' || currentEmotion === 'fearful' 
                      ? 'High' 
                      : currentEmotion === 'sad' 
                      ? 'Medium'
                      : 'Low'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>💡 TensorFlow.js Integration:</strong> 
                Place your facial emotion detection model files in <code>/public/models/facial/</code> 
                and update the model loading logic in this component.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraModule;
