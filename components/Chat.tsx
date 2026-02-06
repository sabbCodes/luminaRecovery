import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Heart, Loader2 } from 'lucide-react';
import { startCoachChat, evaluateResponse } from '../services/geminiService';
import { Message, OpikTrace } from '../types';
import { Chat as ChatSession } from "@google/genai";

import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

const Chat: React.FC<{ addTrace: (trace: OpikTrace) => void }> = ({ addTrace }) => {
  const messages = useLiveQuery(() => db.chatMessages.toArray(), [], []);
  const userProfile = useLiveQuery(() => db.userProfile.get('profile'), []);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<ChatSession | null>(null);

  useEffect(() => {
    // Initialize Chat Session (history from DB will be loaded by useLiveQuery)
    if (!chatInstance.current && userProfile) {
      chatInstance.current = startCoachChat([], userProfile.value.name);
    }
    
    // Seed initial message if empty
    const seed = async () => {
      const count = await db.chatMessages.count();
      if (count === 0 && userProfile) {
        await db.chatMessages.add({
          id: '1',
          role: 'model',
          content: `Hello ${userProfile.value.name}. I'm Lumina. I'm here to listen and support you on your recovery journey. How are you feeling right now?`,
          timestamp: new Date()
        });
      }
    };
    if (userProfile) seed();
  }, [userProfile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !chatInstance.current) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    await db.chatMessages.add(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatInstance.current.sendMessage({ message: input });
      const modelContent = result.text || "I'm processing that. Can you tell me more?";

      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: modelContent,
        timestamp: new Date()
      };

      await db.chatMessages.add(modelMsg);

      // Opik-style Evaluation (Simulated for Hackathon Observability)
      const evaluation = await evaluateResponse(input, modelContent);
      
      const trace: OpikTrace = {
        id: `trace-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent: 'Recovery Coach (Gemini 3 Flash)',
        input,
        output: modelContent,
        evaluations: evaluation.metrics || [],
        latency: evaluation.latency
      };
      
      addTrace(trace);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: 'err',
        role: 'system',
        content: "I'm having trouble connecting. Let's try again in a moment.",
        timestamp: new Date()
      };
      await db.chatMessages.add(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Lumina Coach</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Compassionate AI</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Heart size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 rounded-tr-none' 
                  : msg.role === 'system'
                  ? 'bg-rose-50 text-rose-600 text-xs text-center w-full'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Loader2 className="animate-spin" size={16} />
              </div>
              <div className="bg-slate-100 px-4 py-2 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 pl-4 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Talk to Lumina about your day..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-lg shadow-indigo-100"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
