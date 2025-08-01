import React from "react";
import { Terminal, MessageSquare, Zap, Settings } from "lucide-react";
import AIAvatar from "./AIAvatar";

interface HeaderProps {
  isTerminalMode: boolean;
  onToggleTerminal: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isTerminalMode,
  onToggleTerminal,
  onOpenSettings,
}) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-cyan-500/30 relative">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative">
              <Zap className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                HAWAI
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Neural Network v1.5
              </p>
            </div>
          </div>

          <div className="flex-1 flex justify-center px-2">
            <AIAvatar />
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onToggleTerminal}
              className="p-2 rounded-lg border bg-gray-800/50 border-gray-600 text-gray-400"
            >
              {isTerminalMode ? (
                <MessageSquare size={20} />
              ) : (
                <Terminal size={20} />
              )}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg border bg-gray-800/50 border-gray-600 text-gray-400"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
