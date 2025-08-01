// src/components/MessageInput.tsx

import React, { useState, useRef } from "react";
import { Send, Mic, Paperclip, X, FileText, Image } from "lucide-react";
import { MessagePart } from "../types";

interface MessageInputProps {
  onSendMessage: (parts: MessagePart[]) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    const parts: MessagePart[] = [];
    if (text.trim()) {
      parts.push({ type: "text", content: text.trim() });
    }

    // Konversi file menjadi MessagePart
    files.forEach((file) => {
      parts.push({
        type: file.type.startsWith("image/") ? "image" : "file",
        content: URL.createObjectURL(file), // URL lokal untuk pratinjau
        mimeType: file.type,
        fileName: file.name,
      });
    });

    onSendMessage(parts);
    setText("");
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-2 sm:p-4">
      {/* Pratinjau File */}
      {files.length > 0 && (
        <div className="mb-2 p-2 bg-gray-800/50 rounded-lg flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group bg-gray-700 p-1.5 rounded-lg"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              ) : (
                <div className="w-16 h-16 flex flex-col items-center justify-center text-center">
                  <FileText size={24} className="text-cyan-400" />
                  <span className="text-xs text-gray-300 mt-1 truncate w-full px-1">
                    {file.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl flex items-end p-2 space-x-2">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp, application/pdf, text/plain"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-cyan-400"
          >
            <Paperclip size={20} />
          </button>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSubmit(e)
            }
            placeholder="Ketik atau lampirkan file..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none font-mono text-sm max-h-32 p-2"
            rows={1}
          />

          <button
            type="submit"
            disabled={!text.trim() && files.length === 0}
            className="p-2 rounded-lg disabled:opacity-50 text-cyan-400 bg-cyan-400/20"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
