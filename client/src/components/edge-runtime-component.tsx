import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Server } from "lucide-react";

interface EdgeDevice {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "busy";
  specs: {
    cpu: string;
    ram: number;
    storage: number;
    gpu?: boolean;
  };
}

export function EdgeRuntimeComponent() {
  const [devices, setDevices] = useState<EdgeDevice[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
    loadStats();
    const interval = setInterval(() => {
      loadDevices();
      loadStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      const res = await fetch("/api/edge/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (err) {
      console.error("Failed to load devices:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/edge/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "busy":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Edge AI Runtime
          </CardTitle>
          <CardDescription>
            On-device inference with zero cloud dependency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overview Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Devices Online</p>
                <p className="text-2xl font-bold">{stats.devicesOnline}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalDevices}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Capacity</p>
                <p className="text-2xl font-bold">{stats.totalCapacityMB}</p>
                <p className="text-xs text-muted-foreground">MB RAM</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Available Models</p>
                <p className="text-2xl font-bold">{stats.availableModels}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Deployed</p>
                <p className="text-2xl font-bold">{stats.deployedModels}</p>
              </div>
            </div>
          )}

          {/* Devices List */}
          <Tabs defaultValue="devices" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
            </TabsList>

            <TabsContent value="devices" className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : devices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No devices available</p>
              ) : (
                devices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(device.status)}`} />
                        <Badge variant="outline">{device.status}</Badge>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">ID:</span> {device.id}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span> {device.type}
                      </p>
                      <p>
                        <span className="font-medium">CPU:</span> {device.specs.cpu}
                      </p>
                      <p>
                        <span className="font-medium">RAM:</span> {device.specs.ram}MB
                      </p>
                      {device.specs.gpu && (
                        <Badge className="mt-1 bg-blue-600">GPU Enabled</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="models" className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p className="mb-3">Available edge models for deployment:</p>
                <ul className="space-y-2">
                  <li className="border rounded p-2">
                    <p className="font-medium text-foreground">YOLOv5 Tiny (Object Detection)</p>
                    <p className="text-xs">13.5 MB • ~150ms latency • 89% accuracy</p>
                  </li>
                  <li className="border rounded p-2">
                    <p className="font-medium text-foreground">MobileNet v3 (Classification)</p>
                    <p className="text-xs">9.2 MB • ~80ms latency • 91% accuracy</p>
                  </li>
                  <li className="border rounded p-2">
                    <p className="font-medium text-foreground">MediaPipe Pose (Pose Detection)</p>
                    <p className="text-xs">6.4 MB • ~120ms latency • 93% accuracy</p>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-medium">💡 Tip:</span> Edge Runtime executes models directly on devices
              with zero cloud calls, ensuring maximum privacy and minimal latency.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
