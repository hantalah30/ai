import React, { useState } from "react";
import { Track } from "../types";
import {
  Play,
  Pause,
  X,
  SkipBack,
  SkipForward,
  Music,
  ListMusic,
  Trash2,
} from "lucide-react";

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlSubmit: (url: string) => void;
  playlist: Track[];
  activeTrackId?: string;
  isPlaying: boolean;
  onPlayTrackAtIndex: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onTogglePlay: () => void;
}

const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({
  isOpen,
  onClose,
  onUrlSubmit,
  playlist,
  activeTrackId,
  isPlaying,
  onPlayTrackAtIndex,
  onRemoveTrack,
  onPlayNext,
  onPlayPrevious,
  onTogglePlay,
}) => {
  const [url, setUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // Panggil onUrlSubmit untuk memulai proses inspeksi judul
      onUrlSubmit(url);
      setUrl(""); // Kosongkan input setelah submit
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/20 w-full max-w-lg p-6 relative m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 font-mono">
          <Music className="text-cyan-400" />
          Music Player
        </h2>

        {/* Form sekarang hanya membutuhkan URL */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="space-y-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube URL to fetch title automatically"
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 p-2 bg-cyan-600 text-white font-bold rounded hover:bg-cyan-500 transition-colors"
          >
            Add to Queue
          </button>
        </form>

        {/* Tampilan Playlist */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2 font-mono mb-3">
            <ListMusic className="text-cyan-400" />
            Playlist
          </h3>
          {playlist.length > 0 ? (
            playlist.map((track, index) => (
              <div
                key={track.id}
                onClick={() => onPlayTrackAtIndex(index)}
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                  track.id === activeTrackId
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "hover:bg-gray-800/60"
                }`}
              >
                <div className="flex items-center gap-4 truncate">
                  {track.id === activeTrackId && isPlaying ? (
                    <Play
                      size={16}
                      className="text-cyan-400 animate-pulse flex-shrink-0"
                    />
                  ) : (
                    <Music
                      size={16}
                      className="text-gray-500 group-hover:text-cyan-400 flex-shrink-0"
                    />
                  )}
                  <span className="truncate">{track.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTrack(track.id);
                  }}
                  className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={`Remove ${track.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Playlist is empty. Add a song to start.
            </p>
          )}
        </div>

        {/* Kontrol Player */}
        {playlist.length > 0 && (
          <div className="mt-6 flex justify-center items-center gap-6">
            <button
              onClick={onPlayPrevious}
              className="text-gray-400 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack size={28} />
            </button>
            <button
              onClick={onTogglePlay}
              className="text-white bg-cyan-600 rounded-full p-4 hover:bg-cyan-500 shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-110"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={32} className="translate-x-0" />
              ) : (
                <Play size={32} className="translate-x-0.5" />
              )}
            </button>
            <button
              onClick={onPlayNext}
              className="text-gray-400 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward size={28} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayerModal;
