'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, X, Send, Loader2, Sparkles, Trash2,
  ChevronDown, Bot, User, RefreshCw, Minimize2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatContext {
  type: 'course' | 'dashboard' | 'general';
  courseId?: string;
}

interface Props {
  userId: string;
  context?: ChatContext;
}

// ─── Markdown-lite renderer (bold, line breaks only) ─────────────────────────
function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-bold">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
      }`}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-slate-100 text-slate-800 rounded-tl-sm'
      }`}>
        <p className="whitespace-pre-wrap break-words">
          {renderContent(msg.content)}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5 align-text-bottom" />
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Main Chat Widget ─────────────────────────────────────────────────────────
export default function AIChatWidget({ userId, context }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [unread, setUnread] = useState(0);
  const [wasEverOpened, setWasEverOpened] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Default follow-ups by context
  const defaultFollowUps =
    context?.type === 'course'
      ? ['Is this course right for me?', 'What will I learn?', 'Compare to similar courses']
      : context?.type === 'dashboard'
      ? ['What should I study next?', 'Show my enrolled courses', 'Build a weekly plan']
      : ['What courses do you recommend?', 'How do I get started?', 'Show popular courses'];

  // Load history on open
  useEffect(() => {
    if (isOpen && !historyLoaded && userId) {
      fetch(`${API_URL}/ai/chat/history?userId=${userId}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          if (data.messages?.length) {
            setMessages(
              data.messages.map((m: any) => ({
                role: m.role,
                content: m.content,
                timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
              }))
            );
          } else {
            // Welcome message
            setMessages([{
              role: 'assistant',
              content: "Hi! I'm your StudySprint Study Advisor 👋 I can help you find courses, plan your learning journey, and answer questions about what you're studying.\n\nWhat would you like to know?",
            }]);
          }
          setHistoryLoaded(true);
        })
        .catch(() => {
          setMessages([{ role: 'assistant', content: "Hi! I'm your Study Advisor. How can I help you today?" }]);
          setHistoryLoaded(true);
        });
    }
  }, [isOpen, historyLoaded, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Track unread only when widget was previously opened (user has interacted)
  useEffect(() => {
    if (!isOpen && wasEverOpened && messages.length > 1 && messages[messages.length - 1].role === 'assistant') {
      setUnread((u) => u + 1);
    }
  }, [messages]);

  const clearUnread = () => setUnread(0);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setInput('');
    setFollowUps([]);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setIsSending(true);
    setIsStreaming(true);
    setStreamingContent('');

    abortRef.current = new AbortController();

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, message: trimmed, context }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Chat request failed');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === 'delta') {
              full += payload.content;
              setStreamingContent(full);
            } else if (payload.type === 'done') {
              setFollowUps(payload.followUps || defaultFollowUps);
            } else if (payload.type === 'error') {
              throw new Error(payload.content);
            }
          } catch { /* ignore parse errors in stream */ }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: full, timestamp: new Date() }]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I ran into a problem: ${err.message || 'Please try again.'}` },
      ]);
    } finally {
      setIsSending(false);
      setIsStreaming(false);
      setStreamingContent('');
      abortRef.current = null;
    }
  }, [userId, context, isSending, defaultFollowUps]);

  // ── Clear history ───────────────────────────────────────────────────────────
  const clearHistory = async () => {
    setClearingHistory(true);
    try {
      await fetch(`${API_URL}/ai/chat/history?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setMessages([{ role: 'assistant', content: "Chat cleared! What would you like to talk about?" }]);
      setFollowUps([]);
    } finally {
      setClearingHistory(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── FAB Button ─────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          id="ai-chat-fab"
        onClick={() => { setIsOpen(true); setWasEverOpened(true); clearUnread(); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-xl shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Open AI Study Advisor"
        >
          <Sparkles className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat Panel ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
          isMinimized ? 'h-14 w-72' : 'w-[360px] sm:w-[400px] h-[580px]'
        }`}>

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Study Advisor</p>
                <p className="text-[10px] text-indigo-200 font-medium mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                  AI-powered · {isStreaming ? 'typing…' : 'ready'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={clearHistory}
                disabled={clearingHistory}
                title="Clear chat history"
                className="w-7 h-7 text-white/70 hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-all"
              >
                {clearingHistory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsMinimized((m) => !m)}
                className="w-7 h-7 text-white/70 hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-all"
              >
                {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 text-white/70 hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}

                {/* Streaming bubble */}
                {isStreaming && streamingContent && (
                  <MessageBubble
                    msg={{ role: 'assistant', content: streamingContent }}
                    isStreaming
                  />
                )}

                {/* Typing indicator (before any streaming content) */}
                {isSending && !streamingContent && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Follow-up chips */}
              {(followUps.length > 0 || messages.length <= 1) && !isSending && (
                <div className="px-4 py-2 border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none shrink-0 bg-white">
                  {(followUps.length > 0 ? followUps : defaultFollowUps).map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(chip)}
                      className="shrink-0 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-200 flex items-center gap-2 bg-white shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask me anything…"
                  disabled={isSending}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all disabled:opacity-60"
                />
                <button
                  id="chat-send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isSending}
                  className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md"
                >
                  {isSending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
