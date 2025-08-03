// src/components/MessageInput.tsx

import React, { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { Send, Image, Paperclip } from "lucide-react"; // Import Paperclip for file input
import { MessagePart } from "../types";

interface MessageInputProps {
  onSendMessage: (parts: MessagePart[]) => void;
  onGetPreviousCommand?: () => string; // Opsional untuk mode terminal
  onGetNextCommand?: () => string; // Opsional untuk mode terminal
  terminalMode?: boolean; // Opsional untuk menunjukkan mode terminal
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onGetPreviousCommand,
  onGetNextCommand,
  terminalMode = false,
}) => {
  const [inputContent, setInputContent] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Referensi untuk textarea

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleSend = () => {
    if (inputContent.trim() === "" && selectedFiles.length === 0) return;

    const parts: MessagePart[] = [];
    if (inputContent.trim() !== "") {
      parts.push({ type: "text", content: inputContent.trim() });
    }

    selectedFiles.forEach((file) => {
      const mimeType = file.type || "application/octet-stream";
      // Untuk demo, kita akan menggunakan URL objek. Untuk produksi, perlu upload ke server.
      parts.push({
        type: file.type.startsWith("image/") ? "image" : "file",
        content: URL.createObjectURL(file), // Buat URL objek sementara
        fileName: file.name,
        mimeType: mimeType,
      });
    });

    onSendMessage(parts);
    setInputContent("");
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input file
    }
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Mencegah baris baru
      handleSend();
    } else if (terminalMode) {
      // Logika riwayat perintah untuk mode terminal
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (onGetPreviousCommand) {
          const prevCommand = onGetPreviousCommand();
          if (prevCommand !== undefined) {
            setInputContent(prevCommand);
            // Sesuaikan tinggi textarea untuk konten riwayat
            if (inputRef.current) {
              inputRef.current.style.height = "auto";
              inputRef.current.style.height =
                inputRef.current.scrollHeight + "px";
            }
          }
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (onGetNextCommand) {
          const nextCommand = onGetNextCommand();
          if (nextCommand !== undefined) {
            setInputContent(nextCommand);
            // Sesuaikan tinggi textarea untuk konten riwayat
            if (inputRef.current) {
              inputRef.current.style.height = "auto";
              inputRef.current.style.height =
                inputRef.current.scrollHeight + "px";
            }
          }
        }
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input file
    }
  };

  return (
    <div className="p-4 flex items-end space-x-2">
      {/* File Input and Selected Files Display */}
      <div className="flex-col w-full">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-700 rounded-md">
            {selectedFiles.map((file, index) => (
              <span
                key={file.name + index}
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center"
              >
                {file.name}
                <button
                  onClick={() => removeFile(index)}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-2">
          {/* Tombol Upload File */}
          <label
            htmlFor="file-input"
            className="p-2 bg-gray-700 text-cyan-400 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
          >
            <Paperclip size={20} />
            <input
              id="file-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </label>
          {/* Textarea Input */}
          <textarea
            ref={inputRef}
            className={`flex-1 p-3 rounded-lg bg-gray-700 text-gray-200 resize-none overflow-hidden max-h-40 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              terminalMode ? "font-mono border border-green-500/50" : ""
            }`}
            placeholder={
              terminalMode ? "type command..." : "Type your message..."
            }
            rows={1}
            value={inputContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          {/* Tombol Kirim */}
          <button
            onClick={handleSend}
            className="p-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
