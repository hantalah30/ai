import React, { useState, useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { Message } from "../types";

interface TerminalModeProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping: boolean;
}

const TerminalMode: React.FC<TerminalModeProps> = ({
  messages,
  onSendMessage,
  isTyping,
}) => {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setCommandHistory((prev) => [...prev, input]);
      onSendMessage(input.trim());
      setInput("");
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  return (
    <div className="flex-1 bg-black/90 backdrop-blur-sm border border-green-400/30 rounded-lg m-4 font-mono text-sm flex flex-col">
      <div className="bg-gray-800/50 border-b border-green-400/30 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="text-green-400">CyberAI Terminal v2.077</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">ONLINE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-green-400 mb-4">
          <div className="animate-typewriter">
            {">"} CyberAI Neural Network initialized...
          </div>
          <div className="animate-typewriter" style={{ animationDelay: "1s" }}>
            {">"} Quantum processors online...
          </div>
          <div className="animate-typewriter" style={{ animationDelay: "2s" }}>
            {">"} Ready for neural interface...
          </div>
        </div>

        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            {message.sender === "user" ? (
              <div className="text-cyan-400">
                <span className="text-purple-400">user@cyberai:~$</span>{" "}
                {message.content}
              </div>
            ) : (
              <div className="text-green-400 ml-4">
                <span className="text-yellow-400">[AI-RESPONSE]</span>{" "}
                {message.content}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="text-green-400 ml-4 flex items-center space-x-1">
            <span className="text-yellow-400">[AI-PROCESSING]</span>
            {/* ... (typing indicator dots) */}
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      <div className="p-4 border-t border-green-400/30">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-purple-400">user@cyberai:~$</span>
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

      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-b from-green-400/5 via-transparent to-green-400/5 animate-scan-lines"></div>
      </div>
    </div>
  );
};

export default TerminalMode;
