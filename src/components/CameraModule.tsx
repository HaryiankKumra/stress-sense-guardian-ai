import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Eye, AlertCircle, Play, Pause, RefreshCw } from "lucide-react";

interface CameraModuleProps {
  isActive: boolean;
  onEmotionDetected: (emotion: string, confidence: number) => void;
}

const CameraModule: React.FC<CameraModuleProps> = ({
  isActive,
  onEmotionDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const [confidence, setConfidence] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [localCameraActive, setLocalCameraActive] = useState(false);
  const [permissionState, setPermissionState] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isActive && !localCameraActive) {
      startCamera();
    } else if (!isActive && localCameraActive) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  // Check permission status on component mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if ("permissions" in navigator && "query" in navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: "camera" as any,
        });
        setPermissionState(permission.state as "prompt" | "granted" | "denied");

        permission.onchange = () => {
          setPermissionState(
            permission.state as "prompt" | "granted" | "denied",
          );
        };
      }
    } catch (err) {
      console.log("Permission API not supported:", err);
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError("");
        setLocalCameraActive(true);
        setPermissionState("granted");

        // Wait for video to load before starting detection
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setTimeout(() => {
                  startEmotionDetection();
                }, 1000);
              })
              .catch(console.error);
          }
        };
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setLocalCameraActive(false);
      setPermissionState("denied");

      // Provide specific error messages based on error type
      if (err.name === "NotAllowedError") {
        setError(
          'Camera access was denied. Please click "Allow" when prompted or enable camera permissions in your browser settings.',
        );
      } else if (err.name === "NotFoundError") {
        setError(
          "No camera found. Please ensure your camera is connected and not being used by another application.",
        );
      } else if (err.name === "NotReadableError") {
        setError(
          "Camera is already in use by another application. Please close other apps using the camera and try again.",
        );
      } else if (err.name === "OverconstrainedError") {
        setError(
          "Camera constraints could not be satisfied. Trying with basic settings...",
        );
        // Try again with basic constraints
        tryBasicCamera();
      } else {
        setError(`Camera error: ${err.message || "Unknown error occurred"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tryBasicCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError("");
        setLocalCameraActive(true);
        setPermissionState("granted");

        setTimeout(() => {
          startEmotionDetection();
        }, 1000);
      }
    } catch (err: any) {
      console.error("Basic camera access failed:", err);
      setError(
        "Unable to access camera with any settings. Please check your camera permissions.",
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsProcessing(false);
    setLocalCameraActive(false);
  };

  const toggleCamera = async () => {
    if (localCameraActive) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startEmotionDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);

    const detectEmotion = () => {
      if (
        !isActive ||
        !videoRef.current ||
        !canvasRef.current ||
        !localCameraActive
      )
        return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx && videoRef.current.readyState === 4) {
        // Draw current frame to canvas
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        // Simulate emotion detection (replace with actual TensorFlow.js model)
        const emotions = [
          "happy",
          "sad",
          "angry",
          "surprised",
          "fearful",
          "disgusted",
          "neutral",
        ];
        const randomEmotion =
          emotions[Math.floor(Math.random() * emotions.length)];
        const randomConfidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0

        setCurrentEmotion(randomEmotion);
        setConfidence(randomConfidence);
        onEmotionDetected(randomEmotion, randomConfidence);
      }

      // Continue detection
      if (localCameraActive) {
        setTimeout(detectEmotion, 1000); // Analyze every second
      }
    };

    detectEmotion();
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: "bg-green-500/20 text-green-400 border-green-500/30",
      sad: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      angry: "bg-red-500/20 text-red-400 border-red-500/30",
      surprised: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      fearful: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      disgusted: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      neutral: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return (
      colors[emotion as keyof typeof colors] ||
      "bg-gray-500/20 text-gray-400 border-gray-500/30"
    );
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-purple-900/20 border-slate-700/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xl font-semibold">Emotion Detection</span>
          </div>
          {localCameraActive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Camera Feed - Takes 2 columns */}
          <div className="xl:col-span-2 space-y-4">
            <div
              className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-700/50"
              style={{ aspectRatio: "16/10" }}
            >
              {error ? (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center space-y-6 max-w-md">
                    <div className="p-4 bg-red-500/10 rounded-full w-fit mx-auto">
                      <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Camera Access Required
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {error}
                      </p>
                    </div>

                    {permissionState === "denied" && (
                      <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-300">
                          <div className="font-medium mb-2">
                            To enable camera access:
                          </div>
                          <ul className="space-y-1 text-slate-400">
                            <li>
                              • Click the camera icon in your browser's address
                              bar
                            </li>
                            <li>
                              • Or go to Settings → Privacy & Security → Camera
                            </li>
                            <li>• Allow camera access for this site</li>
                          </ul>
                        </div>
                        <Button
                          onClick={startCamera}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Requesting...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              Try Again
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {permissionState === "prompt" && (
                      <Button
                        onClick={startCamera}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Requesting...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Grant Camera Permission
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-full text-blue-400">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Requesting camera access...</p>
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
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Live indicator */}
                  {localCameraActive && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}

                  {/* Camera Control Button - Adjacent to video */}
                  <div className="absolute top-4 right-4">
                    <Button
                      onClick={toggleCamera}
                      className={`${localCameraActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : localCameraActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Current emotion overlay */}
                  {isProcessing && localCameraActive && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge
                        className={`${getEmotionColor(currentEmotion)} text-lg py-2 px-4 w-full justify-center border`}
                      >
                        {currentEmotion.toUpperCase()} (
                        {(confidence * 100).toFixed(1)}%)
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
              <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <Eye className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-white">
                  {isProcessing && localCameraActive ? "Active" : "Inactive"}
                </div>
                <div className="text-sm text-slate-400">Detection Status</div>
              </div>

              <div className="text-center p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <div className="text-2xl font-bold text-white">
                  {(confidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-slate-400">Confidence</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-white">
                Current Analysis
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Dominant Emotion:</span>
                  <Badge
                    className={`${getEmotionColor(currentEmotion)} border`}
                  >
                    {currentEmotion}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Stress Indicator:</span>
                  <Badge
                    className={
                      currentEmotion === "angry" || currentEmotion === "fearful"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : currentEmotion === "sad"
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                    }
                  >
                    {currentEmotion === "angry" || currentEmotion === "fearful"
                      ? "High"
                      : currentEmotion === "sad"
                        ? "Medium"
                        : "Low"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
              <p className="text-blue-400 text-sm">
                <strong>💡 TensorFlow.js Integration:</strong>
                Place your facial emotion detection model files in{" "}
                <code className="text-purple-400">/public/models/facial/</code>
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
