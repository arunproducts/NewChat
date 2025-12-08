import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Building2, AlertTriangle } from "lucide-react";

export function IndustrySolutionsComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form states
  const [location, setLocation] = useState("");
  const [storeId, setStoreId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [cameraId, setCameraId] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const runAnalysis = async (type: "access-control" | "retail" | "logistics" | "security") => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      let endpoint = "";
      if (type === "access-control") {
        if (!location) return alert("Location required");
        formData.append("location", location);
        endpoint = "/api/solutions/access-control";
      } else if (type === "retail") {
        if (!storeId) return alert("Store ID required");
        formData.append("storeId", storeId);
        endpoint = "/api/solutions/retail-analytics";
      } else if (type === "logistics") {
        if (!packageId || !lat || !lng) return alert("Package ID and coordinates required");
        formData.append("packageId", packageId);
        formData.append("lat", lat);
        formData.append("lng", lng);
        endpoint = "/api/solutions/logistics";
      } else if (type === "security") {
        if (!cameraId || !location) return alert("Camera ID and location required");
        formData.append("cameraId", cameraId);
        formData.append("location", location);
        endpoint = "/api/solutions/security-analytics";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
      setResult({ error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Industry Solutions
          </CardTitle>
          <CardDescription>
            Pre-built AI solutions for access control, retail, logistics, and security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload */}
          <div className="border-2 border-dashed rounded-lg p-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="solutions-file"
            />
            <label htmlFor="solutions-file" className="flex flex-col items-center cursor-pointer">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">
                {selectedFile ? selectedFile.name : "Upload image to analyze"}
              </span>
            </label>
          </div>

          {previewUrl && (
            <div className="max-h-48 w-full rounded-lg border overflow-hidden">
              <img src={previewUrl} alt="Preview" className="w-full h-auto" />
            </div>
          )}

          {/* Solutions Tabs */}
          <Tabs defaultValue="access" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="access">Access</TabsTrigger>
              <TabsTrigger value="retail">Retail</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Access Control */}
            <TabsContent value="access" className="space-y-3">
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="e.g., Main Entrance, Building A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => runAnalysis("access-control")}
                disabled={!selectedFile || !location || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify Access
              </Button>
              <p className="text-xs text-muted-foreground">
                Checks facial recognition + liveness + KYC verification
              </p>
            </TabsContent>

            {/* Smart Retail */}
            <TabsContent value="retail" className="space-y-3">
              <div>
                <label className="text-sm font-medium">Store ID</label>
                <Input
                  placeholder="e.g., STORE-001"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => runAnalysis("retail")}
                disabled={!selectedFile || !storeId || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Analyze Store
              </Button>
              <p className="text-xs text-muted-foreground">
                Detects products, customer count, suspicious activity
              </p>
            </TabsContent>

            {/* Logistics */}
            <TabsContent value="logistics" className="space-y-3">
              <div>
                <label className="text-sm font-medium">Package ID</label>
                <Input
                  placeholder="e.g., PKG-123456"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Latitude</label>
                  <Input
                    placeholder="e.g., 40.7128"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitude</label>
                  <Input
                    placeholder="e.g., -74.0060"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={() => runAnalysis("logistics")}
                disabled={!selectedFile || !packageId || !lat || !lng || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Track Package
              </Button>
              <p className="text-xs text-muted-foreground">
                Detects package damage and delivery status
              </p>
            </TabsContent>

            {/* Security Analytics */}
            <TabsContent value="security" className="space-y-3">
              <div>
                <label className="text-sm font-medium">Camera ID</label>
                <Input
                  placeholder="e.g., CAM-LOBBY-01"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="e.g., Lobby, Floor 2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => runAnalysis("security")}
                disabled={!selectedFile || !cameraId || !location || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Analyze Feed
              </Button>
              <p className="text-xs text-muted-foreground">
                Detects threats and unusual activity
              </p>
            </TabsContent>
          </Tabs>

          {/* Results */}
          {result && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                {result.error && <AlertTriangle className="w-4 h-4 text-red-500" />}
                {result.error ? "Error" : "Result"}
              </h4>
              {result.error ? (
                <p className="text-sm text-red-600">{result.error}</p>
              ) : result.accessGranted !== undefined ? (
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Access:</span>{" "}
                    <span className={result.accessGranted ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {result.accessGranted ? "✓ GRANTED" : "✗ DENIED"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Facial Match:</span> {(result.facialMatchScore * 100).toFixed(1)}%
                  </p>
                  <p>
                    <span className="font-medium">Liveness:</span> {(result.livenessScore * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">{result.reason}</p>
                </div>
              ) : result.detectectedObjects ? (
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Customers:</span> {result.customerCount}
                  </p>
                  <p>
                    <span className="font-medium">Estimated Sales:</span> ${result.estimatedSales.toFixed(2)}
                  </p>
                  {result.suspiciousActivity && (
                    <p className="text-orange-600 font-medium">⚠️ Suspicious activity detected</p>
                  )}
                </div>
              ) : result.status ? (
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Status:</span> {result.status.toUpperCase()}
                  </p>
                  {result.damageLevel !== "none" && (
                    <p className="text-orange-600">
                      <span className="font-medium">Damage:</span> {result.damageLevel}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{result.recommendedAction}</p>
                </div>
              ) : result.alert ? (
                <div className="text-sm space-y-1">
                  <p className="text-red-600 font-semibold">🚨 {result.alert.alertType.toUpperCase()}</p>
                  <p>
                    <span className="font-medium">Severity:</span> {result.alert.severity}
                  </p>
                  <p className="text-xs text-muted-foreground">{result.alert.recommendedAction}</p>
                </div>
              ) : (
                <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
