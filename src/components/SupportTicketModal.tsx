import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  PhoneCall,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { SupportTicket } from '../types';

export const SupportTicketModal: React.FC = () => {
  const {
    supportModalOpen,
    setSupportModalOpen,
    supportTickets,
    createSupportTicket,
    replySupportTicket,
    currentUser,
    currency,
    formatPrice
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tickets' | 'new' | 'faq'>('tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    supportTickets.length > 0 ? supportTickets[0].id : null
  );

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('service_quality');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [initialMessage, setInitialMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!supportModalOpen) return null;

  const currentTicket = supportTickets.find(t => t.id === selectedTicketId) || supportTickets[0];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;

    const created = createSupportTicket(subject.trim(), category, priority, initialMessage.trim());
    setSelectedTicketId(created.id);
    setSubject('');
    setInitialMessage('');
    setActiveTab('tickets');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentTicket) return;

    replySupportTicket(currentTicket.id, replyText.trim());
    setReplyText('');
  };

  const faqs = [
    {
      q: 'How does Fixora Price Protection & 100% Money-Back Guarantee work?',
      a: 'Fixora locks your labor and parts estimates in an escrow deposit. If a technician fails to arrive or the job is unsatisfactory, our automated dispute desk halts provider payout and refunds your full amount to your wallet, Raast, or JazzCash within 24 hours.'
    },
    {
      q: 'Are all technicians police and government CNIC verified?',
      a: 'Yes. Every technician on Fixora is required to pass a 3-tier vetting process: National CNIC verification with NADRA, criminal record background check, and skill certification testing.'
    },
    {
      q: 'What is the 15-Minute Emergency Response SLA?',
      a: 'When you book an "Emergency" service, our algorithmic dispatcher alerts the nearest on-call certified providers within a 3km radius. Technicians equipped with on-bike service kits accept and navigate directly to your doorstep.'
    },
    {
      q: 'Can I pay in Pakistani Rupees (PKR) and US Dollars (USD)?',
      a: 'Yes! Fixora supports dual-currency processing. You can switch between PKR (Easypaisa, JazzCash, SadaPay, Raast) and USD (Stripe, Visa, Mastercard, Apple Pay) seamlessly at checkout.'
    },
    {
      q: 'What is the cancellation and refund policy?',
      a: 'Free cancellations are allowed up to 15 minutes before the scheduled time or before the technician marks "En Route". For cancellations after technician arrival, a standard fuel fee applies.'
    }
  ];

  return (
    <div
      id="support-ticket-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in"
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Fixora Help & Safety Center</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  24/7 Escrow Protection
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Diagnostics, Live Support Desk & Transparent Dispute Arbitration
              </p>
            </div>
          </div>

          <button
            onClick={() => setSupportModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
          {[
            { id: 'tickets', label: `My Support Cases (${supportTickets.length})`, icon: MessageSquare },
            { id: 'new', label: 'Open New Support Ticket', icon: Plus },
            { id: 'faq', label: 'Safety & Refund Policies (FAQ)', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                  isSel
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TICKETS LIST & CONVERSATION */}
          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Tickets Queue */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Recent Tickets
                  </span>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    + New
                  </button>
                </div>

                {supportTickets.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                    No support tickets opened yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {supportTickets.map(ticket => {
                      const isSelected = selectedTicketId === ticket.id;
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                              : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] text-slate-400 uppercase">
                              #{ticket.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                ticket.status === 'resolved'
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : ticket.status === 'in_progress'
                                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                  : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                              }`}
                            >
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {ticket.subject}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Category: {ticket.category.replace('_', ' ')} • {ticket.createdAt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Active Conversation */}
              <div className="md:col-span-2 flex flex-col h-[460px] bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {currentTicket ? (
                  <>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {currentTicket.subject}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Case #{currentTicket.id} • Assigned to: {currentTicket.assignedAgentName || 'Fixora AI Resolution Arbiter'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        Priority: {currentTicket.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {currentTicket.messages.map(msg => {
                        const isUser = msg.sender === 'user';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1">
                              <span>{msg.senderName}</span>
                              <span>•</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <div
                              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isUser
                                  ? 'bg-indigo-600 text-white rounded-tr-none'
                                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form
                      onSubmit={handleSendReply}
                      className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type reply or provide details for fast resolution..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-slate-500">
                    Select a ticket on the left or create a new request.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE NEW TICKET */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateTicket} className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200">
                  All requests are backed by Fixora Buyer Protection. If you had an issue with pricing or service quality, our team will review the technician telemetry and resolve it with full refund authorization.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Overcharged on AC Gas Refill / Technician No-Show"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Issue Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="billing">Billing & Overcharge Dispute</option>
                    <option value="service_quality">Service Quality or Incomplete Repair</option>
                    <option value="cancellation">Cancellation & Refund Status</option>
                    <option value="technician_conduct">Technician Punctuality / Behavior</option>
                    <option value="app_bug">App Feature / Payment Gateway Issue</option>
                    <option value="other">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Urgency Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="low">Low (General Query)</option>
                    <option value="medium">Medium (Standard Review)</option>
                    <option value="high">High (Immediate Dispute)</option>
                    <option value="emergency">Emergency (Ongoing Active Job)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Explanation & Evidence
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe what happened, booking ID if applicable, and expected resolution..."
                  value={initialMessage}
                  onChange={e => setInitialMessage(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Submit Priority Support Ticket
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FAQ ACCORDION */}
          {activeTab === 'faq' && (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Fixora uses automated escrow. Payments are released to providers only after you verify the job with the safety OTP and approve completion.
                </span>
              </div>

              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
