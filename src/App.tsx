import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";
import TerminalMode from "./components/TerminalMode";
import DataStream from "./components/DataStream";
import { Message, FileUpload } from "./types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// PERINGATAN: Kunci API ini seharusnya tidak diekspos di sisi klien.
// Gunakan variabel lingkungan atau backend proxy untuk keamanan.
const API_KEY = "AIzaSyAQMDd0Ts64TNUTLuiTrBNMWmWF217RUFk";

const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to CyberAI. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);

  useEffect(() => {
    // Logika untuk suara ambient atau inisialisasi audio bisa diletakkan di sini
  }, []);

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

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro", // Mempertahankan model sesuai permintaan
      });

      // Perbaikan: `generateContentStream` mengembalikan objek, kita butuh properti `.stream`
      const result = await model.generateContentStream(content);
      const stream = result.stream;

      let accumulatedText = "";
      for await (const chunk of stream) {
        // Pastikan chunk dan text() ada sebelum diakses
        const chunkText = chunk.text ? chunk.text() : "";
        accumulatedText += chunkText;

        setMessages((currentMessages) => {
          const newMessages = [...currentMessages];
          const aiMessageIndex = newMessages.findIndex(
            (msg) => msg.id === aiMessagePlaceholder.id
          );
          if (aiMessageIndex !== -1) {
            newMessages[aiMessageIndex].content = accumulatedText;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";

      setMessages((currentMessages) => {
        const newMessages = [...currentMessages];
        const aiMessageIndex = newMessages.findIndex(
          (msg) => msg.id === aiMessagePlaceholder.id
        );
        if (aiMessageIndex !== -1) {
          newMessages[
            aiMessageIndex
          ].content = `Sorry, there was an error connecting to the neural network. Please check the browser console (F12) for more details.\n\n**Error:** \`${errorMessage}\``;
        }
        return newMessages;
      });
    }
  };

  const handleFileUpload = (files: FileUpload[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleUpdateMessage = (id: string, newContent: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, content: newContent } : msg
      )
    );
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
            />
          )}
        </main>
      </div>
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-10">
        <div className="glitch-overlay"></div>
      </div>
    </div>
  );
}

export default App;
