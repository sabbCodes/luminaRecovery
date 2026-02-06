import * as React from 'react';
import { UserProfile } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Calendar, Target, Heart, BarChart3 } from 'lucide-react';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';


const Dashboard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const stats = useLiveQuery(async () => {
    const entries = await db.journalEntries.orderBy('date').toArray();
    
    // Format for Chart (Last 7 entries or days)
    const chartData = entries.slice(-7).map(e => ({
      day: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
      mood: e.mood
    }));

    // Calculate Avg Mood
    const totalMood = entries.reduce((acc, curr) => acc + curr.mood, 0);
    const avgMood = entries.length ? (totalMood / entries.length).toFixed(1) : '0.0';

    return { chartData, avgMood };
  }, [], { chartData: [], avgMood: '0.0' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-slate-900 mb-2">My Recovery Path</h2>
          <p className="text-slate-500">You're making incredible progress. Every day counts.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
            <Calendar size={18} />
            <span className="font-semibold text-sm">Day {profile.streaks}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Zap className="text-amber-500" />} 
          title="Current Streak" 
          value={`${profile.streaks} Days`} 
          subValue="Keep it up!"
        />
        <StatCard 
          icon={<Target className="text-indigo-500" />} 
          title="Target Goal" 
          value="30 Days" 
          subValue="47% Completed"
        />
        <StatCard 
          icon={<Heart className="text-rose-500" />} 
          title="Avg. Mood" 
          value={`${stats.avgMood} / 10`} 
          subValue="Based on your entries"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-slate-400" />
            Mood Stability Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#6366f1'}}
                />
                <Area type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Focus Area</h3>
          <div className="space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              Based on your recent journals, weekends are your highest risk period. 
              Let's plan some activities for this Saturday to stay engaged.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Target Behavior</p>
                <p className="text-sm text-slate-500">{profile.targetBehavior}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Target className="text-indigo-600" />
              </div>
            </div>
            <button className="w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition-colors">
              Explore Coping Strategies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, subValue: string }> = ({ icon, title, value, subValue }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</span>
    </div>
    <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
    <p className="text-xs text-slate-400">{subValue}</p>
  </div>
);

export default Dashboard;
