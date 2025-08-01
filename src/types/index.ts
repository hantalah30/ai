export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  files?: FileUpload[];
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
}
