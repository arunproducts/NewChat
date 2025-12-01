import { User, Bot } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-4 animate-in fade-in duration-500 ${
        isUser ? "flex-row" : "flex-row-reverse"
      }`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-primary/10 text-primary"
            : "bg-chart-1/10 text-chart-1"
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>

      <div
        className={`flex-1 max-w-[80%] ${
          isUser ? "text-left" : "text-right"
        }`}
      >
        <div
          className={`inline-block p-4 rounded-2xl ${
            isUser
              ? "bg-primary/5 border-l-2 border-primary rounded-tl-sm"
              : "bg-card border-l-2 border-chart-1 rounded-tr-sm"
          }`}
        >
          <p className="text-base leading-relaxed text-foreground">
            {message.content}
          </p>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-2 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
