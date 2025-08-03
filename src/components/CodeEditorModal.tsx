// src/components/CodeEditorModal.tsx

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    setCurrentCode(initialCode);
  }, [initialCode]);

  const handleSave = () => {
    onSave(currentCode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl flex flex-col w-full max-w-4xl h-5/6 sm:h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <h2 className="text-xl font-bold text-white">
            Code Editor ({language.toUpperCase()})
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Save Code"
            >
              <Save size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Close Editor"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Area Textarea Editor Sederhana */}
        <div className="flex-1 p-4 bg-gray-900 rounded-b-lg">
          <textarea
            className="w-full h-full p-3 bg-gray-900 text-gray-200 font-mono text-sm sm:text-base rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value)}
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
