import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { X, Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';

interface AIAssistantModalProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'rule_engine' | 'gemini_grounded';
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am Campus Nexus AI, your personal campus intelligence assistant. You can ask me about your attendance, next class schedule, gate pass status, leave requests, today's dining menu, or published alumni workshops.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const suggestedQueries = user?.role === 'student' ? [
    'What is my attendance percentage?',
    'When is my next class?',
    'Has my gate pass been approved?',
    "What is today's mess menu?",
    'Which alumni workshops are available?'
  ] : [
    'Which hostel rooms are available?',
    'Show today dining menu',
    'What are the campus guidelines?'
  ];

  const handleSend = async (messageText: string) => {
    const query = messageText.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await apiRequest<{ reply: string; source: 'rule_engine' | 'gemini_grounded' }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: query })
      });

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ I encountered an issue retrieving your institutional records: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl h-[560px] max-h-[90vh] bg-[#0D222B] border border-[#35D6E8]/30 rounded-2xl shadow-2xl text-[#D9F7FA] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#12313B] bg-[#081820]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#35D6E8]/20 flex items-center justify-center text-[#35D6E8] border border-[#35D6E8]/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Campus Nexus AI Assistant</h3>
                <span className="text-[10px] text-[#35D6E8] font-mono bg-[#35D6E8]/10 px-1.5 py-0.5 rounded border border-[#35D6E8]/20">
                  SECURE VAULT
                </span>
              </div>
              <p className="text-[11px] text-[#91B8C0]">Strictly authorized to access your personal campus records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#91B8C0] hover:text-white hover:bg-[#12313B] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-[#35D6E8] text-[#081820]'
                  : 'bg-[#12313B] text-[#35D6E8] border border-[#35D6E8]/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`max-w-[82%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-[#35D6E8] text-[#081820] font-medium rounded-tr-none'
                  : 'bg-[#12313B] text-[#D9F7FA] border border-white/5 rounded-tl-none'
              }`}>
                {msg.text}
                <div className="flex items-center justify-between mt-1 text-[10px] opacity-60">
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span className="font-mono">{msg.source === 'gemini_grounded' ? '✨ Gemini Grounded' : '⚡ Smart Engine'}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#91B8C0] bg-[#12313B]/50 p-2.5 rounded-xl border border-white/5 w-fit">
              <Bot className="w-4 h-4 text-[#35D6E8] animate-pulse" />
              <span>Querying verified institutional database...</span>
            </div>
          )}
        </div>

        {/* Quick Question Prompts */}
        <div className="px-4 py-2 bg-[#081820]/40 border-t border-[#12313B] flex gap-1.5 overflow-x-auto no-scrollbar">
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-[#12313B] hover:bg-[#1a4452] text-[#91B8C0] hover:text-[#D9F7FA] px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors border border-white/5"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#12313B] bg-[#081820]/80">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask attendance, schedule, passes, mess menu..."
              className="flex-1 bg-[#12313B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#66848C] focus:outline-none focus:border-[#35D6E8]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#35D6E8] hover:bg-[#6EEAF5] text-[#081820] font-bold text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
