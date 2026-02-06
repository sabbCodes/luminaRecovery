import React, { useState, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  BookOpen, 
  BarChart3, 
  ShieldAlert, 
  Menu,
  Heart,
  Mic2,
  Wind
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Journal from './components/Journal';
import Insights from './components/Insights';
import Observability from './components/Observability';
import LiveSupport from './components/LiveSupport';
import CalmSpace from './components/CalmSpace';
import { UserProfile, OpikTrace } from './types';
import { RECOVERY_DISCLAIMER } from './constants';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { OnboardingModal } from './components/OnboardingModal';

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      {icon}
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </Link>
  );
};

const App: React.FC = () => {
  // Initialize DB with default profile if needed
  React.useEffect(() => {
    const initProfile = async () => {
      const exists = await db.userProfile.get('profile');
      if (!exists) {
        await db.userProfile.put({
          key: 'profile',
          value: {
            name: "",
            targetBehavior: "Compulsive Online Shopping",
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            streaks: 14
          }
        });
      }
    };
    initProfile();
  }, []);

  const userProfile = useLiveQuery(async () => {
    const p = await db.userProfile.get('profile');
    return p ? p.value : {
      name: "Loading...",
      targetBehavior: "...",
      startDate: new Date().toISOString(),
      streaks: 0
    };
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [traces, setTraces] = useState<OpikTrace[]>([]);

  const addTrace = useCallback((trace: OpikTrace) => {
    setTraces(prev => [trace, ...prev].slice(0, 50));
  }, []);

  if (!userProfile) return null; // or a loading spinner

  return (
    <>
      {!userProfile.name && <OnboardingModal onComplete={() => window.location.reload()} />}
      <Router>
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Lumina</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <div className="pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Daily Tools</div>
              <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/chat" icon={<MessageCircle size={18} />} label="Coach Chat" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/live" icon={<Mic2 size={18} />} label="Live Support" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/journal" icon={<BookOpen size={18} />} label="Journal" onClick={() => setIsSidebarOpen(false)} />
              
              <div className="pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Growth</div>
              <SidebarLink to="/insights" icon={<BarChart3 size={18} />} label="Patterns" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/calm" icon={<Wind size={18} />} label="Calm Space" onClick={() => setIsSidebarOpen(false)} />

              <div className="pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Engineering</div>
              <SidebarLink to="/observability" icon={<ShieldAlert size={18} />} label="Opik Metrics" onClick={() => setIsSidebarOpen(false)} />
            </nav>

            <div className="p-4 border-t border-slate-100">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Current Streak</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">{userProfile.streaks}</span>
                  <span className="text-xs font-medium opacity-80">Days</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Header */}
          <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
            <button 
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as</span>
                <span className="font-bold text-slate-800">{userProfile.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="group bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-xl shadow-rose-200 transition-all active:scale-95 flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse group-hover:scale-125 transition-transform" />
                <span>SOS SUPPORT</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="p-8 max-w-6xl mx-auto w-full">
              <Routes>
                <Route path="/" element={<Dashboard profile={userProfile} />} />
                <Route path="/chat" element={<Chat addTrace={addTrace} />} />
                <Route path="/live" element={<LiveSupport />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/calm" element={<CalmSpace />} />
                <Route path="/observability" element={<Observability traces={traces} />} />
              </Routes>
            </div>
          </div>

          <footer className="px-8 py-4 bg-white border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {RECOVERY_DISCLAIMER}
            </p>
          </footer>
        </main>
      </div>
    </Router>
    </>
  );
};

export default App;