import React, { useState } from "react";
import { X, Code, FileText, Plus } from "lucide-react";

interface CodeInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string, language: string, filename?: string) => void;
}

const CodeInsertModal: React.FC<CodeInsertModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [filename, setFilename] = useState("");

  const languages = [
    { value: "javascript", label: "JavaScript", icon: "🟨" },
    { value: "typescript", label: "TypeScript", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "json", label: "JSON", icon: "📋" },
    { value: "sql", label: "SQL", icon: "🗄️" },
    { value: "bash", label: "Bash", icon: "⚡" },
    { value: "php", label: "PHP", icon: "🐘" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "cpp", label: "C++", icon: "⚙️" },
    { value: "text", label: "Plain Text", icon: "📄" },
  ];

  const handleInsert = () => {
    if (code.trim()) {
      onInsert(code, language, filename || undefined);
      setCode("");
      setFilename("");
      onClose();
    }
  };

  const insertTemplate = (template: string) => {
    setCode(template);
  };

  const templates = {
    javascript: `function example() {
  console.log("Hello, World!");
  return true;
}

example();`,
    python: `def example():
    print("Hello, World!")
    return True

if __name__ == "__main__":
    example()`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,
    css: `.example {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
}`,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 border border-cyan-400/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-400/20">
          <div className="flex items-center space-x-3">
            <Code className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-cyan-400 font-mono">
              Insert Code Block
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Language and Filename */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100 font-mono focus:border-cyan-400/50 focus:outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Filename (Optional)
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="example.js"
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-100 font-mono focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(templates).map(([lang, template]) => (
                <button
                  key={lang}
                  onClick={() => insertTemplate(template)}
                  className="px-3 py-1 bg-gray-800/50 border border-gray-600/50 rounded-lg text-xs text-gray-300 hover:border-purple-400/50 hover:text-purple-400 transition-all duration-200 font-mono"
                >
                  {languages.find((l) => l.value === lang)?.icon} {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
              Code Content
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
              className="w-full h-64 bg-gray-800/50 border border-gray-600/50 rounded-lg p-4 text-gray-100 font-mono text-sm resize-none focus:border-cyan-400/50 focus:outline-none scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-cyan-500/50"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-cyan-400/20">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-gray-300 hover:border-red-400/50 hover:text-red-400 transition-all duration-200 font-mono"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!code.trim()}
            className={`px-4 py-2 rounded-lg font-mono transition-all duration-200 ${
              code.trim()
                ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/30"
                : "bg-gray-800/50 border border-gray-600/50 text-gray-500 cursor-not-allowed"
            }`}
          >
            Insert Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeInsertModal;
