import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, Loader } from "lucide-react";

interface MusicPlayerBubbleProps {
  isPlaying: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  title: string;
  duration: number;
  progress: number;
  onTogglePlay: () => void;
  onOpenModal: () => void;
}

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const MusicPlayerBubble: React.FC<MusicPlayerBubbleProps> = ({
  isPlaying,
  isLoading,
  isLoaded,
  title,
  duration,
  progress,
  onTogglePlay,
  onOpenModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragMovement = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Hanya atur status expand/collapse jika ada lagu yang dimuat
    if (isLoaded) {
      if (isPlaying) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    } else {
      // Jika tidak ada lagu, pastikan bubble dalam keadaan 'unloaded' (mengecil)
      setIsExpanded(false);
    }
  }, [isPlaying, isLoaded]);

  // Logika Drag (tidak ada perubahan)
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !bubbleRef.current) return;
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragMovement.current.x = clientX - dragStartPos.current.x;
      dragMovement.current.y = clientY - dragStartPos.current.y;
      const newX = position.x - dragMovement.current.x;
      const newY = position.y - dragMovement.current.y;
      bubbleRef.current.style.right = `${newX}px`;
      bubbleRef.current.style.bottom = `${newY}px`;
    };
    const handleRelease = () => {
      if (!isDragging) return;
      setIsDragging(false);
      setPosition((prev) => ({
        x: prev.x - dragMovement.current.x,
        y: prev.y - dragMovement.current.y,
      }));
      dragMovement.current = { x: 0, y: 0 };
    };
    if (isDragging) {
      window.addEventListener("mousemove", handleMove, { passive: false });
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("mouseup", handleRelease);
      window.addEventListener("touchend", handleRelease);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchend", handleRelease);
    };
  }, [isDragging, position.x, position.y]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".control-button")) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: "touches" in e ? e.touches[0].clientX : e.clientX,
      y: "touches" in e ? e.touches[0].clientY : e.clientY,
    };
    dragMovement.current = { x: 0, y: 0 };
  };

  // --- PERBAIKAN UTAMA: Logika Klik yang menangani semua kondisi ---
  const handleClick = (e: React.MouseEvent) => {
    if (
      Math.abs(dragMovement.current.x) > 5 ||
      Math.abs(dragMovement.current.y) > 5
    )
      return;
    if ((e.target as HTMLElement).closest(".control-button")) return;

    // Jika TIDAK ADA lagu di playlist, klik akan selalu membuka modal.
    if (!isLoaded) {
      onOpenModal();
      return;
    }

    // Jika ADA lagu, dan bubble sedang mengecil, klik akan memanjangkannya.
    if (!isExpanded) {
      setIsExpanded(true);
    }
    // Jika sudah memanjang, klik akan membuka modal (seperti di iOS).
    else {
      onOpenModal();
    }
  };

  // --- PERBAIKAN UTAMA: Bubble sekarang SELALU di-render ---
  // Logika `if (!isLoaded) return null` telah dihapus.

  return (
    <div
      ref={bubbleRef}
      style={{ bottom: `${position.y}px`, right: `${position.y}px` }}
      className={`group fixed z-50 flex items-center select-none cursor-grab
        bg-gray-900/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-cyan-500/10
        transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]
        ${
          isExpanded
            ? "w-60 h-16 rounded-2xl"
            : "w-14 h-14 rounded-full justify-center"
        }
        ${isDragging ? "cursor-grabbing scale-105" : ""}`}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onClick={handleClick}
      onDoubleClick={onOpenModal}
      title={
        isLoaded
          ? isExpanded
            ? "Click to open playlist"
            : "Click to expand"
          : "Click to open music player"
      }
    >
      <div className="flex items-center justify-between w-full h-full px-3">
        {/* Ikon Musik/Loading */}
        <div
          className={`flex-shrink-0 text-white ${
            isLoaded && isPlaying ? "animate-spin-slow" : ""
          }`}
        >
          {isLoaded && isLoading ? (
            <Loader className="h-6 w-6 animate-spin" />
          ) : (
            <Music className="h-6 w-6" />
          )}
        </div>

        {/* Info Lagu (hanya terlihat saat expanded) */}
        {isLoaded && (
          <div
            className={`flex-grow text-center text-white overflow-hidden whitespace-nowrap px-2 transition-opacity duration-300
              ${isExpanded ? "opacity-100" : "opacity-0"}`}
          >
            <p className="text-sm font-medium truncate">{title}</p>
            <p className="text-xs text-white/60">
              {formatTime(progress)} / {formatTime(duration)}
            </p>
          </div>
        )}

        {/* Tombol Play/Pause (hanya terlihat saat expanded) */}
        {isLoaded && (
          <div
            className={`control-button flex-shrink-0 transition-all duration-300 ${
              isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayerBubble;
