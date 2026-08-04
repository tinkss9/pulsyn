'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'What are the biggest bottlenecks in my pipelines?',
  'How can I reduce CDC replication lag?',
  'Which connectors have the lowest success rate?',
  'Predict my storage needs for the next 30 days',
  'What optimizations do you recommend?',
  'Are there any security concerns with my setup?',
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  async function handleSubmit(question?: string) {
    const text = question ?? input.trim();
    if (!text || streaming) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setStreamContent('');

    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages.map((m) => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok) throw new Error('Failed to get response');

      // Try streaming
      if (resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let full = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setStreamContent(full);
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: full, timestamp: new Date() }]);
      } else {
        const data = await resp.json();
        const content = data.response ?? data.message ?? JSON.stringify(data);
        setMessages((prev) => [...prev, { role: 'assistant', content, timestamp: new Date() }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() },
      ]);
    } finally {
      setStreaming(false);
      setStreamContent('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Ask Pulsyn AI</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Get insights about your pipelines, connectors, performance, and optimization recommendations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="text-left text-sm px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800/80 text-gray-200 border border-gray-700'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <time className="text-[10px] opacity-50 mt-1 block">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming indicator */}
        {streaming && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="max-w-[80%] px-4 py-3 rounded-xl bg-gray-800/80 text-gray-200 border border-gray-700 text-sm">
              {streamContent ? (
                <p className="whitespace-pre-wrap">{streamContent}</p>
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              )}
            </div>
          </div>
        )}

        {/* Suggested questions when conversation has started */}
        {messages.length > 0 && !streaming && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTED_QUESTIONS.filter(
              (q) => !messages.some((m) => m.role === 'user' && m.content === q)
            )
              .slice(0, 3)
              .map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="text-xs px-3 py-1.5 bg-gray-800/30 hover:bg-gray-800/60 border border-gray-700/50 rounded-full text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {q}
                </button>
              ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-800 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your pipelines, connectors, or performance..."
            rows={1}
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || streaming}
            className="p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {streaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
