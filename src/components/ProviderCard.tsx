import React from 'react';
import { motion } from 'motion/react';
import { ProviderProfile } from '../types';
import { useApp } from '../context/AppContext';
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  MessageSquare,
  Heart,
  Phone,
  ShieldAlert,
  CalendarCheck,
  Crown,
  Sparkles,
  Percent
} from 'lucide-react';

interface ProviderCardProps {
  provider: ProviderProfile;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const {
    setSelectedProvider,
    setBookingModalProvider,
    setBookingIsEmergency,
    setChatModalBooking,
    currentUser,
    setAuthModalOpen,
    favorites,
    toggleFavorite,
    isFavorite,
    setActiveCallProvider,
    setReportModalOpen,
    setReportTargetUser,
    currency,
    formatPrice,
    language,
    t
  } = useApp();

  const handleBook = (isEmergency: boolean) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setBookingIsEmergency(isEmergency);
    setBookingModalProvider(provider);
  };

  const handleDirectChat = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setChatModalBooking({
      id: `DIRECT-${provider.id}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      customerAddress: currentUser.address,
      customerLat: 28.6139,
      customerLng: 77.2090,
      providerId: provider.id,
      provider: provider,
      categoryId: provider.categoryId,
      serviceTitle: `Direct Inquiry: ${provider.title}`,
      problemDescription: 'Direct inquiry regarding service availability.',
      urgency: 'standard',
      scheduledDate: 'Today',
      scheduledTime: 'Now',
      status: 'accepted',
      baseFare: provider.hourlyRate,
      emergencySurge: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: provider.hourlyRate,
      paymentMethod: 'wallet',
      paymentStatus: 'pending',
      otp: '0000',
      createdAt: new Date().toISOString(),
    });
  };

  const handleCall = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setActiveCallProvider(provider);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReportTargetUser({
      id: provider.id,
      name: provider.name,
      role: 'provider'
    });
    setReportModalOpen(true);
  };

  const favorited = isFavorite(provider.id);
  const isProVip = provider.subscription?.tier === 'pro_vip' || provider.isFeatured || provider.commissionRate === 5;

  return (
    <motion.div
      id={`provider-card-${provider.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative rounded-3xl bg-white/90 dark:bg-slate-850/90 backdrop-blur-xl border transition-all duration-300 p-5 shadow-xs hover:shadow-xl flex flex-col justify-between overflow-hidden ${
        isProVip
          ? 'border-amber-300/80 dark:border-amber-600/60 ring-1 ring-amber-400/20 hover:border-amber-400'
          : 'border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500'
      }`}
    >
      {/* Decorative ambient top glow for VIP providers */}
      {isProVip && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-indigo-500" />
      )}

      <div>
        {/* Top Badges, Avatar & Favorite Button */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="relative">
            <div className="relative">
              <img
                src={provider.avatar}
                alt={provider.name}
                referrerPolicy="no-referrer"
                className={`w-16 h-16 rounded-2xl object-cover border-2 shadow-xs group-hover:scale-105 transition-transform duration-300 ${
                  isProVip ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white dark:border-slate-700'
                }`}
              />
              {provider.isOnline && (
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>
              )}
            </div>

            {isProVip && (
              <span className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-1 rounded-full shadow-md">
                <Crown className="w-3 h-3 fill-white" />
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleFavorite(provider.id)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  favorited
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                }`}
                title={favorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleCall}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Direct In-App Voice Call"
              >
                <Phone className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="flex items-center gap-1">
              {isProVip && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                  <span>VIP PRO</span>
                </span>
              )}

              {provider.emergencyReady && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-0.5 animate-pulse">
                  <Zap className="w-2.5 h-2.5 fill-rose-600" />
                  <span>15-MIN SLA</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Name & Title */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-extrabold text-black dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {provider.name}
              </h3>
              {provider.isVerified && (
                <span title="Govt CNIC & Trade Verified Pro">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 inline shrink-0" />
                </span>
              )}
            </div>

            <button
              onClick={handleReport}
              className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-rose-600 p-1 cursor-pointer"
              title="Report Provider"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-black dark:text-slate-200 font-bold line-clamp-1 mt-0.5">
            {provider.title}
          </p>
        </div>

        {/* Distance & Rating Stats */}
        <div className="flex items-center gap-2.5 py-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 mb-3 text-xs">
          <div className="flex items-center gap-1 text-amber-600 font-black">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{provider.rating}</span>
            <span className="text-black dark:text-slate-300 font-bold">({provider.reviewCount})</span>
          </div>
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="text-black dark:text-slate-200 font-bold">
            <span className="font-extrabold text-black dark:text-white">{provider.completedJobs}</span> jobs
          </div>
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="text-black dark:text-slate-200 font-bold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>{provider.distanceKm}km</span>
          </div>
        </div>

        {/* Specialties Tags & Commission Rate Guarantee */}
        <div className="space-y-2 mb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {provider.specialties.slice(0, 3).map((spec, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold"
              >
                {spec}
              </span>
            ))}
            {provider.specialties.length > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-300 font-bold">
                +{provider.specialties.length - 3}
              </span>
            )}
          </div>

          {/* Low Commission / Escrow Protection Badge */}
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-black dark:text-slate-300 font-bold">
            <span className="flex items-center gap-1 text-black dark:text-slate-200">
              <Percent className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Fixora Escrow:</span>
            </span>
            <span className="font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
              {isProVip ? '5% VIP' : '12% Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing and Action Buttons Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-black dark:text-slate-300 uppercase tracking-wider block font-black">Standard Fare</span>
            <div className="text-lg font-black text-black dark:text-white font-mono flex items-baseline gap-1">
              <span>{formatPrice(provider.hourlyRate)}</span>
              <span className="text-xs font-bold text-black dark:text-slate-300 font-sans"> / visit</span>
            </div>
          </div>

          {provider.emergencyReady && (
            <div className="text-right">
              <span className="text-[10px] text-rose-700 dark:text-rose-400 uppercase tracking-wider block font-black">⚡ Emergency</span>
              <div className="text-sm font-black text-rose-700 dark:text-rose-400 font-mono">
                {formatPrice(provider.emergencyRate)}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            id={`chat-prov-${provider.id}`}
            onClick={handleDirectChat}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Chat</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            id={`view-prov-${provider.id}`}
            onClick={() => setSelectedProvider(provider)}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
          >
            <span>Profile & Reviews</span>
          </motion.button>
        </div>

        {/* Primary Booking Button(s) */}
        {provider.emergencyReady ? (
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              id={`book-regular-prov-${provider.id}`}
              onClick={() => handleBook(false)}
              className="py-2.5 px-2.5 rounded-xl bg-[#1565D8] hover:bg-[#0D47A1] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-[#1565D8]/20 transition-all cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Book Regular</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              id={`book-emergency-prov-${provider.id}`}
              onClick={() => handleBook(true)}
              className="py-2.5 px-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>⚡ 15-Min SOS</span>
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            id={`book-regular-prov-${provider.id}`}
            onClick={() => handleBook(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1565D8] hover:bg-[#0D47A1] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#1565D8]/20 transition-all cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

