import React, { useState } from "react";
import { X, Youtube, Play } from "lucide-react";

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: (url: string) => void;
}

const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  const [url, setUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onPlay(url);
      setUrl("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 border border-purple-400/30 rounded-2xl w-full max-w-md backdrop-blur-sm transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex items-center justify-between p-6 border-b border-purple-400/20">
          <div className="flex items-center space-x-3">
            <Youtube className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-purple-400 font-mono">
              Play YouTube Audio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
              YouTube URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100 font-mono focus:border-purple-400/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!url.trim()}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg font-mono transition-all duration-200 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5 mr-2" />
            Play Audio
          </button>
        </form>
      </div>
    </div>
  );
};

export default MusicPlayerModal;
