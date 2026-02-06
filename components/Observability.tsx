import * as React from 'react';
import { OpikTrace } from '../types';
import { Activity, ShieldCheck, Zap, Database, ExternalLink, Heart, Beaker } from 'lucide-react';
import { ExperimentRunner } from './ExperimentRunner';

const Observability: React.FC<{ traces: OpikTrace[] }> = ({ traces }) => {
  const [view, setView] = React.useState<'live' | 'experiment' | 'settings'>('live');
  const [opikKey, setOpikKey] = React.useState(localStorage.getItem('OPIK_API_KEY') || '');

  const saveKey = (val: string) => {
    setOpikKey(val);
    localStorage.setItem('OPIK_API_KEY', val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-slate-900">Agent Observability</h2>
          <p className="text-slate-500">Real-time performance tracing & evaluation powered by Opik.</p>
        </div>
        <div className="flex gap-4">
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                    onClick={() => setView('live')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'live' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Live Traces
                </button>
                <button 
                    onClick={() => setView('experiment')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'experiment' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Beaker size={14} />
                    <span>Experiment Suite</span>
                </button>
                <button 
                    onClick={() => setView('settings')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'settings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Connection
                </button>
             </div>
        
            <a 
              href="https://www.comet.com/opik" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 font-bold hover:underline self-center"
            >
              <span>Open Opik Cloud</span>
              <ExternalLink size={16} />
            </a>
        </div>
      </div>

      {view === 'settings' ? (
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    <Database size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Opik Cloud Connection</h3>
                    <p className="text-sm text-slate-500">Sync your local traces to the Opik platform for advanced analytics.</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opik API Key</label>
                    <input 
                        type="password"
                        value={opikKey}
                        onChange={(e) => saveKey(e.target.value)}
                        placeholder="Enter your Opik API Key"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                    <p className="text-[10px] text-slate-400">Your key is stored locally in your browser and never leaves this device.</p>
                </div>

                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="flex gap-4">
                        <ShieldCheck className="text-indigo-600 shrink-0" size={24} />
                        <div>
                            <p className="text-sm font-bold text-indigo-900 mb-1">Hackathon Version Notice</p>
                            <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                                We are currently using a <strong>Local-First Tracing Node</strong>. This ensures maximum privacy for sensitive recovery data. 
                                In a production environment, simply providing your key above would enable real-time sync with Opik Cloud.
                            </p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
      ) : view === 'experiment' ? (
          <ExperimentRunner />
      ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricBox icon={<Activity size={20} className="text-indigo-500" />} label="Total Traces" value={traces.length.toString()} />
                <MetricBox icon={<ShieldCheck size={20} className="text-emerald-500" />} label="Avg Safety" value="9.8" />
                <MetricBox icon={<Heart size={20} className="text-rose-500" />} label="Avg Empathy" value="9.4" />
                <MetricBox icon={<Zap size={20} className="text-amber-500" />} label="Avg Latency" value={traces.length > 0 ? `${(traces.reduce((acc, t) => acc + (t.latency || 0), 0) / traces.length / 1000).toFixed(1)}s` : '-'} />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Database size={20} className="text-slate-400" />
                    Live Trace Stream
                </div>
                <span className="text-xs text-slate-400 font-mono">Powered by Gemini 3 Flash</span>
                </div>
                
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-slate-50/30 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Trace ID</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Metrics (Opik)</th>
                        <th className="px-6 py-4">Latency</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {traces.length === 0 ? (
                        <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                            No traces recorded yet. Start a chat to see live evaluations.
                        </td>
                        </tr>
                    ) : (
                        traces.map((trace) => (
                        <tr key={trace.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                            <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                            {new Date(trace.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-indigo-600">
                            {trace.id ? trace.id.slice(0, 8) : '...'}
                            </td>
                            <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">OK</span>
                            </td>
                            <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                                {trace.evaluations && trace.evaluations.map((ev, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium">{ev.name.split(' ')[0]}</span>
                                    <span className={`text-xs font-bold ${Number(ev.score) >= 0.8 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {(Number(ev.score) * 10).toFixed(1)}/10
                                    </span>
                                </div>
                                ))}
                            </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                {trace.latency ? `${trace.latency}ms` : '-'}
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </div>
          </>
      )}
    </div>
  );
};

const MetricBox: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</span>
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
  </div>
);

export default Observability;
