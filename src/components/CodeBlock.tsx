import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Edit3, Check, X, Save, Play } from "lucide-react";
import LivePreview from "./LivePreview";

// Props untuk komponen CodeBlock
interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  onCodeUpdate?: (newCode: string) => void;
  isEditable?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  filename,
  onCodeUpdate,
  isEditable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fungsi untuk menyalin kode ke clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedCode : code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset status setelah 2 detik
    } catch (err) {
      console.error("Gagal menyalin kode:", err);
    }
  };

  // Fungsi untuk menyimpan kode yang diedit
  const handleSave = () => {
    if (onCodeUpdate) {
      onCodeUpdate(editedCode);
    }
    setIsEditing(false);
  };

  // Fungsi untuk membatalkan mode edit
  const handleCancel = () => {
    setEditedCode(code); // Kembalikan ke kode asli
    setIsEditing(false);
  };

  // Fungsi untuk toggle live preview
  const handleRun = () => {
    setShowPreview(!showPreview);
  };

  // Helper untuk mendapatkan ikon bahasa pemrograman
  const getLanguageIcon = (lang: string) => {
    const langLower = lang.toLowerCase();
    if (["js", "javascript", "ts", "typescript"].includes(langLower))
      return "🟨";
    if (["py", "python"].includes(langLower)) return "🐍";
    if (["html", "xml"].includes(langLower)) return "🌐";
    if (["css", "scss", "sass"].includes(langLower)) return "🎨";
    return "📄";
  };

  // Komponen tombol kustom untuk konsistensi
  const ActionButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ onClick, title, children, className }) => (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-mono bg-gray-800/60 border border-gray-700/80 rounded-md text-gray-300 hover:text-white hover:border-cyan-400/70 transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative group bg-gray-900/90 border border-cyan-400/30 rounded-lg overflow-hidden backdrop-blur-sm my-4">
      {/* Header Block Kode */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-cyan-400/20">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getLanguageIcon(language)}</span>
          <span className="text-sm font-mono text-cyan-400">
            {language.toUpperCase()}
          </span>
          {filename && (
            <span className="text-sm font-mono text-gray-400">{filename}</span>
          )}
        </div>

        {/* Grup Tombol Aksi */}
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <ActionButton
                onClick={handleSave}
                title="Save changes"
                className="hover:border-green-500 hover:text-green-400"
              >
                <Save className="h-4 w-4" /> <span>Save</span>
              </ActionButton>
              <ActionButton
                onClick={handleCancel}
                title="Cancel editing"
                className="hover:border-red-500 hover:text-red-400"
              >
                <X className="h-4 w-4" /> <span>Cancel</span>
              </ActionButton>
            </>
          ) : (
            <>
              {isEditable && (
                <ActionButton
                  onClick={() => setIsEditing(true)}
                  title="Edit code"
                  className="hover:border-purple-500 hover:text-purple-400"
                >
                  <Edit3 className="h-4 w-4" /> <span>Edit</span>
                </ActionButton>
              )}
              <ActionButton
                onClick={handleRun}
                title="Run code"
                className={`hover:border-green-500 ${
                  showPreview
                    ? "text-green-400 border-green-500/80"
                    : "hover:text-green-400"
                }`}
              >
                <Play className="h-4 w-4" />{" "}
                <span>{showPreview ? "Close" : "Run"}</span>
              </ActionButton>
              <ActionButton
                onClick={handleCopy}
                title={isCopied ? "Copied!" : "Copy code"}
                className={
                  isCopied
                    ? "text-cyan-400 border-cyan-500/80"
                    : "hover:text-cyan-400"
                }
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </ActionButton>
            </>
          )}
        </div>
      </div>

      {/* Konten Kode */}
      <div className="relative">
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-64 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none border-none"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          />
        ) : (
          <SyntaxHighlighter
            language={language}
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              fontSize: "0.875rem",
              fontFamily: "JetBrains Mono, monospace",
            }}
            showLineNumbers={true}
            lineNumberStyle={{ color: "#4B5563", userSelect: "none" }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Live Preview Canvas */}
      {showPreview && (
        <div className="p-4 bg-gray-800/30 border-t border-gray-700/50">
          <LivePreview
            code={isEditing ? editedCode : code}
            language={language}
          />
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
