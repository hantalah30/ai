import React from "react";
import { Bot } from "lucide-react";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-3 max-w-3xl">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/50 flex items-center justify-center">
          <Bot className="h-4 w-4 text-cyan-400" />
        </div>

        {/* Typing Animation */}
        <div className="relative px-4 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-cyan-400/30 rounded-2xl backdrop-blur-sm">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 200}ms`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-blue-400/10 blur-sm animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
