// src/components/ChatHistoryModal.tsx

import React, { useState } from "react";
import { X, PlusCircle, Trash2, FolderOpen, Edit, Check } from "lucide-react";
import { ChatSession } from "../types";

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onLoadChat: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (sessionId: string) => void;
  onRenameChat: (sessionId: string, newTitle: string) => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onLoadChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  if (!isOpen) return null;

  const handleEditClick = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setNewTitle(session.title);
  };

  const handleSaveTitle = (sessionId: string) => {
    if (
      newTitle.trim() !== "" &&
      newTitle.trim() !== sessions.find((s) => s.id === sessionId)?.title
    ) {
      onRenameChat(sessionId, newTitle.trim());
    }
    setEditingSessionId(null);
    setNewTitle("");
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    sessionId: string
  ) => {
    if (e.key === "Enter") {
      handleSaveTitle(sessionId);
    }
    if (e.key === "Escape") {
      setEditingSessionId(null);
      setNewTitle("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl flex flex-col w-full max-w-xl h-5/6">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <h2 className="text-xl font-bold text-white">Chat History</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Start New Chat"
            >
              <PlusCircle size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Close History"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Daftar Sesi Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No chat sessions found. Start a new chat!
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                  session.id === currentSessionId
                    ? "bg-purple-700/50 border border-purple-500 text-white"
                    : "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                <div className="flex-1 flex flex-col mr-4 overflow-hidden">
                  {editingSessionId === session.id ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => handleSaveTitle(session.id)} // Simpan saat blur
                      onKeyDown={(e) => handleKeyPress(e, session.id)}
                      className="bg-gray-600 text-white p-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="font-semibold truncate cursor-pointer hover:underline"
                      onClick={() => onLoadChat(session.id)} // Klik untuk memuat
                    >
                      {session.title}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {session.messages.length -
                      (session.messages[0].id === "welcome" ? 1 : 0)}{" "}
                    messages
                    <br />
                    Last updated:{" "}
                    {new Date(session.lastUpdated).toLocaleString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {editingSessionId === session.id ? (
                    <button
                      onClick={() => handleSaveTitle(session.id)}
                      className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                      title="Save Title"
                    >
                      <Check size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(session)}
                      className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title="Edit Title"
                    >
                      <Edit size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => onLoadChat(session.id)}
                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    title="Load Chat"
                  >
                    <FolderOpen size={20} />
                  </button>
                  <button
                    onClick={() => onDeleteChat(session.id)}
                    className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    title="Delete Chat"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;
