// src/types/index.ts

// Bagian dari sebuah pesan, bisa berupa teks atau file
export interface MessagePart {
  type: "text" | "image" | "file";
  content: string; // Teks atau URL data untuk file
  mimeType?: string; // Diperlukan untuk file
  fileName?: string; // Nama file asli
}

export interface Message {
  id: string;
  parts: MessagePart[]; // Pesan sekarang terdiri dari beberapa bagian
  sender: "user" | "ai";
  timestamp: Date;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // URL pratinjau lokal
  content?: string; // Konten file (misal: base64)
}

export interface AppSettings {
  isTerminalMode: boolean;
  soundEnabled: boolean;

  glitchEffects: boolean;
  model: string;
}
