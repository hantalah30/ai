import React, { useState, useRef, useEffect } from "react";
import { Send, Code, Mic } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "id-ID";

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            onSendMessage(event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setMessage(interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [onSendMessage]);

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
    if ("vibrate" in navigator) navigator.vibrate(50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl">
          <div className="flex items-end space-x-2 p-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSubmit(e)
              }
              placeholder="Ketik pesan..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none font-mono text-sm max-h-32 p-2"
              rows={1}
            />
            <div className="flex space-x-1">
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`p-2 rounded-lg ${
                    isRecording
                      ? "text-red-400 bg-red-400/20 animate-pulse"
                      : "text-gray-400"
                  }`}
                >
                  <Mic size={20} />
                </button>
              )}
              <button
                type="submit"
                disabled={!message.trim()}
                className="p-2 rounded-lg disabled:opacity-50 text-cyan-400 bg-cyan-400/20"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
