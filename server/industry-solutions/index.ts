/**
 * Industry Solutions
 * Pre-built AI solutions for specific verticals
 * - Access Control (Face recognition + liveness + KYC)
 * - Smart Retail (Product detection, analytics, theft prevention)
 * - Logistics (Package tracking, damage detection, route optimization)
 * - Security (Threat detection, anomaly detection, surveillance)
 */

import { getIdentityPlatform, AIIdentityPlatform } from "../identity-platform/index";
import { getVisionSDK, AIVisionSDK } from "../vision-sdk/index";
import { getEdgeRuntime, EdgeAIRuntime } from "../edge-runtime/index";

export type SolutionType =
  | "access_control"
  | "smart_retail"
  | "logistics"
  | "security_analytics";

export interface AccessControlEvent {
  timestamp: number;
  personId: string;
  userId?: string;
  location: string;
  accessGranted: boolean;
  facialMatchScore: number;
  livenessScore: number;
  kycVerified: boolean;
  reason?: string;
}

export interface RetailAnalytics {
  timestamp: number;
  storeId: string;
  detectectedObjects: Array<{
    class: string;
    count: number;
    confidence: number;
  }>;
  customerCount: number;
  dwell_time: number; // seconds
  suspiciousActivity: boolean;
  estimatedSales: number;
}

export interface LogisticsEvent {
  timestamp: number;
  packageId: string;
  location: {
    lat: number;
    lng: number;
  };
  status: "in_transit" | "damaged" | "delivered" | "lost";
  damageLevel?: "none" | "minor" | "major" | "destroyed";
  detectedIssues: string[];
  recommendedAction?: string;
}

export interface SecurityAlert {
  timestamp: number;
  cameraId: string;
  alertType: "person_detected" | "unusual_activity" | "object_abandoned" | "intrusion";
  confidence: number;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  imageUrl?: string;
  recommendedAction: string;
}

export interface SolutionConfig {
  type: SolutionType;
  enabled: boolean;
  settings: Record<string, any>;
}

export class IndustrySolutions {
  private identity: AIIdentityPlatform;
  private vision: AIVisionSDK;
  private edge: EdgeAIRuntime;
  private configs: Map<SolutionType, SolutionConfig> = new Map();
  private eventLogs: Map<SolutionType, any[]> = new Map();

  constructor() {
    this.identity = getIdentityPlatform();
    this.vision = getVisionSDK();
    this.edge = getEdgeRuntime();

    this.initializeConfigs();
  }

  /**
   * ACCESS CONTROL SOLUTION
   * Monitor entry points with face + liveness + KYC verification
   */
  async processAccessControl(
    cameraImage: Buffer,
    location: string,
    requiredKYC: boolean = false
  ): Promise<AccessControlEvent> {
    try {
      // Step 1: Detect face
      const faceDetection = await this.vision.detectFaces(cameraImage, {
        includeEmbeddings: true,
      });

      if (!faceDetection.detections.length) {
        const event: AccessControlEvent = {
          timestamp: Date.now(),
          personId: "unknown",
          location,
          accessGranted: false,
          facialMatchScore: 0,
          livenessScore: 0,
          kycVerified: false,
          reason: "No face detected",
        };
        this.logEvent("access_control", event);
        return event;
      }

      const facialMatch = faceDetection.detections[0].confidence;

      // Step 2: Check liveness (would require video stream in production)
      const livenessScore = 0.92; // Mock

      // Step 3: Verify KYC if required
      let kycVerified = !requiredKYC;
      if (requiredKYC) {
        // In production, would verify against ID database
        kycVerified = facialMatch > 0.85;
      }

      const accessGranted = facialMatch > 0.8 && livenessScore > 0.8 && kycVerified;

      const event: AccessControlEvent = {
        timestamp: Date.now(),
        personId: `person_${Math.random().toString(36).substr(2, 9)}`,
        location,
        accessGranted,
        facialMatchScore: facialMatch,
        livenessScore,
        kycVerified,
        reason: accessGranted ? "Access granted" : "Face match or liveness check failed",
      };

      this.logEvent("access_control", event);
      console.log(`[Industry Solutions] Access Control: ${location} - ${accessGranted ? "✓ GRANTED" : "✗ DENIED"}`);

      return event;
    } catch (err) {
      console.error("[Industry Solutions] Access control failed:", err);
      throw err;
    }
  }

  /**
   * SMART RETAIL SOLUTION
   * Detect products, customers, and suspicious activity
   */
  async analyzeRetailStore(
    storeCamera: Buffer,
    storeId: string
  ): Promise<RetailAnalytics> {
    try {
      // Detect objects (products, people)
      const objectDetection = await this.vision.detectObjects(storeCamera);

      // Count people and products
      const detectedObjects = objectDetection.detections.map((d) => ({
        class: d.data?.class || "unknown",
        count: 1,
        confidence: d.confidence,
      }));

      // Aggregate by class
      const aggregated = new Map<string, typeof detectedObjects[0]>();
      detectedObjects.forEach((obj) => {
        const existing = aggregated.get(obj.class);
        if (existing) {
          existing.count += 1;
        } else {
          aggregated.set(obj.class, { ...obj });
        }
      });

      const customerCount = aggregated.get("person")?.count || 0;

      // Detect suspicious activity (mock: based on crowd + motion)
      const suspiciousActivity = customerCount > 20; // Example threshold

      // Estimate sales (mock: based on detected purchases)
      const estimatedSales = customerCount * 45.5; // Mock average

      const analytics: RetailAnalytics = {
        timestamp: Date.now(),
        storeId,
        detectectedObjects: Array.from(aggregated.values()),
        customerCount,
        dwell_time: 180, // Mock
        suspiciousActivity,
        estimatedSales,
      };

      this.logEvent("smart_retail", analytics);
      console.log(
        `[Industry Solutions] Retail Analytics: ${storeId} - ${customerCount} customers, ${suspiciousActivity ? "🚨 ALERT" : "✓ Normal"}`
      );

      return analytics;
    } catch (err) {
      console.error("[Industry Solutions] Retail analysis failed:", err);
      throw err;
    }
  }

  /**
   * LOGISTICS SOLUTION
   * Track packages, detect damage, optimize routes
   */
  async processLogisticsPackage(
    packageImage: Buffer,
    packageId: string,
    location: { lat: number; lng: number }
  ): Promise<LogisticsEvent> {
    try {
      // Detect damage on package
      const objectDetection = await this.vision.detectObjects(packageImage);

      const damageIndicators = objectDetection.detections.filter((d) =>
        (d.data?.class || "").includes("damage")
      );

      let damageLevel: "none" | "minor" | "major" | "destroyed" = "none";
      let status: "in_transit" | "damaged" | "delivered" | "lost" = "in_transit";

      if (damageIndicators.length) {
        const maxConfidence = Math.max(...damageIndicators.map((d) => d.confidence));
        if (maxConfidence > 0.8) {
          damageLevel = "major";
          status = "damaged";
        } else {
          damageLevel = "minor";
        }
      }

      const detectedIssues = damageLevel !== "none" ? [`Damage detected: ${damageLevel}`] : [];

      const event: LogisticsEvent = {
        timestamp: Date.now(),
        packageId,
        location,
        status,
        damageLevel,
        detectedIssues,
        recommendedAction:
          damageLevel === "major" ? "Hold for inspection" : "Continue delivery",
      };

      this.logEvent("logistics", event);
      console.log(
        `[Industry Solutions] Logistics: Package ${packageId} - Status: ${status}${damageLevel !== "none" ? ` (${damageLevel} damage)` : ""}`
      );

      return event;
    } catch (err) {
      console.error("[Industry Solutions] Logistics processing failed:", err);
      throw err;
    }
  }

  /**
   * SECURITY ANALYTICS SOLUTION
   * Real-time threat detection and anomaly detection
   */
  async analyzeSecurityFeed(
    cameraImage: Buffer,
    cameraId: string,
    location: string
  ): Promise<SecurityAlert | null> {
    try {
      // Detect people and suspicious patterns
      const faceDetection = await this.vision.detectFaces(cameraImage);
      const objectDetection = await this.vision.detectObjects(cameraImage);

      let alert: SecurityAlert | null = null;

      if (faceDetection.detections.length === 0 && objectDetection.detections.length === 0) {
        return null;
      }

      // Check for suspicious patterns
      const personCount = faceDetection.detections.length;
      const hasUnusualObjects = objectDetection.detections.some(
        (d) =>
          (d.data?.class || "").includes("weapon") ||
          (d.data?.class || "").includes("prohibited")
      );

      if (hasUnusualObjects) {
        alert = {
          timestamp: Date.now(),
          cameraId,
          alertType: "intrusion",
          confidence: 0.95,
          location,
          severity: "critical",
          recommendedAction: "Escalate to security team immediately",
        };
      } else if (personCount > 5 && Math.random() > 0.7) {
        // Mock: Unusual crowd behavior
        alert = {
          timestamp: Date.now(),
          cameraId,
          alertType: "unusual_activity",
          confidence: 0.75,
          location,
          severity: "medium",
          recommendedAction: "Monitor closely",
        };
      }

      if (alert) {
        this.logEvent("security_analytics", alert);
        console.log(
          `[Industry Solutions] Security Alert: ${location} - ${alert.alertType.toUpperCase()}`
        );
      }

      return alert;
    } catch (err) {
      console.error("[Industry Solutions] Security analysis failed:", err);
      throw err;
    }
  }

  /**
   * Get solution by type
   */
  getSolution(type: SolutionType): SolutionConfig | undefined {
    return this.configs.get(type);
  }

  /**
   * Enable/disable solution
   */
  setSolutionEnabled(type: SolutionType, enabled: boolean): void {
    const config = this.configs.get(type);
    if (config) {
      config.enabled = enabled;
      console.log(
        `[Industry Solutions] ${type} solution ${enabled ? "enabled" : "disabled"}`
      );
    }
  }

  /**
   * Get solution statistics
   */
  getStats(type?: SolutionType): Record<string, any> {
    if (type) {
      const events = this.eventLogs.get(type) || [];
      return {
        solution: type,
        totalEvents: events.length,
        lastEvent: events[events.length - 1] || null,
        config: this.configs.get(type),
      };
    }

    // Return all stats
    const stats: Record<string, any> = {
      totalSolutions: this.configs.size,
      enabledSolutions: Array.from(this.configs.values()).filter((c) => c.enabled).length,
      solutions: {},
    };

    this.configs.forEach((config, type) => {
      const events = this.eventLogs.get(type) || [];
      stats.solutions[type] = {
        enabled: config.enabled,
        totalEvents: events.length,
      };
    });

    return stats;
  }

  /**
   * Get event history
   */
  getEventHistory(type: SolutionType, limit: number = 100): any[] {
    const events = this.eventLogs.get(type) || [];
    return events.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearEventHistory(type?: SolutionType): void {
    if (type) {
      this.eventLogs.set(type, []);
    } else {
      this.eventLogs.clear();
    }
  }

  /**
   * Helper: Initialize solution configurations
   */
  private initializeConfigs(): void {
    const solutions: SolutionConfig[] = [
      {
        type: "access_control",
        enabled: true,
        settings: {
          requireKYC: true,
          livenessThreshold: 0.8,
          faceMatchThreshold: 0.85,
        },
      },
      {
        type: "smart_retail",
        enabled: true,
        settings: {
          suspiciousActivityThreshold: 20,
          trackingInterval: 5000,
        },
      },
      {
        type: "logistics",
        enabled: true,
        settings: {
          damageDetectionThreshold: 0.7,
          autoReport: true,
        },
      },
      {
        type: "security_analytics",
        enabled: true,
        settings: {
          threatLevel: "high",
          alertOnUnusualActivity: true,
        },
      },
    ];

    solutions.forEach((config) => {
      this.configs.set(config.type, config);
      this.eventLogs.set(config.type, []);
    });

    console.log(`[Industry Solutions] Initialized ${solutions.length} solutions`);
  }

  /**
   * Helper: Log event
   */
  private logEvent(type: SolutionType, event: any): void {
    const events = this.eventLogs.get(type) || [];
    events.push(event);

    // Keep only last 1000 events per solution
    if (events.length > 1000) {
      events.shift();
    }

    this.eventLogs.set(type, events);
  }
}

// Singleton instance
let industrySolutionsInstance: IndustrySolutions | null = null;

export function initIndustrySolutions(): IndustrySolutions {
  if (!industrySolutionsInstance) {
    industrySolutionsInstance = new IndustrySolutions();
  }
  return industrySolutionsInstance;
}

export function getIndustrySolutions(): IndustrySolutions {
  if (!industrySolutionsInstance) {
    industrySolutionsInstance = new IndustrySolutions();
  }
  return industrySolutionsInstance;
}
