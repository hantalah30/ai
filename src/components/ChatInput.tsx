// src/components/ChatInput.tsx

import React, { useState, useRef, KeyboardEvent } from "react";
// --- PERUBAHAN DI SINI ---
import { Send, Loader2 } from "lucide-react";
import { MessagePart } from "../types";

interface ChatInputProps {
  onSendMessage: (parts: MessagePart[]) => void;
  isStreaming: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSend = () => {
    if (text.trim() && !isStreaming) {
      onSendMessage([{ type: "text", content: text }]);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 md:gap-4">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message or ask HAWAI anything..."
        className="flex-1 bg-gray-800/80 border border-purple-400/30 rounded-lg p-3 resize-none max-h-48 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
        rows={1}
        disabled={isStreaming}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isStreaming}
        className="w-12 h-12 flex-shrink-0 bg-cyan-500 text-white rounded-full flex items-center justify-center transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {/* --- DAN PERUBAHAN DI SINI --- */}
        {isStreaming ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <Send size={24} />
        )}
      </button>
    </div>
  );
};

export default ChatInput;
