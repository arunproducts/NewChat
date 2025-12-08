import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DottedAvatar } from "@/components/dotted-avatar";
import { VoiceButton } from "@/components/voice-button";
import { ConversationArea } from "@/components/conversation-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { ModelSelector } from "@/components/model-selector";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { HelpOverlay } from "@/components/help-overlay";
import { ConnectorsSidebar } from "@/components/connectors-sidebar";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { getSelectedModelId, saveSelectedModelId } from "@shared/models";
import { LogOut } from "lucide-react";
import type { Message, ConversationState, ChatResponse, TranscribeResponse } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const [useFallbackRecording, setUseFallbackRecording] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>("mock");
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/login");
  };

  // Mistral availability for warnings / auto-revert if saved selection is a Mistral model but key is missing
  const { data: mistralAvailable } = useQuery({
    queryKey: ["mistral-status"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/models/mistral/status");
        return response.json() as Promise<{ available: boolean }>;
      } catch {
        return { available: false };
      }
    },
    staleTime: 1000 * 30,
  });

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError,
    isWaitingForWakeWord,
  } = useVoiceInput();

  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recordError,
  } = useAudioRecorder();

  const { isPlaying, audioAmplitude, playAudio, stopAudio } = useAudioPlayback();

  // Browser TTS (Web Speech API - SpeechSynthesis)
  const playBrowserTTS = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      // Check if browser supports speech synthesis
      const synth = window.speechSynthesis;
      if (!synth) {
        console.warn("Browser does not support Web Speech API");
        resolve();
        return;
      }

      // Cancel any ongoing speech
      synth.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      utterance.onstart = () => {
        console.log("Speech started");
        setConversationState("speaking");
      };

      utterance.onend = () => {
        console.log("Speech ended");
        setConversationState("idle");
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("TTS error:", event.error);
        setConversationState("idle");
        resolve();
      };

      utterance.onpause = () => {
        console.log("Speech paused");
      };

      utterance.onresume = () => {
        console.log("Speech resumed");
      };

      // Actually speak the text
      console.log("Speaking:", text.substring(0, 50) + "...");
      synth.speak(utterance);
    });
  };

  // Check if Web Speech API is available, otherwise use fallback
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUseFallbackRecording(true);
    }
    
    // Load selected model from localStorage
    const saved = getSelectedModelId();
    setSelectedModelId(saved);
  }, []);

  // If the selected model is Mistral but Mistral becomes unavailable, revert to mock and notify the user
  useEffect(() => {
    if (selectedModelId && selectedModelId.startsWith("mistral-") && mistralAvailable?.available === false) {
      setSelectedModelId("mock");
      saveSelectedModelId("mock");
      toast({
        title: "Mistral disabled",
        description: "Mistral API key is not set. Set MISTRAL_API_KEY in your .env to enable Mistral models",
        variant: "destructive",
      });
    }
  }, [mistralAvailable, selectedModelId, saveSelectedModelId, toast]);

  // Transcribe mutation for fallback recording
  const transcribeMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to transcribe audio" }));
        throw new Error(errorData.error || "Failed to transcribe audio");
      }

      return response.json() as Promise<TranscribeResponse>;
    },
    onSuccess: (data) => {
      if (data.text.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: data.text.trim(),
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setConversationState("processing");
        chatMutation.mutate(data.text.trim());
      } else {
        setConversationState("idle");
      }
    },
    onError: (error: any) => {
      console.error("Transcribe error:", error);
      toast({
        title: "Transcription Error",
        description: error.message || "Failed to transcribe audio",
        variant: "destructive",
      });
      setConversationState("idle");
    },
    onSettled: () => {
      // Ensure state is reset even if mutation is still pending
      if (conversationState === "processing" && !chatMutation.isPending) {
        setConversationState("idle");
      }
    },
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest(
        "POST",
        "/api/chat",
        {
          message,
          conversationHistory: messages.slice(-5),
          modelId: selectedModelId,
        }
      );
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: async (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Always use browser TTS (Web Speech API) for reliable cross-platform audio
      try {
        setConversationState("speaking");
        await playBrowserTTS(data.message);
      } catch (error) {
        console.error("TTS error:", error);
      } finally {
        setConversationState("idle");
      }
    },
    onError: (error: any) => {
      console.error("Chat error:", error);
      toast({
        title: "AI Response Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setConversationState("idle");
    },
    onSettled: () => {
      // Ensure we always return to idle after chat completes
      if (!isPlaying) {
        setConversationState("idle");
      }
    },
  });

  // Handle voice input
  useEffect(() => {
    if (isListening || isRecording) {
      setConversationState("listening");
    }
  }, [isListening, isRecording]);

  useEffect(() => {
    if (voiceError) {
      toast({
        title: "Voice Input Error",
        description: voiceError,
        variant: "destructive",
      });
    }
  }, [voiceError, toast]);

  useEffect(() => {
    if (recordError) {
      toast({
        title: "Recording Error",
        description: recordError,
        variant: "destructive",
      });
    }
  }, [recordError, toast]);

  const handleStartListening = async () => {
    if (useFallbackRecording) {
      await startRecording();
    } else {
      startListening();
    }
  };

  const handleStopListening = async () => {
    if (useFallbackRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        setConversationState("processing");
        transcribeMutation.mutate(audioBlob);
      } else {
        setConversationState("idle");
      }
    } else {
      stopListening();

      if (transcript.trim()) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: transcript.trim(),
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setConversationState("processing");
        
        chatMutation.mutate(transcript.trim());
        resetTranscript();
      } else {
        setConversationState("idle");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex flex-col gap-3 px-6 md:px-8 py-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
            xelochat
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <p className="font-medium">Welcome, {user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector
            selectedModelId={selectedModelId}
            onModelChange={(modelId) => {
              setSelectedModelId(modelId);
              saveSelectedModelId(modelId);
            }}
          />
        </div>
      </header>

      {/* Main Content */}
  <div className="flex-1 flex overflow-hidden">
        {/* Left column: Avatar + Conversation area (main) */}
        <div className="flex-1 flex flex-col">
          <div className="flex-shrink-0 border-b border-border/40">
          <DottedAvatar
            state={conversationState}
            audioAmplitude={audioAmplitude}
          />
        </div>

          {/* Conversation Area */}
          <ConversationArea messages={messages} />

          {/* Voice Controls */}
          <div className="flex-shrink-0 p-6 md:p-8 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-3xl mx-auto flex justify-center">
            <VoiceButton
              state={conversationState}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              disabled={chatMutation.isPending || transcribeMutation.isPending}
            />
          </div>

          </div>
        </div>

        {/* Right column: Connectors */}
        <ConnectorsSidebar />
      <HelpOverlay
          isListening={isListening}
          isWaitingForWakeWord={isWaitingForWakeWord}
          transcript={transcript}
          onStart={handleStartListening}
          onStop={handleStopListening}
          useFallbackRecording={useFallbackRecording}
        />
      </div>
    </div>
  );
}
