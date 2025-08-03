// src/components/LivePreview.tsx

import React from "react";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Maximize, Minimize } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

interface LivePreviewProps {
  code: string;
  language: string;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  isStreaming: boolean;
}

const LivePreview: React.FC<LivePreviewProps> = ({
  code,
  language,
  isFullScreen,
  onToggleFullScreen,
  isStreaming,
}) => {
  const getPreviewOutput = () => {
    if (language === "html") {
      // Untuk HTML di iframe:
      // Catatan: Scrollbar di dalam iframe TIDAK DAPAT ditata gaya dari CSS halaman utama karena batasan browser.
      // Scrollbar yang Anda lihat di sini adalah scrollbar bawaan iframe.
      return (
        <iframe
          srcDoc={code}
          title="Live HTML Preview"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor: "#1e1e1e",
          }}
        />
      );
    } else {
      // Untuk bahasa lain dengan SyntaxHighlighter:
      // Kelas custom-scrollbar akan diterapkan ke elemen <pre> internal yang dapat digulir.
      return (
        <SyntaxHighlighter
          language={language}
          style={darcula}
          showLineNumbers
          // HAPUS wrapLines={true} agar scrollbar horizontal muncul untuk baris panjang
          customStyle={{ height: "100%", width: "100%", overflow: "auto" }}
          preTagProps={{
            className: "custom-scrollbar",
            style: { overflow: "auto" },
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }
  };

  return (
    <div
      className={`
      flex flex-col rounded-lg shadow-xl overflow-hidden
      ${
        isFullScreen
          ? "fixed inset-0 z-[100] bg-gray-900"
          : "h-full bg-gray-800"
      }
    `}
    >
      <div
        className={`
        flex items-center justify-between p-3 border-b border-cyan-500/30
        ${isFullScreen ? "bg-gray-800" : "bg-gray-800"} 
      `}
      >
        <h3 className="text-lg font-bold text-white">Live Preview</h3>
        <button
          onClick={onToggleFullScreen}
          className="p-1 rounded-full text-cyan-400 hover:bg-gray-700/50 transition-colors"
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </div>

      {/* Area Pratinjau Kode - custom-scrollbar akan bekerja di sini untuk non-HTML */}
      <div className="preview-canvas flex-1 p-2 relative overflow-auto custom-scrollbar">
        {getPreviewOutput()}

        {isFullScreen && isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm text-white text-xl font-bold animate-pulse z-[101]">
            AI is Processing...
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
