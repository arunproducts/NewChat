import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Shield } from "lucide-react";

export function IdentityComponent() {
  const [userId, setUserId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleMultiFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const enrollUser = async () => {
    if (!userId || !selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("userId", userId);

      const res = await fetch("/api/identity/enroll", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Enrollment failed");
      const data = await res.json();
      setResult({ type: "enroll", data });
    } catch (err) {
      console.error("Enrollment error:", err);
      setResult({ type: "error", error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const verifyIdentity = async () => {
    if (!userId || !selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("userId", userId);

      const res = await fetch("/api/identity/verify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Verification failed");
      const data = await res.json();
      setResult({ type: "verify", data });
    } catch (err) {
      console.error("Verification error:", err);
      setResult({ type: "error", error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const checkLiveness = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append("frames", f));

      const res = await fetch("/api/identity/check-liveness", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Liveness check failed");
      const data = await res.json();
      setResult({ type: "liveness", data });
    } catch (err) {
      console.error("Liveness check error:", err);
      setResult({ type: "error", error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Identity Platform
          </CardTitle>
          <CardDescription>
            Facial authentication, liveness detection, KYC verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User ID Input */}
          <div>
            <label className="text-sm font-medium">User ID</label>
            <Input
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1"
            />
          </div>

          <Tabs defaultValue="enroll" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="enroll">Enroll</TabsTrigger>
              <TabsTrigger value="verify">Verify</TabsTrigger>
              <TabsTrigger value="liveness">Liveness</TabsTrigger>
            </TabsList>

            {/* Enroll Tab */}
            <TabsContent value="enroll" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="identity-enroll-file"
                />
                <label htmlFor="identity-enroll-file" className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Upload facial image"}
                  </span>
                </label>
              </div>

              {previewUrl && (
                <div className="max-h-48 w-full rounded-lg border overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                </div>
              )}

              <Button
                onClick={enrollUser}
                disabled={!userId || !selectedFile || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Enroll User
              </Button>
            </TabsContent>

            {/* Verify Tab */}
            <TabsContent value="verify" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="identity-verify-file"
                />
                <label htmlFor="identity-verify-file" className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Upload facial image to verify"}
                  </span>
                </label>
              </div>

              {previewUrl && (
                <div className="max-h-48 w-full rounded-lg border overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                </div>
              )}

              <Button
                onClick={verifyIdentity}
                disabled={!userId || !selectedFile || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify Identity
              </Button>
            </TabsContent>

            {/* Liveness Tab */}
            <TabsContent value="liveness" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultiFileSelect}
                  className="hidden"
                  id="identity-liveness-files"
                />
                <label htmlFor="identity-liveness-files" className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} frames selected` : "Upload 5+ frames"}
                  </span>
                  <span className="text-xs text-muted-foreground">Minimum 5 images required</span>
                </label>
              </div>

              <Button
                onClick={checkLiveness}
                disabled={selectedFiles.length < 5 || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Check Liveness
              </Button>
            </TabsContent>
          </Tabs>

          {/* Results */}
          {result && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">
                {result.type === "error" ? "Error" : result.type === "verify" ? "Verification Result" : "Result"}
              </h4>
              {result.type === "error" ? (
                <p className="text-sm text-destructive">{result.error}</p>
              ) : result.type === "verify" ? (
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={result.data.verified ? "text-green-600" : "text-red-600"}>
                      {result.data.verified ? "✓ Verified" : "✗ Not Verified"}
                    </span>
                  </p>
                </div>
              ) : result.type === "liveness" ? (
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Is Live:</span>{" "}
                    <span className={result.data.isLive ? "text-green-600" : "text-red-600"}>
                      {result.data.isLive ? "✓ Yes" : "✗ No"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Confidence:</span> {(result.data.confidence * 100).toFixed(1)}%
                  </p>
                  <p>
                    <span className="font-medium">Frames Analyzed:</span> {result.data.framesAnalyzed}
                  </p>
                </div>
              ) : (
                <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
