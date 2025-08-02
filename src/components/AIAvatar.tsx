// src/components/AIAvatar.tsx

import React from "react"; // Hapus useState dan useEffect karena state isActive akan datang dari prop
import { Brain, Cpu } from "lucide-react";

interface AIAvatarProps {
  isStreaming?: boolean; // Tambahkan prop ini
}

const AIAvatar: React.FC<AIAvatarProps> = ({ isStreaming = false }) => {
  // Default ke false jika tidak disediakan
  return (
    <div className="relative w-12 h-12">
      {" "}
      {/* Tambahkan width dan height agar prop inset bekerja */}
      {/* Holographic Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-spin-slow"></div>
      <div className="absolute inset-2 rounded-full border border-purple-400/40 animate-spin-reverse"></div>
      {/* Avatar Container */}
      <div
        className={`relative w-full h-full rounded-full bg-gradient-to-br from-cyan-400/20 via-purple-500/20 to-pink-400/20 backdrop-blur-sm border transition-all duration-300 ${
          // Durasi transisi lebih pendek
          isStreaming
            ? "border-cyan-400 shadow-cyan-400/50 shadow-2xl scale-105" // Sedikit membesar saat aktif
            : "border-purple-400/50 scale-100"
        }`}
      >
        {/* AI Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isStreaming ? (
            <Brain className="h-6 w-6 text-cyan-400 animate-pulse" /> // Berdenyut saat streaming
          ) : (
            <Cpu className="h-6 w-6 text-purple-400" /> // CPU saat idle
          )}
        </div>

        {/* Energy Particles (lebih banyak dan lebih halus saat streaming) */}
        <div className="absolute inset-0">
          {[...Array(isStreaming ? 10 : 4)].map(
            (
              _,
              i // Lebih banyak partikel saat streaming
            ) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-cyan-400 rounded-full ${
                  isStreaming ? "animate-ping-faster" : "animate-ping-slow" // Animasi lebih cepat saat streaming
                }`}
                style={{
                  top: `${20 + Math.sin(i * 60) * 15}%`,
                  left: `${50 + Math.cos(i * 60) * 15}%`,
                  animationDelay: `${i * 100}ms`, // Delay lebih pendek saat streaming
                  animationDuration: isStreaming ? "1.5s" : "2.5s",
                  opacity: isStreaming ? 0.8 : 0.6,
                }}
              />
            )
          )}
        </div>

        {/* Glitch Effect (lebih sering/jelas saat streaming) */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/10 to-purple-400/10 ${
            isStreaming ? "animate-glitch-active" : "animate-glitch-idle" // Animasi glitch yang berbeda
          }`}
        ></div>
      </div>
      {/* Data Flow */}
      <div className="absolute -inset-4">
        <div className="h-full w-full rounded-full border border-dashed border-green-400/20 animate-spin-slow"></div>
      </div>
    </div>
  );
};

export default AIAvatar;
