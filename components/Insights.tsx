import * as React from 'react';
import { useState, useEffect } from 'react';
import { analyzePatterns } from '../services/geminiService';
import { RecoveryInsight } from '../types';
import { Lightbulb, AlertTriangle, Trophy, Loader2, RefreshCw, Sparkles } from 'lucide-react';

const Insights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<RecoveryInsight[]>([]);
  const [progress, setProgress] = useState('');

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Dummy entries for demo
      const mockEntries = [
        { date: '2023-10-25', mood: 4, content: 'Work was stressful, had high urges.' },
        { date: '2023-10-26', mood: 8, content: 'Exercised and felt great. Urges were low.' },
        { date: '2023-10-27', mood: 3, content: 'Late night browsing led to a close call.' },
      ];
      const data = await analyzePatterns(mockEntries);
      setInsights(data.insights || []);
      setProgress(data.overallProgress || "You're making steady progress on your journey.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-slate-900">Pattern Insights</h2>
          <p className="text-slate-500">Lumina's Deep Analysis of your recovery journey.</p>
        </div>
        <button 
          onClick={loadInsights}
          disabled={loading}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Analyzing patterns and detecting behavioral triggers...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles size={24} />
              Progress Summary
            </h3>
            <p className="text-indigo-50 leading-relaxed text-lg italic">
              "{progress}"
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const InsightCard: React.FC<{ insight: RecoveryInsight }> = ({ insight }) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'pattern': return <Lightbulb className="text-amber-500" />;
      case 'warning': return <AlertTriangle className="text-rose-500" />;
      case 'encouragement': return <Trophy className="text-emerald-500" />;
      default: return <Lightbulb />;
    }
  };

  const getStyle = () => {
    switch (insight.type) {
      case 'pattern': return 'bg-amber-50 border-amber-100';
      case 'warning': return 'bg-rose-50 border-rose-100';
      case 'encouragement': return 'bg-emerald-50 border-emerald-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col h-full transition-transform hover:-translate-y-1 ${getStyle()}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">{getIcon()}</div>
        <h4 className="font-bold text-slate-800">{insight.title}</h4>
      </div>
      <p className="text-sm text-slate-600 flex-1 leading-relaxed mb-6">
        {insight.description}
      </p>
      {insight.actionItem && (
        <div className="bg-white/80 p-4 rounded-2xl border border-slate-100/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended Action</p>
          <p className="text-sm font-semibold text-slate-800">{insight.actionItem}</p>
        </div>
      )}
    </div>
  );
};

export default Insights;
