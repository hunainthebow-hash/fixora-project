import React from 'react';
import { useApp } from '../context/AppContext';
import { Zap, AlertTriangle, Clock, ShieldCheck, Flame, Droplets, HeartPulse, ChevronRight } from 'lucide-react';
import { CategoryId } from '../types';

export const EmergencyBanner: React.FC = () => {
  const { setVoiceModalOpen, setSelectedCategory, setFilterEmergencyOnly, setBookingModalProvider, providers, setBookingIsEmergency } = useApp();

  const handleQuickEmergency = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setFilterEmergencyOnly(true);
    // Find nearest online provider in this category
    const match = providers.find(p => p.categoryId === catId && p.isOnline && p.emergencyReady);
    if (match) {
      setBookingIsEmergency(true);
      setBookingModalProvider(match);
    }
  };

  return (
    <div id="emergency-banner" className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4">
      <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 p-4 sm:p-5 shadow-sm">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-red-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 shrink-0">
              <Zap className="w-5 h-5 fill-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span>⚡ 15-Minute Emergency Response</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider shadow-xs">
                    24/7 SLA
                  </span>
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Urgent pipe leak, power blackout, sparking MCB or vehicle breakdown? Instant dispatch to nearest verified pro.
              </p>
            </div>
          </div>

          {/* Rapid Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              id="emergency-pipe-burst-btn"
              onClick={() => handleQuickEmergency('plumbing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-red-200 text-xs font-semibold text-red-700 transition-all cursor-pointer shadow-xs"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Pipe Burst</span>
            </button>

            <button
              id="emergency-short-circuit-btn"
              onClick={() => handleQuickEmergency('electrical')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-amber-200 text-xs font-semibold text-amber-700 transition-all cursor-pointer shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Short Circuit</span>
            </button>

            <button
              id="emergency-medical-btn"
              onClick={() => handleQuickEmergency('healthcare')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-rose-200 text-xs font-semibold text-rose-700 transition-all cursor-pointer shadow-xs"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Medical Nurse</span>
            </button>

            <button
              id="emergency-voice-sos-btn"
              onClick={() => setVoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer shrink-0 ml-auto md:ml-0"
            >
              <span>Speak Emergency</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
