import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import FileUploadArea from "./FileUploadArea";
import { Message, FileUpload } from "../types";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, files?: FileUpload[]) => void;
  onFileUpload: (files: FileUpload[]) => void;
  uploadedFiles: FileUpload[];
  onUpdateMessage: (id: string, newContent: string) => void;
  isStreaming: boolean; // Prop baru untuk status streaming
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onFileUpload,
  uploadedFiles,
  onUpdateMessage,
  isStreaming,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[messages.length - 1]?.content]);

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
      <div className="flex-1 overflow-y-auto py-6 space-y-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-cyan-500/50">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
            // Kirim status streaming hanya untuk pesan AI yang terakhir
            isStreaming={
              isStreaming &&
              message.sender === "ai" &&
              index === messages.length - 1
            }
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showFileUpload && (
        <FileUploadArea
          onFileUpload={onFileUpload}
          onClose={() => setShowFileUpload(false)}
          uploadedFiles={uploadedFiles}
        />
      )}

      <div className="border-t border-cyan-500/30 bg-gray-900/50 backdrop-blur-sm">
        <MessageInput
          onSendMessage={onSendMessage}
          onToggleFileUpload={() => setShowFileUpload(!showFileUpload)}
          uploadedFiles={uploadedFiles}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
