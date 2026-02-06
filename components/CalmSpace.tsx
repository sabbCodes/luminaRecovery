import * as React from 'react';
import { useState } from 'react';
import { generateCalmImage } from '../services/geminiService';
import { Sparkles, Download, RefreshCcw, Loader2, Image as ImageIcon } from 'lucide-react';

const CalmSpace: React.FC = () => {
  const [prompt, setPrompt] = useState('A serene Zen garden at sunset with floating cherry blossom petals and a mirror-like pond.');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const url = await generateCalmImage(prompt);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-slate-900 mb-2">Calm Space Generator</h2>
          <p className="text-slate-500">Describe your ideal place of peace, and let AI visualize it for you.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">My Peaceful Vision</label>
          <div className="flex flex-col md:flex-row gap-4">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-100 text-slate-700 text-lg leading-relaxed resize-none h-32 md:h-auto"
              placeholder="e.g., A floating forest in the clouds with soft bioluminescent lights..."
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="md:w-48 bg-indigo-600 text-white rounded-3xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:bg-slate-200 shadow-xl shadow-indigo-100 py-6"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              <span>{loading ? 'Visualizing...' : 'Create Space'}</span>
            </button>
          </div>
        </div>

        <div className="relative group">
          {imageUrl ? (
            <div className="relative animate-in zoom-in-95 duration-700">
              <img 
                src={imageUrl} 
                alt="Personalized Calm Space" 
                className="w-full aspect-video object-cover rounded-[2.5rem] shadow-2xl"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                   onClick={() => window.open(imageUrl)}
                   className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/40 transition-all"
                   title="Download"
                >
                  <Download size={20} />
                </button>
                <button 
                   onClick={handleGenerate}
                   className="bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/40 transition-all"
                   title="Regenerate"
                >
                  <RefreshCcw size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
              <ImageIcon size={64} strokeWidth={1} className="mb-4" />
              <p className="font-medium">Enter a vision above to see your calm space</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SuggestionCard 
          title="Forest Sanctuary" 
          desc="Ancient redwoods with morning mist and golden sunlight filters." 
          onClick={() => setPrompt("Ancient redwoods with morning mist and golden sunlight filtering through the canopy.")}
        />
        <SuggestionCard 
          title="Stellar Library" 
          desc="A grand, circular library with floor-to-ceiling glass looking out at a nebula." 
          onClick={() => setPrompt("A cozy grand circular library with floating books and a giant window looking out into a purple nebula.")}
        />
        <SuggestionCard 
          title="Desert Night" 
          desc="Moonlit dunes under a crystal clear sky with a billion stars." 
          onClick={() => setPrompt("Vast moonlit sand dunes under a massive Milky Way sky, deep blues and silvers.")}
        />
      </div>
    </div>
  );
};

const SuggestionCard: React.FC<{ title: string, desc: string, onClick: () => void }> = ({ title, desc, onClick }) => (
  <button 
    onClick={onClick}
    className="text-left p-6 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group"
  >
    <p className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{title}</p>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </button>
);

export default CalmSpace;
