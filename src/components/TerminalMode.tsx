import React, { useState, useEffect, useRef } from "react";
import { Terminal, Sparkles, Lightbulb } from "lucide-react";
import { Message, MessagePart } from "../types";

interface TerminalModeProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearTerminal: () => void;
}

const TerminalMode: React.FC<TerminalModeProps> = ({
  messages,
  onSendMessage,
  onClearTerminal,
}) => {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [localMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showHelp = () => {
    const helpMessage: Message = {
      id: `local-${Date.now()}`,
      sender: "ai",
      timestamp: new Date(),
      parts: [
        {
          type: "text",
          content: `
            Halo! Selamat datang di **HAWAI Creative Terminal**.
            Ini adalah panduan untuk fitur-fitur yang bisa kamu gunakan:

            **[Perintah Utama]**
            /help               - Menampilkan panduan ini.
            /clear              - Membersihkan layar terminal dari riwayat pesan.
            /history            - Menampilkan riwayat perintah yang pernah kamu ketik.
            /lang [kode bahasa] - Mengubah bahasa respons AI (contoh: /lang en untuk Inggris).

            **[Mode Kreatif & Ide]**
            /note [isi catatan] - Mencatat ide atau pemikiranmu dengan cepat.
            /prompt             - Mendapatkan ide kreatif acak untuk menulis atau berkarya.
            /story              - Menghasilkan ide cerita yang unik dan menarik.
            /art                - Memberikan prompt atau tantangan untuk karya seni visual.
            /social             - Menghasilkan ide konten untuk media sosialmu (TikTok, Instagram, dll).

            **[Manajemen Proyek]**
            /create project "nama proyek"  - Membuat folder virtual untuk ide-ide proyekmu.
            /view projects              - Melihat daftar semua proyek yang sudah dibuat.
            
            **[Mode Belajar]**
            /learn [topik]      - Memulai sesi belajar interaktif tentang topik tertentu.
            /quiz               - Memberikan kuis singkat untuk menguji pengetahuanmu.
            /progress           - Menampilkan kemajuan belajarmu.

            Cukup ketik idemu, dan aku akan membantumu mengembangkannya!
            `.trim(),
        },
      ],
    };
    setLocalMessages((prev) => [...prev, helpMessage]);
  };

  const showHistory = () => {
    const historyContent =
      commandHistory.length > 0
        ? commandHistory.join("\n")
        : "Belum ada perintah dalam riwayat.";
    const historyMessage: Message = {
      id: `local-${Date.now()}`,
      sender: "ai",
      timestamp: new Date(),
      parts: [
        {
          type: "text",
          content: `Riwayat Perintahmu:\n${historyContent}`,
        },
      ],
    };
    setLocalMessages((prev) => [...prev, historyMessage]);
  };

  const generatePrompt = (type: string) => {
    // Daftar prompt untuk berbagai bahasa.
    const prompts = {
      id: {
        story: [
          "Seorang detektif yang bisa membaca memori dari foto-foto lama.",
          "Dunia pasca-apokaliptik di mana musik adalah satu-satunya mata uang.",
          "Sekelompok teman menemukan peta menuju dimensi tersembunyi di sebuah game lama.",
        ],
        social: [
          "Buat TikTok 15 detik yang menampilkan 'meja kerjamu', tapi dengan sentuhan unik (misal: semuanya miniatur).",
          "Post carousel di Instagram yang menjelaskan topik kompleks dalam tiga langkah visual sederhana.",
          "Thread Twitter yang membagikan 5 tips produktivitas yang menurutmu paling diremehkan.",
        ],
        art: [
          "Lukiskan mimpi yang kamu alami semalam, tapi dalam gaya Van Gogh.",
          "Lukisan surealis sebuah kota yang dibangun di atas ubur-ubur raksasa yang melayang.",
          "Sebuah patung yang dibuat sepenuhnya dari plastik daur ulang dan kawat, melambangkan pertumbuhan.",
        ],
      },
      en: {
        story: [
          "A detective who can read memories through old photographs.",
          "A post-apocalyptic world where music is the only currency.",
          "A group of friends finds a map to a hidden dimension in an old video game.",
        ],
        // ... Tambahkan prompt bahasa lain di sini
      },
    };

    // Ini adalah contoh sederhana. Pada implementasi nyata, Anda akan
    // menggunakan state untuk melacak bahasa yang dipilih oleh pengguna.
    // Di sini, kita akan asumsikan bahasa default adalah 'id'.
    const currentLang = "id";
    const selectedPrompts =
      prompts[currentLang as keyof typeof prompts][
        type as keyof typeof prompts.id
      ];

    const randomPrompt =
      selectedPrompts[Math.floor(Math.random() * selectedPrompts.length)];

    const aiMessage: Message = {
      id: `local-${Date.now()}`,
      sender: "ai",
      timestamp: new Date(),
      parts: [
        {
          type: "text",
          content: `[GENERATOR IDE] Ini ide kreatif untukmu:\n\n"${randomPrompt}"`,
        },
      ],
    };
    setLocalMessages((prev) => [...prev, aiMessage]);
  };

  const handleLocalCommand = (command: string) => {
    const userMessage: Message = {
      id: `local-user-${Date.now()}`,
      parts: [{ type: "text", content: command }],
      sender: "user",
      timestamp: new Date(),
    };
    setLocalMessages((prev) => [...prev, userMessage]);

    const commandParts = command.toLowerCase().split(" ");
    const commandName = commandParts[0];
    const argument = commandParts.slice(1).join(" ").replace(/"/g, "");

    switch (commandName) {
      case "/help":
        showHelp();
        break;
      case "/clear":
        onClearTerminal();
        break;
      case "/history":
        showHistory();
        break;
      case "/note":
        // Logika untuk menyimpan catatan.
        const noteMessage: Message = {
          id: `local-${Date.now()}`,
          sender: "ai",
          timestamp: new Date(),
          parts: [
            {
              type: "text",
              content: `Catatanmu berhasil disimpan: "${argument}"`,
            },
          ],
        };
        setLocalMessages((prev) => [...prev, noteMessage]);
        break;
      case "/story":
      case "/social":
      case "/art":
      case "/prompt":
        generatePrompt(commandName.substring(1));
        break;
      // Tambahkan logika untuk /create, /learn, /quiz, dll. di sini
      default:
        onSendMessage(command);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput) {
      setCommandHistory((prev) => [...prev, trimmedInput]);
      if (trimmedInput.startsWith("/")) {
        handleLocalCommand(trimmedInput);
      } else {
        onSendMessage(trimmedInput);
      }
      setInput("");
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const renderParts = (parts: MessagePart[]) => {
    return parts.map((part, index) => {
      if (part.type === "text")
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part.content}
          </span>
        );
      return null;
    });
  };

  const lastMessage = localMessages[localMessages.length - 1];
  const isAiStreaming =
    lastMessage &&
    lastMessage.sender === "ai" &&
    isNaN(parseInt(lastMessage.id.split("-")[1]));

  return (
    <div className="flex-1 bg-black/90 backdrop-blur-sm border border-purple-400/30 rounded-lg m-2 sm:m-4 font-mono text-sm flex flex-col">
      <div className="bg-gray-800/50 border-b border-purple-400/30 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-purple-400">HAWAI Creative Terminal v2.0</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">MODE_KREATIF</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {localMessages.map((message) => (
          <div key={message.id}>
            {message.sender === "user" ? (
              <div className="text-cyan-400 break-words">
                <span className="text-cyan-400">kreator@hawai:~$</span>{" "}
                {renderParts(message.parts)}
              </div>
            ) : (
              <div className="text-purple-400 break-words">
                <span className="text-yellow-400">[AI-GENIE]</span>{" "}
                {renderParts(message.parts)}
                {isAiStreaming && message.id === lastMessage.id && (
                  <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1"></span>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <div className="p-4 border-t border-purple-400/30">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-cyan-400">kreator@hawai:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none caret-purple-400"
            autoComplete="off"
            placeholder="Ketik idemu atau /help untuk panduan..."
          />
          <div className="w-2 h-4 bg-purple-400 animate-pulse"></div>
        </form>
      </div>
    </div>
  );
};

export default TerminalMode;
