import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { chatRequestSchema, chatResponseSchema, transcribeRequestSchema, transcribeResponseSchema } from "@shared/schema";
import { generateChatResponse, textToSpeech, transcribeAudio } from "./huggingface";
import { consultantProfile } from "./consultant-kb";

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

  // Get consultant profile
  app.get("/api/consultant/profile", (req, res) => {
    res.json(consultantProfile);
  });

  // Chat endpoint - text input, get text + audio response
  app.post("/api/chat", async (req, res) => {
    try {
      const body = chatRequestSchema.parse(req.body);

      // Generate AI response
      const conversationHistory = (body.conversationHistory || []).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const responseText = await generateChatResponse(body.message, conversationHistory);

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

  const httpServer = createServer(app);

  return httpServer;
}
