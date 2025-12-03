/**
 * Model Service - Handles different LLM providers
 * Supports: Ollama, HuggingFace, Mock mode
 */

import { HfInference } from "@huggingface/inference";
import { getMockResponse } from "./mock-responses";
import { getModelById } from "@shared/models";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const hf = new HfInference(process.env.HF_TOKEN);

/**
 * Generate response using selected model
 */
export async function generateResponseWithModel(
  userMessage: string,
  modelId: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    console.log(`[Model] Using model: ${modelId}`);

    // Mock mode - instant response
    if (modelId === "mock") {
      return getMockResponse(userMessage);
    }

    // Ollama - local LLM
    if (modelId.startsWith("ollama-")) {
      try {
        return await generateViaOllama(userMessage, modelId, systemPrompt, conversationHistory);
      } catch (error: any) {
        console.warn(`[Model] Ollama failed: ${error.message}, falling back to mock`);
        return getMockResponse(userMessage);
      }
    }

    // HuggingFace - free inference API
    if (modelId.startsWith("hf-")) {
      try {
        return await generateViaHuggingFace(userMessage, modelId, systemPrompt, conversationHistory);
      } catch (error: any) {
        console.warn(`[Model] HuggingFace failed: ${error.message}, falling back to mock`);
        return getMockResponse(userMessage);
      }
    }

    // Google Gemini
    if (modelId.startsWith("gemini-")) {
      try {
        return await generateViaGemini(userMessage, modelId, systemPrompt, conversationHistory);
      } catch (error: any) {
        console.warn(`[Model] Gemini failed: ${error.message}, falling back to mock`);
        return getMockResponse(userMessage);
      }
    }

    // Mistral.ai (direct) - if a dedicated Mistral API key is set (MISTRAL_API_KEY)
    if (modelId.startsWith("mistral-")) {
      if (!process.env.MISTRAL_API_KEY) {
        console.warn("[Model] Mistral model requested but MISTRAL_API_KEY is not set. Falling back to mock.");
        return getMockResponse(userMessage);
      }
      try {
        return await generateViaMistral(userMessage, modelId, systemPrompt, conversationHistory);
      } catch (error: any) {
        console.warn(`[Model] Mistral failed: ${error.message}, falling back to mock`);
        return getMockResponse(userMessage);
      }
    }

    // Fallback to mock
    console.warn(`[Model] Unknown model: ${modelId}, falling back to mock`);
    return getMockResponse(userMessage);
  } catch (error) {
    console.error("[Model] Error generating response:", error);
    // Ultimate fallback to mock
    return getMockResponse(userMessage);
  }
}

/**
 * Generate response via Ollama (local)
 * Requires Ollama to be running on http://localhost:11434
 */
async function generateViaOllama(
  userMessage: string,
  modelId: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const modelMap: Record<string, string> = {
    "ollama-llama2": "llama2",
    "ollama-mistral": "mistral",
    "ollama-neural-chat": "neural-chat",
    "ollama-dolphin-mixtral": "dolphin-mixtral",
  };

  const modelName = modelMap[modelId];
  if (!modelName) throw new Error(`Unknown Ollama model: ${modelId}`);

  try {
    // Build conversation context
    let fullPrompt = systemPrompt + "\n\n";
    
    // Add conversation history
    for (const msg of conversationHistory.slice(-4)) {
      fullPrompt += `${msg.role}: ${msg.content}\n`;
    }

    fullPrompt += `user: ${userMessage}\nassistant:`;

    // Call Ollama API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt: fullPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response?.trim() || "No response from Ollama";
  } catch (error: any) {
    console.error("[Ollama] Error:", error.message);
    throw new Error(`Ollama is not running. Install from https://ollama.ai and run 'ollama serve'`);
  }
}

/**
 * Generate response via HuggingFace Inference API
 * Requires HF_TOKEN environment variable
 */
async function generateViaHuggingFace(
  userMessage: string,
  modelId: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const modelMap: Record<string, string> = {
    "hf-mistral-7b": "mistralai/Mistral-7B-Instruct-v0.1",
    "hf-zephyr-7b": "HuggingFaceH4/zephyr-7b-beta",
  };

  const modelName = modelMap[modelId];
  if (!modelName) throw new Error(`Unknown HF model: ${modelId}`);

  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN not set. Get one from https://huggingface.co/settings/tokens");
  }

  try {
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
      model: modelName,
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || "No response";
  } catch (error: any) {
    console.error("[HuggingFace] Error:", error.message);
    throw new Error(`HuggingFace API error: ${error.message}`);
  }
}

/**
 * Generate response via Google Gemini API
 */
async function generateViaGemini(
  userMessage: string,
  modelId: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set");
    }

    // Get the actual model name from config
    const modelConfig = getModelById(modelId);
    if (!modelConfig) {
      throw new Error(`Model ${modelId} not found`);
    }

    const geminiModelName = modelConfig.modelName;

    // Build the prompt
    const prompt = [
      systemPrompt,
      ...conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`),
      `user: ${userMessage}`
    ].join("\n\n");

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return text.trim();
  } catch (error: any) {
    console.error("[Gemini] Error:", error.message);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Generate response via Mistral.ai (Direct API)
 * If MISTRAL_API_KEY is not set, the function throws, and the caller can fallback to other providers
 */
async function generateViaMistral(
  userMessage: string,
  modelId: string,
  systemPrompt: string,
  conversationHistory: ChatMessage[] = [],
): Promise<string> {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error("MISTRAL_API_KEY not set");

    const modelConfig = getModelById(modelId);
    if (!modelConfig) throw new Error(`Model ${modelId} not found`);

    // Use the modelName field from the config, fallback to the modelId
    const mistralModelName = modelConfig.modelName || modelId;

    const prompt = [
      systemPrompt,
      ...conversationHistory.slice(-4).map((m) => `${m.role}: ${m.content}`),
      `user: ${userMessage}`,
    ].join("\n\n");

    // NOTE: Mistral's API shape may require adjustments depending on API version
    const response = await fetch(`https://api.mistral.ai/v1/models/${mistralModelName}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const data = await response.json();

    // Extract text from response. This may need updating to match the API format.
    const text = data?.output?.[0]?.content?.[0]?.text || data?.output?.[0]?.text || data?.result || data?.text;
    if (!text) throw new Error("No response from Mistral");
    return String(text).trim();
  } catch (error: any) {
    console.error("[Mistral] Error:", error.message);
    throw new Error(`Mistral API error: ${error.message}`);
  }
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch("http://localhost:11434/api/tags", { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if Mistral provider is enabled (MISTRAL_API_KEY set)
 */
export async function isMistralAvailable(): Promise<boolean> {
  try {
    // simple check: presence of API key enables Mistral usage
    return !!process.env.MISTRAL_API_KEY;
  } catch {
    return false;
  }
}

/**
 * Get available Ollama models
 */
export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch {
    return [];
  }
}
