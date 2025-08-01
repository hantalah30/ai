import React from "react";
import { X, Bot, Trash2, Sparkles, LayoutDashboard } from "lucide-react";
import { AppSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  onClearChat: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onClearChat,
}) => {
  if (!isOpen) return null;

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      onClearChat();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900/95 border border-purple-400/30 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-purple-400/20">
          <h2 className="text-lg font-bold text-purple-400 font-mono">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300 font-mono">
              <Bot size={16} className="mr-2 text-cyan-400" /> AI Model
            </label>
            <select
              value={settings.model}
              onChange={(e) =>
                onSettingsChange({ ...settings, model: e.target.value })
              }
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100 font-mono"
            >
              <option value="gemini-1.5-pro-latest">
                Gemini 1.5 Pro (Recommended)
              </option>
              <option value="gemini-1.5-flash-latest">
                Gemini 1.5 Flash (Fast)
              </option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="flex items-center text-sm font-medium text-gray-300 font-mono">
              <LayoutDashboard size={16} className="mr-2 text-cyan-400" />{" "}
              Visuals
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Glitch & Matrix Effects</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.glitchEffects}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      glitchEffects: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </div>
            </label>
          </div>

          <div>
            <button
              onClick={handleClearChat}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 border border-red-400/50 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={16} className="mr-2" /> Clear Chat History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
