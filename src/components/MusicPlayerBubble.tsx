import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, Loader } from "lucide-react";
import "./MusicPlayerBubble.css";

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
  if (isNaN(timeInSeconds) || timeInSeconds === 0) return "0:00";
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
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !bubbleRef.current) return;

      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;

      const newX = position.x - dx;
      const newY = position.y - dy;

      bubbleRef.current.style.right = `${newX}px`;
      bubbleRef.current.style.bottom = `${newY}px`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      setPosition((prev) => ({ x: prev.x - dx, y: prev.y - dy }));
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".control-button")) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click event after dragging
    const wasDragged =
      Math.abs(e.clientX - dragStartPos.current.x) > 3 ||
      Math.abs(e.clientY - dragStartPos.current.y) > 3;
    if (wasDragged && isDragging) return;

    const target = e.target as HTMLElement;
    if (target.closest(".control-button")) return;

    if (isLoaded) {
      onTogglePlay();
    } else {
      onOpenModal();
    }
  };

  return (
    <div
      ref={bubbleRef}
      className={`group dynamic-island-container ${
        isExpanded ? "expanded" : ""
      } ${isDragging ? "dragging" : ""}`}
      style={{ bottom: `${position.y}px`, right: `${position.x}px` }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between w-full h-full px-3">
        <div className={`music-icon-wrapper ${isPlaying ? "spinning" : ""}`}>
          {isLoading ? (
            <Loader className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Music className="h-6 w-6 text-white" />
          )}
        </div>

        <div className="song-info">
          <p className="song-title">{title}</p>
          <p className="song-duration">
            {formatTime(progress)} / {formatTime(duration)}
          </p>
        </div>

        <div className="controls-wrapper">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="control-button"
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
