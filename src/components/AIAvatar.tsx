import React, { useState, useEffect } from 'react';
import { Brain, Cpu } from 'lucide-react';

const AIAvatar: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Holographic Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-spin-slow"></div>
      <div className="absolute inset-2 rounded-full border border-purple-400/40 animate-spin-reverse"></div>
      
      {/* Avatar Container */}
      <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/20 via-purple-500/20 to-pink-400/20 backdrop-blur-sm border transition-all duration-1000 ${
        isActive ? 'border-cyan-400 shadow-cyan-400/50 shadow-2xl' : 'border-purple-400/50'
      }`}>
        
        {/* AI Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isActive ? (
            <Brain className="h-6 w-6 text-cyan-400 animate-pulse" />
          ) : (
            <Cpu className="h-6 w-6 text-purple-400" />
          )}
        </div>

        {/* Energy Particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
              style={{
                top: `${20 + Math.sin(i * 60) * 15}%`,
                left: `${50 + Math.cos(i * 60) * 15}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>

        {/* Glitch Effect */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/10 to-purple-400/10 ${
          isActive ? 'animate-glitch' : ''
        }`}></div>
      </div>

      {/* Data Flow */}
      <div className="absolute -inset-4">
        <div className="h-full w-full rounded-full border border-dashed border-green-400/20 animate-spin-slow"></div>
      </div>
    </div>
  );
};

export default AIAvatar;