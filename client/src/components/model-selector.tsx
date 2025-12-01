import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { availableModels, getSelectedModelId, saveSelectedModelId } from "@shared/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Zap } from "lucide-react";
import type { LLMModel } from "@shared/models";

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ selectedModelId, onModelChange }: ModelSelectorProps) {
  const { data: ollamaAvailable } = useQuery({
    queryKey: ["ollama-status"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/models/ollama/status");
        return response.json() as Promise<{ available: boolean }>;
      } catch {
        return { available: false };
      }
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const selectedModel = availableModels.find((m) => m.id === selectedModelId);

  return (
    <div className="flex items-center gap-2 w-full">
      <label className="text-xs font-medium whitespace-nowrap">Model:</label>
      <Select value={selectedModelId} onValueChange={onModelChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {/* Ollama Section */}
          <div className="px-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Ollama (Local)</p>
          </div>
          {availableModels
            .filter((m) => m.provider === "ollama")
            .map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
                {!ollamaAvailable?.available && " ⚠️"}
              </SelectItem>
            ))}

          {/* HuggingFace Section */}
          <div className="px-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              HuggingFace (Cloud)
            </p>
          </div>
          {availableModels
            .filter((m) => m.provider === "huggingface")
            .map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}

          {/* Google Gemini Section */}
          <div className="px-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Google Gemini</p>
          </div>
          {availableModels
            .filter((m) => m.provider === "gemini")
            .map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name} ✨
              </SelectItem>
            ))}

          {/* Mock Section */}
          <div className="px-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Test Mode</p>
          </div>
          {availableModels
            .filter((m) => m.provider === "local")
            .map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
