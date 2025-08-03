// src/components/SettingsModal.tsx

import React, { useState } from "react";
import {
  X,
  Bot,
  Trash2,
  LayoutDashboard,
  BrainCircuit,
  Thermometer,
  Palette,
  RotateCcw,
  Volume2,
  Smile, // Impor ikon Smile untuk kepribadian
} from "lucide-react";
import { AppSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: Omit<AppSettings, "apiKey">) => void;
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

  // Definisi tema yang tersedia
  const themeOptions = [
    { id: "default", name: "Default HAWAI" },
    { id: "cyberpunk", name: "Cyberpunk Pulse" },
    { id: "matrix", name: "Matrix Code" },
    { id: "vaporwave", name: "Vaporwave Dream" },
  ];

  // Definisi preset kepribadian AI
  const aiPersonalityPresets = [
    {
      id: "helpful",
      name: "Helpful Assistant 🤖",
      prompt:
        "You are HAWAI, a helpful and futuristic AI assistant. Provide concise and accurate information.",
    },
    {
      id: "chill",
      name: "Chill Vibe 😎",
      prompt:
        "You are HAWAI, a chill and laid-back AI assistant. Use casual language and positive vibes. Keep it cool.",
    },
    {
      id: "sarcastic",
      name: "Sarcastic Sensei 😈",
      prompt:
        "You are HAWAI, an AI assistant with a dry, sarcastic wit. Provide accurate information, but feel free to add a touch of humor.",
    },
    {
      id: "creative",
      name: "Creative Muse ✨",
      prompt:
        "You are HAWAI, a highly creative and imaginative AI assistant. Think outside the box and inspire new ideas.",
    },
    {
      id: "formal",
      name: "Formal Advisor 👔",
      prompt:
        "You are HAWAI, a professional and formal AI advisor. Use polite and structured language.",
    },
  ];

  // Fungsi untuk mendapatkan systemPrompt berdasarkan kepribadian yang dipilih
  const getSystemPromptForPersonality = (personalityId: string): string => {
    const preset = aiPersonalityPresets.find((p) => p.id === personalityId);
    // Jika ada preset, gunakan promptnya, jika tidak, gunakan systemPrompt yang sudah ada di localSettings
    // Ini memungkinkan pengguna mengetik prompt kustom dan mengabaikan personality jika diinginkan
    return preset ? preset.prompt : localSettings.systemPrompt;
  };

  // Definisi pengaturan default untuk fungsi reset
  const defaultAppSettings: Omit<AppSettings, "apiKey"> = {
    isTerminalMode: false,
    soundEnabled: true,
    glitchEffects: true,
    model: "models/gemini-1.5-flash",
    systemPrompt: "You are HAWAI, a helpful and futuristic AI assistant.", // System prompt default
    temperature: 0.7,
    theme: "default",
    aiPersonality: "helpful", // Kepribadian default
  };

  if (!isOpen) return null;

  const handleSave = () => {
    // Saat menyimpan, perbarui juga systemPrompt berdasarkan aiPersonality yang dipilih
    // Hanya perbarui jika aiPersonality diatur ke salah satu preset
    let finalSystemPrompt = localSettings.systemPrompt;
    if (
      aiPersonalityPresets.some((p) => p.id === localSettings.aiPersonality)
    ) {
      finalSystemPrompt = getSystemPromptForPersonality(
        localSettings.aiPersonality
      );
    }

    onSettingsChange({
      ...localSettings,
      systemPrompt: finalSystemPrompt, // Pastikan systemPrompt sesuai dengan personality atau custom
    });
    onClose();
  };

  const handleClearChat = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the current chat history? This action cannot be undone."
      )
    ) {
      onClearChat();
      onClose();
    }
  };

  const handleResetSettings = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to default?")
    ) {
      setLocalSettings(defaultAppSettings);
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
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
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
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {modelOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Personality */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300 font-mono">
              <Smile size={16} className="mr-2 text-cyan-400" /> AI Personality
            </label>
            <select
              value={localSettings.aiPersonality}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  aiPersonality: e.target.value,
                  // Ketika personality diubah, update systemPrompt dengan nilai preset
                  systemPrompt: getSystemPromptForPersonality(e.target.value),
                })
              }
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {aiPersonalityPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt (bisa dibiarkan untuk custom prompt, atau disembunyikan jika AI Personality aktif) */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-300 font-mono">
              <BrainCircuit size={16} className="mr-2 text-cyan-400" /> System
              Prompt (Override Personality)
            </label>
            <textarea
              value={localSettings.systemPrompt}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  systemPrompt: e.target.value,
                  aiPersonality: "custom", // Set personality ke 'custom' jika prompt diedit manual
                })
              }
              placeholder="e.g., You are a helpful assistant..."
              className="w-full h-24 bg-gray-800/50 border border-gray-600/50 rounded-lg p-2 text-gray-100 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Visuals */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-medium text-gray-300 font-mono">
              <LayoutDashboard size={16} className="mr-2 text-cyan-400" />{" "}
              Visuals
            </label>

            {/* Toggle Glitch Effects */}
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
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </label>

            {/* Toggle Sound Effects */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Sound Effects (UI)</span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localSettings.soundEnabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      soundEnabled: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </div>
            </label>

            {/* Theme Selection */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center text-sm font-medium text-gray-300 font-mono">
                <Palette size={16} className="mr-2 text-cyan-400" /> App Theme
              </label>
              <select
                value={localSettings.theme}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    theme: e.target.value,
                  })
                }
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {themeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons: Clear Chat & Reset Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 border border-red-400/50 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={16} className="mr-2" /> Clear Current Chat
            </button>
            {/* Reset All Settings */}
            <button
              onClick={handleResetSettings}
              className="w-full flex items-center justify-center px-4 py-2 text-sm text-yellow-400 border border-yellow-400/50 rounded-lg hover:bg-yellow-400/10 transition-colors"
            >
              <RotateCcw size={16} className="mr-2" /> Reset All Settings
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
