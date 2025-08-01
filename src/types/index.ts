export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  files?: FileUpload[];
  isCode?: boolean;
  language?: string;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  id: string;
  code: string;
  language: string;
  filename?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  content?: string;
}

export interface ChatSettings {
  isTerminalMode: boolean;
  soundEnabled: boolean;
  glitchEffects: boolean;
}