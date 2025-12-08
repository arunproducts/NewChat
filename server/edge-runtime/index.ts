/**
 * Edge AI Runtime
 * On-device inference with zero cloud dependency
 * Optimized for edge devices: mobile, edge servers, IoT
 */

export interface EdgeDevice {
  id: string;
  name: string;
  type: "mobile" | "edge_server" | "iot" | "camera";
  capabilities: string[];
  status: "online" | "offline" | "busy";
  lastSeen: number;
  specs: {
    cpu: string;
    ram: number; // MB
    storage: number; // MB
    gpu?: boolean;
    tpu?: boolean;
  };
}

export interface EdgeInferenceRequest {
  deviceId: string;
  modelId: string;
  input: Buffer | ArrayBuffer;
  priority: "low" | "normal" | "high";
  timeout: number; // ms
}

export interface EdgeInferenceResult {
  deviceId: string;
  modelId: string;
  output: Record<string, any>;
  inferenceTime: number; // ms
  accuracy: number;
  timestamp: number;
  cacheHit: boolean;
}

export interface EdgeModelManifest {
  id: string;
  name: string;
  version: string;
  sizeBytes: number;
  type: "object_detection" | "classification" | "segmentation" | "pose" | "custom";
  framework: "onnx" | "tflite" | "mojo" | "custom";
  quantization: "fp32" | "fp16" | "int8" | "int4";
  inputShape: number[];
  outputShape: number[];
  requiredRamMB: number;
  estimatedLatencyMs: number;
  accuracy: number; // 0-1
}

export interface EdgeBatchRequest {
  deviceId: string;
  requests: EdgeInferenceRequest[];
  returnPartialResults: boolean;
}

export interface EdgeStreamConfig {
  deviceId: string;
  modelId: string;
  batchSize: number;
  intervalMs: number;
  maxFrames?: number;
}

export class EdgeAIRuntime {
  private devices: Map<string, EdgeDevice> = new Map();
  private models: Map<string, EdgeModelManifest> = new Map();
  private inferenceQueue: Map<string, EdgeInferenceRequest[]> = new Map();
  private resultCache: Map<string, EdgeInferenceResult> = new Map();

  constructor() {
    this.initializeSampleDevices();
    this.loadAvailableModels();
  }

  /**
   * Register an edge device
   */
  registerDevice(device: EdgeDevice): void {
    if (!this.devices.has(device.id)) {
      device.lastSeen = Date.now();
      this.devices.set(device.id, device);
      console.log(`[Edge Runtime] Device registered: ${device.id} (${device.type})`);
    }
  }

  /**
   * Update device status
   */
  updateDeviceStatus(deviceId: string, status: "online" | "offline" | "busy"): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = status;
      device.lastSeen = Date.now();
      console.log(`[Edge Runtime] Device ${deviceId} status: ${status}`);
    }
  }

  /**
   * Get list of available devices
   */
  getAvailableDevices(type?: string): EdgeDevice[] {
    return Array.from(this.devices.values()).filter(
      (d) => d.status === "online" && (!type || d.type === type)
    );
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): EdgeDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Deploy model to edge device
   */
  async deployModel(deviceId: string, modelId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    const model = this.models.get(modelId);

    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Check device capacity
    if (model.requiredRamMB > device.specs.ram * 0.8) {
      throw new Error(
        `Insufficient RAM on device ${deviceId}. Required: ${model.requiredRamMB}MB, Available: ${device.specs.ram * 0.8}MB`
      );
    }

    console.log(`[Edge Runtime] Deploying ${modelId} to ${deviceId}...`);
    // In production, this would push the model to the device

    // Track deployment
    if (!device.capabilities.includes(modelId)) {
      device.capabilities.push(modelId);
    }

    console.log(`[Edge Runtime] Model ${modelId} deployed to ${deviceId}`);
  }

  /**
   * Run inference on edge device
   */
  async runInference(request: EdgeInferenceRequest): Promise<EdgeInferenceResult> {
    try {
      const device = this.devices.get(request.deviceId);
      if (!device) {
        throw new Error(`Device not found: ${request.deviceId}`);
      }

      if (device.status !== "online") {
        throw new Error(`Device is ${device.status}`);
      }

      if (!device.capabilities.includes(request.modelId)) {
        throw new Error(`Model ${request.modelId} not available on device`);
      }

      const startTime = Date.now();

      // Check cache
      const cacheKey = `${request.deviceId}-${request.modelId}-${request.input}`;
      const cached = this.resultCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 60000) {
        console.log(`[Edge Runtime] Cache hit for ${request.modelId} on ${request.deviceId}`);
        return { ...cached, timestamp: Date.now(), cacheHit: true };
      }

      // Simulate inference
      const model = this.models.get(request.modelId);
      const inferenceTime = model?.estimatedLatencyMs || 500;

      // Mock inference result
      const result: EdgeInferenceResult = {
        deviceId: request.deviceId,
        modelId: request.modelId,
        output: {
          predictions: [
            { class: "object_1", confidence: 0.92 },
            { class: "object_2", confidence: 0.87 },
          ],
        },
        inferenceTime,
        accuracy: model?.accuracy || 0.9,
        timestamp: Date.now(),
        cacheHit: false,
      };

      // Cache result
      this.resultCache.set(cacheKey, result);

      console.log(
        `[Edge Runtime] Inference complete on ${request.deviceId}: ${inferenceTime}ms`
      );

      return result;
    } catch (err) {
      console.error("[Edge Runtime] Inference failed:", err);
      throw err;
    }
  }

  /**
   * Run batch inference
   */
  async runBatchInference(request: EdgeBatchRequest): Promise<EdgeInferenceResult[]> {
    try {
      const device = this.devices.get(request.deviceId);
      if (!device) {
        throw new Error(`Device not found: ${request.deviceId}`);
      }

      const results: EdgeInferenceResult[] = [];

      for (const req of request.requests) {
        try {
          const result = await this.runInference(req);
          results.push(result);
        } catch (err) {
          if (!request.returnPartialResults) {
            throw err;
          }
          // Continue with partial results
          console.warn(`[Edge Runtime] Skipping failed inference:`, err);
        }
      }

      console.log(
        `[Edge Runtime] Batch inference complete: ${results.length}/${request.requests.length} succeeded`
      );

      return results;
    } catch (err) {
      console.error("[Edge Runtime] Batch inference failed:", err);
      throw err;
    }
  }

  /**
   * Stream inference results from device
   */
  async *streamInference(config: EdgeStreamConfig): AsyncGenerator<EdgeInferenceResult> {
    const device = this.devices.get(config.deviceId);
    if (!device) {
      throw new Error(`Device not found: ${config.deviceId}`);
    }

    let frameCount = 0;
    while (!config.maxFrames || frameCount < config.maxFrames) {
      try {
        const request: EdgeInferenceRequest = {
          deviceId: config.deviceId,
          modelId: config.modelId,
          input: Buffer.alloc(0), // Mock input
          priority: "normal",
          timeout: config.intervalMs,
        };

        const result = await this.runInference(request);
        yield result;

        frameCount++;

        // Wait for next frame
        await new Promise((resolve) => setTimeout(resolve, config.intervalMs));
      } catch (err) {
        console.error("[Edge Runtime] Stream inference error:", err);
        throw err;
      }
    }

    console.log(`[Edge Runtime] Stream ended after ${frameCount} frames`);
  }

  /**
   * Get model availability on devices
   */
  getModelAvailability(modelId: string): Map<string, EdgeDevice> {
    const availability = new Map<string, EdgeDevice>();

    this.devices.forEach((device) => {
      if (device.capabilities.includes(modelId)) {
        availability.set(device.id, device);
      }
    });

    return availability;
  }

  /**
   * Optimize model for device constraints
   */
  async optimizeModel(
    modelId: string,
    deviceId: string,
    targetQuantization?: string
  ): Promise<EdgeModelManifest> {
    const model = this.models.get(modelId);
    const device = this.devices.get(deviceId);

    if (!model || !device) {
      throw new Error("Model or device not found");
    }

    // Mock optimization
    const optimized = { ...model };

    // Apply quantization if specified
    if (targetQuantization === "int8") {
      optimized.sizeBytes = model.sizeBytes * 0.25;
      optimized.estimatedLatencyMs = model.estimatedLatencyMs * 0.8;
      optimized.accuracy = model.accuracy * 0.98;
      optimized.quantization = "int8";
    }

    console.log(`[Edge Runtime] Model ${modelId} optimized for ${deviceId}`);

    return optimized;
  }

  /**
   * Get runtime statistics
   */
  getStats(): Record<string, any> {
    const devices = this.getAvailableDevices();
    const totalCapacity = devices.reduce((sum, d) => sum + d.specs.ram, 0);
    const totalModels = this.models.size;
    const deployedModels = devices.reduce((sum, d) => sum + d.capabilities.length, 0);

    return {
      devicesOnline: devices.length,
      totalDevices: this.devices.size,
      totalCapacityMB: totalCapacity,
      availableModels: totalModels,
      deployedModels,
      cachedInferences: this.resultCache.size,
    };
  }

  /**
   * Initialize sample devices
   */
  private initializeSampleDevices(): void {
    const sampleDevices: EdgeDevice[] = [
      {
        id: "mobile-device-1",
        name: "iPhone 14 Pro",
        type: "mobile",
        capabilities: [],
        status: "online",
        lastSeen: Date.now(),
        specs: { cpu: "A16", ram: 6000, storage: 128000, gpu: true },
      },
      {
        id: "edge-server-1",
        name: "NVIDIA Jetson Orin",
        type: "edge_server",
        capabilities: [],
        status: "online",
        lastSeen: Date.now(),
        specs: { cpu: "ARM", ram: 12000, storage: 256000, gpu: true, tpu: true },
      },
      {
        id: "camera-device-1",
        name: "IP Camera - Lobby",
        type: "camera",
        capabilities: [],
        status: "online",
        lastSeen: Date.now(),
        specs: { cpu: "ARMv7", ram: 512, storage: 4000, gpu: false },
      },
    ];

    sampleDevices.forEach((device) => this.registerDevice(device));
  }

  /**
   * Load available models
   */
  private loadAvailableModels(): void {
    const models: EdgeModelManifest[] = [
      {
        id: "yolov5-tiny",
        name: "YOLOv5 Tiny (Object Detection)",
        version: "1.0.0",
        sizeBytes: 13500000,
        type: "object_detection",
        framework: "onnx",
        quantization: "int8",
        inputShape: [1, 3, 416, 416],
        outputShape: [1, 25200, 85],
        requiredRamMB: 128,
        estimatedLatencyMs: 150,
        accuracy: 0.89,
      },
      {
        id: "mobilenet-v3",
        name: "MobileNet v3 (Classification)",
        version: "1.0.0",
        sizeBytes: 9200000,
        type: "classification",
        framework: "tflite",
        quantization: "int8",
        inputShape: [1, 224, 224, 3],
        outputShape: [1, 1000],
        requiredRamMB: 64,
        estimatedLatencyMs: 80,
        accuracy: 0.91,
      },
      {
        id: "pose-estimation",
        name: "MediaPipe Pose (Pose Detection)",
        version: "1.0.0",
        sizeBytes: 6400000,
        type: "pose",
        framework: "tflite",
        quantization: "fp16",
        inputShape: [1, 192, 192, 3],
        outputShape: [1, 33, 3],
        requiredRamMB: 96,
        estimatedLatencyMs: 120,
        accuracy: 0.93,
      },
    ];

    models.forEach((model) => this.models.set(model.id, model));
    console.log(`[Edge Runtime] Loaded ${models.length} edge models`);
  }
}

// Singleton instance
let edgeRuntimeInstance: EdgeAIRuntime | null = null;

export function initEdgeRuntime(): EdgeAIRuntime {
  if (!edgeRuntimeInstance) {
    edgeRuntimeInstance = new EdgeAIRuntime();
  }
  return edgeRuntimeInstance;
}

export function getEdgeRuntime(): EdgeAIRuntime {
  if (!edgeRuntimeInstance) {
    edgeRuntimeInstance = new EdgeAIRuntime();
  }
  return edgeRuntimeInstance;
}
