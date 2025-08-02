// src/components/LivePreview.tsx

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Maximize, Minimize } from "lucide-react";

interface LivePreviewProps {
  code: string;
  language: string;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  isStreaming: boolean; // Prop baru untuk indikator streaming
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
      return (
        <div style={{ overflow: "auto", height: "100%" }}>
          <SyntaxHighlighter
            language={language}
            style={darcula}
            showLineNumbers
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }
  };

  return (
    <div
      className={`
      flex flex-col rounded-lg shadow-xl overflow-hidden
      ${
        isFullScreen
          ? "fixed inset-0 z-[100] bg-gray-900" // Gaya full screen
          : "h-full bg-gray-800" // Gaya normal
      }
    `}
    >
      {/* Header Live Preview */}
      <div
        className={`
        flex items-center justify-between p-3 border-b border-cyan-500/30
        ${isFullScreen ? "bg-gray-800" : "bg-gray-800"} 
      `}
      >
        <h3 className="text-lg font-bold text-white">Live Preview</h3>
        <button
          onClick={onToggleFullScreen}
          className="p-1 rounded-full text-cyan-400 hover:bg-gray-700 transition-colors"
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </div>

      {/* Area Pratinjau Kode */}
      <div className="preview-canvas flex-1 p-2 overflow-auto relative">
        {" "}
        {/* Tambahkan relative */}
        {getPreviewOutput()}
        {/* Indikator Pemrosesan (hanya tampil saat full screen dan streaming) */}
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
