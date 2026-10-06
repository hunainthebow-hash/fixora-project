import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  Star,
  FileText,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Wallet,
  Plus,
  CreditCard,
  Smartphone,
  Building2,
  X,
  Heart,
  Gift,
  HelpCircle,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Home,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { ProviderProfile } from '../types';

export const CustomerDashboard: React.FC = () => {
  const {
    currentUser,
    providers,
    bookings,
    favorites,
    isFavorite,
    toggleFavorite,
    fastRebookProvider,
    setActiveTrackingBooking,
    setChatModalBooking,
    setReviewModalBooking,
    setReceiptModalBooking,
    cancelBooking,
    setVoiceModalOpen,
    setReferralModalOpen,
    setSupportModalOpen,
    setDisputeModalOpen,
    setActiveDisputeBooking,
    corporatePlans,
    currency,
    formatPrice,
    topUpWallet,
    setActiveTab: setGlobalActiveTab,
    language,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'favorites' | 'corporate'>('active');
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(currency === 'PKR' ? 2000 : 25);
  const [topUpMethod, setTopUpMethod] = useState<string>(currency === 'PKR' ? 'Easypaisa' : 'Credit Card');
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  const myBookings = bookings.filter(b => b.customerId === currentUser?.id);
  const activeBookings = myBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const pastBookings = myBookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const favoriteProviders = providers.filter(p => favorites.includes(p.id));

  const handleExecuteTopUp = () => {
    // In our dual currency system, base USD amount is calculated if in PKR
    const baseUsd = currency === 'PKR' ? topUpAmount / 280 : topUpAmount;
    topUpWallet(baseUsd, topUpMethod);
    setTopUpSuccess(true);
    setTimeout(() => {
      setTopUpSuccess(false);
      setTopUpModalOpen(false);
    }, 1200);
  };

  const handleOpenDispute = (booking: any) => {
    setActiveDisputeBooking(booking);
    setDisputeModalOpen(true);
  };

  return (
    <div id="customer-dashboard-container" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Navigation Strip with Back / Close Button */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <button
          id="customer-dashboard-back-btn"
          onClick={() => {
            setGlobalActiveTab('explore');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4 text-[#00B4D8]" />
          <span>{language === 'ur' ? 'ہوم پیج پر واپس جائیں' : 'Back to Home'}</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-400">
          {language === 'ur' ? 'کسٹمر پورٹل اور بکنگز' : 'Customer Account & Bookings'}
        </span>
      </div>

      {/* Header Profile Row */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser?.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
          />
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Welcome back, {currentUser?.name}</span>
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email} • {currentUser?.phone}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentUser?.address}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Wallet */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Referral Button */}
          <button
            onClick={() => setReferralModalOpen(true)}
            className="py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Refer & Earn {currency === 'PKR' ? '₨ 500' : '$16'}</span>
          </button>

          {/* Support Ticket Center */}
          <button
            onClick={() => setSupportModalOpen(true)}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Support & Dispute Desk</span>
          </button>

          {/* Wallet Balance Widget */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right flex-1 sm:flex-none">
            <div className="flex items-center justify-between gap-3 mb-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fixora Escrow Wallet</span>
              <button
                onClick={() => setTopUpModalOpen(true)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Top Up</span>
              </button>
            </div>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {formatPrice(currentUser?.walletBalance || 0)}
            </span>
          </div>

          <button
            onClick={() => setVoiceModalOpen(true)}
            className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/40 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>AI Voice Diagnosis</span>
          </button>
        </div>
      </div>

      {/* Wallet Top Up Modal */}
      {topUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Wallet className="w-5 h-5 text-indigo-400" />
                <span>Top Up Fixora Wallet</span>
              </div>
              <button
                onClick={() => setTopUpModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {topUpSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Wallet Loaded Successfully!</h4>
                <p className="text-xs text-slate-300">Added via {topUpMethod}</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Select Quick Amounts */}
                <div>
                  <label className="block text-slate-300 font-bold mb-2">Select Amount ({currency})</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(currency === 'PKR' ? [1000, 2500, 5000] : [20, 50, 100]).map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2 px-3 rounded-xl font-bold border transition ${
                          topUpAmount === amt
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {currency === 'PKR' ? `₨ ${amt.toLocaleString()}` : `$${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method selector */}
                <div>
                  <label className="block text-slate-300 font-bold mb-2">Payment Channel</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(currency === 'PKR'
                      ? [
                          { id: 'Easypaisa', icon: Smartphone, color: 'text-emerald-400' },
                          { id: 'JazzCash', icon: Smartphone, color: 'text-rose-400' },
                          { id: 'SadaPay / Raast', icon: Building2, color: 'text-teal-400' },
                          { id: 'Visa / Mastercard', icon: CreditCard, color: 'text-blue-400' },
                        ]
                      : [
                          { id: 'Credit Card', icon: CreditCard, color: 'text-indigo-400' },
                          { id: 'Stripe / Apple Pay', icon: Building2, color: 'text-blue-400' },
                        ]
                    ).map(item => {
                      const Icon = item.icon;
                      const isSel = topUpMethod === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTopUpMethod(item.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                            isSel
                              ? 'bg-indigo-950/60 border-indigo-500 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${item.color}`} />
                          <span className="font-bold text-[11px]">{item.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleExecuteTopUp}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                >
                  Pay {currency === 'PKR' ? `₨ ${topUpAmount.toLocaleString()}` : `$${topUpAmount}`} & Add to Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'active', label: `Active Dispatches (${activeBookings.length})`, icon: Clock },
          { id: 'history', label: `Order History & Invoices (${pastBookings.length})`, icon: FileText },
          { id: 'favorites', label: `Saved Favorites (${favoriteProviders.length})`, icon: Heart },
          { id: 'corporate', label: `Corporate & Society Maintenance`, icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isSel
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Bookings Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeBookings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Active Service Requests</h3>
              <p className="text-xs text-slate-400">Browse categories on the Fixora home marketplace or use the Voice Assistant to book a certified technician.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map(booking => {
                const isEmergency = booking.urgency === 'emergency';
                return (
                  <div
                    key={booking.id}
                    className={`p-6 rounded-3xl bg-slate-900 border transition-all ${
                      isEmergency
                        ? 'border-red-500/50 shadow-xl shadow-red-950/30 ring-1 ring-red-500/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.provider.avatar}
                          alt={booking.provider.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{booking.provider.name}</h3>
                            <ShieldCheck className="w-4 h-4 text-indigo-400" />
                            {isEmergency && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-red-400" />
                                <span>15-Min Emergency</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{booking.provider.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Booking ID: #{booking.id} • Date: {booking.scheduledDate} ({booking.scheduledTime})
                          </span>
                        </div>
                      </div>

                      {/* Live GPS Telemetry Badge */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block font-mono">Status</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                          <span>{booking.status.toUpperCase().replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Service Request:</span>
                        <span className="font-bold text-white block">{booking.serviceTitle}</span>
                        <span className="text-slate-400 text-[11px]">{booking.problemDescription}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-center flex flex-col justify-center">
                        <span className="text-[10px] text-indigo-400 font-semibold uppercase">Job Start Safety OTP</span>
                        <span className="text-xl font-mono font-black text-white tracking-widest">{booking.otp}</span>
                        <span className="text-[9px] text-slate-400">Share with technician on arrival</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTrackingBooking(booking)}
                          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950/40 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Open Live GPS Tracking</span>
                        </button>

                        <button
                          onClick={() => setChatModalBooking(booking)}
                          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Chat Technician</span>
                        </button>

                        <button
                          onClick={() => handleOpenDispute(booking)}
                          className="py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 text-rose-300 text-xs font-semibold flex items-center gap-1 border border-rose-800/40 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Raise Dispute</span>
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400">Total Escrow: </span>
                        <span className="text-base font-bold text-indigo-400 font-mono">
                          {formatPrice(booking.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Past History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
              No completed orders in history yet.
            </div>
          ) : (
            <div className="space-y-3">
              {pastBookings.map(b => (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={b.provider.avatar}
                      alt={b.provider.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{b.provider.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{b.serviceTitle}</p>
                      <span className="text-[10px] text-slate-500">
                        {b.scheduledDate} • {formatPrice(b.totalAmount)} • Paid via {b.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Fast Book Again */}
                    <button
                      onClick={() => fastRebookProvider(b.provider)}
                      className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Book Again</span>
                    </button>

                    <button
                      onClick={() => setReceiptModalBooking(b)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Invoice</span>
                    </button>

                    {b.status === 'completed' && !b.hasCustomerReviewed && (
                      <button
                        onClick={() => setReviewModalBooking(b)}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Rate</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorites & Fast Rebook Tab */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Saved Favorite Technicians ({favoriteProviders.length})
            </h3>
            <span className="text-xs text-slate-400">1-Click Fast Rebooking Available</span>
          </div>

          {favoriteProviders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs space-y-2">
              <Heart className="w-8 h-8 text-slate-600 mx-auto" />
              <p>You haven&apos;t saved any favorite technicians yet. Click the heart icon on any provider profile to add them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteProviders.map(prov => (
                <div
                  key={prov.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={prov.avatar}
                        alt={prov.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">{prov.name}</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <p className="text-xs text-slate-400">{prov.title}</p>
                        <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{prov.rating}</span> ({prov.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFavorite(prov.id)}
                      className="p-2 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">
                      Starts from <strong className="text-white">{formatPrice(prov.hourlyRate)}</strong>
                    </span>

                    <button
                      onClick={() => fastRebookProvider(prov)}
                      className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Book Again</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Corporate & Society Maintenance Plans Tab */}
      {activeTab === 'corporate' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-800">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Commercial & Society SLA Contracts
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                Fixora Corporate AMC Maintenance Packages
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Zero-downtime maintenance for corporate offices, commercial plazas, residential housing societies, and restaurants with guaranteed 15-minute emergency SLA dispatch.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {corporatePlans.map(plan => (
              <div
                key={plan.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-indigo-400 uppercase">
                      {plan.targetAudience}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      Monthly Contract
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-2">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.nameUrdu}</p>

                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                      {currency === 'PKR' ? `₨ ${(plan.monthlyRatePkr || 0).toLocaleString()}` : `$${plan.monthlyRateUsd || 0}`}
                      <span className="text-xs text-slate-400 font-normal"> / month</span>
                    </div>
                  </div>

                  {/* Feature list */}
                  <div className="space-y-2 mt-4 text-xs text-slate-300">
                    {plan.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Corporate Inquiry for "${plan.name}" received! A Fixora enterprise account manager will contact you within 2 hours.`)}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950/40 transition cursor-pointer"
                >
                  Inquire Enterprise SLA
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
