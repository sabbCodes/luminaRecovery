import * as React from 'react';
import { useState, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Loader2, Volume2, ShieldAlert } from 'lucide-react';
import { connectToLiveCoach } from '../services/geminiService';
import { decodeAudio, decodeAudioData, encodeAudio } from '../utils/audioUtils';
import { LiveServerMessage } from '@google/genai';

const LiveSupport: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    setIsModelSpeaking(false);
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = connectToLiveCoach({
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            
            /* Use manually implemented encodeAudio function from utils as required */
            const base64Pcm = encodeAudio(new Uint8Array(int16.buffer));
            
            /* Solely rely on sessionPromise resolves to send realtime input to avoid race conditions */
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: { data: base64Pcm, mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            setIsModelSpeaking(true);
            const ctx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            
            /* Manually implemented decodeAudio and decodeAudioData are used for PCM streaming */
            const audioBuffer = await decodeAudioData(
              decodeAudio(base64Audio),
              ctx,
              24000,
              1
            );

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
            };
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => {
              try { s.stop(); } catch (e) {}
            });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsModelSpeaking(false);
          }
        },
        onerror: (e: any) => {
          console.error("Live session error:", e);
          stopSession();
        },
        onclose: () => {
          setIsActive(false);
          setIsModelSpeaking(false);
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start live session:", err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-slate-900 mb-2">Voice Companion</h2>
        <p className="text-slate-500">Need to talk? Lumina is here to listen in real-time.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden p-12 flex flex-col items-center justify-center space-y-8 min-h-[500px] relative">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Visual Pulse */}
        <div className="relative">
          <div className={`absolute inset-0 bg-indigo-500/20 rounded-full transition-all duration-700 ${isActive ? 'animate-ping scale-150' : 'scale-0'}`}></div>
          <div className={`absolute inset-0 bg-indigo-500/10 rounded-full transition-all duration-1000 delay-300 ${isActive ? 'animate-ping scale-[1.8]' : 'scale-0'}`}></div>
          <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 z-10 relative ${
            isActive ? 'bg-indigo-600 shadow-2xl shadow-indigo-200' : 'bg-slate-100'
          }`}>
            {isConnecting ? (
              <Loader2 className="text-indigo-600 animate-spin" size={64} />
            ) : isActive ? (
              isModelSpeaking ? (
                <Volume2 className="text-white animate-bounce" size={64} />
              ) : (
                <Mic className="text-white" size={64} />
              )
            ) : (
              <MicOff className="text-slate-400" size={64} />
            )}
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">
            {isConnecting ? "Connecting to Lumina..." : isActive ? (isModelSpeaking ? "Lumina is speaking..." : "Listening...") : "Ready to talk?"}
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            {isActive ? "Go ahead, share what's on your mind. Everything stays between us." : "Click the button below to start a secure voice session."}
          </p>
        </div>

        <div className="flex gap-4">
          {!isActive && !isConnecting ? (
            <button 
              onClick={startSession}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
            >
              <Mic size={24} />
              Start Conversation
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="bg-rose-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all active:scale-95 flex items-center gap-3"
            >
              <PhoneOff size={24} />
              End Session
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <ShieldAlert size={14} className="text-amber-500" />
          Encrypted & Private
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Pro-Tip</p>
          <p className="text-sm text-indigo-700">Voice coaching is most effective when you're alone in a quiet space where you feel safe to speak freely.</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
          <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Grounding</p>
          <p className="text-sm text-emerald-700">If you feel overwhelmed, Lumina can guide you through a 4-7-8 breathing exercise over voice.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveSupport;
