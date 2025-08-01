import React, { useState } from "react";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";
import TerminalMode from "./components/TerminalMode";
import DataStream from "./components/DataStream";
import MusicPlayerBubble from "./components/MusicPlayerBubble";
import MusicPlayerModal from "./components/MusicPlayerModal";
import { Message, FileUpload } from "./types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactPlayer from "react-player/youtube";

const API_KEY = "AIzaSyAQMDd0Ts64TNUTLuiTrBNMWmWF217RUFk";
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to HAWAI. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Music Player State
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [progress, setProgress] = useState({ playedSeconds: 0 });

  const handleSendMessage = async (content: string, files?: FileUpload[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      files,
    };
    const aiMessagePlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      sender: "ai",
      timestamp: new Date(),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      aiMessagePlaceholder,
    ]);
    setIsStreaming(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
      });
      const result = await model.generateContentStream(content);
      const stream = result.stream;

      let accumulatedText = "";
      let lastUpdateTime = 0;
      const updateInterval = 50;

      for await (const chunk of stream) {
        const chunkText = chunk.text ? chunk.text() : "";
        accumulatedText += chunkText;
        const now = Date.now();
        if (now - lastUpdateTime > updateInterval) {
          setMessages((current) => {
            const newMessages = [...current];
            const idx = newMessages.findIndex(
              (m) => m.id === aiMessagePlaceholder.id
            );
            if (idx !== -1) newMessages[idx].content = accumulatedText;
            return newMessages;
          });
          lastUpdateTime = now;
        }
      }

      setMessages((current) => {
        const newMessages = [...current];
        const idx = newMessages.findIndex(
          (m) => m.id === aiMessagePlaceholder.id
        );
        if (idx !== -1) newMessages[idx].content = accumulatedText;
        return newMessages;
      });
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages((current) => {
        const newMessages = [...current];
        const idx = newMessages.findIndex(
          (m) => m.id === aiMessagePlaceholder.id
        );
        if (idx !== -1)
          newMessages[idx].content = `**Error:** \`${errorMessage}\``;
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFileUpload = (files: FileUpload[]) =>
    setUploadedFiles((prev) => [...prev, ...files]);
  const handleUpdateMessage = (id: string, newContent: string) =>
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, content: newContent } : msg
      )
    );

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
      setVideoTitle(player.player.player.videoTitle);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to get player details:", error);
      setVideoTitle("Unknown Title");
      setIsLoading(false);
    }
  };

  const handlePlayerError = (error: any) => {
    console.error("ReactPlayer Error:", error);
    setPlayingUrl(null);
    setIsPlaying(false);
    setIsLoading(false);
    const errorMessage: Message = {
      id: Date.now().toString(),
      content: `❌ Failed to play audio.`,
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((current) => [...current, errorMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20"></div>
      <DataStream />
      <div className="fixed inset-0 pointer-events-none">
        <div className="h-full w-full opacity-5 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
      </div>
      <div className="relative z-10 flex flex-col h-screen">
        <Header
          isTerminalMode={isTerminalMode}
          onToggleTerminal={() => setIsTerminalMode(!isTerminalMode)}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">
          {isTerminalMode ? (
            <TerminalMode
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              onUpdateMessage={handleUpdateMessage}
              isStreaming={isStreaming}
            />
          )}
        </main>
      </div>
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-10">
        <div className="glitch-overlay"></div>
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

      {playingUrl && (
        <div style={{ display: "none" }}>
          <ReactPlayer
            url={playingUrl}
            playing={isPlaying}
            onReady={handlePlayerReady}
            onProgress={setProgress}
            width="0"
            height="0"
            controls={false}
            onEnded={() => {
              setPlayingUrl(null);
              setIsPlaying(false);
            }}
            onError={handlePlayerError}
          />
        </div>
      )}
    </div>
  );
}

export default App;
