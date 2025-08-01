import React, { useState, useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { Message, MessagePart } from "../types";

interface TerminalModeProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearTerminal: () => void; // Prop baru untuk membersihkan riwayat
}

const TerminalMode: React.FC<TerminalModeProps> = ({
  messages,
  onSendMessage,
  onClearTerminal,
}) => {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sinkronkan pesan lokal dengan pesan dari App.tsx
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [localMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showHelp = () => {
    const helpMessage: Message = {
      id: `local-${Date.now()}`,
      sender: "ai",
      timestamp: new Date(),
      parts: [
        {
          type: "text",
          content: `Available commands:\n/help     - Show this help message\n/clear    - Clear the terminal screen\n/history  - Show command history`,
        },
      ],
    };
    setLocalMessages((prev) => [...prev, helpMessage]);
  };

  const showHistory = () => {
    const historyContent =
      commandHistory.length > 0
        ? commandHistory.join("\n")
        : "No commands in history.";
    const historyMessage: Message = {
      id: `local-${Date.now()}`,
      sender: "ai",
      timestamp: new Date(),
      parts: [{ type: "text", content: `Command History:\n${historyContent}` }],
    };
    setLocalMessages((prev) => [...prev, historyMessage]);
  };

  const handleLocalCommand = (command: string) => {
    const userMessage: Message = {
      id: `local-user-${Date.now()}`,
      parts: [{ type: "text", content: command }],
      sender: "user",
      timestamp: new Date(),
    };
    setLocalMessages((prev) => [...prev, userMessage]);

    switch (command.toLowerCase()) {
      case "/help":
        showHelp();
        break;
      case "/clear":
        onClearTerminal();
        break;
      case "/history":
        showHistory();
        break;
      default:
        onSendMessage(command); // Kirim ke AI jika bukan perintah lokal
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput) {
      setCommandHistory((prev) => [...prev, trimmedInput]);
      if (trimmedInput.startsWith("/")) {
        handleLocalCommand(trimmedInput);
      } else {
        onSendMessage(trimmedInput);
      }
      setInput("");
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navigasi riwayat perintah
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  // Render setiap bagian dari pesan
  const renderParts = (parts: MessagePart[]) => {
    return parts
      .map((part, index) => {
        if (part.type === "text")
          return <span key={index}>{part.content}</span>;
        if (part.type === "image")
          return (
            <span key={index} className="text-gray-400">
              [Sent Image: {part.fileName}]
            </span>
          );
        if (part.type === "file")
          return (
            <span key={index} className="text-gray-400">
              [Sent File: {part.fileName}]
            </span>
          );
        return null;
      })
      .reduce((prev, curr) => (
        <>
          {prev} {curr}
        </>
      ));
  };

  const lastMessage = localMessages[localMessages.length - 1];
  const isAiStreaming =
    lastMessage &&
    lastMessage.sender === "ai" &&
    isNaN(parseInt(lastMessage.id.split("-")[1]));

  return (
    <div className="flex-1 bg-black/90 backdrop-blur-sm border border-green-400/30 rounded-lg m-2 sm:m-4 font-mono text-sm flex flex-col">
      <div className="bg-gray-800/50 border-b border-green-400/30 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="text-green-400">HAWAI Terminal v1.5</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">ONLINE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {localMessages.map((message) => (
          <div key={message.id}>
            {message.sender === "user" ? (
              <div className="text-cyan-400 break-words">
                <span className="text-purple-400">user@hawai:~$</span>{" "}
                {renderParts(message.parts)}
              </div>
            ) : (
              <div className="text-green-400 break-words whitespace-pre-wrap">
                <span className="text-yellow-400">[AI-RESPONSE]</span>{" "}
                {renderParts(message.parts)}
                {isAiStreaming && message.id === lastMessage.id && (
                  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1"></span>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <div className="p-4 border-t border-green-400/30">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-purple-400">user@hawai:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-cyan-400 outline-none caret-green-400"
            autoComplete="off"
          />
          <div className="w-2 h-4 bg-green-400 animate-pulse"></div>
        </form>
      </div>
    </div>
  );
};

export default TerminalMode;
