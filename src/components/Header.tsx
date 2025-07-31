import React from 'react';
import { Terminal, MessageSquare, Zap, Settings } from 'lucide-react';
import AIAvatar from './AIAvatar';

interface HeaderProps {
  isTerminalMode: boolean;
  onToggleTerminal: () => void;
}

const Header: React.FC<HeaderProps> = ({ isTerminalMode, onToggleTerminal }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-cyan-500/30 relative">
      {/* Neon Border Effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Zap className="h-8 w-8 text-cyan-400" />
              <div className="absolute inset-0 animate-ping">
                <Zap className="h-8 w-8 text-cyan-400 opacity-20" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                CyberAI
              </h1>
              <p className="text-xs text-gray-400 font-mono">Neural Network v2.077</p>
            </div>
          </div>

          {/* AI Avatar */}
          <div className="flex-1 flex justify-center">
            <AIAvatar />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleTerminal}
              className={`p-2 rounded-lg border transition-all duration-300 ${
                isTerminalMode
                  ? 'bg-green-500/20 border-green-400 text-green-400 shadow-green-400/50 shadow-lg'
                  : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
              }`}
              title={isTerminalMode ? 'Exit Terminal Mode' : 'Enter Terminal Mode'}
            >
              {isTerminalMode ? <MessageSquare className="h-5 w-5" /> : <Terminal className="h-5 w-5" />}
            </button>
            
            <button className="p-2 rounded-lg bg-gray-800/50 border border-gray-600 text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-all duration-300">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;