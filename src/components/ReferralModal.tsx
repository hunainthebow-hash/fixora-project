import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  DollarSign,
  Zap,
  Sparkles,
  X,
  Award,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReferralModal: React.FC = () => {
  const {
    referralModalOpen,
    setReferralModalOpen,
    referralData,
    currentUser,
    currency,
    formatPrice
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!referralModalOpen) return null;

  const referralLink = `https://fixora.pk/join?ref=${referralData.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch {
      // ignore
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Get 20% OFF your first home maintenance or emergency repair on Fixora! Use my referral code ${referralData.code} or click: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      id="referral-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-0">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white text-center relative">
          <button
            onClick={() => setReferralModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg">
            <Gift className="w-7 h-7 text-amber-300 animate-bounce" />
          </div>

          <h2 className="text-xl font-black tracking-tight">
            Invite Friends & Earn {currency === 'PKR' ? '₨ 500 Credit' : '$16 Credit'}
          </h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-xs mx-auto">
            Your friends get <span className="font-bold text-amber-300">20% OFF</span> their first booking, and you get instant wallet cash once their job is completed!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invites</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {referralData.totalInvited}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {referralData.completedBookings}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Earned Cash</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {formatPrice(referralData.earnedCashUSD)}
              </span>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Your Exclusive Referral Code
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-black font-mono tracking-widest text-indigo-600 dark:text-indigo-400">
                {referralData.code}
              </span>
              <button
                onClick={handleCopyLink}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link!' : 'Copy Code & Link'}</span>
              </button>
            </div>
          </div>

          {/* Direct Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Direct Link</span>
            </button>
          </div>

          {/* Recent Referrals List */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
              Recent Referrals Tracker
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {referralData.invitedUsers.map((item, index) => (
                <div
                  key={index}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400">Joined: {item.joinedDate}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {item.status === 'completed'
                      ? `+${formatPrice(item.rewardEarnedUSD)} Earned`
                      : 'Pending 1st Booking'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
