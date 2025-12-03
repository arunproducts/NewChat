import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConversationState } from "@shared/schema";

interface VoiceButtonProps {
  state: ConversationState;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
}

export function VoiceButton({
  state,
  onStartListening,
  onStopListening,
  disabled = false,
}: VoiceButtonProps) {
  const isListening = state === "listening";

  const getStateLabel = () => {
    switch (state) {
      case "listening":
        return "Listening...";
      case "processing":
        return "Processing...";
      case "speaking":
        return "Speaking...";
      default:
        return "Tap to speak";
    }
  };

  const getButtonVariant = (): "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined => {
    if (isListening) return "default";
    return "default";
  };

  const getButtonColor = () => {
    if (isListening) {
      return "bg-chart-2 hover:bg-chart-2 border-chart-2";
    }
    return "";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="icon"
        variant={getButtonVariant()}
        onClick={isListening ? onStopListening : onStartListening}
        disabled={disabled || state === "processing" || state === "speaking"}
        className={`h-16 w-16 rounded-full transition-all duration-300 ${getButtonColor()} ${
          isListening ? "animate-pulse scale-110" : ""
        } hover-elevate active-elevate-2`}
        data-testid="button-voice-input"
      >
        {isListening ? (
          <Square className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
        <span className="sr-only">{getStateLabel()}</span>
      </Button>
      
      <p
        className={`text-sm font-medium uppercase tracking-wide transition-colors duration-300 ${
          state === "listening"
            ? "text-chart-2"
            : state === "processing"
            ? "text-primary"
            : state === "speaking"
            ? "text-primary"
            : "text-muted-foreground"
        }`}
        data-testid="text-voice-state"
      >
        {getStateLabel()}
      </p>
    </div>
  );
}
