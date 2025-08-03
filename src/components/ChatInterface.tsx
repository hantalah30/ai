// src/components/ChatInterface.tsx

import React, { useRef, useEffect, useState } from "react";
import { Message } from "../types";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { ArrowDownCircle } from "lucide-react";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (
    parts: {
      type: "text" | "image" | "file";
      content: string;
      fileName?: string;
      mimeType?: string;
    }[]
  ) => void;
  isStreaming: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isStreaming,
}) => {
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Cek apakah pesan saat ini hanya berisi pesan selamat datang bawaan
  const isWelcomeMessageOnly =
    messages.length === 1 && messages[0].id === "welcome";

  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    chatBottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // Scroll ke bawah saat pesan baru muncul atau saat tombol scroll tidak ditampilkan
    if (!showScrollButton) {
      scrollToBottom("auto");
    }
  }, [messages, showScrollButton]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop > clientHeight + 150);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" /* TAMBAHKAN custom-scrollbar DI SINI */
      >
        {/* Tampilkan pesan selamat datang hanya jika ini adalah sesi chat baru dengan pesan welcome saja */}
        {isWelcomeMessageOnly && (
          <div className="flex flex-col items-center text-center my-8 animate-fade-in">
            <div className="relative mb-4">
              <img
                src="/pwa-512x512.png"
                alt="HAWAI Welcome Character"
                className="w-32 h-32 rounded-full shadow-lg shadow-purple-500/20"
              />
              <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                HAWAI
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white font-mono">
              Helloww, welcome to HAWAI!
            </h1>
            <p className="text-gray-400 max-w-md mt-2">
              Start by typing a message, or explore existing chats from the
              history menu.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
            isStreaming={isStreaming}
          />
        ))}
        <div ref={chatBottomRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-4 sm:right-6 z-20 p-2 rounded-full bg-cyan-500/50 text-white backdrop-blur-md hover:bg-cyan-500/80 transition-colors"
        >
          <ArrowDownCircle size={28} />
        </button>
      )}

      <div className="border-t border-cyan-500/30 bg-gray-900/50 backdrop-blur-sm">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default ChatInterface;
