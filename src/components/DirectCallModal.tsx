import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, Shield } from 'lucide-react';

export const DirectCallModal: React.FC = () => {
  const { activeCallProvider, setActiveCallProvider, t } = useApp();

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    if (!activeCallProvider) {
      setCallState('ringing');
      setSeconds(0);
      return;
    }

    // Simulate answer after 2.5 seconds
    const ringTimer = setTimeout(() => {
      setCallState('connected');
    }, 2500);

    return () => clearTimeout(ringTimer);
  }, [activeCallProvider]);

  useEffect(() => {
    let interval: any = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!activeCallProvider) return null;

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      setActiveCallProvider(null);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 text-center text-white shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />

        {/* Security badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          End-to-End Masked Number Call
        </div>

        {/* Provider Avatar & Info */}
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={activeCallProvider.avatar}
              alt={activeCallProvider.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-700 shadow-xl mx-auto"
            />
            {callState === 'connected' && (
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{activeCallProvider.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeCallProvider.title}</p>
          </div>

          {/* Status text */}
          <div className="text-sm font-semibold">
            {callState === 'ringing' && (
              <span className="text-indigo-400 animate-pulse">Ringing technician...</span>
            )}
            {callState === 'connected' && (
              <div className="space-y-1">
                <span className="text-emerald-400 font-mono text-base">{formatTimer(seconds)}</span>
                <div className="flex items-center justify-center gap-1 h-3 mt-1">
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            {callState === 'ended' && <span className="text-slate-400">Call Ended</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Mute/Unmute"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 transition transform active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-3.5 rounded-full transition ${
              isSpeaker ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Speaker"
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
