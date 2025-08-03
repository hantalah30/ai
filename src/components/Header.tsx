// src/components/Header.tsx

import React, { useState } from "react"; // Impor useState
import {
  Terminal,
  MessageSquare,
  Zap,
  Settings,
  Code,
  FileText,
  PlusCircle,
  History,
  Menu, // Impor ikon Menu
  X, // Impor ikon X untuk tombol tutup
} from "lucide-react";
import AIAvatar from "./AIAvatar"; // Pastikan AIAvatar diimpor

interface HeaderProps {
  isTerminalMode: boolean;
  onToggleTerminal: () => void;
  onOpenSettings: () => void;
  onToggleLivePreview: () => void;
  onToggleCodeEditor: () => void;
  isStreaming: boolean;
  onNewChat: () => void;
  onOpenChatHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isTerminalMode,
  onToggleTerminal,
  onOpenSettings,
  onToggleLivePreview,
  onToggleCodeEditor,
  isStreaming,
  onNewChat,
  onOpenChatHistory,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State untuk mengontrol menu mobile

  const handleNewChatAndCloseMenu = () => {
    onNewChat();
    setIsMobileMenuOpen(false);
  };

  const handleOpenChatHistoryAndCloseMenu = () => {
    onOpenChatHistory();
    setIsMobileMenuOpen(false);
  };

  const handleToggleCodeEditorAndCloseMenu = () => {
    onToggleCodeEditor();
    setIsMobileMenuOpen(false);
  };

  const handleToggleLivePreviewAndCloseMenu = () => {
    onToggleLivePreview();
    setIsMobileMenuOpen(false);
  };

  const handleToggleTerminalAndCloseMenu = () => {
    onToggleTerminal();
    setIsMobileMenuOpen(false);
  };

  const handleOpenSettingsAndCloseMenu = () => {
    onOpenSettings();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-cyan-500/30">
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
            <AIAvatar isStreaming={isStreaming} />
          </div>

          {/* Tombol Navigasi Desktop - Sembunyikan di mobile */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg border bg-gray-800/50 border-gray-600 text-green-400 hover:bg-gray-700/50 transition-colors"
              title="New Chat"
            >
              <PlusCircle size={20} />
            </button>
            <button
              onClick={onOpenChatHistory}
              className="p-2 rounded-lg border bg-gray-800/50 border-gray-600 text-yellow-400 hover:bg-gray-700/50 transition-colors"
              title="Chat History"
            >
              <History size={20} />
            </button>
            <button
              onClick={onToggleCodeEditor}
              className="p-2 rounded-lg border bg-gray-800/50 border-gray-600 text-gray-400"
              title="Open Code Editor"
            >
              <FileText size={20} />
            </button>
            <button
              onClick={onToggleLivePreview}
              className="p-2 rounded-lg border bg-gray-800/50 border-gray-600 text-gray-400"
              title="Toggle Live Preview"
            >
              <Code size={20} />
            </button>
            <button
              onClick={onToggleTerminal}
              className="p-2 rounded-lg border bg-gray-800/50 border-gray-600 text-gray-400"
              title="Terminal Mode"
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
              title="Open Settings"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Tombol Hamburger Mobile - Hanya tampil di mobile */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-cyan-400 hover:bg-gray-800/50 transition-colors"
              title="Open Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay dan Side Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] sm:hidden">
          {" "}
          {/* Backdrop dengan z-index lebih rendah */}
          {/* Backdrop gelap yang menutup layar */}
          <div
            className="absolute inset-0 bg-black bg-opacity-0 backdrop-blur-sm" // Opacity backdrop sangat dikurangi (0)
            onClick={() => setIsMobileMenuOpen(false)} // Tutup menu saat klik di luar
          ></div>
          {/* Side Drawer Menu */}
          <div
            className={`
            absolute top-0 bottom-0 right-0 w-56 bg-gray-900/20 backdrop-blur-md shadow-lg flex flex-col p-3 space-y-2
            transform transition-transform duration-300 ease-out
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="self-end p-2 rounded-full text-red-400 hover:bg-gray-700/50 transition-colors"
              title="Close Menu"
            >
              <X size={28} />
            </button>

            <button
              onClick={handleNewChatAndCloseMenu}
              className="w-full p-2 rounded-lg bg-gray-800/10 text-green-400 text-base font-bold flex items-center justify-start space-x-2 hover:bg-gray-700/10 transition-colors" // Opacity button dikurangi
            >
              <PlusCircle size={20} /> <span>New Chat</span>
            </button>
            <button
              onClick={handleOpenChatHistoryAndCloseMenu}
              className="w-full p-2 rounded-lg bg-gray-800/10 text-yellow-400 text-base font-bold flex items-center justify-start space-x-2 hover:bg-gray-700/10 transition-colors"
            >
              <History size={20} /> <span>Chat History</span>
            </button>
            <button
              onClick={handleToggleCodeEditorAndCloseMenu}
              className="w-full p-2 rounded-lg bg-gray-800/10 text-gray-300 text-base font-bold flex items-center justify-start space-x-2 hover:bg-gray-700/10 transition-colors"
            >
              <FileText size={20} /> <span>Code Editor</span>
            </button>
            <button
              onClick={handleToggleLivePreviewAndCloseMenu}
              className="w-full p-2 rounded-lg bg-gray-800/10 text-gray-300 text-base font-bold flex items-center justify-start space-x-2 hover:bg-gray-700/10 transition-colors"
            >
              <Code size={20} /> <span>Live Preview</span>
            </button>
            <button
              onClick={handleToggleTerminalAndCloseMenu}
              className="w-full p-2 rounded-lg bg-gray-800/10 text-blue-400 text-base font-bold flex items-center justify-start space-x-2 hover:bg-gray-700/10 transition-colors"
            >
              {isTerminalMode ? (
                <MessageSquare size={20} />
              ) : (
                <Terminal size={20} />
              )}{" "}
              <span>{isTerminalMode ? "Chat Mode" : "Terminal Mode"}</span>
            </button>
            <button
              onClick={handleOpenSettingsAndCloseMenu}
              className="w-full p-2 rounded-lg bg-gray-800/10 text-purple-400 text-base font-bold flex items-center justify-start space-x-2 hover:bg-gray-700/10 transition-colors"
            >
              <Settings size={20} /> <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
