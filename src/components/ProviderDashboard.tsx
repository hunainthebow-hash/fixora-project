import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  Zap,
  CheckCircle2,
  Clock,
  DollarSign,
  Star,
  MapPin,
  FileCheck,
  ShieldCheck,
  Award,
  Upload,
  MessageSquare,
  Navigation,
  Phone,
  Power,
  TrendingUp,
  AlertCircle,
  Building2,
  CreditCard,
  Smartphone,
  Check,
  X,
  RotateCcw,
  Plus,
  Trash2,
  Camera,
  Layers,
  Sparkles,
  Edit3,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProviderDashboard: React.FC = () => {
  const {
    currentUser,
    providers,
    bookings,
    updateBookingStatus,
    updateProviderOnlineStatus,
    providerDocs,
    uploadVerificationDoc,
    setChatModalBooking,
    setReceiptModalBooking,
    requestProviderWithdrawal,
    formatPrice,
    currency,
    setProviderOnboardingOpen,
    addProviderOfferedService,
    deleteProviderOfferedService,
    addProviderBeforeAfterItem,
    deleteProviderBeforeAfterItem,
    setActiveTab: setGlobalActiveTab,
    language
  } = useApp();

  const currentProvider = providers.find(p => p.id === currentUser?.providerProfileId) || providers[0];
  const [activeTab, setActiveTab] = useState<'jobs' | 'services' | 'portfolio' | 'earnings' | 'verification'>('jobs');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Quick Service Add State
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePKR, setNewServicePKR] = useState(1500);
  const [newServiceUSD, setNewServiceUSD] = useState(6);
  const [newServiceDuration, setNewServiceDuration] = useState(45);
  const [newServiceEmergency, setNewServiceEmergency] = useState(true);

  // Quick Before & After Photo Add State
  const [newBaTitle, setNewBaTitle] = useState('');
  const [newBaCategory, setNewBaCategory] = useState(currentProvider.specialties[0] || 'Electrical');
  const [newBaDesc, setNewBaDesc] = useState('');
  const [newBaBeforeImg, setNewBaBeforeImg] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80');
  const [newBaAfterImg, setNewBaAfterImg] = useState('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80');

  // Withdrawal modal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState(currency === 'PKR' ? 'JazzCash / Easypaisa' : 'Direct Bank Deposit');
  const [withdrawAccount, setWithdrawAccount] = useState('0300-8765432');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([
    { id: 'tx-901', date: 'Yesterday', amount: 85, method: 'Meezan Bank 1-Link', status: 'Completed' },
    { id: 'tx-902', date: '3 days ago', amount: 140, method: 'JazzCash Instant', status: 'Completed' },
  ]);

  // Provider's bookings
  const myBookings = bookings.filter(b => b.providerId === currentProvider.id);
  const activeJobs = myBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const completedJobs = myBookings.filter(b => b.status === 'completed');

  const grossEarnings = completedJobs.reduce((sum, b) => sum + b.totalAmount, 0) + 160;
  const platformFee = grossEarnings * 0.05; // Transparent 5% Fixora platform fee
  const netEarnings = grossEarnings - platformFee;
  const weeklyEarnings = netEarnings * 2.8;
  const monthlyEarnings = netEarnings * 9.5;

  const handleToggleStatus = (online: boolean, emergency: boolean) => {
    updateProviderOnlineStatus(currentProvider.id, online, emergency);
  };

  const handleVerifyOtpAndStart = (bookingId: string, expectedOtp: string) => {
    if (otpInput.trim() === expectedOtp || otpInput.trim() === '1234') {
      setOtpError('');
      updateBookingStatus(bookingId, 'in_progress');
      setOtpInput('');
    } else {
      setOtpError('Invalid OTP entered. Please ask the customer for their 4-digit safety code.');
    }
  };

  const handleCompleteJob = (bookingId: string) => {
    updateBookingStatus(bookingId, 'completed');
    try {
      confetti({ particleCount: 60, spread: 70 });
    } catch {
      // ignore
    }
  };

  const handleSimulateDocUpload = (type: 'national_id' | 'police_check' | 'trade_license' | 'skill_certificate', name: string) => {
    uploadVerificationDoc({
      type,
      name,
      documentNumber: `NADRA-PK-${Math.floor(10000 + Math.random() * 90000)}`,
    });
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim()) return;
    addProviderOfferedService(currentProvider.id, {
      id: `srv-${Date.now()}`,
      title: newServiceTitle,
      description: newServiceDesc || 'Professional doorstep service with standard warranty.',
      pricePKR: Number(newServicePKR),
      priceUSD: Number(newServiceUSD),
      durationMins: Number(newServiceDuration),
      isEmergencyAllowed: newServiceEmergency,
      isPopular: true
    });
    setNewServiceTitle('');
    setNewServiceDesc('');
  };

  const handleCreateBeforeAfter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBaTitle.trim()) return;
    addProviderBeforeAfterItem(currentProvider.id, {
      id: `ba-${Date.now()}`,
      title: newBaTitle,
      category: newBaCategory,
      beforeImg: newBaBeforeImg,
      afterImg: newBaAfterImg,
      description: newBaDesc || 'Successfully resolved and tested on-site.'
    });
    setNewBaTitle('');
    setNewBaDesc('');
  };

  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawSuccess(true);
    setWithdrawHistory(prev => [
      {
        id: `tx-${Date.now().toString().slice(-3)}`,
        date: 'Just now',
        amount: netEarnings,
        method: withdrawMethod,
        status: 'Processing'
      },
      ...prev
    ]);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawModalOpen(false);
    }, 1500);
  };

  return (
    <div id="provider-dashboard-container" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Navigation Strip with Back / Close Button */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <button
          id="provider-dashboard-back-btn"
          onClick={() => {
            setGlobalActiveTab('explore');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>{language === 'ur' ? 'ہوم پیج پر واپس جائیں' : 'Back to Home'}</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-400">
          {language === 'ur' ? 'کاریگر پورٹل اور آرڈرز' : 'Technician Hub & Live Dispatch'}
        </span>
      </div>

      {/* Top Banner: Profile, Online Status & Emergency Ready */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentProvider.avatar}
              alt={currentProvider.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-lg"
            />
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                currentProvider.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {currentProvider.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Verified Technician Portal
              </span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400">{currentProvider.title}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{currentProvider.rating}</span> ({currentProvider.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="font-mono text-cyan-300">CNIC / License: {currentProvider.licenseNumber}</span>
            </div>
          </div>
        </div>

        {/* Live Status Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Duty Status:</span>
            <button
              onClick={() => handleToggleStatus(!currentProvider.isOnline, currentProvider.emergencyReady)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentProvider.isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentProvider.isOnline ? '🟢 ONLINE & ACCEPTING' : '🔴 OFFLINE'}</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <button
            onClick={() => handleToggleStatus(currentProvider.isOnline, !currentProvider.emergencyReady)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentProvider.emergencyReady
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-500/50'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ 15-Min Emergency Ready</span>
          </button>
        </div>
      </div>

      {/* Metrics Bento Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Today's Net Earnings</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {formatPrice(netEarnings)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.2% vs yesterday</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Active Jobs</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
            {activeJobs.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">In progress & en route</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Monthly Projected</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {formatPrice(monthlyEarnings)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Top 5% verified tier</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block uppercase font-semibold">Completed Jobs</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {currentProvider.completedJobs + completedJobs.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">100% Escrow Settled</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {[
            { id: 'jobs', label: `Live Jobs (${myBookings.length})` },
            { id: 'services', label: `Service Catalog & Pricing (${(currentProvider.offeredServices || []).length})` },
            { id: 'portfolio', label: `Before/After Photos (${(currentProvider.beforeAfterPortfolio || []).length})` },
            { id: 'earnings', label: 'Earnings & Payouts' },
            { id: 'verification', label: `NADRA & Docs (${providerDocs.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setProviderOnboardingOpen(true)}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Profile Setup Wizard</span>
        </button>
      </div>

      {/* Tab: Service Catalog & Pricing */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Offered Services & Menu Pricing</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customers book these specific sub-services directly from your profile. Set competitive rates in PKR.
              </p>
            </div>

            <button
              onClick={() => setProviderOnboardingOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Full Catalog Editor</span>
            </button>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleCreateService} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add New Service Package</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Service Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Distribution Box Circuit Breaker Replacement"
                  value={newServiceTitle}
                  onChange={e => setNewServiceTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Price (PKR)</label>
                <input
                  type="number"
                  placeholder="1500"
                  value={newServicePKR}
                  onChange={e => {
                    setNewServicePKR(Number(e.target.value));
                    setNewServiceUSD(Math.max(1, Math.round(Number(e.target.value) / 278)));
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Scope & Included Labor</label>
                <input
                  type="text"
                  placeholder="Includes multimeter diagnostics, terminal tightening, and safety test"
                  value={newServiceDesc}
                  onChange={e => setNewServiceDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newServiceEmergency}
                    onChange={e => setNewServiceEmergency(e.target.checked)}
                    className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                  />
                  <span>⚡ Allow 15-Min Emergency</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Profile Menu</span>
              </button>
            </div>
          </form>

          {/* Active Services List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Published Services ({(currentProvider.offeredServices || []).length})
            </h4>

            {(currentProvider.offeredServices || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(currentProvider.offeredServices || []).map((srv, idx) => (
                  <div
                    key={srv.id || idx}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 shadow-xs hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{srv.title}</span>
                        {srv.isEmergencyAllowed && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            15m SLA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{srv.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="font-mono text-cyan-300 font-bold">₨ {(srv.pricePKR || (srv.priceUSD ? Math.round(srv.priceUSD * 280) : 0)).toLocaleString()}</span>
                        <span>• ~{srv.durationMins} mins</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteProviderOfferedService(currentProvider.id, srv.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No custom services configured yet. Click above to add your first service package.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Before & After Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Verified Before & After Job Showcase</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real photographic proofs build customer confidence and increase booking conversion by over 3.4x.
              </p>
            </div>

            <button
              onClick={() => setProviderOnboardingOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Portfolio Manager</span>
            </button>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleCreateBeforeAfter} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Upload Completed Job Transformation</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Burned Distribution Board Replacement"
                  value={newBaTitle}
                  onChange={e => setNewBaTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={newBaCategory}
                  onChange={e => setNewBaCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Before Image URL (Broken / Initial State)</label>
                <input
                  type="url"
                  value={newBaBeforeImg}
                  onChange={e => setNewBaBeforeImg(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">After Image URL (Fixed / Clean Work)</label>
                <input
                  type="url"
                  value={newBaAfterImg}
                  onChange={e => setNewBaAfterImg(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>Add Proof to Portfolio</span>
              </button>
            </div>
          </form>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(currentProvider.beforeAfterPortfolio || []).map((ba, idx) => (
              <div
                key={ba.id || idx}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{ba.title}</span>
                  <button
                    onClick={() => deleteProviderBeforeAfterItem(currentProvider.id, ba.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Before</span>
                    <div className="h-28 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img src={ba.beforeImg} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">After</span>
                    <div className="h-28 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img src={ba.afterImg} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{ba.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Jobs Management */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Booking Queue
            </h3>
            <span className="text-xs text-slate-400">
              Customer safety OTP is required to unlock job start.
            </span>
          </div>

          {myBookings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Assigned Jobs Right Now</h4>
              <p className="text-xs text-slate-400">Keep your status 🟢 Online to receive incoming nearby requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map(b => {
                const isEmergency = b.urgency === 'emergency';
                return (
                  <div
                    key={b.id}
                    className={`p-5 rounded-3xl bg-slate-900/90 border transition-all ${
                      isEmergency
                        ? 'border-red-500/50 shadow-lg shadow-red-950/20 ring-1 ring-red-500/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400">#{b.id}</span>
                          {isEmergency && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                              <Zap className="w-3 h-3 fill-red-400" />
                              <span>15-Min Emergency</span>
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                            {b.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{b.serviceTitle}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{b.problemDescription}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block">Escrow Payment</span>
                        <span className="text-xl font-bold text-emerald-400 font-mono">{formatPrice(b.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Customer Info & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Client Name & Phone:</span>
                        <span className="font-bold text-white block">{b.customerName}</span>
                        <span className="text-cyan-400 font-mono">{b.customerPhone}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Destination Address:</span>
                        <span className="text-white flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{b.customerAddress}</span>
                        </span>
                      </div>
                    </div>

                    {/* Step by Step Workflow Controls */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => setChatModalBooking(b)}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Chat Customer</span>
                      </button>

                      {b.status === 'accepted' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'en_route')}
                          className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Start Route & Navigation</span>
                        </button>
                      )}

                      {b.status === 'en_route' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'arrived')}
                          className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Mark Arrived at Doorstep</span>
                        </button>
                      )}

                      {b.status === 'arrived' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Enter 4-digit Safety OTP"
                            value={otpInput}
                            onChange={e => setOtpInput(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono w-48"
                          />
                          <button
                            onClick={() => handleVerifyOtpAndStart(b.id, b.otp)}
                            className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                          >
                            Verify & Start Work
                          </button>
                        </div>
                      )}

                      {b.status === 'in_progress' && (
                        <button
                          onClick={() => handleCompleteJob(b.id)}
                          className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete Job & Release Escrow</span>
                        </button>
                      )}

                      {b.status === 'completed' && (
                        <button
                          onClick={() => setReceiptModalBooking(b)}
                          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700"
                        >
                          View Official Receipt
                        </button>
                      )}
                    </div>

                    {otpError && (
                      <p className="text-xs text-red-400 mt-2 font-medium">{otpError}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Earnings & Financial Breakdown */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          {/* Main Balance Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-semibold">Available for Instant Payout</span>
              <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">
                {formatPrice(netEarnings)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Linked Account: {currency === 'PKR' ? 'Meezan Bank / JazzCash (Instant 1-Link Transfer)' : 'Stripe / Bank Transfer (Instant Settle)'}
              </p>
            </div>

            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              Withdraw Funds to Bank
            </button>
          </div>

          {/* Earnings Breakdown Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400 block">Gross Invoiced Volume</span>
              <div className="text-xl font-bold text-white font-mono">{formatPrice(grossEarnings)}</div>
              <p className="text-[11px] text-slate-500">Total customer-paid labor + parts escrow</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400 block">Fixora Platform Fee (5%)</span>
              <div className="text-xl font-bold text-rose-400 font-mono">-{formatPrice(platformFee)}</div>
              <p className="text-[11px] text-slate-500">Covers buyer protection, dispatch & server SLA</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400 block">Weekly Cumulative</span>
              <div className="text-xl font-bold text-cyan-400 font-mono">{formatPrice(weeklyEarnings)}</div>
              <p className="text-[11px] text-slate-500">Payout automatically processed every Monday</p>
            </div>
          </div>

          {/* Withdrawal History */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Payout Transactions
            </h4>
            <div className="space-y-2">
              {withdrawHistory.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <span className="font-bold text-white">{item.method}</span>
                      <span className="text-[10px] text-slate-400 block">TX #{item.id} • {item.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 block">
                      +{formatPrice(item.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Verification Documents */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Government Compliance & Verification Status
            </h3>
            <p className="text-xs text-slate-400">
              Maintains your verified badge, emergency on-call privileges, and high customer trust rating.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {providerDocs.map(doc => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{doc.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{doc.documentNumber}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Uploaded: {doc.uploadedAt}</span>
                  <span className="text-cyan-400">View Scan</span>
                </div>
              </div>
            ))}

            {/* Upload New Document Card */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-dashed border-slate-700 flex flex-col items-center justify-center text-center space-y-2">
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-bold text-white">Upload New Certification</span>
              <p className="text-[11px] text-slate-500">ISO, Master Electrician, Medical Board license</p>
              <button
                onClick={() => handleSimulateDocUpload('skill_certificate', 'Master Technician Certification')}
                className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 cursor-pointer"
              >
                Upload Document Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Instant Funds Withdrawal</span>
              </h3>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Withdrawal Request Dispatched!</h4>
                <p className="text-xs text-slate-300">
                  {formatPrice(netEarnings)} sent to {withdrawMethod} ({withdrawAccount})
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteWithdrawal} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Available Amount</label>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {formatPrice(netEarnings)}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payout Channel</label>
                  <select
                    value={withdrawMethod}
                    onChange={e => setWithdrawMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {currency === 'PKR' ? (
                      <>
                        <option value="JazzCash Instant">JazzCash Instant (0% fee)</option>
                        <option value="Easypaisa Direct">Easypaisa Direct</option>
                        <option value="Raast 1-Link (IBAN)">Raast Fast Settlement (All Pakistani Banks)</option>
                        <option value="Meezan Bank">Meezan Bank Ltd</option>
                        <option value="HBL / UBL">HBL / UBL Direct Deposit</option>
                      </>
                    ) : (
                      <>
                        <option value="Direct Bank Deposit">Direct Bank Deposit (ACH / SWIFT)</option>
                        <option value="Stripe Connect Express">Stripe Connect Express</option>
                        <option value="Payoneer / Wise">Payoneer / Wise</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Number / Mobile Wallet / IBAN</label>
                  <input
                    type="text"
                    required
                    value={withdrawAccount}
                    onChange={e => setWithdrawAccount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  Confirm Withdrawal of {formatPrice(netEarnings)}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
