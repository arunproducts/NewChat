import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { VisionComponent } from "@/components/vision-component";
import { IdentityComponent } from "@/components/identity-component";
import { EdgeRuntimeComponent } from "@/components/edge-runtime-component";
import { IndustrySolutionsComponent } from "@/components/industry-solutions-component";
import { Eye, Shield, Zap, Building2 } from "lucide-react";

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">xelo AI Platform</h1>
            <p className="text-muted-foreground">Advanced AI Features & Industry Solutions</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Features Tabs */}
        <Tabs defaultValue="vision" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Vision</span>
            </TabsTrigger>
            <TabsTrigger value="identity" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Identity</span>
            </TabsTrigger>
            <TabsTrigger value="edge" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Edge</span>
            </TabsTrigger>
            <TabsTrigger value="solutions" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Solutions</span>
            </TabsTrigger>
          </TabsList>

          {/* Vision SDK */}
          <TabsContent value="vision" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1">JavaScript AI Vision SDK</h2>
              <p className="text-muted-foreground">
                Detect faces, objects, and estimate poses in images with WebGPU acceleration
              </p>
            </div>
            <VisionComponent />
          </TabsContent>

          {/* Identity Platform */}
          <TabsContent value="identity" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1">AI Identity Platform</h2>
              <p className="text-muted-foreground">
                Facial authentication, liveness detection, KYC verification, and deepfake detection
              </p>
            </div>
            <IdentityComponent />
          </TabsContent>

          {/* Edge Runtime */}
          <TabsContent value="edge" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1">Edge AI Runtime</h2>
              <p className="text-muted-foreground">
                On-device inference with zero cloud dependency for maximum privacy and speed
              </p>
            </div>
            <EdgeRuntimeComponent />
          </TabsContent>

          {/* Industry Solutions */}
          <TabsContent value="solutions" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1">Industry Solutions</h2>
              <p className="text-muted-foreground">
                Pre-built AI solutions for access control, retail, logistics, and security
              </p>
            </div>
            <IndustrySolutionsComponent />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Powered by advanced AI and machine learning technologies</p>
          <p className="mt-1">Privacy-first • On-device • Scalable • Enterprise-ready</p>
        </div>
      </div>
    </div>
  );
}
