import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, Eye } from "lucide-react";

interface Detection {
  type: "face" | "object" | "pose";
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  data?: Record<string, any>;
}

interface VisionResult {
  detections: Detection[];
  processingTime: number;
  timestamp: number;
  imageSize: { width: number; height: number };
}

export function VisionComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const runDetection = async (type: "faces" | "objects" | "pose") => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const endpoint =
        type === "faces"
          ? "/api/vision/detect-faces?includeLandmarks=true&includeEmbeddings=true"
          : type === "objects"
            ? "/api/vision/detect-objects"
            : "/api/vision/estimate-pose";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Detection failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Detection error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            AI Vision SDK
          </CardTitle>
          <CardDescription>
            Detect faces, objects, and estimate poses in images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="vision-file"
            />
            <label htmlFor="vision-file" className="flex flex-col items-center cursor-pointer">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">
                {selectedFile ? selectedFile.name : "Upload image to analyze"}
              </span>
              <span className="text-xs text-muted-foreground">PNG, JPG, or WebP</span>
            </label>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="max-h-96 w-full rounded-lg border overflow-hidden">
              <img src={previewUrl} alt="Preview" className="w-full h-auto" />
            </div>
          )}

          {/* Detection Buttons */}
          <Tabs defaultValue="faces" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faces">Faces</TabsTrigger>
              <TabsTrigger value="objects">Objects</TabsTrigger>
              <TabsTrigger value="pose">Pose</TabsTrigger>
            </TabsList>

            <TabsContent value="faces" className="space-y-2">
              <Button
                onClick={() => runDetection("faces")}
                disabled={!selectedFile || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Detect Faces
              </Button>
            </TabsContent>

            <TabsContent value="objects" className="space-y-2">
              <Button
                onClick={() => runDetection("objects")}
                disabled={!selectedFile || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Detect Objects
              </Button>
            </TabsContent>

            <TabsContent value="pose" className="space-y-2">
              <Button
                onClick={() => runDetection("pose")}
                disabled={!selectedFile || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Estimate Pose
              </Button>
            </TabsContent>
          </Tabs>

          {/* Results */}
          {result && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">Results</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Detections:</span> {result.detections.length}
                </p>
                <p>
                  <span className="font-medium">Processing Time:</span> {result.processingTime}ms
                </p>
                <p>
                  <span className="font-medium">Image Size:</span> {result.imageSize.width}x{result.imageSize.height}
                </p>
              </div>

              {result.detections.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-sm mb-2">Detections:</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.detections.map((det, i) => (
                      <div key={i} className="text-xs bg-background p-2 rounded">
                        <p>
                          <span className="font-medium">{det.type}</span> - Confidence:{" "}
                          {(det.confidence * 100).toFixed(1)}%
                        </p>
                        {det.data?.class && <p className="text-muted-foreground">Class: {det.data.class}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
