import React from "react";
import { Bot, Zap } from "lucide-react";

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start space-x-3 max-w-3xl">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/50 flex items-center justify-center">
          <Bot className="h-4 w-4 text-cyan-400" />
        </div>

        {/* Pesan "Berpikir" */}
        <div className="relative px-4 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-cyan-400/30 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-mono">
            <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
            <span>Processing...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Menambahkan keyframes untuk animasi fade-in sederhana
const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
`;

// Menyuntikkan style ke dalam head dokumen
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ThinkingIndicator;
