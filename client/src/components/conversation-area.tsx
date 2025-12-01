import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import type { Message } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationAreaProps {
  messages: Message[];
}

export function ConversationArea({ messages }: ConversationAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 w-full">
      <div ref={scrollRef} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Start a Conversation</h2>
            <p className="text-muted-foreground max-w-md">
              Tap the microphone button below to begin speaking with your AI assistant.
              Your voice will be transcribed and the AI will respond with natural speech.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function Mic({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}
