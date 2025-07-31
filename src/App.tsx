import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import TerminalMode from './components/TerminalMode';
import DataStream from './components/DataStream';
import { Message, FileUpload } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to CyberAI. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
    }
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
      sender: 'user',
      timestamp: new Date(),
      files
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I understand your request. Processing your input through my neural networks...',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleFileUpload = (files: FileUpload[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
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
        
        <main className="flex-1 flex flex-col overflow-hidden">
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