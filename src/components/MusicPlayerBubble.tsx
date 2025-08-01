import React, { useState, useEffect, useRef, useCallback } from "react";
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

// Fungsi untuk format waktu
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

// Fungsi Linear Interpolation (Lerp) untuk efek pergerakan yang mulus
const lerp = (start: number, end: number, amount: number) => {
  return (1 - amount) * start + amount * end;
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

  // State untuk posisi akhir bubble (disimpan setelah drag selesai)
  // Ini adalah offset dari kanan dan bawah viewport
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs untuk menyimpan posisi secara real-time untuk kalkulasi drag
  const dragStartX = useRef(0); // clientX saat drag dimulai
  const dragStartY = useRef(0); // clientY saat drag dimulai
  const bubbleStartOffset = useRef({ x: 0, y: 0 }); // offset (right, bottom) bubble saat drag dimulai

  // Posisi target (mengikuti kursor, akan di-clamp ke batas layar)
  const targetPosition = useRef({ x: 20, y: 20 });
  // Posisi bubble yang dirender (mengejar target dengan lerp)
  const currentPosition = useRef({ x: 20, y: 20 });

  // Flag untuk membedakan click dan drag
  const didMoveSignificantly = useRef(false);

  // Efek untuk auto-expand/collapse berdasarkan status musik
  useEffect(() => {
    if (isLoaded) {
      setIsExpanded(isPlaying);
    } else {
      setIsExpanded(false); // Jika belum ada musik, selalu ciut
    }
  }, [isPlaying, isLoaded]);

  // Callback untuk menangkap posisi kursor dan memperbarui posisi target
  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      // PENTING: Mencegah scroll halaman saat di perangkat sentuh
      // Ini adalah kunci untuk masalah yang Anda alami
      if ("touches" in e) {
        e.preventDefault();
      }

      if (!bubbleRef.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      // Hitung pergeseran kursor dari titik awal drag
      const deltaX = clientX - dragStartX.current;
      const deltaY = clientY - dragStartY.current;

      // Hitung posisi target baru berdasarkan posisi awal bubble dan pergeseran kursor
      // Perhatikan tanda minus karena 'right' dan 'bottom' offset berkurang saat bubble bergerak ke kanan/bawah
      let newTargetX = bubbleStartOffset.current.x - deltaX;
      let newTargetY = bubbleStartOffset.current.y - deltaY;

      // ---- Batasan Gerak (Clamp to Viewport) ----
      const bubbleWidth = bubbleRef.current.offsetWidth;
      const bubbleHeight = bubbleRef.current.offsetHeight;

      // Offset 'right' tidak boleh kurang dari 0 (sampai di ujung kanan)
      // dan tidak boleh lebih dari (lebar viewport - lebar bubble) (sampai di ujung kiri)
      const maxRightOffset = window.innerWidth - bubbleWidth;
      newTargetX = Math.max(0, Math.min(newTargetX, maxRightOffset));

      // Offset 'bottom' tidak boleh kurang dari 0 (sampai di ujung bawah)
      // dan tidak boleh lebih dari (tinggi viewport - tinggi bubble) (sampai di ujung atas)
      const maxBottomOffset = window.innerHeight - bubbleHeight;
      newTargetY = Math.max(0, Math.min(newTargetY, maxBottomOffset));

      targetPosition.current.x = newTargetX;
      targetPosition.current.y = newTargetY;

      // Tandai bahwa ada pergerakan signifikan (untuk membedakan click dari drag)
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        didMoveSignificantly.current = true;
      }
    },
    [] // Dependencies kosong karena refs diakses langsung, tidak perlu re-render
  );

  // Effect utama untuk animasi dan event listener
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (!bubbleRef.current) return;

      // Menggunakan Lerp untuk memperhalus pergerakan
      // currentPosition akan bergerak 10% dari jarak menuju targetPosition setiap frame
      currentPosition.current.x = lerp(
        currentPosition.current.x,
        targetPosition.current.x,
        0.15 // Sedikit lebih cepat dari 0.1 agar terasa lebih responsif
      );
      currentPosition.current.y = lerp(
        currentPosition.current.y,
        targetPosition.current.y,
        0.15
      );

      // Menerapkan posisi yang sudah dihaluskan ke style bubble
      bubbleRef.current.style.right = `${currentPosition.current.x}px`;
      bubbleRef.current.style.bottom = `${currentPosition.current.y}px`;

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleRelease = () => {
      if (!isDragging) return;
      setIsDragging(false);
      // Simpan posisi terakhir yang di-render (sudah di-lerp) ke state React
      setPosition(currentPosition.current);

      // Hapus event listener
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchend", handleRelease);
      cancelAnimationFrame(animationFrameId); // Hentikan animasi
    };

    if (isDragging) {
      // Sinkronkan posisi awal bubble dan mouse saat drag dimulai
      // agar tidak ada lompatan saat animasi dimulai
      currentPosition.current = position;
      targetPosition.current = position;

      // Mulai loop animasi
      animationFrameId = requestAnimationFrame(animate);

      // Tambahkan event listener
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("touchmove", handleMove, { passive: false }); // <-- PENTING: Tambahkan { passive: false }
      window.addEventListener("mouseup", handleRelease);
      window.addEventListener("touchend", handleRelease);
    }

    // Cleanup function: penting untuk menghapus listener saat komponen unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchend", handleRelease);
    };
  }, [isDragging, handleMove, position]); // 'position' ditambahkan karena 'handleRelease' menggunakannya

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Jangan memulai drag jika klik berasal dari tombol kontrol di dalam bubble
    if ((e.target as HTMLElement).closest(".control-button")) {
      e.stopPropagation(); // Mencegah drag dari tombol
      return;
    }

    setIsDragging(true);
    didMoveSignificantly.current = false; // Reset flag pergerakan

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartX.current = clientX;
    dragStartY.current = clientY;
    bubbleStartOffset.current = { x: position.x, y: position.y };

    // Mencegah pemilihan teks saat drag (dan scroll jika ini touch event)
    e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent) => {
    // Jangan proses klik jika ada pergerakan drag yang signifikan
    if (didMoveSignificantly.current) {
      return;
    }

    // Jangan proses klik jika target adalah tombol kontrol (sudah ditangani oleh tombol itu sendiri)
    if ((e.target as HTMLElement).closest(".control-button")) {
      return;
    }

    if (!isLoaded) {
      onOpenModal();
      return;
    }

    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      // Jika sudah mengembang, klik akan membuka modal
      onOpenModal();
    }
  };

  return (
    <div
      ref={bubbleRef}
      // Set posisi awal menggunakan state 'position'
      style={{ bottom: `${position.y}px`, right: `${position.x}px` }}
      className={`group fixed z-50 flex items-center select-none cursor-grab
        bg-gray-900/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-cyan-500/10
        transition-[width,height,border-radius] duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]
        hover:shadow-xl hover:shadow-cyan-500/20
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
      <div className="flex items-center justify-between w-full h-full px-3 pointer-events-none">
        {/* Ikon Musik/Loading */}
        <div
          className={`flex-shrink-0 text-white transition-transform duration-500 ${
            isLoaded && isPlaying ? "animate-spin-slow" : ""
          }`}
        >
          {isLoaded && isLoading ? (
            <Loader className="h-6 w-6 animate-spin" />
          ) : (
            <Music className="h-6 w-6" />
          )}
        </div>

        {/* Info Lagu */}
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

        {/* Tombol Play/Pause */}
        {isLoaded && (
          <div
            // Pastikan tombol bisa diklik, bukan bagian dari area drag
            className={`control-button flex-shrink-0 transition-all duration-300 pointer-events-auto ${
              isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // Sangat penting untuk mencegah trigger handleClick/onDragStart
                onTogglePlay();
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-white" />
              ) : (
                <Play className="h-5 w-5 fill-white" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayerBubble;
