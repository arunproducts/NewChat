/**
 * Text-to-Speech (TTS) Service
 * Uses multiple fallback strategies for generating speech audio
 * 1. Try Hugging Face MMS TTS (free tier)
 * 2. Fallback to browser-based Web Speech API instructions
 * 3. Return text-only response with client-side TTS hint
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

/**
 * Generate audio using a free TTS service
 * Returns audio URL or null if TTS is unavailable
 * 
 * When null is returned, the frontend should use browser Web Speech API instead
 */
export async function textToSpeech(text: string): Promise<string | null> {
  // If no HF token, return null (frontend will use Web Speech API)
  if (!process.env.HF_TOKEN) {
    console.log("[TTS] No HF_TOKEN - returning null (frontend will use Web Speech API)");
    return null;
  }

  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Try Hugging Face TTS
    try {
      console.log("[TTS] Attempting Hugging Face TTS...");
      const audioBlob = await hf.textToSpeech({
        model: "facebook/mms-tts-eng",
        inputs: text,
      });

      const speechFile = path.join(uploadsDir, `speech-${randomUUID()}.flac`);
      const buffer = Buffer.from(await audioBlob.arrayBuffer());
      fs.writeFileSync(speechFile, buffer);

      console.log("[TTS] Success - audio file created");
      return `/audio/${path.basename(speechFile)}`;
    } catch (hfError: any) {
      console.warn("[TTS] HF TTS failed:", hfError.message);
      // HF failed, return null to trigger client-side TTS
      return null;
    }
  } catch (error) {
    console.error("[TTS] Error in textToSpeech:", error);
    return null;
  }
}

/**
 * Get TTS instruction for client-side synthesis
 * When server-side TTS is unavailable, send instruction to client to use Web Speech API
 */
export function getTTSHint(): string {
  return "USE_BROWSER_TTS"; // Special marker for frontend to use Web Speech API
}
