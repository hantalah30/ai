import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Message, FileUpload } from "../types";
import { ArrowDownCircle } from "lucide-react";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, files?: FileUpload[]) => void;
  isStreaming: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isStreaming,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (behavior: "smooth" | "auto" = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[messages.length - 1]?.content]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      // Tampilkan tombol jika pengguna tidak berada di bagian paling bawah
      setShowScrollButton(scrollHeight - scrollTop > clientHeight + 100);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-cyan-500/50"
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
            isStreaming={
              isStreaming &&
              message.sender === "ai" &&
              index === messages.length - 1
            }
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-24 right-6 z-20 p-2 rounded-full bg-cyan-500/50 text-white backdrop-blur-md animate-bounce"
        >
          <ArrowDownCircle size={24} />
        </button>
      )}

      <div className="border-t border-cyan-500/30 bg-gray-900/50 backdrop-blur-sm">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default ChatInterface;
