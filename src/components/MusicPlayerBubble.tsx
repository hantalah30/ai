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
  const isExpanded = isLoaded || isLoading;
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Adjusted for mobile
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !bubbleRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - dragStartPos.current.x;
      const dy = clientY - dragStartPos.current.y;

      const newX = position.x - dx;
      const newY = position.y - dy;

      bubbleRef.current.style.right = `${newX}px`;
      bubbleRef.current.style.bottom = `${newY}px`;
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      const clientX =
        "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY =
        "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;

      const dx = clientX - dragStartPos.current.x;
      const dy = clientY - dragStartPos.current.y;
      setPosition((prev) => ({ x: prev.x - dx, y: prev.y - dy }));
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, position.x, position.y]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".control-button")) return;
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX, y: clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    const wasDragged =
      Math.abs(e.clientX - dragStartPos.current.x) > 5 ||
      Math.abs(e.clientY - dragStartPos.current.y) > 5;
    if (wasDragged && isDragging) return;

    const target = e.target as HTMLElement;
    if (target.closest(".control-button")) return;

    if (isLoaded) onTogglePlay();
    else onOpenModal();
  };

  return (
    <div
      ref={bubbleRef}
      style={{ bottom: `${position.y}px`, right: `${position.x}px` }}
      className={`group fixed z-50 flex items-center justify-center cursor-grab overflow-hidden select-none
                 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl
                 transition-all duration-400 cubic-bezier(0.68, -0.55, 0.27, 1.55)
                 ${
                   isExpanded
                     ? "w-52 sm:w-60 h-14 rounded-2xl"
                     : "w-12 h-12 rounded-full"
                 }
                 ${
                   isDragging
                     ? "cursor-grabbing scale-105 shadow-purple-500/20"
                     : ""
                 }`}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between w-full h-full px-3">
        <div
          className={`flex-shrink-0 ${isPlaying ? "animate-spin-slow" : ""}`}
        >
          {isLoading ? (
            <Loader className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Music className="h-6 w-6 text-white" />
          )}
        </div>

        <div
          className={`flex-grow text-center text-white overflow-hidden whitespace-nowrap px-2
                        transition-opacity duration-300 ${
                          isExpanded ? "opacity-100" : "opacity-0"
                        }`}
        >
          <p className="text-xs sm:text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-white/60">
            {formatTime(progress)} / {formatTime(duration)}
          </p>
        </div>

        <div
          className={`flex-shrink-0 transition-all duration-300
                        ${
                          isExpanded
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-50"
                        }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerBubble;
