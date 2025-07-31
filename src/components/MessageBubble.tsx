import React, { useState, useEffect } from 'react';
import { User, Bot, Copy, Code, FileText } from 'lucide-react';
import { Message } from '../types';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
  onMessageUpdate?: (messageId: string, newContent: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLatest, onMessageUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isUser = message.sender === 'user';

  useEffect(() => {
    if (isLatest) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(true);
    }
  }, [isLatest]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const detectCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const blocks = [];
    let match;
    let lastIndex = 0;
    let blockId = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add code block
      blocks.push({
        type: 'code',
        id: `code-${blockId++}`,
        language: match[1] || 'text',
        code: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      blocks.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return blocks.length > 1 ? blocks : [{ type: 'text', content: text }];
  };

  const handleCodeUpdate = (blockId: string, newCode: string) => {
    if (onMessageUpdate) {
      // Update the message content with the new code
      let updatedContent = message.content;
      const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
      let blockIndex = 0;
      
      updatedContent = updatedContent.replace(codeBlockRegex, (match, lang, code) => {
        if (`code-${blockIndex}` === blockId) {
          blockIndex++;
          return `\`\`\`${lang || 'text'}\n${newCode}\n\`\`\``;
        }
        blockIndex++;
        return match;
      });
      
      onMessageUpdate(message.id, updatedContent);
    }
  };

  const contentBlocks = detectCodeBlocks(message.content);

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
          isUser 
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50' 
            : 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border-cyan-400/50'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-purple-400" />
          ) : (
            <Bot className="h-4 w-4 text-cyan-400" />
          )}
        </div>

        {/* Message Content */}
        <div className={`relative group ${isUser ? 'text-right' : 'text-left'}`}>
          {/* Message Bubble */}
          <div className={`relative px-4 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
            isUser
              ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/20 border-purple-400/50 text-white'
              : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-cyan-400/30 text-gray-100'
          }`}>
            
            {/* Neon Glow */}
            <div className={`absolute inset-0 rounded-2xl blur-sm transition-opacity duration-300 opacity-0 group-hover:opacity-20 ${
              isUser ? 'bg-gradient-to-br from-purple-400 to-pink-400' : 'bg-gradient-to-br from-cyan-400 to-blue-400'
            }`}></div>

            {/* Content */}
            <div className="relative">
              <div className="space-y-3">
                {contentBlocks.map((block, index) => (
                  <div key={index}>
                    {block.type === 'text' ? (
                      <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                        {block.content}
                      </p>
                    ) : (
                      <CodeBlock
                        code={block.code}
                        language={block.language}
                        onCodeUpdate={(newCode) => handleCodeUpdate(block.id, newCode)}
                        isEditable={isUser}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Files Display */}
              {message.files && message.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.files.map((file) => (
                    <div key={file.id} className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg border border-gray-600/50">
                      <FileText className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-gray-300 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)}KB)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isUser ? '-left-10' : '-right-10'
            }`}>
              <button
                onClick={copyToClipboard}
                className="p-1 bg-gray-800/80 border border-gray-600 rounded-md hover:border-cyan-400 hover:text-cyan-400 transition-colors duration-200"
                title="Copy message"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Timestamp */}
          <div className={`mt-1 text-xs text-gray-500 font-mono ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;