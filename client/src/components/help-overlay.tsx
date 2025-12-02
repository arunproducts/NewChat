import { useState } from "react";
import { Button } from "@/components/ui/button";

interface HelpOverlayProps {
  isListening: boolean;
  isWaitingForWakeWord: boolean;
  transcript: string;
  onStart: () => void;
  onStop: () => void;
  useFallbackRecording: boolean;
}

export function HelpOverlay({
  isListening,
  isWaitingForWakeWord,
  transcript,
  onStart,
  onStop,
  useFallbackRecording,
}: HelpOverlayProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-sm bg-background/90 backdrop-blur border border-border/40 p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Start a Conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">Tap the mic and say "xelo" to begin. The assistant will auto-stop after 2s of silence.</p>

          <ul className="text-xs text-muted-foreground mt-2 space-y-1">
            <li>🎤 Click the mic button to start</li>
            <li>📢 Say the wake-word: <strong>"xelo"</strong></li>
            <li>🤐 Stops automatically after 2s of silence</li>
            <li>🗣️ You’ll hear a response via browser TTS (or server audio)</li>
          </ul>

          <div className="mt-3 flex items-center gap-2">
            {!isListening ? (
              <Button onClick={onStart} size="sm">Start Conversation</Button>
            ) : (
              <Button onClick={onStop} size="sm" variant="destructive">Stop</Button>
            )}

            <Button onClick={() => setVisible(false)} variant="ghost" size="sm">Close</Button>
          </div>

          <div className="mt-3 text-xs">
            <div><strong>Wake:</strong> {isWaitingForWakeWord ? "Waiting for 'xelo'" : "Ready"}</div>
            <div><strong>Transcript:</strong> {transcript || "—"}</div>
            <div><strong>Fallback:</strong> {useFallbackRecording ? "Recording fallback enabled" : "Web Speech API"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
