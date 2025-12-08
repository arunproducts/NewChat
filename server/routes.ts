import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { chatRequestSchema, chatResponseSchema, transcribeRequestSchema, transcribeResponseSchema } from "@shared/schema";
import { generateChatResponse, textToSpeech, transcribeAudio } from "./huggingface";
import { consultantProfile, searchKnowledgeBase, getConsultantSystemPrompt } from "./consultant-kb";
import { listConnectors, getConnectorById, connectConnector, disconnectConnector, getConnectorTabs, getActiveTab, switchTab, closeTab, getTabSummary } from "./connectors";
import { availableModels, getModelById } from "@shared/models";
import { generateResponseWithModel, isOllamaAvailable, isMistralAvailable } from "./model-service";
import { getVisionSDK } from "./vision-sdk/index";
import { getIdentityPlatform } from "./identity-platform/index";
import { getEdgeRuntime } from "./edge-runtime/index";
import { getIndustrySolutions } from "./industry-solutions/index";
import { loginUser, registerUser, logoutUser, verifyToken, getUserById } from "./auth";

// Configure multer for audio file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["audio/webm", "audio/wav", "audio/mp3", "audio/mpeg", "audio/ogg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve audio files
  app.use("/audio", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadsDir));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ========== AUTHENTICATION ENDPOINTS ==========
  app.post("/api/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      const result = loginUser({ username, password });
      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password required" });
      }
      const result = registerUser({ username, email, password });
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    try {
      const { token } = req.body;
      if (token) {
        logoutUser(token);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/verify", (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }
      const session = verifyToken(token);
      if (!session) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      const user = getUserById(session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get consultant profile
  app.get("/api/consultant/profile", (req, res) => {
    res.json(consultantProfile);
  });

  // Get available models
  app.get("/api/models", (req, res) => {
    res.json(availableModels);
  });

  // Get model details
  app.get("/api/models/:id", (req, res) => {
    const model = getModelById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    res.json(model);
  });

  // Check Ollama availability
  app.get("/api/models/ollama/status", async (req, res) => {
    const available = await isOllamaAvailable();
    res.json({ available });
  });

  // Check Mistral availability (simple check for MISTRAL_API_KEY presence)
  app.get("/api/models/mistral/status", async (req, res) => {
    const available = await isMistralAvailable();
    res.json({ available });
  });

  // Chat endpoint - text input, get text + audio response
  app.post("/api/chat", async (req, res) => {
    try {
      const body = chatRequestSchema.parse(req.body);
      const selectedModelId = body.modelId || "mock"; // Get model from request, default to mock

      // Generate AI response using selected model
      const conversationHistory = (body.conversationHistory || []).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Search knowledge base for context
      const relevantKnowledge = searchKnowledgeBase(body.message, 3);
      
      // Get tab context from Chrome connector if available
      let tabContext: string | undefined;
      try {
        const chromeConnector = getConnectorById("chrome-tabseer");
        if (chromeConnector && chromeConnector.isConnected) {
          tabContext = getTabSummary("chrome-tabseer");
        }
      } catch (err) {
        // Silently ignore tab context errors
      }

      const systemPrompt = getConsultantSystemPrompt(relevantKnowledge, tabContext);

      let responseText: string;

      // Use model-based generation or fallback to legacy
      if (selectedModelId && selectedModelId !== "default") {
        responseText = await generateResponseWithModel(
          body.message,
          selectedModelId,
          systemPrompt,
          conversationHistory
        );
      } else {
        // Fallback to legacy generateChatResponse
        responseText = await generateChatResponse(body.message, conversationHistory);
      }


      // Try to convert to speech (may not be available on free tier)
      const audioPath = await textToSpeech(responseText);
      const audioUrl = audioPath ? `/audio/${path.basename(audioPath)}` : "";

      const response: z.infer<typeof chatResponseSchema> = {
        message: responseText,
        audioUrl,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process chat request" 
      });
    }
  });

  // Transcribe endpoint - audio input, get text output (fallback for browsers without Web Speech API)
  app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const text = await transcribeAudio(req.file.path);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      const response: z.infer<typeof transcribeResponseSchema> = {
        text,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Transcribe error:", error);
      
      // Clean up file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({ 
        error: error.message || "Failed to transcribe audio" 
      });
    }
  });

  // Clean up old audio files (older than 1 hour)
  setInterval(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    fs.readdir(uploadsDir, (err, files) => {
      if (err) return;

      files.forEach((file) => {
        const filePath = path.join(uploadsDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;
          if (now - stats.mtimeMs > oneHour) {
            fs.unlink(filePath, (err) => {
              if (err) console.error("Error deleting old file:", err);
            });
          }
        });
      });
    });
  }, 30 * 60 * 1000); // Run every 30 minutes

  // ========== VISION SDK ENDPOINTS ==========
  app.post("/api/vision/detect-faces", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const visionSDK = getVisionSDK();
      const imageBuffer = fs.readFileSync(req.file.path);

      const result = await visionSDK.detectFaces(imageBuffer, {
        includeLandmarks: req.body.includeLandmarks === "true",
        includeEmbeddings: req.body.includeEmbeddings === "true",
      });

      fs.unlinkSync(req.file.path);
      res.json(result);
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vision/detect-objects", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const visionSDK = getVisionSDK();
      const imageBuffer = fs.readFileSync(req.file.path);
      const result = await visionSDK.detectObjects(imageBuffer);

      fs.unlinkSync(req.file.path);
      res.json(result);
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vision/estimate-pose", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const visionSDK = getVisionSDK();
      const imageBuffer = fs.readFileSync(req.file.path);
      const result = await visionSDK.estimatePose(imageBuffer);

      fs.unlinkSync(req.file.path);
      res.json(result);
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vision/info", (req, res) => {
    const visionSDK = getVisionSDK();
    res.json(visionSDK.getInfo());
  });

  // ========== IDENTITY PLATFORM ENDPOINTS ==========
  app.post("/api/identity/enroll", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const userId = req.body.userId;
      if (!userId) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "userId is required" });
      }

      const identityPlatform = getIdentityPlatform();
      const imageBuffer = fs.readFileSync(req.file.path);
      const profile = await identityPlatform.enrollUser(userId, imageBuffer);

      fs.unlinkSync(req.file.path);
      res.json(profile);
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/identity/verify", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const userId = req.body.userId;
      if (!userId) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "userId is required" });
      }

      const identityPlatform = getIdentityPlatform();
      const imageBuffer = fs.readFileSync(req.file.path);
      const isMatch = await identityPlatform.verifyIdentity(userId, imageBuffer);

      fs.unlinkSync(req.file.path);
      res.json({ userId, verified: isMatch });
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/identity/check-liveness", upload.array("frames", 20), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "At least one frame required" });
      }

      const identityPlatform = getIdentityPlatform();
      const frames = (req.files as any[]).map((f) => fs.readFileSync(f.path));

      const result = await identityPlatform.checkLiveness(frames);

      (req.files as any[]).forEach((f) => fs.unlinkSync(f.path));
      res.json(result);
    } catch (error: any) {
      if (req.files) {
        (req.files as any[]).forEach((f) => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/identity/verify-kyc", upload.fields([
    { name: "document", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]), async (req, res) => {
    try {
      const files = req.files as any;
      if (!files.document || !files.selfie) {
        return res.status(400).json({ error: "Both document and selfie images required" });
      }

      const identityPlatform = getIdentityPlatform();
      const documentBuffer = fs.readFileSync(files.document[0].path);
      const selfieBuffer = fs.readFileSync(files.selfie[0].path);

      const result = await identityPlatform.verifyKYC(documentBuffer, selfieBuffer);

      fs.unlinkSync(files.document[0].path);
      fs.unlinkSync(files.selfie[0].path);
      res.json(result);
    } catch (error: any) {
      const files = req.files as any;
      if (files) {
        if (files.document) fs.unlinkSync(files.document[0].path);
        if (files.selfie) fs.unlinkSync(files.selfie[0].path);
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/identity/detect-deepfake", upload.array("frames", 30), async (req, res) => {
    try {
      const files = req.files as any;
      if (!files || files.length < 5) {
        return res.status(400).json({ error: "At least 5 frames required" });
      }

      const identityPlatform = getIdentityPlatform();
      const frames = files.map((f: any) => fs.readFileSync(f.path));

      const result = await identityPlatform.detectDeepfake(frames);

      files.forEach((f: any) => fs.unlinkSync(f.path));
      res.json(result);
    } catch (error: any) {
      const files = req.files as any;
      if (files) {
        files.forEach((f: any) => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ========== EDGE RUNTIME ENDPOINTS ==========
  app.get("/api/edge/devices", (req, res) => {
    const edgeRuntime = getEdgeRuntime();
    const devices = edgeRuntime.getAvailableDevices(req.query.type as string);
    res.json(devices);
  });

  app.get("/api/edge/device/:deviceId", (req, res) => {
    const edgeRuntime = getEdgeRuntime();
    const device = edgeRuntime.getDevice(req.params.deviceId);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device);
  });

  app.get("/api/edge/stats", (req, res) => {
    const edgeRuntime = getEdgeRuntime();
    res.json(edgeRuntime.getStats());
  });

  app.post("/api/edge/deploy", (req, res) => {
    try {
      const { deviceId, modelId } = req.body;
      if (!deviceId || !modelId) {
        return res.status(400).json({ error: "deviceId and modelId required" });
      }

      const edgeRuntime = getEdgeRuntime();
      edgeRuntime.deployModel(deviceId, modelId);
      res.json({ message: `Model ${modelId} deployed to ${deviceId}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/edge/infer", upload.single("input"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No input file provided" });
      }

      const { deviceId, modelId, priority } = req.body;
      if (!deviceId || !modelId) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "deviceId and modelId required" });
      }

      const edgeRuntime = getEdgeRuntime();
      const inputBuffer = fs.readFileSync(req.file.path);

      const result = await edgeRuntime.runInference({
        deviceId,
        modelId,
        input: inputBuffer,
        priority: priority || "normal",
        timeout: 5000,
      });

      fs.unlinkSync(req.file.path);
      res.json(result);
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  // ========== INDUSTRY SOLUTIONS ENDPOINTS ==========
  app.post("/api/solutions/access-control", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const { location } = req.body;
      if (!location) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "location is required" });
      }

      const solutions = getIndustrySolutions();
      const imageBuffer = fs.readFileSync(req.file.path);

      const event = await solutions.processAccessControl(
        imageBuffer,
        location,
        req.body.requireKYC === "true"
      );

      fs.unlinkSync(req.file.path);
      res.json(event);
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/solutions/retail-analytics", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const { storeId } = req.body;
      if (!storeId) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "storeId is required" });
      }

      const solutions = getIndustrySolutions();
      const imageBuffer = fs.readFileSync(req.file.path);

      const analytics = await solutions.analyzeRetailStore(imageBuffer, storeId);

      fs.unlinkSync(req.file.path);
      res.json(analytics);
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/solutions/logistics", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const { packageId, lat, lng } = req.body;
      if (!packageId || !lat || !lng) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "packageId, lat, lng required" });
      }

      const solutions = getIndustrySolutions();
      const imageBuffer = fs.readFileSync(req.file.path);

      const event = await solutions.processLogisticsPackage(imageBuffer, packageId, {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      });

      fs.unlinkSync(req.file.path);
      res.json(event);
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/solutions/security-analytics", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const { cameraId, location } = req.body;
      if (!cameraId || !location) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "cameraId and location required" });
      }

      const solutions = getIndustrySolutions();
      const imageBuffer = fs.readFileSync(req.file.path);

      const alert = await solutions.analyzeSecurityFeed(imageBuffer, cameraId, location);

      fs.unlinkSync(req.file.path);
      res.json(alert || { alert: null });
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/solutions/stats", (req, res) => {
    const solutions = getIndustrySolutions();
    const solutionType = req.query.type as string;
    const stats = solutions.getStats(solutionType as any);
    res.json(stats);
  });

  app.get("/api/solutions/events/:type", (req, res) => {
    const solutions = getIndustrySolutions();
    const limit = parseInt(req.query.limit as string) || 100;
    const events = solutions.getEventHistory(req.params.type as any, limit);
    res.json(events);
  });

  // Connectors endpoints (mock implementation)
  app.get("/api/connectors", (req, res) => {
    res.json(listConnectors());
  });

  app.post('/api/connectors/:id/connect', (req, res) => {
    const id = req.params.id;
    const result = connectConnector(id);
    if (!result) return res.status(404).json({ error: 'Connector not found' });
    res.json(result);
  });

  app.post('/api/connectors/:id/disconnect', (req, res) => {
    const id = req.params.id;
    const result = disconnectConnector(id);
    if (!result) return res.status(404).json({ error: 'Connector not found' });
    res.json(result);
  });

  app.get('/api/connectors/:id/tabs', (req, res) => {
    const id = req.params.id;
    const tabs = getConnectorTabs(id);
    if (!tabs) return res.status(404).json({ error: 'Connector not found' });
    if ((tabs as any).error === 'not_connected') return res.status(400).json({ error: 'Connector not connected' });
    res.json(tabs);
  });

  // Get active tab for a connector
  app.get('/api/connectors/:id/active-tab', (req, res) => {
    const id = req.params.id;
    const activeTab = getActiveTab(id);
    if (!activeTab) return res.status(404).json({ error: 'No active tab found' });
    res.json(activeTab);
  });

  // Get natural language summary of tabs
  app.get('/api/connectors/:id/tab-summary', (req, res) => {
    const id = req.params.id;
    const summary = getTabSummary(id);
    res.json({ summary });
  });

  // Switch to a specific tab
  app.post('/api/connectors/:id/switch-tab', (req, res) => {
    const id = req.params.id;
    const { tabIdentifier } = req.body;
    if (!tabIdentifier && tabIdentifier !== 0) {
      return res.status(400).json({ error: 'tabIdentifier (tab ID or index) is required' });
    }
    const result = switchTab(id, tabIdentifier);
    if (!result) return res.status(404).json({ error: 'Tab not found' });
    res.json({ message: `Switched to tab: ${result.title}`, tab: result });
  });

  // Close a specific tab
  app.post('/api/connectors/:id/close-tab', (req, res) => {
    const id = req.params.id;
    const { tabIdentifier } = req.body;
    if (!tabIdentifier && tabIdentifier !== 0) {
      return res.status(400).json({ error: 'tabIdentifier (tab ID or index) is required' });
    }
    const result = closeTab(id, tabIdentifier);
    if (!result) return res.status(404).json({ error: 'Tab not found' });
    res.json({ message: `Closed tab: ${result.closedTab.title}`, remaining: result.remainingTabs });
  });

  const httpServer = createServer(app);

  return httpServer;
}
