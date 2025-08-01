import React, { useState } from "react";
import {
  X,
  Bot,
  Trash2,
  LayoutDashboard,
  BrainCircuit,
  Thermometer,
} from "lucide-react"; // KeyRound dihapus
import { AppSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: Omit<AppSettings, "apiKey">) => void; // Omit apiKey
  onClearChat: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onClearChat,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      onClearChat();
      onClose();
    }
  };

  // --- DAFTAR MODEL SESUAI PERMINTAAN ---
  const modelOptions = [
    { id: "gemini-2.5-flash", name: "HAWAI 2.5 Flash" },
    { id: "gemini-1.5-flash-8b", name: "HAWAI 1.5 Flash-8B" },
    { id: "gemini-2.5-pro", name: "HAWAI 2.5 Pro (Recommended)" },
    { id: "gemini-2.0-flash-lite", name: "HAWAI 2.0 Flash-Lite" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900/95 border border-purple-400/30 rounded-2xl w-full max-w-lg">
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

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* AI Model Settings */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300 font-mono">
              <Bot size={16} className="mr-2 text-cyan-400" /> AI Model
            </label>
            <select
              value={localSettings.model}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  model: e.target.value,
                })
              }
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100 font-mono"
            >
              {modelOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300 font-mono">
              <BrainCircuit size={16} className="mr-2 text-cyan-400" /> System
              Prompt
            </label>
            <textarea
              value={localSettings.systemPrompt}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  systemPrompt: e.target.value,
                })
              }
              placeholder="e.g., You are a helpful assistant..."
              className="w-full h-24 bg-gray-800/50 border border-gray-600/50 rounded-lg p-2 text-gray-100 font-mono text-sm resize-y"
            />
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium text-gray-300 font-mono">
              <div className="flex items-center">
                <Thermometer size={16} className="mr-2 text-cyan-400" />{" "}
                Temperature
              </div>
              <span className="text-cyan-400">
                {localSettings.temperature.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.temperature}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* --- BAGIAN API KEY DIHAPUS --- */}

          {/* Visuals */}
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
                  checked={localSettings.glitchEffects}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      glitchEffects: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </div>
            </label>
          </div>

          {/* Clear Chat */}
          <div>
            <button
              onClick={handleClearChat}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 border border-red-400/50 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={16} className="mr-2" /> Clear Chat History
            </button>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-purple-400/20">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors font-mono"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
