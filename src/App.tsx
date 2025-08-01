// src/App.tsx

import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";
import TerminalMode from "./components/TerminalMode";
import DataStream from "./components/DataStream";
import MusicPlayerBubble from "./components/MusicPlayerBubble";
import MusicPlayerModal from "./components/MusicPlayerModal";
import SettingsModal from "./components/SettingsModal";
import LivePreview from "./components/LivePreview";
import CodeEditorModal from "./components/CodeEditorModal";
import { Message, AppSettings, MessagePart, Track } from "./types";
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

  const defaultLivePreviewContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HAWAI Live Preview</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #1a202c;
            color: #e2e8f0;
            overflow: hidden;
        }
        .container {
            text-align: center;
            padding: 30px;
            border-radius: 15px;
            background: linear-gradient(145deg, #2a2e3a, #1a1e26);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: fadeIn 1s ease-out;
            max-width: 80%;
            transform: scale(0.95);
            transition: transform 0.3s ease-in-out;
        }
        .container:hover {
            transform: scale(1);
        }
        h1 {
            color: #9f7aea;
            font-size: 2.5em;
            margin-bottom: 15px;
            text-shadow: 0 0 10px rgba(159, 122, 234, 0.7);
        }
        p {
            font-size: 1.1em;
            line-height: 1.6;
            color: #a0aec0;
        }
        .highlight {
            color: #63b3ed;
            font-weight: bold;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to HAWAI's Live Preview!</h1>
        <p>This is where your <span class="highlight">code comes to life</span> instantly.</p>
        <p>Click the <b>Code</b> icon in the header to toggle this panel.</p>
    </div>
</body>
</html>`;

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

  // State for Live Preview content
  const [livePreviewCode, setLivePreviewCode] = useState(
    defaultLivePreviewContent
  );
  const [livePreviewLanguage, setLivePreviewLanguage] = useState("html");
  // New state to control Live Preview visibility
  const [showLivePreview, setShowLivePreview] = useState(false);
  // New state for Code Editor visibility
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  // State to hold the code in the editor (can be different from livePreviewCode)
  const [editorCode, setEditorCode] = useState(defaultLivePreviewContent);
  const [editorLanguage, setEditorLanguage] = useState("html");
  // NEW: State for Live Preview Full Screen
  const [isLivePreviewFullScreen, setIsLivePreviewFullScreen] = useState(false);

  // Function to toggle Live Preview visibility
  const handleToggleLivePreview = () => {
    setShowLivePreview((prev) => !prev);
    // Jika Live Preview disembunyikan, pastikan bukan dalam mode full screen
    if (isLivePreviewFullScreen) {
      setIsLivePreviewFullScreen(false);
    }
  };

  // Function to toggle Code Editor visibility
  const handleToggleCodeEditor = () => {
    setShowCodeEditor((prev) => !prev);
  };

  // NEW: Function to toggle Live Preview Full Screen
  const handleToggleLivePreviewFullScreen = () => {
    setIsLivePreviewFullScreen((prev) => !prev);
    // Pastikan Live Preview terlihat jika masuk mode full screen
    if (!showLivePreview) {
      setShowLivePreview(true);
    }
  };

  // Callback from CodeEditorModal when code is saved
  const handleEditorCodeSave = (code: string) => {
    setLivePreviewCode(code); // Update Live Preview with saved code
    // Assuming language won't change often from editor, or add a language selector to editor
    setLivePreviewLanguage(editorLanguage); // Keep the language consistent
  };

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
      // Define arrays to store parsed code blocks
      let parsedHtml: string[] = [];
      let parsedCss: string[] = [];
      let parsedJs: string[] = [];
      let parsedOther: { language: string; code: string }[] = [];

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;

        // Clear previous parsed blocks to re-evaluate whole accumulatedText
        parsedHtml = [];
        parsedCss = [];
        parsedJs = [];
        parsedOther = [];

        // Regex to find all markdown code blocks
        const codeBlockRegex = /`{3}(\w+)?\n([\s\S]*?)\n`{3}/g;
        let match;
        // Reset lastIndex for a fresh search on accumulatedText
        codeBlockRegex.lastIndex = 0;
        while ((match = codeBlockRegex.exec(accumulatedText)) !== null) {
          const lang = match[1] ? match[1].toLowerCase() : "plaintext";
          const code = match[2];

          if (lang === "html") {
            parsedHtml.push(code);
          } else if (lang === "css") {
            parsedCss.push(code);
          } else if (lang === "javascript" || lang === "js") {
            parsedJs.push(code);
          } else {
            parsedOther.push({ language: lang, code: code });
          }
        }

        let codeToPreview = "";
        let languageToPreview = "html";
        let codeToEditor = ""; // Code to set in the editor
        let languageToEditor = "html"; // Language to set in the editor

        // Prioritize combining HTML, CSS, and JS for live preview
        if (
          parsedHtml.length > 0 ||
          parsedCss.length > 0 ||
          parsedJs.length > 0
        ) {
          const combinedHtmlContent = parsedHtml.join("\n");
          const combinedCssContent = parsedCss.join("\n");
          const combinedJsContent = parsedJs.join("\n");

          // Construct a full HTML document
          codeToPreview = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    ${combinedCssContent ? `<style>${combinedCssContent}</style>` : ""}
</head>
<body>
    ${combinedHtmlContent}
    ${combinedJsContent ? `<script>${combinedJsContent}</script>` : ""}
</body>
</html>`;
          languageToPreview = "html";
          // For editor, if we combine, the editor should ideally show the combined HTML
          codeToEditor = codeToPreview;
          languageToEditor = "html";
        } else if (parsedOther.length > 0) {
          // If no HTML/CSS/JS blocks, show the last "other" code block with syntax highlighting
          const lastOtherBlock = parsedOther[parsedOther.length - 1];
          codeToPreview = lastOtherBlock.code;
          languageToPreview = lastOtherBlock.language;
          // Editor content is the same as preview content
          codeToEditor = lastOtherBlock.code;
          languageToEditor = lastOtherBlock.language;
        } else {
          // If no recognized code blocks, fall back to default live preview content
          codeToPreview = defaultLivePreviewContent;
          languageToPreview = "html";
          codeToEditor = defaultLivePreviewContent;
          languageToEditor = "html";
        }

        setLivePreviewCode(codeToPreview);
        setLivePreviewLanguage(languageToPreview);
        setEditorCode(codeToEditor); // Update editor's content
        setEditorLanguage(languageToEditor); // Update editor's language

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
    // Clear live preview and editor on chat clear
    setLivePreviewCode(defaultLivePreviewContent);
    setLivePreviewLanguage("html");
    setShowLivePreview(false);
    setEditorCode(defaultLivePreviewContent);
    setEditorLanguage("html");
    setShowCodeEditor(false);
    setIsLivePreviewFullScreen(false); // Also reset full screen state
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
          onToggleLivePreview={handleToggleLivePreview}
          onToggleCodeEditor={handleToggleCodeEditor}
          isStreaming={isStreaming}
        />

        {/* Render LivePreview in full screen if active, otherwise in main layout */}
        {isLivePreviewFullScreen ? (
          <LivePreview
            code={livePreviewCode}
            language={livePreviewLanguage}
            isFullScreen={true} // Selalu true ketika dirender di sini
            onToggleFullScreen={handleToggleLivePreviewFullScreen} // Gunakan toggle yang sama
            isStreaming={isStreaming} // Teruskan isStreaming ke LivePreview
          />
        ) : (
          <main className="flex-1 flex flex-col sm:flex-row overflow-hidden pt-16">
            {/* Left Column: AI Chat/Terminal */}
            <div
              className={`flex-1 flex flex-col overflow-hidden ${
                showLivePreview
                  ? "sm:w-3/5 border-r border-cyan-500/30"
                  : "sm:w-full"
              }`}
            >
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
            </div>

            {/* Right Column: Live Preview - Conditionally rendered */}
            {showLivePreview && (
              <div className="flex-1 sm:w-2/5 flex flex-col bg-gray-800/50 backdrop-blur-sm overflow-hidden rounded-lg m-2">
                <LivePreview
                  code={livePreviewCode}
                  language={livePreviewLanguage}
                  isFullScreen={false} // Selalu false ketika dirender di sini
                  onToggleFullScreen={handleToggleLivePreviewFullScreen}
                  isStreaming={isStreaming} // Teruskan isStreaming ke LivePreview
                />
              </div>
            )}
          </main>
        )}
      </div>

      {/* Code Editor Modal - Conditionally rendered */}
      <CodeEditorModal
        isOpen={showCodeEditor}
        onClose={() => setShowCodeEditor(false)}
        initialCode={editorCode}
        language={editorLanguage}
        onSave={handleEditorCodeSave}
      />

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
