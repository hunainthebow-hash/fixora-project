import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  HandCoins,
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { USD_TO_PKR_RATE } from '../utils/currency';

export const BargainingModal: React.FC = () => {
  const {
    bargainingModalBooking,
    setBargainingModalBooking,
    sendBargainOffer,
    respondBargainOffer,
    currentUser,
    formatPrice,
    setChatModalBooking,
    language
  } = useApp();

  const booking = bargainingModalBooking;

  const initialPKR = booking ? Math.round((booking.baseFare || 10) * USD_TO_PKR_RATE) : 1000;
  const [proposedPKR, setProposedPKR] = useState<number>(initialPKR);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!booking) return null;

  const currentBaseUSD = booking.baseFare;
  const currentBasePKR = Math.round(currentBaseUSD * USD_TO_PKR_RATE);
  const offers = booking.offersHistory || [];
  const latestOffer = offers[offers.length - 1];

  const handleQuickAdjust = (delta: number) => {
    setProposedPKR(prev => Math.max(200, prev + delta));
  };

  const handleSendOffer = () => {
    if (proposedPKR < 200) {
      setFeedbackMsg(language === 'ur' ? 'کم از کم پیشکش ₨ 200 ہونی چاہیے' : 'Minimum offer is ₨ 200');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const offerUSD = +(proposedPKR / USD_TO_PKR_RATE).toFixed(2);
    const result = sendBargainOffer(booking.id, offerUSD, proposedPKR);

    setTimeout(() => {
      setIsSubmitting(false);
      setFeedbackMsg(language === 'ur' ? 'پیشکش ٹیکنیشن کو بھیج دی گئی ہے!' : 'Offer dispatched to technician!');
    }, 600);
  };

  const handleAcceptOffer = (offerId: string) => {
    respondBargainOffer(booking.id, offerId, 'accept');
    setFeedbackMsg(language === 'ur' ? 'ڈیل منظور ہو گئی ہے!' : 'Fare agreed successfully!');
    setTimeout(() => {
      setBargainingModalBooking(null);
    }, 1500);
  };

  const handleDeclineOffer = (offerId: string) => {
    respondBargainOffer(booking.id, offerId, 'decline');
  };

  return (
    <div id="bargaining-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'ur' ? 'ریٹ کم کرائیں (Price Bidding)' : 'Fair Price Bidding'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                  Live
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ur' ? 'ٹیکنیشن کے ساتھ من پسند ریٹ طے کریں' : 'Negotiate and agree on a fair price with the technician'}
              </p>
            </div>
          </div>

          <button
            id="close-bargaining-modal-btn"
            onClick={() => setBargainingModalBooking(null)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Prominent Task Name ("Kaam Ka Naam") */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
              {language === 'ur' ? 'کام کی تفصیل (Service Task):' : 'Service Task Details:'}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {booking.serviceTitle}
            </h3>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                {language === 'ur' ? 'ٹیکنیشن:' : 'Technician:'} <strong className="text-slate-900 dark:text-white">{booking.provider.name}</strong>
              </span>
              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                {language === 'ur' ? 'ابتدائی ریٹ:' : 'Base Rate:'} ₨ {currentBasePKR.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Feedback Message if any */}
          {feedbackMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Real-time Bidding Stream / Offer History */}
          <div className="space-y-3">
            <label className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{language === 'ur' ? 'پیشکشوں کی تاریخ (Live Offers):' : 'Negotiation History:'}</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
              </span>
            </label>

            {offers.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center text-slate-500 dark:text-slate-400 text-xs">
                <Sparkles className="w-5 h-5 mx-auto mb-1.5 text-amber-500 opacity-70" />
                <span>
                  {language === 'ur'
                    ? 'ابھی تک کوئی پیشکش نہیں کی گئی۔ آپ اپنی مرضی کا ریٹ منتخب کر کے بھیج سکتے ہیں۔'
                    : 'No offers yet. Propose your custom fare below to start bargaining.'}
                </span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {offers.map(offer => {
                  const isFromMe = (currentUser?.role === 'provider' && offer.offeredBy === 'provider') ||
                                   (currentUser?.role !== 'provider' && offer.offeredBy === 'customer');

                  return (
                    <div
                      key={offer.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        offer.status === 'accepted'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700'
                          : isFromMe
                          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {offer.offeredByName}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {offer.timestamp}
                          </span>
                        </div>
                        <div className="text-base font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                          ₨ {offer.amountPKR.toLocaleString()} <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">PKR</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {offer.status === 'accepted' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{language === 'ur' ? 'منظور شدہ' : 'Agreed'}</span>
                          </span>
                        ) : offer.status === 'declined' ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">
                            {language === 'ur' ? 'رد' : 'Declined'}
                          </span>
                        ) : !isFromMe && offer.status === 'pending' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAcceptOffer(offer.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer transition"
                            >
                              {language === 'ur' ? 'قبول کریں' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeclineOffer(offer.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300 cursor-pointer transition"
                            >
                              {language === 'ur' ? 'رد' : 'Pass'}
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{language === 'ur' ? 'جواب کا انتظار...' : 'Pending reply...'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Propose Your Own Price Input */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <label className="block font-bold text-slate-900 dark:text-white">
              {language === 'ur' ? 'اپنی پیشکش مقرر کریں (Your Price Offer):' : 'Set Your Target Fare:'}
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 dark:text-slate-400 text-sm">
                  ₨
                </span>
                <input
                  type="number"
                  min="200"
                  step="50"
                  value={proposedPKR}
                  onChange={e => setProposedPKR(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSendOffer}
                className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>{language === 'ur' ? 'پیشکش بھیجیں' : 'Send Offer'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Adjustment Buttons (-₨ 200, -₨ 100, +₨ 100, +₨ 200) */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">
                {language === 'ur' ? 'فوری تبدیل:' : 'Quick adjust:'}
              </span>
              <button
                type="button"
                onClick={() => handleQuickAdjust(-200)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                -₨ 200
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(-100)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                -₨ 100
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(100)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                +₨ 100
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(200)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                +₨ 200
              </button>
            </div>
          </div>

          {/* Safe Escrow Assurance */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {language === 'ur'
                ? 'جب ریٹ طے ہو جائے گا، رقم آپ کے والٹ سے کٹ کر Fixora کے 100% محفوظ اسکرو میں چلی جائے گی۔ کام کے بعد 4 ہندسوں کا OTP دینے پر ہی ٹیکنیشن کو ادائیگی ہوگی۔'
                : 'Once a fare is agreed, the exact amount is held in Fixora 100% secure escrow. Technician is only paid when you provide the 4-digit security OTP after inspection.'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setChatModalBooking(booking);
              setBargainingModalBooking(null);
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'ٹیکنیشن کے ساتھ چیٹ کھولیں' : 'Open Direct Chat'}</span>
          </button>

          <button
            type="button"
            onClick={() => setBargainingModalBooking(null)}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 cursor-pointer transition"
          >
            {language === 'ur' ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
