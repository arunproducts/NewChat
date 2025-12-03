/**
 * Free/Open-Source LLM Models Configuration
 * Supports multiple model providers and local hosting options
 */

export interface LLMModel {
  id: string;
  name: string;
  // add 'mistral' as a provider option
  provider: "ollama" | "huggingface" | "lmstudio" | "gemini" | "local" | "mistral";
  description: string;
  modelName: string;
  endpoint?: string; // Optional custom endpoint
  requiresSetup: boolean;
  setupInstructions?: string;
  capabilities: {
    reasoning: number; // 1-5
    speed: number; // 1-5
    quality: number; // 1-5
  };
}

export const availableModels: LLMModel[] = [
  // Ollama Models (Easiest - install from https://ollama.ai)
  {
    id: "ollama-llama2",
    name: "LLaMA 2 (7B) - Ollama",
    provider: "ollama",
    description: "Fast, good reasoning. Run locally with Ollama.",
    modelName: "llama2",
    endpoint: "http://localhost:11434/api/generate",
    requiresSetup: true,
    setupInstructions: `
      1. Install Ollama from https://ollama.ai
      2. Run: ollama pull llama2
      3. Run: ollama serve
      4. Select this model and chat!
    `,
    capabilities: {
      reasoning: 4,
      speed: 4,
      quality: 4,
    },
  },
  {
    id: "ollama-mistral",
    name: "Mistral 7B - Ollama",
    provider: "ollama",
    description: "Lightweight, excellent performance. Great for local use.",
    modelName: "mistral",
    endpoint: "http://localhost:11434/api/generate",
    requiresSetup: true,
    setupInstructions: `
      1. Install Ollama from https://ollama.ai
      2. Run: ollama pull mistral
      3. Run: ollama serve
      4. Select this model and chat!
    `,
    capabilities: {
      reasoning: 4,
      speed: 5,
      quality: 4,
    },
  },
  {
    id: "ollama-neural-chat",
    name: "Neural Chat 7B - Ollama",
    provider: "ollama",
    description: "Intel's conversational model. Very fast.",
    modelName: "neural-chat",
    endpoint: "http://localhost:11434/api/generate",
    requiresSetup: true,
    setupInstructions: `
      1. Install Ollama from https://ollama.ai
      2. Run: ollama pull neural-chat
      3. Run: ollama serve
      4. Select this model and chat!
    `,
    capabilities: {
      reasoning: 3,
      speed: 5,
      quality: 3,
    },
  },
  {
    id: "ollama-dolphin-mixtral",
    name: "Dolphin 2.6 Mixtral 8x7B - Ollama",
    provider: "ollama",
    description: "Powerful 8x7B MoE model. Best reasoning locally.",
    modelName: "dolphin-mixtral",
    endpoint: "http://localhost:11434/api/generate",
    requiresSetup: true,
    setupInstructions: `
      1. Install Ollama from https://ollama.ai
      2. Run: ollama pull dolphin-mixtral
      3. Run: ollama serve
      4. Select this model and chat!
      (Note: Requires 48GB+ RAM or GPU)
    `,
    capabilities: {
      reasoning: 5,
      speed: 2,
      quality: 5,
    },
  },

  // Hugging Face Free Inference
  {
    id: "hf-mistral-7b",
    name: "Mistral 7B - HuggingFace",
    provider: "huggingface",
    description: "Free tier available on HuggingFace Inference API.",
    modelName: "mistralai/Mistral-7B-Instruct-v0.1",
    requiresSetup: true,
    setupInstructions: `
      1. Get free HF token: https://huggingface.co/settings/tokens
      2. Set HF_TOKEN environment variable
      3. Select this model
    `,
    capabilities: {
      reasoning: 4,
      speed: 3,
      quality: 4,
    },
  },
  {
    id: "hf-zephyr-7b",
    name: "Zephyr 7B - HuggingFace",
    provider: "huggingface",
    description: "Optimized for instruction following.",
    modelName: "HuggingFaceH4/zephyr-7b-beta",
    requiresSetup: true,
    setupInstructions: `
      1. Get free HF token: https://huggingface.co/settings/tokens
      2. Set HF_TOKEN environment variable
      3. Select this model
    `,
    capabilities: {
      reasoning: 4,
      speed: 3,
      quality: 4,
    },
  },

  // Google Gemini API
  {
    id: "gemini-pro",
    name: "Google Gemini 2.0 Flash",
    provider: "gemini",
    description: "Fast and powerful multimodal AI from Google.",
    modelName: "gemini-2.0-flash",
    requiresSetup: false,
    capabilities: {
      reasoning: 5,
      speed: 5,
      quality: 4,
    },
  },
  // Mistral.ai (Direct API) - optional
  {
    id: "mistral-instruct-1",
    name: "Mistral Instruct - Mistral.ai",
    provider: "mistral",
    description: "Powerful instruction-following model from Mistral.ai (use MISTRAL_API_KEY)",
    modelName: "mistral-instruct",
    requiresSetup: false,
    capabilities: {
      reasoning: 4,
      speed: 4,
      quality: 4,
    },
  },

  // Mock Mode (No Setup - Works Immediately!)
  {
    id: "mock",
    name: "Mock Responses - Test Mode",
    provider: "local",
    description: "Sample responses. Perfect for UI testing without AI setup.",
    modelName: "mock",
    requiresSetup: false,
    capabilities: {
      reasoning: 1,
      speed: 5,
      quality: 1,
    },
  },
];

/**
 * Get model by ID
 */
export function getModelById(id: string): LLMModel | undefined {
  return availableModels.find((m) => m.id === id);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: string): LLMModel[] {
  return availableModels.filter((m) => m.provider === provider);
}

/**
 * Get currently selected model (from localStorage or default)
 */
export function getSelectedModelId(): string {
  if (typeof window === "undefined") return "mock";
  return localStorage.getItem("selectedModelId") || "mock";
}

/**
 * Save selected model to localStorage
 */
export function saveSelectedModelId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("selectedModelId", id);
  }
}
