import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  Clock,
  Zap,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  KeyRound,
  FileText,
  Star,
  AlertTriangle,
  Receipt,
  HandCoins
} from 'lucide-react';

export const LiveTrackingModal: React.FC = () => {
  const {
    activeTrackingBooking,
    setActiveTrackingBooking,
    updateBookingStatus,
    setChatModalBooking,
    setReviewModalBooking,
    setReceiptModalBooking,
    cancelBooking,
    setActiveCallProvider,
    setDisputeModalOpen,
    setActiveDisputeBooking,
    setBargainingModalBooking,
    formatPrice,
    t
  } = useApp();

  if (!activeTrackingBooking) return null;

  const tracking = activeTrackingBooking.liveTracking || {
    progressPercent: 65,
    etaMinutes: 6,
    distanceKm: 0.7,
    speedKmh: 28,
    step: activeTrackingBooking.status === 'completed' ? 'completed' : 'en_route',
    lastUpdated: new Date().toISOString()
  };

  const isCompleted = activeTrackingBooking.status === 'completed';
  const isArrived = activeTrackingBooking.status === 'arrived' || activeTrackingBooking.status === 'in_progress';

  const handleOpenChat = () => {
    setChatModalBooking(activeTrackingBooking);
  };

  const handleOpenReview = () => {
    setReviewModalBooking(activeTrackingBooking);
  };

  const handleOpenReceipt = () => {
    setReceiptModalBooking(activeTrackingBooking);
  };

  const handleCallTechnician = () => {
    setActiveCallProvider(activeTrackingBooking.provider);
  };

  const handleRaiseDispute = () => {
    setActiveDisputeBooking(activeTrackingBooking);
    setDisputeModalOpen(true);
  };

  // Progress calculations for animated route
  const progressRatio = (tracking.progressPercent || 20) / 100;
  let bikeX = 60;
  let bikeY = 190;

  if (progressRatio <= 0.35) {
    const subRatio = progressRatio / 0.35;
    bikeX = 60 + (180 - 60) * subRatio;
    bikeY = 190;
  } else if (progressRatio <= 0.65) {
    const subRatio = (progressRatio - 0.35) / 0.30;
    bikeX = 180;
    bikeY = 190 - (190 - 100) * subRatio;
  } else if (progressRatio <= 0.90) {
    const subRatio = (progressRatio - 0.65) / 0.25;
    bikeX = 180 + (340 - 180) * subRatio;
    bikeY = 100;
  } else {
    const subRatio = (progressRatio - 0.90) / 0.10;
    bikeX = 340;
    bikeY = 100 - (100 - 50) * Math.min(1, subRatio);
  }

  if (isArrived || isCompleted) {
    bikeX = 340;
    bikeY = 50;
  }

  return (
    <div id="live-tracking-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('liveTracking')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  #{activeTrackingBooking.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeTrackingBooking.urgency === 'emergency' ? '⚡ 15-Minute Priority Emergency Dispatch' : 'Scheduled Technician Dispatch'}
              </p>
            </div>
          </div>

          <button
            id="close-tracking-modal-btn"
            onClick={() => setActiveTrackingBooking(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Simulated Interactive Vector Map Canvas */}
          <div className="relative w-full h-56 sm:h-64 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
            <svg className="w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="400" height="240" fill="#0f172a" />
              <rect width="400" height="240" fill="url(#grid)" />

              {/* Background Roads */}
              <path d="M 20 190 L 380 190" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
              <path d="M 180 30 L 180 220" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 100 L 380 100" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
              <path d="M 340 30 L 340 220" stroke="#334155" strokeWidth="12" strokeLinecap="round" />

              {/* Active Route Path */}
              <path
                d="M 60 190 L 180 190 L 180 100 L 340 100 L 340 50"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="4"
                strokeDasharray="6,4"
                className="animate-pulse"
              />

              {/* Provider Start Hub */}
              <circle cx="60" cy="190" r="8" fill="#6366f1" />
              <circle cx="60" cy="190" r="14" fill="#6366f1" opacity="0.3" className="animate-ping" />

              {/* Customer Destination Marker */}
              <circle cx="340" cy="50" r="10" fill="#ef4444" />
              <circle cx="340" cy="50" r="18" fill="#ef4444" opacity="0.25" className="animate-ping" />
              <text x="340" y="44" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">🏠</text>

              {/* Moving Technician Icon */}
              <g transform={`translate(${bikeX - 12}, ${bikeY - 12})`}>
                <circle cx="12" cy="12" r="12" fill="#10b981" />
                <circle cx="12" cy="12" r="18" fill="#10b981" opacity="0.3" className="animate-ping" />
                <text x="12" y="15" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">🛵</text>
              </g>
            </svg>

            {/* Floating Live Telemetry HUD */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 text-white flex items-center gap-4 text-xs shadow-lg">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Estimated Arrival</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {isArrived || isCompleted ? 'Arrived at Site' : `~${tracking.etaMinutes} mins`}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Distance Left</span>
                <span className="text-sm font-bold font-mono text-indigo-400">
                  {isArrived || isCompleted ? '0.0 km' : `${tracking.distanceKm} km`}
                </span>
              </div>
            </div>

            {/* Fast-forward simulation buttons for testing */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700 text-[10px]">
              <span className="text-slate-400 px-1 font-mono">Status:</span>
              <button
                onClick={() => updateBookingStatus(activeTrackingBooking.id, 'en_route')}
                className={`px-2 py-1 rounded-lg ${activeTrackingBooking.status === 'en_route' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                En Route
              </button>
              <button
                onClick={() => updateBookingStatus(activeTrackingBooking.id, 'arrived')}
                className={`px-2 py-1 rounded-lg ${activeTrackingBooking.status === 'arrived' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                Arrived
              </button>
              <button
                onClick={() => updateBookingStatus(activeTrackingBooking.id, 'completed')}
                className={`px-2 py-1 rounded-lg ${activeTrackingBooking.status === 'completed' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                Complete
              </button>
            </div>
          </div>

          {/* Assigned Technician Profile & Security OTP */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={activeTrackingBooking.provider.avatar}
                alt={activeTrackingBooking.provider.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border border-white dark:border-slate-600 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeTrackingBooking.provider.name}</h4>
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeTrackingBooking.provider.title}</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  License: {activeTrackingBooking.provider.licenseNumber}
                </span>
              </div>
            </div>

            {/* Safety Start OTP */}
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-center shrink-0 w-full sm:w-auto">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block flex items-center justify-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>Job Start Security OTP</span>
              </span>
              <span className="text-lg font-mono font-bold text-slate-900 dark:text-white tracking-widest">
                {activeTrackingBooking.otp}
              </span>
            </div>
          </div>

          {/* Real-time Fare Negotiation / Bargaining Banner & Button */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <HandCoins className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs block">
                  {activeTrackingBooking.status === 'bargaining' ? 'Price Negotiation Active' : 'Fair Price Bidding'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current Fare: {formatPrice(activeTrackingBooking.baseFare)}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="open-bargaining-from-tracking-btn"
              onClick={() => setBargainingModalBooking(activeTrackingBooking)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition"
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>Bargain Fare</span>
            </button>
          </div>

          {/* Direct Communication Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="tracking-call-btn"
              onClick={handleCallTechnician}
              className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-600 transition cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Direct Masked Call</span>
            </button>

            <button
              id="tracking-chat-btn"
              onClick={handleOpenChat}
              className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>In-App Direct Chat</span>
            </button>
          </div>

          {/* Post Completion Actions if Job is done */}
          {isCompleted && (
            <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Job Completed & Inspected!</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="tracking-view-receipt-btn"
                  onClick={handleOpenReceipt}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>View Tax Invoice</span>
                </button>

                {!activeTrackingBooking.hasCustomerReviewed && (
                  <button
                    id="tracking-leave-review-btn"
                    onClick={handleOpenReview}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Rate Technician</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dispute & Cancellation Bar */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={handleRaiseDispute}
              className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Issue with Service? Raise Dispute / Refund</span>
            </button>

            {!isCompleted && (
              <button
                id="cancel-active-booking-btn"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this booking? Free cancellation applies before arrival.')) {
                    cancelBooking(activeTrackingBooking.id);
                  }
                }}
                className="text-slate-400 hover:text-rose-500 transition"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
