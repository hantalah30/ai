// src/types/index.ts

export interface MessagePart {
  type: "text" | "image" | "file";
  content: string;
  mimeType?: string;
  fileName?: string;
}

export interface Message {
  id: string;
  parts: MessagePart[];
  sender: "user" | "ai";
  timestamp: Date;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  content?: string;
}

export interface AppSettings {
  isTerminalMode: boolean;
  soundEnabled: boolean;
  glitchEffects: boolean;
  model: string;
  systemPrompt: string; // <-- BARIS BARU
  temperature: number; // <-- BARIS BARU
  apiKey: string | null; // <-- BARIS BARU
}
