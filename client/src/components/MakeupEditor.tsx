import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import * as tf from "@tensorflow/tfjs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Save, Share2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

const SHADES = {
  lipstick: [
    { name: "Classic Red", color: "#E91E63" },
    { name: "Raspberry", color: "#D81B60" },
    { name: "Vivid Pink", color: "#F06292" },
    { name: "Plum", color: "#880E4F" },
    { name: "Magenta", color: "#AD1457" },
  ],
  blush: [
    { name: "Light Pink", color: "#F8BBD0" },
    { name: "Hot Pink", color: "#EC407A" },
    { name: "Rose", color: "#F06292" },
    { name: "Peach", color: "#FFAB91" },
    { name: "Coral", color: "#FF7043" },
  ],
  eyeshadow: [
    { name: "Brown", color: "#5D4037" },
    { name: "Copper", color: "#BCAAA4" },
    { name: "Bronze", color: "#A9746E" },
    { name: "Mocha", color: "#8D6E63" },
    { name: "Beige", color: "#FFECB3" },
  ],
  eyebrow: [
    { name: "Soft Brown", color: "#5D4037" },
    { name: "Charcoal", color: "#36454F" },
    { name: "Dark Brown", color: "#3E2723" },
    { name: "Ebony", color: "#1C1C1C" },
    { name: "Ash", color: "#B2BEB5" },
  ],
};

const POPULAR_LOOKS = ["Natural", "Bold", "Glamorous", "Classic"];
const PRODUCT_ORDER = ["lipstick", "blush", "eyeshadow", "eyebrow"] as const;
type ProductType = typeof PRODUCT_ORDER[number];

interface MakeupEditorProps {
  onSave?: (file: Blob) => void;
}

export default function MakeupEditor({ onSave }: MakeupEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [intensity, setIntensity] = useState({
    lipstick: 75,
    blush: 65,
    eyeshadow: 75,
    eyebrow: 50,
  });

  const [selectedShades, setSelectedShades] = useState({
    lipstick: 0,
    blush: 0,
    eyeshadow: 0,
    eyebrow: 0,
  });

  const [popularLook, setPopularLook] = useState("Glamorous");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const setupBackend = async () => {
      try {
        await tf.ready();
        await tf.setBackend("webgl");
        console.log("Tensorflow backend set to webgl");
      } catch {
        await tf.setBackend("cpu");
        console.log("Tensorflow backend set to cpu");
      }
    };
    setupBackend();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        toast.success("AI models loaded! Camera starting...");
      } catch (err) {
        console.error("Model load error:", err);
        setModelsLoaded(false);
        toast.error("Failed loading AI models.");
      }
    })();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        });
        video.srcObject = stream;
        setCameraActive(true);
        toast.success("Camera activated!");
      } catch (err) {
        toast.error("Camera access denied or unavailable.");
        console.error("Camera error:", err);
      }
    }
    startCamera();

    const onLoadedMetadata = async () => {
      try {
        await video.play();
      } catch {
        // Ignore play errors (autoplay policy)
      }
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log("Canvas size set:", canvas.width, canvas.height);
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraActive) return;

    let animationId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = async () => {
      if (!video || video.readyState !== 4 || video.paused) {
        animationId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      ctx.fillStyle = "rgba(255,0,0,0.6)";
      ctx.fillRect(20, 20, 160, 80);

      if (!modelsLoaded) {
        animationId = requestAnimationFrame(render);
        return;
      }

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true);

        if (detection?.landmarks) {
          const landmarks = detection.landmarks;

          // Lips
          const lipPoints = landmarks.getMouth();
          console.log("[Lips] Points count:", lipPoints.length);
          if (lipPoints.length > 0) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#00FF00";
            ctx.beginPath();
            ctx.arc(canvas.width - lipPoints[0].x, lipPoints[0].y, 30, 0, Math.PI * 2);
            ctx.fill();

            if (intensity.lipstick > 0) {
              ctx.globalAlpha = intensity.lipstick / 150;
              ctx.fillStyle = SHADES.lipstick[selectedShades.lipstick].color;
              ctx.beginPath();
              lipPoints.forEach((pt, i) => {
                const x = canvas.width - pt.x;
                const y = pt.y;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              ctx.closePath();
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }

          // Cheeks
          const leftCheek = landmarks.positions[3];
          const rightCheek = landmarks.positions[13];
          if (leftCheek && rightCheek && intensity.blush > 0) {
            ctx.globalAlpha = intensity.blush / 200;
            ctx.fillStyle = SHADES.blush[selectedShades.blush].color;
            ctx.beginPath();
            ctx.ellipse(
              canvas.width - leftCheek.x,
              leftCheek.y,
              canvas.width * 0.05,
              canvas.height * 0.03,
              0,
              0,
              2 * Math.PI
            );
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(
              canvas.width - rightCheek.x,
              rightCheek.y,
              canvas.width * 0.05,
              canvas.height * 0.03,
              0,
              0,
              2 * Math.PI
            );
            ctx.fill();

            ctx.globalAlpha = 1;
          }

          // Eyeshadow
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          console.log("[Eye] Left points:", leftEye.length, "Right points:", rightEye.length);
          if (leftEye.length > 0 && rightEye.length > 0 && intensity.eyeshadow > 0) {
            ctx.globalAlpha = intensity.eyeshadow / 150;
            ctx.fillStyle = SHADES.eyeshadow[selectedShades.eyeshadow].color;
            ctx.beginPath();
            leftEye.forEach((pt, i) => {
              const x = canvas.width - pt.x;
              const y = pt.y;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            rightEye.forEach((pt, i) => {
              const x = canvas.width - pt.x;
              const y = pt.y;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          // Eyebrows from positions indexes (17-21 left, 22-26 right)
          const leftEyebrowPoints = landmarks.positions.slice(17, 22);
          const rightEyebrowPoints = landmarks.positions.slice(22, 27);
          console.log("[Eyebrows] Left points:", leftEyebrowPoints.length, "Right points:", rightEyebrowPoints.length);
          if (
            leftEyebrowPoints.length > 0 &&
            rightEyebrowPoints.length > 0 &&
            intensity.eyebrow > 0
          ) {
            ctx.globalAlpha = intensity.eyebrow / 180;
            ctx.fillStyle = SHADES.eyebrow[selectedShades.eyebrow].color;

            ctx.beginPath();
            leftEyebrowPoints.forEach((pt, i) => {
              const x = canvas.width - pt.x;
              const y = pt.y;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            rightEyebrowPoints.forEach((pt, i) => {
              const x = canvas.width - pt.x;
              const y = pt.y;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();

            ctx.globalAlpha = 1;
          }
        }
      } catch (error) {
        console.error("[Detection Error]", error);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [cameraActive, selectedShades, intensity, modelsLoaded]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      canvas.toBlob((blob) => {
        if (blob) {
          onSave(blob);
          toast.success("Look saved successfully!");
        }
      }, "image/jpeg", 0.95);
    }
  };

  const handleReset = () => {
    setIntensity({ lipstick: 75, blush: 65, eyeshadow: 75, eyebrow: 50 });
    setSelectedShades({ lipstick: 0, blush: 0, eyeshadow: 0, eyebrow: 0 });
    toast.info("Makeup reset to defaults");
  };

  const handleShadeClick = (product: ProductType, idx: number) => {
    setSelectedShades((prev) => ({ ...prev, [product]: idx }));
  };

  const handleIntensityChange = (product: ProductType, value: number[]) => {
    setIntensity((prev) => ({ ...prev, [product]: value[0] }));
  };

  const getProductIcon = (product: ProductType) => {
    switch (product) {
      case "lipstick":
        return "💄";
      case "blush":
        return "🌸";
      case "eyeshadow":
        return "👁️";
      case "eyebrow":
        return "🖌️";
      default:
        return "";
    }
  };

  const getProductLabel = (product: ProductType) =>
    product.charAt(0).toUpperCase() + product.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="overflow-hidden shadow-beauty border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Camera className="w-6 h-6" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: "none" }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
                  <div className="text-center space-y-3 p-6 bg-card/90 rounded-lg shadow-xl">
                    <Camera className="w-16 h-16 mx-auto animate-pulse text-primary" />
                    <div>
                      <p className="text-xl font-bold text-foreground">
                        Initializing camera...
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Please allow camera access
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={handleSave} size="lg" className="shadow-soft">
            <Save className="w-4 h-4 mr-2" />
            Save Look
          </Button>
          <Button variant="secondary" size="lg" className="shadow-soft">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="lg" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Popular Looks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {POPULAR_LOOKS.map((look) => (
                <Badge
                  key={look}
                  variant={popularLook === look ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm transition-smooth hover:scale-105"
                  onClick={() => setPopularLook(look)}
                >
                  {look}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {PRODUCT_ORDER.map((product) => (
          <Card key={product} className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{getProductIcon(product)}</span>
                {getProductLabel(product)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Select Shade
                </label>
                <div className="flex gap-2">
                  {SHADES[product].map((shade, idx) => (
                    <button
                      key={idx}
                      title={shade.name}
                      onClick={() => handleShadeClick(product, idx)}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedShades[product] === idx
                          ? "border-primary shadow-beauty scale-110"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: shade.color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-muted-foreground">
                    Intensity
                  </label>
                  <span className="font-bold text-primary">{intensity[product]}%</span>
                </div>
                <Slider
                  value={[intensity[product]]}
                  onValueChange={(value) => handleIntensityChange(product, value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Light</span>
                  <span>Medium</span>
                  <span>Intense</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
