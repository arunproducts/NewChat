import { HfInference } from "@huggingface/inference";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { searchKnowledgeBase, getConsultantSystemPrompt } from "./consultant-kb";
import { getMockResponse } from "./mock-responses";

const hf = new HfInference(process.env.HF_TOKEN);
const USE_MOCK_MODE = !process.env.HF_TOKEN; // Use mock responses if no token provided

// Free Hugging Face models
const CHAT_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const TTS_MODEL = "facebook/mms-tts-eng"; // Multilingual TTS
const WHISPER_MODEL = "openai/whisper-large-v3"; // For transcription

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Generate AI chat response using Llama-3.1-8B-Instruct
 * Integrates consultant knowledge base for context-aware responses
 * Falls back to mock responses if HF_TOKEN is not set
 */
export async function generateChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Use mock mode if no HF token is provided
    if (USE_MOCK_MODE) {
      console.log(`[MOCK MODE] Using sample response for: "${userMessage}"`);
      return getMockResponse(userMessage);
    }

    // Search knowledge base for relevant context
    const relevantKnowledge = searchKnowledgeBase(userMessage, 3);
    
    // Get consultant system prompt with injected context
    const systemPrompt = getConsultantSystemPrompt(relevantKnowledge);

    // Build messages array for chat completion
    const messages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...conversationHistory.slice(-4),
      {
        role: "user",
        content: userMessage,
      },
    ];

    const response = await hf.chatCompletion({
      model: CHAT_MODEL,
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const generatedText = response.choices[0]?.message?.content?.trim() || "";
    
    return generatedText || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    // Fallback to mock response if API fails
    if (!USE_MOCK_MODE) {
      console.log("API failed, falling back to mock response");
      return getMockResponse(userMessage);
    }
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Convert text to speech using Hugging Face TTS
 * Returns the path to the generated audio file
 * Note: TTS models have limited availability on HF free tier
 */
export async function textToSpeech(text: string): Promise<string | null> {
  try {
    const speechFile = path.join(process.cwd(), "uploads", `speech-${randomUUID()}.flac`);
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Try to use Hugging Face TTS
    // Note: TTS inference providers are very limited on free tier
    try {
      const audioBlob = await hf.textToSpeech({
        model: TTS_MODEL,
        inputs: text,
      });

      const buffer = Buffer.from(await audioBlob.arrayBuffer());
      fs.writeFileSync(speechFile, buffer);

      return speechFile;
    } catch (ttsError: any) {
      console.warn("TTS not available on free tier, returning text-only:", ttsError.message);
      // Return null to indicate no audio available (text-only response)
      return null;
    }
  } catch (error) {
    console.error("Error in textToSpeech:", error);
    // Return null instead of throwing - allows text-only responses
    return null;
  }
}

/**
 * Transcribe audio to text using Whisper
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
  try {
    const audioBuffer = fs.readFileSync(audioFilePath);
    const audioBlob = new Blob([audioBuffer]);

    const result = await hf.automaticSpeechRecognition({
      model: WHISPER_MODEL,
      data: audioBlob,
    });

    return result.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}

/**
 * Complete conversation flow: transcribe user audio, generate response, convert to speech
 */
export async function processVoiceConversation(
  audioFilePath: string,
  conversationHistory: ChatMessage[] = []
): Promise<{ text: string; responseText: string; audioPath: string | null }> {
  try {
    // Step 1: Transcribe user audio
    const userText = await transcribeAudio(audioFilePath);

    // Step 2: Generate AI response
    const responseText = await generateChatResponse(userText, conversationHistory);

    // Step 3: Convert response to speech (may be null if TTS unavailable)
    const audioPath = await textToSpeech(responseText);

    return {
      text: userText,
      responseText,
      audioPath,
    };
  } catch (error) {
    console.error("Error processing voice conversation:", error);
    throw error;
  }
}
