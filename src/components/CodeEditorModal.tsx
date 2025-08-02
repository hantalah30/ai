// src/components/CodeEditorModal.tsx

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { X, Save } from "lucide-react";

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  language: string;
  onSave: (code: string) => void;
}

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  language,
  onSave,
}) => {
  const [currentCode, setCurrentCode] = useState(initialCode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentCode(initialCode);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [initialCode, isOpen]);

  const handleSave = () => {
    onSave(currentCode.trim());
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Code Editor Modal"
    >
      <div className="bg-gray-800 rounded-lg shadow-2xl flex flex-col w-full max-w-4xl h-[90vh] animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <h2 className="text-xl font-semibold text-white tracking-wide">
            Code Editor ({language.toUpperCase()})
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring focus:ring-green-400"
              title="Save Code (Ctrl+S)"
            >
              <Save size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring focus:ring-red-400"
              title="Close Editor"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4 bg-gray-900 rounded-b-lg overflow-hidden">
          <textarea
            ref={textareaRef}
            className="w-full h-full p-3 bg-gray-900 text-gray-200 font-mono text-sm sm:text-base rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={`Tulis kode ${language} Anda di sini...`}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorModal;
