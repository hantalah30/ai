import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Edit3, Check, X, Save, Code, FileText } from "lucide-react";

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleSave = () => {
    if (onCodeUpdate) {
      onCodeUpdate(editedCode);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCode(code);
    setIsEditing(false);
  };

  const getLanguageIcon = (lang: string) => {
    const langLower = lang.toLowerCase();
    if (["js", "javascript", "ts", "typescript"].includes(langLower)) {
      return "🟨";
    } else if (["py", "python"].includes(langLower)) {
      return "🐍";
    } else if (["html", "xml"].includes(langLower)) {
      return "🌐";
    } else if (["css", "scss", "sass"].includes(langLower)) {
      return "🎨";
    } else if (["json"].includes(langLower)) {
      return "📋";
    } else if (["sql"].includes(langLower)) {
      return "🗄️";
    }
    return "📄";
  };

  return (
    <div className="relative group bg-gray-900/90 border border-cyan-400/30 rounded-lg overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-cyan-400/20">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getLanguageIcon(language)}</span>
          <span className="text-sm font-mono text-cyan-400">
            {language.toUpperCase()}
          </span>
          {filename && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-sm font-mono text-gray-300">
                {filename}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isEditable && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded transition-all duration-200"
              title="Edit code"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}

          {isEditing ? (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleSave}
                className="p-1.5 text-green-400 hover:bg-green-400/10 rounded transition-all duration-200"
                title="Save changes"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-all duration-200"
                title="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded transition-all duration-200 ${
                isCopied
                  ? "text-green-400 bg-green-400/10"
                  : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10"
              }`}
              title={isCopied ? "Copied!" : "Copy code"}
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-64 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none border-none scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-cyan-500/50"
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
            lineNumberStyle={{
              color: "#4B5563",
              fontSize: "0.75rem",
              paddingRight: "1rem",
              userSelect: "none",
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}

        {/* Neon Glow Effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/5 via-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      {/* Line Count */}
      <div className="px-4 py-1 bg-gray-800/30 border-t border-gray-700/50">
        <span className="text-xs text-gray-500 font-mono">
          {code.split("\n").length} lines • {code.length} characters
        </span>
      </div>
    </div>
  );
};

export default CodeBlock;
