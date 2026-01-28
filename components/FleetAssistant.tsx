
import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, X, Send, Loader2, MessageSquare, Sparkles, ChevronDown, User } from 'lucide-react';
import { Machine } from '../types';
import { askFleetAssistant } from '../services/geminiService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface FleetAssistantProps {
  machines: Machine[];
}

export const FleetAssistant: React.FC<FleetAssistantProps> = ({ machines }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I am your Fleet Intelligence Assistant. How can I help you optimize your maintenance today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const finalQuery = customQuery || query;
    if (!finalQuery.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: finalQuery };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await askFleetAssistant(finalQuery, machines);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I encountered an error analyzing the fleet. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "Which machine needs attention today?",
    "Summarize fleet risk",
    "Highest potential savings?",
    "Any critical RUL alerts?"
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative ring-4 ring-indigo-500/20"
        >
          <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20 pointer-events-none"></div>
          <BrainCircuit className="w-8 h-8" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 h-[550px] bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-6 bg-indigo-600 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase italic tracking-tighter">Fleet Advisor</h3>
                <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-widest">Active Intelligence</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <BrainCircuit className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-6 pb-2 overflow-x-auto">
             <div className="flex gap-2 pb-2">
               {quickActions.map((action, i) => (
                 <button 
                  key={i} 
                  onClick={() => handleSend(undefined, action)}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] text-slate-400 hover:text-white transition-all font-bold uppercase tracking-widest"
                 >
                   {action}
                 </button>
               ))}
             </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-6 pt-2">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask fleet status..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-xs text-white outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
