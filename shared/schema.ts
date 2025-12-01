import { z } from "zod";

// Message schema for conversation
export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
  isAudioPlaying: z.boolean().optional(),
});

export type Message = z.infer<typeof messageSchema>;

// Conversation state
export const conversationStateSchema = z.enum([
  "idle",
  "listening",
  "processing",
  "speaking",
]);

export type ConversationState = z.infer<typeof conversationStateSchema>;

// API request/response schemas
export const chatRequestSchema = z.object({
  message: z.string(),
  conversationHistory: z.array(messageSchema).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  message: z.string(),
  audioUrl: z.string().optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

export const transcribeRequestSchema = z.object({
  audioData: z.string(), // base64 encoded audio
});

export type TranscribeRequest = z.infer<typeof transcribeRequestSchema>;

export const transcribeResponseSchema = z.object({
  text: z.string(),
});

export type TranscribeResponse = z.infer<typeof transcribeResponseSchema>;
