// src/App.tsx

import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";
import TerminalMode from "./components/TerminalMode";
import DataStream from "./components/DataStream";
import MusicPlayerBubble from "./components/MusicPlayerBubble";
import MusicPlayerModal from "./components/MusicPlayerModal";
import SettingsModal from "./components/SettingsModal";
import { Message, AppSettings, MessagePart, Track } from "./types"; // Import Track
import {
  GoogleGenerativeAI,
  Content,
  Part,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
} from "@google/generative-ai";
import ReactPlayer from "react-player";
import { fileToGenerativePart, extractTextFromFile } from "./utils/fileUtils";

// --- Kunci API sudah terpasang ---
const API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  "AIzaSyAQMDd0Ts64TNUTLuiTrBNMWmWF217RUFk";

function App() {
  const initialWelcomeMessage: Message = {
    id: "welcome",
    parts: [
      {
        type: "text",
        content:
          "Welcome to HAWAI. How can I assist you today? You can now upload files and manage a music playlist.",
      },
    ],
    sender: "ai",
    timestamp: new Date(),
  };

  // --- FITUR: Manajemen Sesi Obrolan (Memuat Pesan) ---
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem("hawai-chat-history");
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        return parsedMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    }
    return [initialWelcomeMessage];
  });

  // --- FITUR: Manajemen Sesi Obrolan (Menyimpan Pesan) ---
  useEffect(() => {
    try {
      localStorage.setItem("hawai-chat-history", JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);

  const [hasShownWelcome, setHasShownWelcome] = useState(messages.length <= 1);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem("hawai-settings");
    const defaults: Omit<AppSettings, "apiKey"> = {
      isTerminalMode: false,
      soundEnabled: true,
      glitchEffects: true,
      model: "models/gemini-1.5-flash",
      systemPrompt: "You are HAWAI, a helpful and futuristic AI assistant.",
      temperature: 0.7,
    };
    return savedSettings
      ? { ...defaults, ...JSON.parse(savedSettings) }
      : defaults;
  });

  useEffect(() => {
    localStorage.setItem("hawai-settings", JSON.stringify(settings));
  }, [settings]);

  const genAI = useMemo(() => new GoogleGenerativeAI(API_KEY), []);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Definisikan daftar lagu awal di sini
  const initialLocalTracks: Track[] = [
    {
      id: "local-track-1",
      url: "/audio/Bergema Sampai Selamanya - Nadhif Basalamah  Lirik Lagu - Indolirik.mp3", // Ganti dengan jalur berkas audio Anda
      title: "Bergema Sampai Selamanya",
      isLocal: true,
    },
    {
      id: "local-track-2",
      url: "/audio/.Feast - Nina (Official Lyric Video) - .Feast.mp3", // Ganti dengan jalur berkas audio Anda
      title: ".Feast - Nina",
      isLocal: true,
    },
    // Tambahkan lebih banyak lagu lokal di sini sesuai kebutuhan
  ];

  // State untuk pemutar musik dan playlist
  // Gunakan initialLocalTracks sebagai nilai awal untuk playlist
  const [playlist, setPlaylist] = useState<Track[]>(initialLocalTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ playedSeconds: 0 });
  const activeTrack = useMemo(
    () => playlist[currentTrackIndex],
    [playlist, currentTrackIndex]
  );

  // State untuk inspeksi URL judul otomatis
  const [pendingTrackUrl, setPendingTrackUrl] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        parts: [{ type: "text", content: `**Error:** ${error}` }],
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((current) => [...current, errorMsg]);
      setError(null);
    }
  }, [error]);

  const handleSendMessage = async (parts: MessagePart[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      parts,
      sender: "user",
      timestamp: new Date(),
    };
    const aiPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      parts: [{ type: "text", content: "" }],
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((current) => [...current, userMessage, aiPlaceholder]);
    setIsStreaming(true);

    try {
      const model = genAI.getGenerativeModel({
        model: settings.model,
        systemInstruction: settings.systemPrompt,
      });

      const generationConfig: GenerationConfig = {
        temperature: settings.temperature,
      };

      const safetySettings: SafetySetting[] = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: "BLOCK_NONE",
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: "BLOCK_NONE",
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: "BLOCK_NONE",
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: "BLOCK_NONE",
        },
      ];

      const promptParts: (string | Part)[] = [];
      let combinedText = "";

      for (const part of parts) {
        if (part.type === "text") {
          combinedText += part.content + "\n";
        } else if (part.content && part.mimeType) {
          const response = await fetch(part.content);
          const blob = await response.blob();
          const file = new File([blob], part.fileName || "file", {
            type: part.mimeType,
          });

          if (part.type === "image") {
            const filePart = await fileToGenerativePart(file);
            promptParts.push(filePart);
          } else {
            try {
              const textContent = await extractTextFromFile(file);
              combinedText += `\n--- START OF FILE: ${file.name} ---\n${textContent}\n--- END OF FILE: ${file.name} ---\n`;
            } catch (e) {
              console.warn(
                `Could not extract text from ${file.name}, sending as file part.`
              );
              const filePart = await fileToGenerativePart(file);
              promptParts.push(filePart);
            }
          }
        }
      }

      if (combinedText) {
        promptParts.unshift(combinedText.trim());
      }

      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(0, -2)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: m.parts
            .filter((p) => p.type === "text")
            .map((p) => ({ text: p.content })),
        }));

      const chat = model.startChat({
        history,
        generationConfig,
        safetySettings,
      });
      const result = await chat.sendMessageStream(promptParts);

      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setMessages((current) =>
          current.map((m) =>
            m.id === aiPlaceholder.id
              ? { ...m, parts: [{ type: "text", content: accumulatedText }] }
              : m
          )
        );
      }
    } catch (e) {
      console.error(e);
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
      setMessages((current) =>
        current.filter((m) => m.id !== aiPlaceholder.id)
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialWelcomeMessage]);
    setHasShownWelcome(true);
    localStorage.removeItem("hawai-chat-history");
  };

  // Modifikasi handleAddToQueue untuk mendukung berkas lokal
  const handleAddToQueue = (track: Omit<Track, "id">) => {
    const newTrack = { ...track, id: Date.now().toString() };
    setPlaylist((currentPlaylist) => {
      const newPlaylist = [...currentPlaylist, newTrack];
      if (newPlaylist.length === 1 && !isPlaying) {
        // Mulai otomatis jika ini lagu pertama dan belum diputar
        setCurrentTrackIndex(0);
        setIsPlaying(true);
        setIsLoading(true);
      }
      return newPlaylist;
    });
  };

  const handleUrlSubmit = (url: string) => {
    setIsLoading(true);
    // Untuk URL YouTube, kita masih perlu inspeksi judul
    setPendingTrackUrl(url);
  };

  // Handler baru untuk berkas audio lokal (ini masih akan berguna untuk unggahan dinamis)
  const handleLocalFileSubmit = (files: File[]) => {
    const newTracks: Track[] = files.map((file) => ({
      id: Date.now().toString() + "-" + file.name, // ID unik
      url: URL.createObjectURL(file), // Buat URL objek untuk berkas lokal
      title: file.name, // Gunakan nama berkas sebagai judul
      isLocal: true, // Tandai sebagai berkas lokal
    }));

    setPlaylist((currentPlaylist) => {
      const updatedPlaylist = [...currentPlaylist, ...newTracks];
      if (currentPlaylist.length === 0 && newTracks.length > 0) {
        // Jika playlist kosong dan ada berkas baru ditambahkan, mulai putar yang pertama
        setCurrentTrackIndex(0);
        setIsPlaying(true);
        setIsLoading(true);
      }
      return updatedPlaylist;
    });
    setIsMusicModalOpen(false); // Tutup modal setelah menambahkan berkas
  };

  const handleInspectorReady = (player: any) => {
    if (!pendingTrackUrl) return;
    try {
      const internalPlayer = player.getInternalPlayer();
      const title =
        internalPlayer?.videoTitle || internalPlayer?.title || "Untitled Track";
      handleAddToQueue({ url: pendingTrackUrl, title });
    } catch (e) {
      console.error("Failed to inspect URL:", e);
      handleAddToQueue({ url: pendingTrackUrl, title: "Untitled Track" });
    } finally {
      setPendingTrackUrl(null);
      if (!isPlaying) {
        setIsLoading(false);
      }
    }
  };

  const playNext = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
      setIsPlaying(true);
      setIsLoading(true);
    } else {
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prev) => prev - 1);
      setIsPlaying(true);
      setIsLoading(true);
    }
  };

  const playTrackAtIndex = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
      setIsLoading(true);
    }
  };

  const removeTrack = (trackId: string) => {
    const trackIndex = playlist.findIndex((track) => track.id === trackId);
    if (trackIndex === -1) return;

    // Jika trek yang dihapus sedang diputar, pastikan pemutaran beralih dengan benar
    if (trackIndex === currentTrackIndex) {
      if (playlist.length === 1) {
        // Jika hanya ada 1 trek dan dihapus
        setPlaylist([]);
        setIsPlaying(false);
        setCurrentTrackIndex(0);
        // Penting: Hapus juga URL.createObjectURL jika ini berkas lokal
        if (
          playlist[trackIndex].isLocal &&
          playlist[trackIndex].url.startsWith("blob:")
        ) {
          URL.revokeObjectURL(playlist[trackIndex].url);
        }
        return;
      }
      // Jika trek yang dihapus adalah yang terakhir, pindah ke yang sebelumnya
      if (trackIndex === playlist.length - 1) {
        setCurrentTrackIndex((prev) => prev - 1);
      }
      // Jika tidak, tetap di indeks saat ini (yang akan menjadi trek berikutnya setelah penghapusan)
      // Pemutaran akan berlanjut secara otomatis karena `currentTrackIndex` berubah
      setIsLoading(true); // Set loading untuk trek baru
    } else if (trackIndex < currentTrackIndex) {
      // Jika trek yang dihapus berada sebelum trek yang sedang diputar, sesuaikan indeks
      setCurrentTrackIndex((prev) => prev - 1);
    }

    setPlaylist((currentPlaylist) => {
      const newPlaylist = currentPlaylist.filter(
        (track) => track.id !== trackId
      );
      // Hapus URL.createObjectURL jika ini berkas lokal
      const removedTrack = currentPlaylist.find(
        (track) => track.id === trackId
      );
      if (removedTrack?.isLocal && removedTrack?.url.startsWith("blob:")) {
        URL.revokeObjectURL(removedTrack.url);
      }
      return newPlaylist;
    });
  };

  const handleTogglePlay = () => {
    if (playlist.length > 0) {
      setIsPlaying(!isPlaying);
    } else {
      setIsMusicModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {settings.glitchEffects && (
        <>
          <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20"></div>
          <DataStream />
        </>
      )}

      <div className="relative z-10 flex flex-col h-screen">
        <Header
          onToggleTerminal={() =>
            setSettings((s) => ({ ...s, isTerminalMode: !s.isTerminalMode }))
          }
          isTerminalMode={settings.isTerminalMode}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        <main className="flex-1 flex flex-col overflow-y-auto pt-16">
          {settings.isTerminalMode ? (
            <TerminalMode
              messages={messages}
              onSendMessage={(text) =>
                handleSendMessage([{ type: "text", content: text }])
              }
              onClearTerminal={handleClearChat}
            />
          ) : (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              hasShownWelcome={hasShownWelcome}
              setHasShownWelcome={setHasShownWelcome}
            />
          )}
        </main>
      </div>

      <MusicPlayerBubble
        isPlaying={isPlaying}
        isLoading={isLoading}
        isLoaded={playlist.length > 0}
        title={activeTrack?.title || "No track playing"}
        duration={activeTrack?.duration || 0}
        progress={progress.playedSeconds}
        onTogglePlay={handleTogglePlay}
        onOpenModal={() => setIsMusicModalOpen(true)}
      />

      <MusicPlayerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onUrlSubmit={handleUrlSubmit}
        onLocalFileSubmit={handleLocalFileSubmit} // Lewatkan handler baru
        playlist={playlist}
        activeTrackId={activeTrack?.id}
        isPlaying={isPlaying}
        onPlayTrackAtIndex={playTrackAtIndex}
        onRemoveTrack={removeTrack}
        onPlayNext={playNext}
        onPlayPrevious={playPrevious}
        onTogglePlay={handleTogglePlay}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        onClearChat={handleClearChat}
      />

      {/* Player Utama untuk memutar musik */}
      {activeTrack && (
        <div style={{ display: "none" }}>
          <ReactPlayer
            url={activeTrack.url}
            playing={isPlaying}
            onReady={(player) => {
              setIsLoading(false);
              const duration = player.getDuration();
              if (duration) {
                setPlaylist((currentPlaylist) =>
                  currentPlaylist.map((t) =>
                    t.id === activeTrack.id ? { ...t, duration } : t
                  )
                );
              }
            }}
            onProgress={setProgress}
            onEnded={playNext}
            onError={(e) => {
              console.error("Player Error:", e);
              setError(`Failed to play: ${activeTrack.title}`);
              // Coba putar trek berikutnya jika ada kesalahan
              playNext();
            }}
            config={{
              youtube: {
                playerVars: { origin: window.location.origin },
              },
            }}
          />
        </div>
      )}

      {/* Player Inspeksi Tersembunyi untuk mengambil judul (Hanya untuk YouTube) */}
      {pendingTrackUrl && (
        <div style={{ display: "none" }}>
          <ReactPlayer
            url={pendingTrackUrl}
            playing={false}
            onReady={handleInspectorReady}
            onError={(e) => {
              console.error("Inspector player error:", e);
              setError(`Could not fetch info for the provided URL.`);
              setPendingTrackUrl(null);
              setIsLoading(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
