import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, X, ShieldAlert, DollarSign, Send } from 'lucide-react';
import { Dispute } from '../types';

export const DisputeModal: React.FC = () => {
  const {
    disputeModalOpen,
    setDisputeModalOpen,
    activeDisputeBooking,
    setActiveDisputeBooking,
    raiseDispute,
    t
  } = useApp();

  const [reason, setReason] = useState<Dispute['reason']>('poor_quality');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!disputeModalOpen || !activeDisputeBooking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      raiseDispute(activeDisputeBooking.id, reason, description);
      setIsSubmitting(false);
      setDescription('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <h3>{t('raiseDispute')}</h3>
          </div>
          <button
            onClick={() => {
              setDisputeModalOpen(false);
              setActiveDisputeBooking(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Summary Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
            <span>Booking #{activeDisputeBooking.id}</span>
            <span className="text-indigo-600 dark:text-indigo-400">${activeDisputeBooking.totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 line-clamp-1">{activeDisputeBooking.serviceTitle}</p>
          <p className="text-[11px] text-slate-400">Provider: {activeDisputeBooking.provider.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason for Dispute
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-medium"
            >
              <option value="poor_quality">Poor Quality of Workmanship / Issue Unresolved</option>
              <option value="overcharged">Overcharged or Extra Demanded Beyond Quotation</option>
              <option value="no_show">Provider Did Not Show Up / Heavy Delay</option>
              <option value="unprofessional_conduct">Unprofessional or Inappropriate Behavior</option>
              <option value="damaged_property">Property Damaged During Service</option>
              <option value="other">Other Dispute Reason</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Explanation
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain exactly what went wrong and what resolution or refund you expect..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white leading-relaxed resize-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300">
            <strong>Customer Protection Guarantee:</strong> Our Admin Dispute team reviews every complaint within 2 hours. Verified refunds are credited instantly to your wallet.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setDisputeModalOpen(false);
                setActiveDisputeBooking(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting Dispute...' : 'Submit to Admin Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
