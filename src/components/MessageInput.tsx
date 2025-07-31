import React, { useState, useRef } from 'react';
import { Send, Paperclip, Code, Mic } from 'lucide-react';
import { FileUpload } from '../types';

interface MessageInputProps {
  onSendMessage: (content: string, files?: FileUpload[]) => void;
  onToggleFileUpload: () => void;
  uploadedFiles: FileUpload[];
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onToggleFileUpload,
  uploadedFiles
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="p-4 space-y-3">
      {/* File Preview */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 border border-cyan-400/30 rounded-full text-xs">
              <span className="text-cyan-400">{file.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl transition-all duration-300 focus-within:border-cyan-400/50 focus-within:shadow-cyan-400/20 focus-within:shadow-lg">
          
          {/* Neon Border Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-purple-400/0 opacity-0 transition-opacity duration-300 pointer-events-none group-focus-within:opacity-100"></div>

          <div className="flex items-end space-x-3 p-3">
            {/* Action Buttons - Left */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onToggleFileUpload}
                className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all duration-200"
                title="Attach files"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-all duration-200"
                title="Insert code"
              >
                <Code className="h-5 w-5" />
              </button>
            </div>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none font-mono text-sm max-h-32 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600"
              rows={1}
            />

            {/* Action Buttons - Right */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isRecording
                    ? 'text-red-400 bg-red-400/20 animate-pulse'
                    : 'text-gray-400 hover:text-purple-400 hover:bg-purple-400/10'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                <Mic className="h-5 w-5" />
              </button>

              <button
                type="submit"
                disabled={!message.trim()}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  message.trim()
                    ? 'text-cyan-400 bg-cyan-400/20 hover:bg-cyan-400/30 shadow-cyan-400/50 shadow-lg'
                    : 'text-gray-500 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;