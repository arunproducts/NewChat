import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// This is using OpenAI's API, which points to OpenAI's API servers and requires your own API key.
// Blueprint reference: javascript_openai
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const CHAT_MODEL = "gpt-5";
const TTS_MODEL = "tts-1";
const TTS_VOICE = "alloy"; // Natural, friendly voice
const WHISPER_MODEL = "whisper-1";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Generate AI chat response using GPT-5
 */
export async function generateChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are a helpful, friendly AI assistant engaged in a natural voice conversation. Keep your responses conversational, concise (2-3 sentences), and engaging. Speak naturally as if you're having a real conversation.",
      },
      ...conversationHistory.slice(-4), // Keep last 4 messages for context
      {
        role: "user",
        content: userMessage,
      },
    ];

    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: messages as any,
      max_completion_tokens: 200, // Keep responses concise for voice
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Convert text to speech using OpenAI TTS
 * Returns the path to the generated audio file
 */
export async function textToSpeech(text: string): Promise<string> {
  try {
    const speechFile = path.join(process.cwd(), "uploads", `speech-${randomUUID()}.mp3`);
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const mp3 = await openai.audio.speech.create({
      model: TTS_MODEL,
      voice: TTS_VOICE,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(speechFile, buffer);

    return speechFile;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech");
  }
}

/**
 * Transcribe audio to text using Whisper
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
  try {
    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: WHISPER_MODEL,
    });

    return transcription.text;
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
): Promise<{ text: string; responseText: string; audioPath: string }> {
  try {
    // Step 1: Transcribe user audio
    const userText = await transcribeAudio(audioFilePath);

    // Step 2: Generate AI response
    const responseText = await generateChatResponse(userText, conversationHistory);

    // Step 3: Convert response to speech
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
