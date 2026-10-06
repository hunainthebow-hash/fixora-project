import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Mic,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  ChevronRight,
  Wallet,
  Bot,
  MapPin,
  Heart,
  Calculator,
  Tag,
  ArrowRight,
  Plus,
  Wrench,
  Zap,
  Snowflake,
  Sparkles,
  SlidersHorizontal,
  Navigation,
  ShieldCheck,
  AlertCircle,
  Siren,
  Hammer,
  Paintbrush,
  Monitor,
  MoreHorizontal,
  X,
  User,
  Stethoscope,
  GraduationCap,
  Truck,
  Tv,
  Globe,
  Home,
  Drill,
  Trees,
  Droplets,
  Smartphone,
  Laptop,
  LayoutGrid,
  Users,
  Flame,
  ChevronDown,
  ChevronUp,
  Car
} from 'lucide-react';
import { ProviderCard } from './ProviderCard';
import { AllCategoriesView } from './AllCategoriesView';
import { CategoryId, ProviderProfile } from '../types';
import mascotImg from '../assets/images/fixora_technician_mascot_1787994466391.jpg';

interface FixoraHomeDashboardProps {
  onOpenEstimator: () => void;
}

export const FixoraHomeDashboard: React.FC<FixoraHomeDashboardProps> = ({ onOpenEstimator }) => {
  const {
    currentUser,
    providers,
    categories,
    bookings,
    filteredProviders,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filterEmergencyOnly,
    setFilterEmergencyOnly,
    filterFavoritesOnly,
    setFilterFavoritesOnly,
    sortBy,
    setSortBy,
    setVoiceModalOpen,
    setWalletModalOpen,
    setActiveTab,
    setBookingModalProvider,
    setBookingIsEmergency,
    setActiveTrackingBooking,
    currency,
    formatPrice,
    language,
    t
  } = useApp();

  const [onlineOnly, setOnlineOnly] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAllServicesGrid, setShowAllServicesGrid] = useState(false);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    setActiveTab('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSuggestion = (query: string, categoryId?: CategoryId) => {
    setSearchQuery(query);
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
    setIsSearchFocused(false);
    setActiveTab('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'ur' ? 'صبح بخیر' : language === 'hi' ? 'शुभ प्रभात' : 'Good Morning';
    if (hour < 18) return language === 'ur' ? 'شام بخیر' : language === 'hi' ? 'शुभ दोपहर' : 'Good Afternoon';
    return language === 'ur' ? 'شب بخیر' : language === 'hi' ? 'शुभ संध्या' : 'Good Evening';
  };

  const userName = currentUser?.name?.split(' ')[0] || (language === 'ur' ? 'علی' : language === 'hi' ? 'राज' : 'Ali');

  // Metrics counts matching Image 2 mockup
  const totalBookingsCount = bookings.length > 0 ? bookings.length : 12;
  const completedCount = bookings.filter(b => b.status === 'completed').length || 8;
  const inProgressCount = bookings.filter(b => b.status === 'in_progress' || b.status === 'confirmed').length || 3;
  const avgRating = '4.8';

  // Popular 6 Services (Correct AC Repair category ID to ac_repair)
  const popularServices = [
    {
      id: 'plumbing' as CategoryId,
      name: language === 'ur' ? 'پلمبنگ' : language === 'hi' ? 'प्लंबिंग' : 'Plumbing',
      icon: Wrench,
      color: 'text-[#00B4D8] bg-[#0A192F]',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400'
    },
    {
      id: 'electrical' as CategoryId,
      name: language === 'ur' ? 'الیکٹریشن' : language === 'hi' ? 'इलेक्ट्रीशियन' : 'Electrical',
      icon: Zap,
      color: 'text-[#FFB703] bg-[#1E1702]',
      borderColor: 'border-amber-500/30 hover:border-amber-400'
    },
    {
      id: 'carpentry' as CategoryId,
      name: language === 'ur' ? 'کارپینٹری' : language === 'hi' ? 'बढ़ई / कारपेंटर' : 'Carpentry',
      icon: Hammer,
      color: 'text-[#38BDF8] bg-[#0A192F]',
      borderColor: 'border-sky-500/30 hover:border-sky-400'
    },
    {
      id: 'ac_repair' as CategoryId,
      name: language === 'ur' ? 'اے سی مرمت' : language === 'hi' ? 'एसी रिपेयर' : 'AC Repair',
      icon: Snowflake,
      color: 'text-[#00F0FF] bg-[#061B2E]',
      borderColor: 'border-cyan-400/30 hover:border-cyan-300'
    },
    {
      id: 'cleaning' as CategoryId,
      name: language === 'ur' ? 'صفائی' : language === 'hi' ? 'सफाई' : 'Cleaning',
      icon: Sparkles,
      color: 'text-[#38BDF8] bg-[#0A192F]',
      borderColor: 'border-sky-500/30 hover:border-sky-400'
    },
    {
      id: 'all' as any,
      name: language === 'ur'
        ? (showAllServicesGrid ? 'کم دیکھیں' : 'تمام دیکھیں')
        : language === 'hi'
        ? (showAllServicesGrid ? 'कम देखें' : 'सभी देखें')
        : (showAllServicesGrid ? 'Show Less' : 'View All'),
      icon: showAllServicesGrid ? ChevronUp : MoreHorizontal,
      color: 'text-[#00B4D8] bg-[#0A192F]',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400'
    }
  ];

  // Complete List of All Categories / Specialized Trade Fields
  const categoryIconMap: Record<string, { icon: React.ElementType; color: string; borderColor: string }> = {
    plumbing: { icon: Wrench, color: 'text-[#00B4D8] bg-[#0A192F]', borderColor: 'border-cyan-500/30 hover:border-cyan-400' },
    electrical: { icon: Zap, color: 'text-[#FFB703] bg-[#1E1702]', borderColor: 'border-amber-500/30 hover:border-amber-400' },
    carpentry: { icon: Hammer, color: 'text-[#38BDF8] bg-[#0A192F]', borderColor: 'border-sky-500/30 hover:border-sky-400' },
    ac_repair: { icon: Snowflake, color: 'text-[#00F0FF] bg-[#061B2E]', borderColor: 'border-cyan-400/30 hover:border-cyan-300' },
    cleaning: { icon: Sparkles, color: 'text-[#38BDF8] bg-[#0A192F]', borderColor: 'border-sky-500/30 hover:border-sky-400' },
    painting: { icon: Paintbrush, color: 'text-[#EC4899] bg-[#1F0D1B]', borderColor: 'border-pink-500/30 hover:border-pink-400' },
    appliance_repair: { icon: Tv, color: 'text-[#818CF8] bg-[#0F172A]', borderColor: 'border-indigo-500/30 hover:border-indigo-400' },
    it_services: { icon: Globe, color: 'text-[#34D399] bg-[#062419]', borderColor: 'border-emerald-500/30 hover:border-emerald-400' },
    tutoring: { icon: GraduationCap, color: 'text-[#F472B6] bg-[#210D18]', borderColor: 'border-pink-400/30 hover:border-pink-300' },
    mechanic: { icon: Car, color: 'text-[#FB923C] bg-[#241103]', borderColor: 'border-orange-500/30 hover:border-orange-400' },
    moving: { icon: Truck, color: 'text-[#A78BFA] bg-[#170E28]', borderColor: 'border-purple-500/30 hover:border-purple-400' },
    maintenance: { icon: Home, color: 'text-[#2DD4BF] bg-[#04211D]', borderColor: 'border-teal-500/30 hover:border-teal-400' },
    healthcare: { icon: Stethoscope, color: 'text-[#F87171] bg-[#270D0D]', borderColor: 'border-red-500/30 hover:border-red-400' },
    handyman: { icon: Drill, color: 'text-[#FBBF24] bg-[#221703]', borderColor: 'border-amber-400/30 hover:border-amber-300' },
    gardening: { icon: Trees, color: 'text-[#4ADE80] bg-[#072412]', borderColor: 'border-green-500/30 hover:border-green-400' },
    car_wash: { icon: Droplets, color: 'text-[#60A5FA] bg-[#081B38]', borderColor: 'border-blue-400/30 hover:border-blue-300' },
    mobile_repair: { icon: Smartphone, color: 'text-[#E879F9] bg-[#220B27]', borderColor: 'border-fuchsia-500/30 hover:border-fuchsia-400' },
    computer_repair: { icon: Laptop, color: 'text-[#38BDF8] bg-[#0A192F]', borderColor: 'border-sky-500/30 hover:border-sky-400' }
  };

  const allTradesList = categories.map(cat => {
    const styling = categoryIconMap[cat.id] || {
      icon: Wrench,
      color: 'text-[#38BDF8] bg-[#0A192F]',
      borderColor: 'border-sky-500/30 hover:border-sky-400'
    };
    return {
      id: cat.id as CategoryId,
      name: language === 'ur' ? cat.nameUrdu || cat.name : language === 'hi' ? cat.nameHindi || cat.name : cat.name,
      icon: styling.icon,
      color: styling.color,
      borderColor: styling.borderColor,
      basePrice: cat.basePrice,
      emergencyAvailable: cat.emergencyAvailable,
      activeCount: providers.filter(p => p.categoryId === cat.id && !p.isSuspended).length || cat.activeProvidersCount || 12
    };
  });

  // Handler for booking a service
  const handleQuickBook = (catId: CategoryId | 'all') => {
    if (catId === 'all') {
      setShowAllServicesGrid(prev => !prev);
      return;
    }
    setSelectedCategory(catId);
    const elem = document.getElementById('marketplace-providers-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmergencyHeroClick = () => {
    setFilterEmergencyOnly(true);
    const emergencyPro = providers.find(p => p.emergencyReady && p.isOnline) || providers[0];
    if (emergencyPro) {
      setBookingIsEmergency(true);
      setBookingModalProvider(emergencyPro);
    }
  };

  const displayedProviders = (filteredProviders || []).filter(p => {
    if (onlineOnly && !p.isOnline) return false;
    return true;
  });

  return (
    <div id="fixora-home-dashboard" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-5 pb-24">
      {/* 1. SEARCH BAR & QUICK FILTERS */}
      <div className="relative w-full max-w-3xl mx-auto space-y-2.5">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-[#0D1527] dark:bg-[#090F1C] rounded-full p-1.5 shadow-lg border border-slate-800 focus-within:border-[#00B4D8] focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all"
        >
          <Search className="w-4 h-4 text-[#00B4D8] ml-3.5 shrink-0" />
          <input
            id="hero-service-search"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
            placeholder={
              language === 'ur'
                ? 'کاریگر کا نام یا سروس تلاش کریں (مثلاً پلمبر، طارق، اے سی)...'
                : 'Search provider name or service (e.g. Tariq, Kashif, Plumber, AC Repair)...'
            }
            className="w-full pl-3 pr-2 py-2 text-xs sm:text-sm text-white placeholder-slate-400 bg-transparent rounded-full focus:outline-none"
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              id="clear-search-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0 mr-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice AI Assistant Mic Button */}
          <button
            type="button"
            id="hero-voice-mic-btn"
            onClick={() => setVoiceModalOpen(true)}
            className="p-2 sm:p-2.5 rounded-full bg-[#0077FE] hover:bg-[#0055D4] text-white transition-all shadow-md shadow-blue-600/30 cursor-pointer shrink-0 mr-1"
            title="Voice AI Assistant"
          >
            <Mic className="w-4 h-4" />
          </button>
        </form>

        {/* Live Search Auto-Suggestions Dropdown */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#091122] border border-blue-900/50 shadow-2xl p-3 space-y-3 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Matching Providers */}
            {searchQuery.trim() ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                  <span>MATCHING TECHNICIANS & SERVICES</span>
                  <span className="text-[#00B4D8]">{displayedProviders.length} Found</span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {displayedProviders.slice(0, 4).map(p => (
                    <div
                      key={p.id}
                      onMouseDown={() => handleSelectSuggestion(p.name, p.categoryId)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-950/70 border border-transparent hover:border-cyan-500/30 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{p.title} • {p.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          {p.rating}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>
                  ))}

                  {displayedProviders.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No exact matches found for "{searchQuery}". Press Enter to view directory.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 px-1 uppercase">Popular Searches</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Plumber Tariq', query: 'Tariq', cat: 'plumbing' as CategoryId },
                    { label: 'AC Master Kashif', query: 'Kashif', cat: 'hvac' as CategoryId },
                    { label: 'Electrician Bilal', query: 'Bilal', cat: 'electrical' as CategoryId },
                    { label: 'Carpenter Usman', query: 'Usman', cat: 'carpentry' as CategoryId },
                    { label: 'Water Leakage', query: 'Leakage', cat: 'plumbing' as CategoryId },
                    { label: 'AC Gas Refill', query: 'AC Gas', cat: 'hvac' as CategoryId },
                    { label: 'Short Circuit', query: 'Short Circuit', cat: 'electrical' as CategoryId }
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(sug.query, sug.cat)}
                      className="px-2.5 py-1 rounded-lg bg-[#0D1830] hover:bg-[#122347] text-cyan-300 hover:text-white border border-cyan-500/20 text-[11px] font-medium transition cursor-pointer"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Filter Tags Below Search Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFilterEmergencyOnly(false);
            }}
            className={`px-3 py-1 rounded-full font-bold whitespace-nowrap text-[11px] transition cursor-pointer border ${
              !searchQuery && selectedCategory === 'all' && !filterEmergencyOnly
                ? 'bg-[#0077FE] text-white border-blue-500 shadow-sm'
                : 'bg-[#091122] text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            All Services
          </button>
          {[
            { id: 'plumbing' as CategoryId, label: '🔧 Plumbing' },
            { id: 'electrical' as CategoryId, label: '⚡ Electrical' },
            { id: 'hvac' as CategoryId, label: '❄️ AC Repair' },
            { id: 'carpentry' as CategoryId, label: '🔨 Carpentry' },
            { id: 'cleaning' as CategoryId, label: '✨ Cleaning' },
            { id: 'painting' as CategoryId, label: '🎨 Painting' },
            { id: 'mechanic' as CategoryId, label: '🚗 Mechanic' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
                const elem = document.getElementById('marketplace-providers-section');
                elem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap text-[11px] transition cursor-pointer border ${
                selectedCategory === cat.id && !searchQuery
                  ? 'bg-[#00B4D8] text-black border-cyan-400 shadow-sm'
                  : 'bg-[#091122] text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. EMERGENCY SERVICE 24/7 HERO BANNER (Image 2 Mockup) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07132B] via-[#0A1D42] to-[#091733] border border-blue-900/40 p-5 sm:p-7 text-white shadow-xl shadow-blue-950/40 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Night City / Blueprint grid glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(#0077FE_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#00B4D8]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5 text-center md:text-left max-w-lg">
          <span className="text-[11px] sm:text-xs font-semibold text-blue-300 tracking-wide uppercase">
            {language === 'ur'
              ? 'فوری مدد کی ضرورت ہے؟'
              : language === 'hi'
              ? 'तुरंत सहायता चाहिए?'
              : 'Need help urgently?'}
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
            <span>Emergency Service</span>
            <span className="text-[#00F0FF] drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]">24/7</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            {language === 'ur'
              ? 'تصدیق شدہ پیشہ ور افراد سے فوری مدد حاصل کریں'
              : language === 'hi'
              ? 'सत्यापित पेशेवरों से तत्काल सहायता प्राप्त करें'
              : 'Get immediate help from verified professionals'}
          </p>

          <div className="pt-2">
            <button
              id="hero-book-emergency-btn"
              onClick={handleEmergencyHeroClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0077FE] hover:bg-[#0060E6] text-white text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-blue-600/40 cursor-pointer group"
            >
              <span>
                {language === 'ur'
                  ? 'ایمرجنسی بک کریں'
                  : language === 'hi'
                  ? 'इमरजेंसी बुक करें'
                  : 'Book Emergency'}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Mascot & Siren Graphic */}
        <div className="relative z-10 flex items-center justify-center gap-3 shrink-0">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36">
            <img
              src={mascotImg}
              alt="Fixora 24/7 Technician"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
            {/* 24/7 Service Glowing Badge */}
            <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-[#0077FE] text-white font-mono font-extrabold text-[9px] border border-cyan-400 shadow-md shadow-blue-500/50 flex items-center gap-1 animate-pulse">
              <Siren className="w-2.5 h-2.5" />
              <span>24/7 SERVICE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 5-METRIC STATUS BAR (Exact Replica of Image 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Metric 1: Wallet Balance */}
        <div
          onClick={() => setWalletModalOpen(true)}
          className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#091122] border border-blue-900/30 hover:border-blue-700/60 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-semibold">
            <Wallet className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>Wallet Balance</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm sm:text-base font-black font-mono text-[#00F0FF]">
              {currentUser ? formatPrice(currentUser.walletBalance) : 'PKR 2,450'}
            </span>
            <ChevronRight className="w-4 h-4 text-[#00B4D8]" />
          </div>
        </div>

        {/* Metric 2: Bookings */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="p-3.5 rounded-2xl bg-[#091122] border border-blue-900/30 hover:border-blue-700/60 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#0077FE]" />
            <span>Bookings</span>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-black font-mono text-white">
            {totalBookingsCount}
          </div>
        </div>

        {/* Metric 3: Completed */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="p-3.5 rounded-2xl bg-[#091122] border border-blue-900/30 hover:border-blue-700/60 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Completed</span>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-black font-mono text-white">
            {completedCount}
          </div>
        </div>

        {/* Metric 4: In Progress */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="p-3.5 rounded-2xl bg-[#091122] border border-blue-900/30 hover:border-blue-700/60 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>In Progress</span>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-black font-mono text-white">
            {inProgressCount}
          </div>
        </div>

        {/* Metric 5: Rating */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#091122] border border-blue-900/30 hover:border-blue-700/60 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
            <Star className="w-3.5 h-3.5 text-[#00B4D8] fill-[#00B4D8]" />
            <span>Rating</span>
          </div>
          <div className="mt-1 text-lg sm:text-xl font-black font-mono text-white">
            {avgRating}
          </div>
        </div>
      </div>

      {/* 4. POPULAR SERVICES GRID (Dynamic 6 Tiles or Expandable All 18+ Trade Fields) */}
      <div id="popular-services-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-black dark:text-white tracking-tight">
              {language === 'ur'
                ? (showAllServicesGrid ? 'تمام ۱۸+ سروسز و شعبہ جات' : 'مقبول سروسز')
                : language === 'hi'
                ? (showAllServicesGrid ? 'सभी १८+ सेवाएं एवं ट्रेड' : 'लोकप्रिय सेवाएं')
                : (showAllServicesGrid ? 'All 18+ Service Trades & Fields' : 'Popular Services')}
            </h2>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00B4D8] border border-cyan-500/20">
              {showAllServicesGrid ? `${allTradesList.length} Categories` : 'Top 6'}
            </span>
          </div>

          <button
            id="toggle-all-services-view-btn"
            onClick={() => setShowAllServicesGrid(prev => !prev)}
            className="text-xs font-bold text-[#00B4D8] hover:underline cursor-pointer flex items-center gap-1 transition"
          >
            <span>
              {language === 'ur'
                ? (showAllServicesGrid ? 'مقبول ۶ دیکھیں' : 'تمام ۱۸+ شعبہ جات دیکھیں')
                : language === 'hi'
                ? (showAllServicesGrid ? 'शीर्ष ६ देखें' : 'सभी १८+ सेवाएं देखें')
                : (showAllServicesGrid ? 'Show Top 6' : 'View All 18+ Fields')}
            </span>
            {showAllServicesGrid ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dynamic Grid: If expanded show all 18+ trades, else show top 6 */}
        {showAllServicesGrid ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allTradesList.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`field-service-card-${cat.id}`}
                    onClick={() => handleQuickBook(cat.id)}
                    className={`p-3.5 rounded-2xl bg-[#091122] border transition-all hover:scale-105 flex flex-col items-center justify-center space-y-2 cursor-pointer shadow-md text-left relative overflow-hidden group ${
                      isSelected ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/30' : cat.borderColor
                    }`}
                  >
                    {cat.emergencyAvailable && (
                      <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-800">
                        ⚡ 15m
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-center w-full">
                      <span className="text-xs font-bold text-white block truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        From {formatPrice(cat.basePrice)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Prominent Close / Collapse Bar */}
            <div className="flex items-center justify-center pt-1 pb-2">
              <button
                id="collapse-all-services-grid-btn"
                onClick={() => setShowAllServicesGrid(false)}
                className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer group"
              >
                <X className="w-4 h-4 text-rose-400 group-hover:rotate-90 transition-transform duration-200" />
                <span>{language === 'ur' ? 'بند کریں / ۶ سروسز پر واپس جائیں' : 'Close / Show Less (Top 6)'}</span>
                <ChevronUp className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
            {popularServices.map((cat, i) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={i}
                  id={`popular-service-${cat.id}`}
                  onClick={() => handleQuickBook(cat.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-[#091122] border ${
                    isSelected ? 'border-[#00B4D8] ring-2 ring-[#00B4D8]/30' : cat.borderColor
                  } transition-all hover:scale-105 flex flex-col items-center justify-center space-y-2 cursor-pointer shadow-md shadow-blue-950/20`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-200">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. TOP RATED VERIFIED TECHNICIANS / MARKETPLACE SECTION */}
      <div id="marketplace-providers-section" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#091122] border border-blue-900/40 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#00B4D8]">
                {language === 'ur'
                  ? 'کاریگر مارکیٹ پلیس'
                  : language === 'hi'
                  ? 'कारीगर मार्केटप्लेस'
                  : 'Verified Technicians Marketplace'}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#0077FE]/20 text-cyan-300 border border-blue-500/30">
                {displayedProviders.length} Available
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              {selectedCategory !== 'all'
                ? `${selectedCategory.toUpperCase()} Specialists`
                : language === 'ur'
                ? 'تمام تصدیق شدہ کاریگر'
                : language === 'hi'
                ? 'शीर्ष रेटेड सत्यापित सेवा प्रदाता'
                : 'Top Rated Verified Service Providers'}
            </h3>
          </div>

          {/* Action Toggles & Filter */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* SOS Filter */}
            <button
              onClick={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                filterEmergencyOnly
                  ? 'bg-red-950/90 text-red-400 border-red-800'
                  : 'bg-[#0D182E] text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>15-Min SOS</span>
            </button>

            {/* Online Filter */}
            <button
              onClick={() => setOnlineOnly(!onlineOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                onlineOnly
                  ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800'
                  : 'bg-[#0D182E] text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Online Now</span>
            </button>

            {/* Reset All */}
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-3 py-1.5 rounded-xl font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800 hover:bg-cyan-900/80 transition cursor-pointer"
              >
                {language === 'ur' ? 'تمام سروسز دکھائیں' : language === 'hi' ? 'सभी ट्रेड दिखाएं' : 'Show All Trades'}
              </button>
            )}
          </div>
        </div>

        {/* Providers Cards Grid */}
        {displayedProviders.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#091122] border border-slate-800 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#00B4D8] mx-auto" />
            <h4 className="font-bold text-sm text-white">
              {language === 'ur'
                ? 'اس کیٹیگری میں کوئی کاریگر آن لائن نہیں'
                : language === 'hi'
                ? 'इस श्रेणी में कोई तकनीशियन ऑनलाइन नहीं है'
                : 'No Technicians Found in This Category'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'ur'
                ? 'تمام سروسز دیکھنے کے لیے نیچے بٹن دبائیں۔'
                : language === 'hi'
                ? 'उपलब्ध सभी सत्यापित पेशेवरों को देखने के लिए नीचे क्लिक करें।'
                : 'Click below to view all available verified professionals across Karachi, Lahore & Islamabad.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setFilterEmergencyOnly(false);
                setOnlineOnly(false);
              }}
              className="py-2 px-4 rounded-xl bg-[#0077FE] text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/30"
            >
              {language === 'ur'
                ? 'تمام سروسز دکھائیں'
                : language === 'hi'
                ? 'सभी सेवा प्रदाता देखें'
                : 'View All Service Providers'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedProviders.slice(0, 6).map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}

        {displayedProviders.length > 6 && (
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setActiveTab('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-2 mx-auto cursor-pointer"
            >
              <span>
                {language === 'ur'
                  ? `تمام ${displayedProviders.length} کاریگر دیکھیں`
                  : language === 'hi'
                  ? `डायरेक्टरी में सभी ${displayedProviders.length} तकनीशियन देखें`
                  : `View All ${displayedProviders.length} Technicians in Directory`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 6. RECENT BOOKINGS LIST (Image 2 Replica) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-black dark:text-white tracking-tight">
            {language === 'ur' ? 'حالیہ بکنگز' : language === 'hi' ? 'हालिया बुकिंग' : 'Recent Bookings'}
          </h2>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs font-bold text-[#00B4D8] hover:underline cursor-pointer"
          >
            {language === 'ur' ? 'تمام دیکھیں' : language === 'hi' ? 'सभी देखें' : 'View All'}
          </button>
        </div>

        <div className="space-y-2.5">
          {[
            {
              id: 'rb-1',
              service: 'Plumbing Service',
              desc: 'Leakage in Kitchen',
              time: 'Tomorrow, 10:00 AM',
              status: 'Confirmed',
              statusStyle: 'bg-blue-950/80 text-[#00B4D8] border-blue-800/80',
              icon: Wrench,
              iconBg: 'bg-cyan-950/80 text-[#00B4D8]'
            },
            {
              id: 'rb-2',
              service: 'Electrical Service',
              desc: 'Wiring Installation',
              time: 'Today, 03:00 PM',
              status: 'In Progress',
              statusStyle: 'bg-amber-950/80 text-[#F59E0B] border-amber-800/80',
              icon: Zap,
              iconBg: 'bg-amber-950/80 text-[#F59E0B]'
            },
            {
              id: 'rb-3',
              service: 'AC Repair',
              desc: 'AC not cooling',
              time: '12 May 2024',
              status: 'Completed',
              statusStyle: 'bg-slate-800/80 text-slate-400 border-slate-700/80',
              icon: Snowflake,
              iconBg: 'bg-sky-950/80 text-[#38BDF8]'
            }
          ].map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab('dashboard')}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#091122] border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                      {item.service}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.desc}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      {item.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.statusStyle}`}>
                    {item.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. FIXORA AI ASSISTANT CARD (with 3D Mascot & Voice trigger from Image 2) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#091326] via-[#0A1835] to-[#0B1E45] border border-cyan-500/30 p-4 sm:p-5 shadow-lg shadow-blue-950/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Robot Mascot Avatar */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 shrink-0">
              <Bot className="w-7 h-7" />
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-black text-[#00B4D8] uppercase tracking-wider block">
                Fixora AI Assistant
              </span>
              <p className="text-xs sm:text-sm font-bold text-white">
                Hi {userName}! 👋 How can I help you today?
              </p>
            </div>
          </div>

          <button
            id="ai-assistant-mic-trigger"
            onClick={() => setVoiceModalOpen(true)}
            className="p-3 rounded-full bg-[#0077FE] hover:bg-[#0060E6] text-white shadow-lg shadow-blue-600/40 cursor-pointer shrink-0 transition-transform hover:scale-105"
            title="Start AI Voice Command"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 mt-3.5 flex-wrap text-xs">
          {[
            'Find Plumber',
            'AC Repair',
            'Electrician',
            'Carpentry',
            'Price Estimate'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setSearchQuery(prompt);
                setActiveTab('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1 rounded-full bg-[#0A192F] hover:bg-[#0F2342] text-cyan-300 border border-cyan-500/20 text-[11px] font-semibold transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 8. COMPREHENSIVE ALL TRADES & PRICE BENCHMARK DIRECTORY */}
      <div className="pt-4 border-t border-slate-800">
        <AllCategoriesView onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          const el = document.getElementById('marketplace-providers-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} />
      </div>

      {/* 9. BROWSE ALL SERVICE PROVIDERS CALLOUT (Directs to Services Tab) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-slate-900 border border-blue-800/60 p-5 sm:p-7 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? '۵۰+ تصدیق شدہ کاریگر آن لائن' : '50+ Background Checked Pros'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {language === 'ur'
                ? 'تمام کاریگر اور سروسز دیکھیں'
                : 'Explore All Service Providers & Categories'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {language === 'ur'
                ? 'پلمبنگ، الیکٹریشن، اے سی ریپیئر اور صفائی کے ماہرین کو سروسز سیکشن میں دیکھیں۔'
                : 'Browse verified technicians with authentic reviews, live GPS distance, and instant booking quotes.'}
            </p>
          </div>

          <button
            id="home-view-services-cta"
            type="button"
            onClick={() => {
              setActiveTab('services');
              setSelectedCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0077FE] hover:bg-[#0060E6] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer shrink-0"
          >
            <span>{language === 'ur' ? 'سروسز ڈائریکٹری کھولیں' : 'Browse Services Directory'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

