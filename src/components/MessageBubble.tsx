import React from "react";
import { User, Bot, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
  isStreaming: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLatest,
  isStreaming,
}) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-fade-in`}
    >
      <div
        className={`flex items-start space-x-3 max-w-full sm:max-w-3xl w-full ${
          isUser ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
            isUser
              ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50"
              : "bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border-cyan-400/50"
          }`}
        >
          {isUser ? (
            <User size={16} className="text-purple-400" />
          ) : (
            <Bot size={16} className="text-cyan-400" />
          )}
        </div>

        <div
          className={`flex flex-col flex-1 min-w-0 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`relative px-4 py-3 rounded-2xl backdrop-blur-sm border ${
              isUser
                ? "bg-gradient-to-br from-purple-600/30 to-pink-600/20 border-purple-400/50 text-white"
                : "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-cyan-400/30 text-gray-100"
            }`}
          >
            <div className="prose prose-sm prose-invert max-w-none font-mono leading-relaxed text-left space-y-2 break-words">
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <ReactMarkdown key={index}>{part.content}</ReactMarkdown>
                  );
                }
                if (part.type === "image") {
                  return (
                    <img
                      key={index}
                      src={part.content}
                      alt="user upload"
                      className="max-w-full h-auto rounded-lg"
                    />
                  );
                }
                if (part.type === "file") {
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-700/50 rounded-lg"
                    >
                      <FileText size={20} className="text-cyan-400" />
                      <span className="text-xs text-gray-300 truncate">
                        {part.fileName || "file"}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
              {isStreaming && isLatest && (
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1"></span>
              )}
            </div>
          </div>
          <div
            className={`mt-1 text-xs text-gray-500 font-mono ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
