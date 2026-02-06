
import React, { useState } from 'react';
import { db } from '../db';
import { Sparkles, ArrowRight } from 'lucide-react';

export const OnboardingModal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const currentProfile = await db.userProfile.get('profile');
    if (currentProfile) {
      await db.userProfile.put({
        ...currentProfile,
        value: {
          ...currentProfile.value,
          name: name.trim()
        }
      });
      onComplete(); // Trigger re-fetch or state update in parent
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3">
            <Sparkles size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif text-center mb-2">Welcome to Lumina</h2>
        <p className="text-slate-500 text-center mb-8">
          I'm here to support your recovery journey. <br/>What should I call you?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-lg font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
            autoFocus
          />
          
          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <span>Begin Journey</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
