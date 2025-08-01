import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";
import TerminalMode from "./components/TerminalMode";
import DataStream from "./components/DataStream";
import MusicPlayerBubble from "./components/MusicPlayerBubble";
import MusicPlayerModal from "./components/MusicPlayerModal";
import SettingsModal from "./components/SettingsModal";
import { Message, AppSettings, MessagePart } from "./types";
import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai";
import ReactPlayer from "react-player";
import { fileToGenerativePart } from "./utils/fileUtils";

const API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  "AIzaSyAQMDd0Ts64TNUTLuiTrBNMWmWF217RUFk"; // Ganti dengan Kunci API Anda atau gunakan .env
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const initialWelcomeMessage: Message = {
    id: "welcome",
    parts: [
      {
        type: "text",
        content:
          "Welcome to HAWAI. How can I assist you today? You can now upload images and documents.",
      },
    ],
    sender: "ai",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialWelcomeMessage]);
  const [hasShownWelcome, setHasShownWelcome] = useState(true);

  const [settings, setSettings] = useState<AppSettings>({
    isTerminalMode: false,
    soundEnabled: true,
    glitchEffects: true,
    model: "models/gemini-2.5-flash",
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [progress, setProgress] = useState({ playedSeconds: 0 });
  const [error, setError] = useState<string | null>(null);

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

  const buildHistory = (): Content[] => {
    const history: Content[] = [];
    messages.slice(-6).forEach((message) => {
      const parts: Part[] = message.parts.map((part) => ({
        text: part.content,
      }));
      history.push({
        role: message.sender === "user" ? "user" : "model",
        parts: parts,
      });
    });
    return history;
  };

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
      const model = genAI.getGenerativeModel({ model: settings.model });

      const promptParts: (string | Part)[] = [];

      for (const part of parts) {
        if (part.type === "text") {
          promptParts.push(part.content);
        } else if (part.content) {
          const response = await fetch(part.content);
          const blob = await response.blob();
          const file = new File([blob], part.fileName || "file", {
            type: part.mimeType,
          });
          const filePart = await fileToGenerativePart(file);
          promptParts.push(filePart);
        }
      }

      const result = await model.generateContentStream(promptParts);

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

  const handlePlayAudio = (url: string) => {
    setPlayingUrl(url);
    setIsPlaying(true);
    setIsLoading(true);
    setVideoTitle("Loading...");
    setProgress({ playedSeconds: 0 });
  };
  const handleTogglePlay = () =>
    playingUrl ? setIsPlaying(!isPlaying) : setIsMusicModalOpen(true);
  const handlePlayerReady = (player: any) => {
    try {
      setVideoDuration(player.getDuration());
      const internalPlayer = player.getInternalPlayer();
      const title =
        internalPlayer?.videoTitle || internalPlayer?.title || "Unknown Title";
      setVideoTitle(title);
      setIsLoading(false);
    } catch (e) {
      setVideoTitle("Unknown Title");
      setIsLoading(false);
    }
  };

  const handleClearTerminal = () => {
    setMessages([initialWelcomeMessage]);
    setHasShownWelcome(true);
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
        {/* --- PERUBAHAN UTAMA ADA DI BARIS INI --- */}
        <main className="flex-1 flex flex-col overflow-y-auto pt-16">
          {settings.isTerminalMode ? (
            <TerminalMode
              messages={messages}
              onSendMessage={(text) =>
                handleSendMessage([{ type: "text", content: text }])
              }
              onClearTerminal={handleClearTerminal}
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
        isLoaded={!!playingUrl}
        title={videoTitle}
        duration={videoDuration}
        progress={progress.playedSeconds}
        onTogglePlay={handleTogglePlay}
        onOpenModal={() => setIsMusicModalOpen(true)}
      />

      <MusicPlayerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onPlay={handlePlayAudio}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        onClearChat={() => {
          setMessages([initialWelcomeMessage]);
          setHasShownWelcome(true);
        }}
      />

      {playingUrl && (
        <div style={{ display: "none" }}>
          <ReactPlayer
            url={playingUrl}
            playing={isPlaying}
            onReady={handlePlayerReady}
            onProgress={setProgress}
            onError={(e) => {
              console.error("Player Error:", e);
              setError(
                "Failed to play audio. The link might be invalid or restricted."
              );
            }}
            onEnded={() => {
              setPlayingUrl(null);
              setIsPlaying(false);
            }}
            config={{
              youtube: {
                playerVars: {
                  origin: window.location.origin,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
