import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Lightbulb,
  PenTool,
  Book,
  LayoutGrid,
  Brain,
  MessageSquareText,
  Plus,
  X,
  Search,
  GalleryHorizontal,
  List,
  ArrowLeft,
  Send,
} from "lucide-react";
import { Message, MessagePart } from "../types"; // Assuming Message and MessagePart types are still relevant for AI responses

interface TerminalModeProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearTerminal: () => void; // This might be repurposed or removed depending on the new "clear" logic
}

type CreativeMode =
  | "dashboard"
  | "ideaGenerator"
  | "quickNotes"
  | "skillBuilder"
  | "projectCanvas";
type IdeaCategory = "story" | "social" | "art" | "youtube" | "blog" | "general";

const TerminalMode: React.FC<TerminalModeProps> = ({
  messages,
  onSendMessage,
  onClearTerminal,
}) => {
  const [currentMode, setCurrentMode] = useState<CreativeMode>("dashboard");
  const [ideaCategory, setIdeaCategory] = useState<IdeaCategory>("general");
  const [noteContent, setNoteContent] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [skillTopic, setSkillTopic] = useState("");
  const [projectList, setProjectList] = useState<string[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [aiResponseInput, setAiResponseInput] = useState(""); // For sending freeform messages to AI within a mode

  const creativeOutputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of output area when new messages/outputs appear
    creativeOutputRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // messages will now be AI responses for prompts, etc.

  const renderCreativeOutput = () => {
    if (messages.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-400" />
          <p>Your creative sparks will appear here!</p>
        </div>
      );
    }
    return messages.map((message) => (
      <div key={message.id} className="mb-4 p-3 bg-gray-800/60 rounded-lg">
        <div className="flex items-center text-purple-300 text-xs mb-1">
          <Lightbulb className="h-3 w-3 mr-1" />
          AI Spark
        </div>
        <div className="text-white text-base leading-relaxed whitespace-pre-wrap">
          {message.parts.map((part, index) =>
            part.type === "text" ? (
              <span key={index}>{part.content}</span>
            ) : null
          )}
        </div>
      </div>
    ));
  };

  const handleGenerateIdea = () => {
    if (ideaCategory === "general") {
      onSendMessage("/prompt"); // Re-use existing /prompt logic for general ideas
    } else {
      onSendMessage(`/${ideaCategory}`); // Use specific commands like /story, /social, /art
    }
  };

  const handleSaveNote = () => {
    if (noteContent.trim()) {
      setSavedNotes((prev) => [...prev, noteContent.trim()]);
      setNoteContent("");
      // Potentially send to AI for processing, e.g., summarization or tagging
      onSendMessage(`/note ${noteContent.trim()}`); // Re-use existing /note logic
    }
  };

  const handleStartSkillSession = () => {
    if (skillTopic.trim()) {
      onSendMessage(`/learn ${skillTopic.trim()}`); // Re-use existing /learn logic
      setSkillTopic("");
    }
  };

  const handleCreateProject = () => {
    if (newProjectName.trim() && !projectList.includes(newProjectName.trim())) {
      setProjectList((prev) => [...prev, newProjectName.trim()]);
      setNewProjectName("");
      onSendMessage(`/create project "${newProjectName.trim()}"`); // Re-use existing /create project logic
    }
  };

  const handleAiResponseInputSend = () => {
    if (aiResponseInput.trim()) {
      onSendMessage(aiResponseInput.trim());
      setAiResponseInput("");
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <button
        className="bg-purple-700/40 hover:bg-purple-600/60 transition-colors p-6 rounded-lg flex flex-col items-center justify-center text-white text-lg font-semibold shadow-lg"
        onClick={() => setCurrentMode("ideaGenerator")}
      >
        <Sparkles className="h-8 w-8 mb-2" />
        Idea Generator
      </button>
      <button
        className="bg-blue-700/40 hover:bg-blue-600/60 transition-colors p-6 rounded-lg flex flex-col items-center justify-center text-white text-lg font-semibold shadow-lg"
        onClick={() => setCurrentMode("quickNotes")}
      >
        <PenTool className="h-8 w-8 mb-2" />
        Quick Notes
      </button>
      <button
        className="bg-green-700/40 hover:bg-green-600/60 transition-colors p-6 rounded-lg flex flex-col items-center justify-center text-white text-lg font-semibold shadow-lg"
        onClick={() => setCurrentMode("skillBuilder")}
      >
        <Book className="h-8 w-8 mb-2" />
        Skill Builder
      </button>
      <button
        className="bg-yellow-700/40 hover:bg-yellow-600/60 transition-colors p-6 rounded-lg flex flex-col items-center justify-center text-white text-lg font-semibold shadow-lg"
        onClick={() => setCurrentMode("projectCanvas")}
      >
        <LayoutGrid className="h-8 w-8 mb-2" />
        Project Canvas
      </button>
    </div>
  );

  const renderIdeaGenerator = () => (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <button
          onClick={() => setCurrentMode("dashboard")}
          className="text-gray-400 hover:text-white mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white">Idea Generator</h2>
      </div>

      <div className="mb-4">
        <label
          htmlFor="ideaCategory"
          className="block text-gray-400 text-sm font-bold mb-2"
        >
          Choose Category:
        </label>
        <select
          id="ideaCategory"
          className="block w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-purple-500"
          value={ideaCategory}
          onChange={(e) => setIdeaCategory(e.target.value as IdeaCategory)}
        >
          <option value="general">General Idea</option>
          <option value="story">Story Plot</option>
          <option value="social">Social Media Content</option>
          <option value="art">Art Challenge</option>
          <option value="youtube">YouTube Video Idea</option>
          <option value="blog">Blog Post Topic</option>
        </select>
      </div>

      <button
        className="bg-purple-600 hover:bg-purple-700 transition-colors text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center mb-6"
        onClick={handleGenerateIdea}
      >
        <Brain className="h-5 w-5 mr-2" />
        Generate Idea
      </button>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {renderCreativeOutput()}
        <div ref={creativeOutputRef} />
      </div>
    </div>
  );

  const renderQuickNotes = () => (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <button
          onClick={() => setCurrentMode("dashboard")}
          className="text-gray-400 hover:text-white mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white">Quick Notes</h2>
      </div>

      <textarea
        className="w-full flex-1 bg-gray-800 border border-gray-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:border-blue-500 mb-4"
        placeholder="Jot down your thoughts, ideas, or to-do list here..."
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
      ></textarea>

      <button
        className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center mb-6"
        onClick={handleSaveNote}
      >
        <Plus className="h-5 w-5 mr-2" />
        Save Note
      </button>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 border-t border-gray-700 pt-4">
        {savedNotes.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg text-gray-300 mb-2">My Saved Notes:</h3>
            {savedNotes.map((note, index) => (
              <div
                key={index}
                className="bg-gray-800/60 p-3 rounded-lg text-white text-sm flex justify-between items-center"
              >
                <p>{note}</p>
                <button
                  className="text-gray-400 hover:text-red-500 ml-3"
                  onClick={() =>
                    setSavedNotes(savedNotes.filter((_, i) => i !== index))
                  }
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No notes saved yet.</p>
        )}
      </div>
    </div>
  );

  const renderSkillBuilder = () => (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <button
          onClick={() => setCurrentMode("dashboard")}
          className="text-gray-400 hover:text-white mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white">Skill Builder</h2>
      </div>

      <input
        type="text"
        className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-green-500 mb-4"
        placeholder="What skill or topic do you want to learn about? (e.g., 'React hooks', 'Digital Marketing basics')"
        value={skillTopic}
        onChange={(e) => setSkillTopic(e.target.value)}
      />

      <button
        className="bg-green-600 hover:bg-green-700 transition-colors text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center mb-6"
        onClick={handleStartSkillSession}
      >
        <Book className="h-5 w-5 mr-2" />
        Get Learning Bite
      </button>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {renderCreativeOutput()}
        <div ref={creativeOutputRef} />
      </div>
    </div>
  );

  const renderProjectCanvas = () => (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <button
          onClick={() => setCurrentMode("dashboard")}
          className="text-gray-400 hover:text-white mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white">Project Canvas</h2>
      </div>

      <div className="flex mb-4">
        <input
          type="text"
          className="flex-1 bg-gray-800 border border-gray-700 text-white p-3 rounded-l-lg focus:outline-none focus:border-yellow-500"
          placeholder="New project name..."
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleCreateProject();
            }
          }}
        />
        <button
          className="bg-yellow-600 hover:bg-yellow-700 transition-colors text-white font-bold py-2 px-4 rounded-r-lg flex items-center justify-center"
          onClick={handleCreateProject}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 border-t border-gray-700 pt-4">
        {projectList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectList.map((project, index) => (
              <div
                key={index}
                className="bg-gray-800/60 p-4 rounded-lg text-white flex flex-col justify-between shadow-md"
              >
                <h4 className="text-lg font-semibold mb-2 flex items-center">
                  <GalleryHorizontal className="h-5 w-5 mr-2 text-yellow-400" />
                  {project}
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  Your creative journey begins here...
                </p>
                <div className="flex justify-end">
                  <button
                    className="text-gray-400 hover:text-red-500"
                    onClick={() =>
                      setProjectList(projectList.filter((_, i) => i !== index))
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No projects created yet. Let's start a new one!
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gradient-to-br from-black to-gray-950 backdrop-blur-sm border border-purple-400/30 rounded-lg m-2 sm:m-4 font-sans text-sm flex flex-col overflow-hidden">
      <div className="bg-gray-800/50 border-b border-purple-400/30 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <span className="text-purple-300 text-lg font-bold">
            HAWAI Creative Flow
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {currentMode.replace(/([A-Z])/g, " $1").trim()} Mode
          </span>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        {currentMode === "dashboard" && renderDashboard()}
        {currentMode === "ideaGenerator" && renderIdeaGenerator()}
        {currentMode === "quickNotes" && renderQuickNotes()}
        {currentMode === "skillBuilder" && renderSkillBuilder()}
        {currentMode === "projectCanvas" && renderProjectCanvas()}
      </div>

      {/* Persistent input bar for general AI interaction, if needed within modes */}
      {currentMode !== "dashboard" && (
        <div className="p-4 border-t border-purple-400/30 flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 bg-transparent text-white outline-none caret-purple-400 placeholder-gray-500"
            placeholder={`Ask AI about ${currentMode
              .replace(/([A-Z])/g, " $1")
              .trim()}...`}
            value={aiResponseInput}
            onChange={(e) => setAiResponseInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAiResponseInputSend();
              }
            }}
          />
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg"
            onClick={handleAiResponseInputSend}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TerminalMode;
