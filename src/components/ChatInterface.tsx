import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiSearch, FiLoader, FiFile, FiExternalLink } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessage, Course, ThinkingLog } from '../types';
import ThinkingIndicator from './ThinkingIndicator';
import { useChat } from '../hooks/useChat';

interface ChatInterfaceProps {
  course: Course;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ course }) => {
  const [input, setInput] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingLogs, setThinkingLogs] = useState<ThinkingLog[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages, sendMessage, isLoading } = useChat(course.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsThinking(true);
    setThinkingLogs([]);

    // Simulate thinking process
    const logs: ThinkingLog[] = [
      { step: 'Analyzing query', description: 'Understanding your question...', status: 'pending' },
      { step: 'Searching embeddings', description: 'Looking through course content...', status: 'pending' },
      { step: 'Retrieving sources', description: 'Finding relevant information...', status: 'pending' },
    ];

    if (webSearchEnabled) {
      logs.push({ step: 'Web search', description: 'Searching the web for additional context...', status: 'pending' });
    }

    logs.push({ step: 'Generating response', description: 'Crafting your answer...', status: 'pending' });

    // Animate thinking logs
    for (let i = 0; i < logs.length; i++) {
      setThinkingLogs(logs.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 500));
      logs[i].status = 'complete';
      setThinkingLogs([...logs]);
    }

    await sendMessage({
      courseId: course.id,
      query: userMessage,
      useWebSearch: webSearchEnabled,
    });

    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              webSearchEnabled
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
            }`}
          >
            <FiSearch className="inline-block w-4 h-4 mr-1" />
            Web Search {webSearchEnabled ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                  : 'bg-gray-800/50 border border-gray-700/50'
              }`}
            >
              {/* Message Content */}
              <div className="text-white">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Sources:</p>
                  <div className="space-y-2">
                    {message.sources.map((source, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/30 rounded-lg p-2"
                      >
                        <FiFile className="w-4 h-4 text-blue-400" />
                        <span className="flex-1">{source.fileName}</span>
                        <span className="text-xs text-gray-500">
                          {Math.round(source.relevanceScore * 100)}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Thinking Indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ThinkingIndicator logs={thinkingLogs} />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your course content..."
            className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            {isLoading ? (
              <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
              <FiSend className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;