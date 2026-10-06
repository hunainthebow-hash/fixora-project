import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2,
  Phone,
  MessageSquare,
  FileCheck,
  Calendar,
  ThumbsUp,
  Image as ImageIcon,
  Camera,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { ProviderOfferedService } from '../types';

export const ProviderDetailModal: React.FC = () => {
  const {
    selectedProvider,
    setSelectedProvider,
    setBookingModalProvider,
    setBookingIsEmergency,
    setChatModalBooking,
    currentUser,
    setAuthModalOpen,
    formatPrice,
    currency
  } = useApp();

  const [activeTab, setActiveTab] = useState<'services' | 'about' | 'before_after' | 'portfolio' | 'reviews' | 'credentials'>('services');
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');

  if (!selectedProvider) return null;

  const handleBookNow = (isEmergency: boolean, specificService?: ProviderOfferedService) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setBookingIsEmergency(isEmergency);
    setBookingModalProvider(selectedProvider);
    setSelectedProvider(null);
  };

  const handleChat = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setChatModalBooking({
      id: `DIRECT-${selectedProvider.id}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      customerAddress: currentUser.address,
      customerLat: 28.6139,
      customerLng: 77.2090,
      providerId: selectedProvider.id,
      provider: selectedProvider,
      categoryId: selectedProvider.categoryId,
      serviceTitle: `Inquiry with ${selectedProvider.name}`,
      problemDescription: 'Direct inquiry regarding service availability and cost estimate.',
      urgency: 'standard',
      scheduledDate: 'Today',
      scheduledTime: 'Now',
      status: 'pending',
      baseFare: selectedProvider.hourlyRate,
      emergencySurge: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: selectedProvider.hourlyRate,
      paymentMethod: 'wallet',
      paymentStatus: 'pending',
      otp: '0000',
      createdAt: new Date().toISOString(),
    });
    setSelectedProvider(null);
  };

  const filteredReviews = (selectedProvider.reviews || []).filter(r =>
    reviewFilterRating === 'all' ? true : r.rating === reviewFilterRating
  );

  const offeredServices = selectedProvider.offeredServices || [];
  const beforeAfterItems = selectedProvider.beforeAfterPortfolio || [];

  return (
    <div id="provider-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Cover Banner */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-4 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Pro</span>
            </span>
            {selectedProvider.emergencyReady && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/90 text-white shadow-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>15-Min Emergency SLA</span>
              </span>
            )}
          </div>

          <button
            id="close-provider-detail-btn"
            onClick={() => setSelectedProvider(null)}
            className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer border border-white/30 shadow-xs backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar & Primary Info Bar */}
        <div className="px-6 -mt-12 sm:-mt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-end gap-4">
            <div className="relative">
              <img
                src={selectedProvider.avatar}
                alt={selectedProvider.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-md"
              />
              {selectedProvider.isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-black dark:text-white">
                  {selectedProvider.name}
                </h2>
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-xs sm:text-sm text-black dark:text-slate-200 font-bold">
                {selectedProvider.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-black dark:text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{selectedProvider.serviceCity || selectedProvider.address} ({selectedProvider.distanceKm} km)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="detail-direct-chat-btn"
              onClick={handleChat}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Direct Chat</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'services', label: `Services & Menu (${offeredServices.length || 'Catalog'})` },
            { id: 'before_after', label: `Work Photos (${beforeAfterItems.length})` },
            { id: 'about', label: 'Overview & Bio' },
            { id: 'reviews', label: `Reviews (${selectedProvider.reviewCount})` },
            { id: 'credentials', label: 'NADRA & Badges' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OFFERED SERVICES MENU */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Service Catalog & Upfront Pricing
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Transparent rates with Fixora 30-Day Workmanship Guarantee
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  Fixed Pricing • No Hidden Costs
                </span>
              </div>

              <div className="space-y-2.5">
                {offeredServices.length > 0 ? (
                  offeredServices.map((srv, idx) => (
                    <div
                      key={srv.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                            {srv.title}
                          </span>
                          {srv.isEmergencyAllowed && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800">
                              ⚡ 15-Min SLA
                            </span>
                          )}
                          {srv.isPopular && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              ★ Popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {srv.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" /> ~{srv.durationMins} mins completion
                          </span>
                          <span>• 30-Day Fixora Warranty</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                        <div className="text-left sm:text-right">
                          <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 block">
                            ₨ {(srv.pricePKR || (srv.priceUSD ? Math.round(srv.priceUSD * 280) : 0)).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400">(${srv.priceUSD || 0} USD)</span>
                        </div>

                        <button
                          onClick={() => handleBookNow(false, srv)}
                          className="py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Book Service
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      Standard home visit inspection available starting at {formatPrice(selectedProvider.hourlyRate)}.
                    </p>
                    <button
                      onClick={() => handleBookNow(false)}
                      className="py-2 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                    >
                      Book Standard Visit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BEFORE & AFTER PORTFOLIO */}
          {activeTab === 'before_after' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Real Before & After Completed Work
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Inspected and verified photographic proofs from recent household jobs
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-indigo-600" />
                  <span>Geo-Tagged Work</span>
                </span>
              </div>

              {beforeAfterItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {beforeAfterItems.map((ba, idx) => (
                    <div
                      key={ba.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {ba.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-medium text-gray-700 dark:text-gray-300">
                          {ba.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                            Before (Issue)
                          </span>
                          <div className="h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 dark:border-slate-700">
                            <img src={ba.beforeImg} alt="Before" className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                            After (Fixed)
                          </span>
                          <div className="h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 dark:border-slate-700">
                            <img src={ba.afterImg} alt="After" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {ba.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center text-xs text-gray-500">
                  No photographic proofs uploaded yet for this technician.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OVERVIEW & BIO */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Highlights Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-base">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{selectedProvider.rating}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Overall Rating</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-center">
                  <div className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedProvider.completedJobs}+
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Jobs Completed</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-center">
                  <div className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedProvider.experienceYears} Years
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Field Experience</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-center">
                  <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    ~{selectedProvider.etaMinutes} mins
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Est. Arrival Time</span>
                </div>
              </div>

              {/* Bio description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Professional Bio
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  {selectedProvider.bio}
                </p>
              </div>

              {/* Services & Specialties */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Specialties & Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.specialties.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Verified Client Feedback
                </h4>
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setReviewFilterRating('all')}
                    className={`px-3 py-1 rounded-xl cursor-pointer ${
                      reviewFilterRating === 'all' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setReviewFilterRating(5)}
                    className={`px-3 py-1 rounded-xl cursor-pointer ${
                      reviewFilterRating === 5 ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    5★ Only
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.customerAvatar}
                          alt={rev.customerName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-white dark:border-slate-800 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{rev.customerName}</span>
                            {rev.verifiedBuyer && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Verified Job
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">{rev.date} • {rev.serviceTag}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CREDENTIALS & NADRA VERIFICATION */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Government & Background Verification Records
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-xs">
                  <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">NADRA CNIC Identity</span>
                    <span className="text-[11px] text-gray-500 font-mono">CNIC: {selectedProvider.cnicNumber || '42101-5829143-7'}</span>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                      NADRA MATCHED
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">Police Character Certificate</span>
                    <span className="text-[11px] text-gray-500">Zero criminal record on official registry</span>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                      CLEAR RECORD
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-xs">
                  <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">Trade License & Certification</span>
                    <span className="text-[11px] text-gray-500 font-mono">License #{selectedProvider.licenseNumber}</span>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold">
                      ACTIVE & VALID
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-xs">
                  <Zap className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">15-Min Fast Dispatch SLA</span>
                    <span className="text-[11px] text-gray-500">Mobile parts kit & immediate response readiness</span>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono font-bold">
                      ON CALL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer with Booking CTA */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Starting Visit Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-mono">
                {formatPrice(selectedProvider.hourlyRate)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">standard visit</span>
              {selectedProvider.emergencyReady && (
                <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">
                  • {formatPrice(selectedProvider.emergencyRate)} emergency
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedProvider.emergencyReady && (
              <button
                id="modal-book-emergency-btn"
                onClick={() => handleBookNow(true)}
                className="flex-1 sm:flex-none py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>⚡ Instant 15-Min Dispatch</span>
              </button>
            )}

            <button
              id="modal-book-regular-btn"
              onClick={() => handleBookNow(false)}
              className="flex-1 sm:flex-none py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

