import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";
import TerminalMode from "./components/TerminalMode";
import DataStream from "./components/DataStream";
import { Message, FileUpload } from "./types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// PERINGATAN: Sangat disarankan untuk memindahkan kunci ini ke lingkungan sisi server
// atau gunakan metode yang aman untuk menanganinya, daripada menampilkannya di kode sisi klien.
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
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);

  useEffect(() => {
    // Add ambient cyberpunk background sounds would go here
    // Also initialize any audio context for UI sounds
  }, []);

  const handleSendMessage = async (content: string, files?: FileUpload[]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      files,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Mencoba menggunakan model 'gemini-2.5-pro' sesuai permintaan
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(content);
      const response = await result.response;
      const text = response.text();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      // Log kesalahan penuh untuk debugging yang lebih baik
      console.error("Gemini API Error:", error);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I am having trouble connecting to the neural network. Please check the console for errors and ensure your API key and selected model are configured correctly in your Google Cloud project.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (files: FileUpload[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  return (
    // overflow-hidden dihapus dari div ini untuk memungkinkan scroll
    <div className="min-h-screen bg-gray-900 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20"></div>

      {/* Data Stream Background */}
      <DataStream />

      {/* Scan Lines Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="h-full w-full opacity-5 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-screen">
        <Header
          isTerminalMode={isTerminalMode}
          onToggleTerminal={() => setIsTerminalMode(!isTerminalMode)}
        />

        <main className="flex-1 flex flex-col overflow-y-auto">
          {" "}
          {/* overflow-y-auto ditambahkan untuk memastikan main area bisa di-scroll jika perlu */}
          {isTerminalMode ? (
            <TerminalMode
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          ) : (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              isTyping={isTyping}
              uploadedFiles={uploadedFiles}
            />
          )}
        </main>
      </div>

      {/* Glitch Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-10">
        <div className="glitch-overlay"></div>
      </div>
    </div>
  );
}

export default App;
