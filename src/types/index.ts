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
}
