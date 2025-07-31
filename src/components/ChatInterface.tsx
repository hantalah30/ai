import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import FileUploadArea from './FileUploadArea';
import TypingIndicator from './TypingIndicator';
import { Message, FileUpload } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, files?: FileUpload[]) => void;
  onFileUpload: (files: FileUpload[]) => void;
  isTyping: boolean;
  uploadedFiles: FileUpload[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onFileUpload,
  isTyping,
  uploadedFiles
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-cyan-500/50">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Area */}
      {showFileUpload && (
        <FileUploadArea
          onFileUpload={onFileUpload}
          onClose={() => setShowFileUpload(false)}
          uploadedFiles={uploadedFiles}
        />
      )}

      {/* Message Input */}
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