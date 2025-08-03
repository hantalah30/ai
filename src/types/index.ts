// src/types/index.ts

// Tambahkan tipe Track
export interface Track {
  id: string;
  url: string;
  title: string;
  duration?: number;
}

export interface MessagePart {
  type: "text" | "image" | "file";
  content: string;
  fileName?: string;
  mimeType?: string;
}

export interface Message {
  id: string;
  parts: MessagePart[];
  sender: "user" | "ai";
  timestamp: Date;
}

export interface AppSettings {
  isTerminalMode: boolean;
  soundEnabled: boolean;
  glitchEffects: boolean;
  model: string;
  systemPrompt: string;
  temperature: number;
  theme: string; // Misalnya, 'default', 'cyberpunk', 'matrix'
  aiPersonality: string; // Misalnya, 'helpful', 'sarcastic', 'chill'
  // NEW: Pengaturan terminal dan kecepatan mengetik
  terminalPrompt: string; // Prompt terminal kustom
  typingSpeed: number; // Kecepatan mengetik AI (misalnya, ms per karakter)
}

// Tambahkan antarmuka ChatSession BARU
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
  // Tambahkan properti untuk Live Preview dan Code Editor per sesi
  livePreviewCode: string;
  livePreviewLanguage: string;
  editorCode: string;
  editorLanguage: string;
}
