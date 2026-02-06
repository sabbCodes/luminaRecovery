import * as React from 'react';
import { useState } from 'react';
import { Save, History, Smile, Frown, Meh } from 'lucide-react';

import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

const Journal: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState<number>(5);

  const recentEntries = useLiveQuery(() => 
    db.journalEntries.orderBy('date').reverse().limit(3).toArray()
  , []);

  const handleSave = async () => {
    if (!entry.trim()) return;
    
    await db.journalEntries.add({
      date: new Date().toISOString(),
      mood,
      content: entry,
      timestamp: new Date().toLocaleTimeString()
    });
    
    setEntry('');
    setMood(5);
  };


  const getMoodIcon = (m: number) => {
    if (m >= 7) return <Smile className="text-emerald-500" size={32} />;
    if (m <= 3) return <Frown className="text-rose-500" size={32} />;
    return <Meh className="text-amber-500" size={32} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-serif mb-6">Daily Reflection</h2>
          
          <div className="mb-8">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">How are you feeling?</p>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {getMoodIcon(mood)}
              </div>
              <div className="flex-1">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={mood}
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                  <span>Difficult</span>
                  <span>Neutral</span>
                  <span>Great</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-800">{mood}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">What's on your mind?</p>
            <textarea 
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Record any cravings, victories, or stressors today..."
              className="w-full h-64 p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700 placeholder:text-slate-300 resize-none leading-relaxed"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
              <Save size={18} />
              Save Entry
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            Recent History
          </h3>
          <div className="space-y-4">
            {recentEntries?.map(e => (
              <RecentEntryItem 
                key={e.id}
                date={new Date(e.date).toLocaleDateString()} 
                mood={e.mood} 
                snippet={e.content} 
              />
            ))}
            {!recentEntries?.length && (
              <p className="text-slate-400 text-sm text-center py-4">No entries yet. Start your journal today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentEntryItem: React.FC<{ date: string, mood: number, snippet: string }> = ({ date, mood, snippet }) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors cursor-pointer group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{date}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
        mood >= 7 ? 'bg-emerald-100 text-emerald-700' : mood <= 3 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
      }`}>Mood {mood}</span>
    </div>
    <p className="text-sm text-slate-600 line-clamp-2 group-hover:text-slate-900 transition-colors">{snippet}</p>
  </div>
);

export default Journal;
