import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, X, AlertTriangle, Send } from 'lucide-react';

export const ReportModal: React.FC = () => {
  const {
    reportModalOpen,
    setReportModalOpen,
    reportTargetUser,
    setReportTargetUser,
    reportUser,
    t
  } = useApp();

  const [reason, setReason] = useState('Unprofessional or Rude Behavior');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!reportModalOpen || !reportTargetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      reportUser(reportTargetUser.id, reportTargetUser.name, reportTargetUser.role, reason, details);
      setSubmitting(false);
      setDetails('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
            <ShieldAlert className="w-5 h-5" />
            <h3>Report User / Safety Concern</h3>
          </div>
          <button
            onClick={() => {
              setReportModalOpen(false);
              setReportTargetUser(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-xs border border-slate-200 dark:border-slate-600">
          Reporting: <strong className="text-slate-900 dark:text-white">{reportTargetUser.name}</strong> ({reportTargetUser.role})
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Violation Category
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
            >
              <option>Unprofessional or Rude Behavior</option>
              <option>Demanding Cash / Off-Platform Payment</option>
              <option>Misleading Credentials / Fake Profile</option>
              <option>Safety Violation / Harassment</option>
              <option>Fraudulent Quotation</option>
              <option>Other Community Guideline Violation</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Incident Details
            </label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe what occurred in detail..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setReportModalOpen(false);
                setReportTargetUser(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting Report...' : 'Submit Safety Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
