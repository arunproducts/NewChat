import { useState, useRef, useCallback } from "react";

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>("");

  const startListening = useCallback(() => {
    setError(null);
    accumulatedTranscriptRef.current = "";
    
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      accumulatedTranscriptRef.current = "";
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      // Process all results from resultIndex to end
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // Accumulate final results
          accumulatedTranscriptRef.current += transcript + " ";
        } else {
          // Show interim results
          interimTranscript += transcript;
        }
      }

      // Update display: accumulated final + interim
      const displayText = accumulatedTranscriptRef.current + interimTranscript;
      setTranscript(displayText.trim());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Keep the accumulated transcript for submission
      setTranscript(accumulatedTranscriptRef.current.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    // Final transcript is already set in onend handler
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    accumulatedTranscriptRef.current = "";
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}
