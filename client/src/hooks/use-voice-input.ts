import { useState, useRef, useCallback } from "react";

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  isWaitingForWakeWord: boolean;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(false);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>("");
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SILENCE_THRESHOLD = 2000; // Stop listening after 2 seconds of silence
  const WAKE_WORD = "xelo";

  const stopListening = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsWaitingForWakeWord(false);
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    accumulatedTranscriptRef.current = "";
    setIsWaitingForWakeWord(true);
    
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
      setIsWaitingForWakeWord(true);
      setTranscript("Listening for 'xelo'...");
      accumulatedTranscriptRef.current = "";
      
      // Reset silence timer
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let isWaiting = isWaitingForWakeWord;

      // Process all results from resultIndex to end
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultTranscript = event.results[i][0].transcript.toLowerCase();
        
        if (event.results[i].isFinal) {
          // Check for wake word if still waiting
          if (isWaiting && resultTranscript.includes(WAKE_WORD)) {
            console.log("Wake word detected:", WAKE_WORD);
            setIsWaitingForWakeWord(false);
            isWaiting = false;
            setTranscript("Listening...");
            accumulatedTranscriptRef.current = "";
            
            // Reset silence timer on wake word
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
            }
            silenceTimeoutRef.current = setTimeout(() => {
              console.log("Silence detected, stopping listening");
              stopListening();
            }, SILENCE_THRESHOLD);
          } else if (!isWaiting) {
            // Accumulate final results after wake word
            accumulatedTranscriptRef.current += resultTranscript + " ";
            
            // Reset silence timer on new speech
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
            }
            silenceTimeoutRef.current = setTimeout(() => {
              console.log("Silence detected, stopping listening");
              stopListening();
            }, SILENCE_THRESHOLD);
          }
        } else if (!isWaiting) {
          // Show interim results only after wake word detected
          interimTranscript += resultTranscript;
        }
      }

      // Update display
      if (isWaiting) {
        setTranscript("Listening for 'xelo'...");
      } else {
        const displayText = accumulatedTranscriptRef.current + interimTranscript;
        setTranscript(displayText.trim() || "Listening...");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      setIsWaitingForWakeWord(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsWaitingForWakeWord(false);
      // Keep the accumulated transcript for submission
      setTranscript(accumulatedTranscriptRef.current.trim());
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    accumulatedTranscriptRef.current = "";
    setIsWaitingForWakeWord(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isWaitingForWakeWord,
  };
}
