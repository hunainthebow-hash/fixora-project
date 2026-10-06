import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FixoraLogo } from './FixoraLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Zap,
  Mic,
  Search,
  MapPin,
  Heart,
  Bell,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  Briefcase,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  Gift,
  HelpCircle,
  Smartphone,
  Sparkles,
  Menu,
  X,
  Home,
  Wrench,
  Bot,
  Calendar,
  MessageSquare,
  Settings,
  AlertTriangle,
  CreditCard,
  ChevronRight,
  PhoneCall,
  Check,
  DollarSign,
  Plus,
  Star,
  ArrowUpRight,
  Wallet,
  Crown,
  Sliders
} from 'lucide-react';
import { ProviderProfile, CategoryId } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    switchRole,
    logout,
    searchQuery,
    setSearchQuery,
    userAddress,
    setUserAddress,
    setVoiceModalOpen,
    setAuthModalOpen,
    setAuthModalMode,
    setAuthTargetRole,
    setReferralModalOpen,
    setSupportModalOpen,
    setPlayStoreModalOpen,
    setProviderOnboardingOpen,
    setChatModalBooking,
    setWalletModalOpen,
    setSubscriptionModalOpen,
    setSettingsModalOpen,
    isFirebaseConnected,
    bookings,
    providers,
    categories,
    selectedProvider,
    setSelectedProvider,
    setBookingModalProvider,
    formatPrice,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    theme,
    setTheme,
    currency,
    toggleCurrency,
    favorites,
    filterFavoritesOnly,
    setFilterFavoritesOnly,
    filterEmergencyOnly,
    setFilterEmergencyOnly,
    unreadNotifCount,
    setNotifDrawerOpen,
    topUpWallet,
    setActiveCallProvider,
    setSelectedCategory,
    t
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [addressEditing, setAddressEditing] = useState(false);
  const [tempAddress, setTempAddress] = useState(userAddress);
  const [walletAddAmount, setWalletAddAmount] = useState(25);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target) &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(target)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (activeTab !== 'explore') {
      setActiveTab('explore');
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchFocused(false);
    if (activeTab !== 'explore') {
      setActiveTab('explore');
    }
    const elem = document.getElementById('global-service-search-input');
    if (elem) elem.blur();
  };

  const handleSelectQuickSearch = (term: string) => {
    setSearchQuery(term);
    setSearchFocused(false);
    if (activeTab !== 'explore') {
      setActiveTab('explore');
    }
  };

  const handleSelectCategory = (catId: CategoryId | 'all') => {
    setSelectedCategory(catId);
    setSearchQuery('');
    setSearchFocused(false);
    if (activeTab !== 'explore') {
      setActiveTab('explore');
    }
  };

  const handleSelectProvider = (prov: ProviderProfile) => {
    setSelectedProvider(prov);
    setSearchFocused(false);
  };

  const handleBookService = (prov: ProviderProfile) => {
    setBookingModalProvider(prov);
    setSearchFocused(false);
  };

  // Compute live matching items for the autocomplete dropdown
  const queryTrimmed = searchQuery.trim().toLowerCase();
  const matchedCategories = queryTrimmed
    ? categories.filter(c =>
        c.name.toLowerCase().includes(queryTrimmed) ||
        (c.nameUrdu || '').toLowerCase().includes(queryTrimmed) ||
        (c.popularTags || []).some(t => t.toLowerCase().includes(queryTrimmed))
      ).slice(0, 3)
    : [];

  const matchedServices = queryTrimmed
    ? providers.flatMap(p =>
        (p.offeredServices || []).map(srv => ({
          ...srv,
          provider: p
        }))
      ).filter(srv =>
        srv.title.toLowerCase().includes(queryTrimmed) ||
        srv.description.toLowerCase().includes(queryTrimmed)
      ).slice(0, 3)
    : [];

  const matchedPros = queryTrimmed
    ? providers.filter(p =>
        p.name.toLowerCase().includes(queryTrimmed) ||
        p.title.toLowerCase().includes(queryTrimmed) ||
        (p.specialties || []).some(s => s.toLowerCase().includes(queryTrimmed)) ||
        (p.serviceCity || '').toLowerCase().includes(queryTrimmed)
      ).slice(0, 3)
    : [];

  const trendingTags = [
    { label: '⚡ AC Service', query: 'AC Repair' },
    { label: '🚿 Plumber Leak Fix', query: 'Plumber' },
    { label: '💡 Short Circuit', query: 'Electrician' },
    { label: '🧹 Sofa Cleaning', query: 'Sofa' },
    { label: '🚗 Battery Jumpstart', query: 'Battery' },
    { label: '📺 TV Wall Mount', query: 'TV' }
  ];

  const activeBookingCount = bookings.filter(
    b =>
      (currentRole === 'customer'
        ? b.customerId === currentUser?.id
        : b.providerId === currentUser?.providerProfileId) &&
      b.status !== 'completed' &&
      b.status !== 'cancelled'
  ).length;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      setUserAddress(tempAddress.trim());
      setAddressEditing(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : language === 'ur' ? 'hi' : 'en');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleOpenChat = () => {
    setMobileDrawerOpen(false);
    // Find active booking or first booking with a provider
    const relevantBooking = bookings.find(b => b.status !== 'cancelled') || bookings[0];
    if (relevantBooking) {
      setChatModalBooking(relevantBooking);
    } else if (providers.length > 0) {
      // Create a virtual booking reference for direct chat
      setChatModalBooking({
        id: 'direct-chat',
        customerId: currentUser?.id || 'u-cust-1',
        customerName: currentUser?.name || 'Customer',
        customerPhone: currentUser?.phone || '+92 300 1234567',
        customerAddress: userAddress,
        providerId: providers[0].id,
        providerName: providers[0].name,
        providerAvatar: providers[0].avatar,
        providerPhone: providers[0].phone,
        categoryId: providers[0].categoryId,
        categoryName: providers[0].title,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '10:00 AM',
        isEmergency: false,
        problemDescription: 'General inquiry via chat',
        totalAmount: 15,
        currency: 'USD',
        status: 'accepted',
        otp: '4821',
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending',
        paymentMethod: 'cash_on_delivery'
      });
    }
  };

  const handleEmergencyClick = () => {
    setMobileDrawerOpen(false);
    setFilterEmergencyOnly(true);
    setActiveTab('explore');
    if (providers.length > 0) {
      const emergencyProv = providers.find(p => p.emergencyReady) || providers[0];
      setActiveCallProvider(emergencyProv);
    }
  };

  return (
    <>
      <header
        id="main-app-header"
        className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Top Bar Left: Full Fixora Brand Logo */}
          <div className="flex items-center shrink-0">
            {/* Brand Logo - Compact, single line, perfectly proportioned */}
            <button
              id="brand-logo-btn"
              onClick={() => {
                setSelectedCategory('all');
                setFilterFavoritesOnly(false);
                setActiveTab('explore');
              }}
              className="flex items-center text-left group cursor-pointer focus:outline-none hover:opacity-90 transition-opacity py-0.5"
            >
              <FixoraLogo variant="header" size="sm" showTagline={false} />
            </button>
          </div>

          {/* Global Search Bar & Voice Assistant Trigger (Visible on md+ screens to give mobile header full room) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl mx-2 items-center gap-1.5 sm:gap-2 relative">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black dark:text-slate-300" />
              <input
                id="global-service-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={e => handleSearchChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                placeholder={language === 'ur' ? 'سروس یا کاریگر تلاش کریں...' : 'Search services (AC, electrician, plumbing)...'}
                className="w-full pl-9 pr-7 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white placeholder-slate-500 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xs"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchFocused(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600 hover:text-black cursor-pointer p-0.5"
                >
                  ✕
                </button>
              ) : null}
            </form>

            <button
              id="navbar-voice-ai-btn"
              onClick={() => setVoiceModalOpen(true)}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
              title="Voice AI Assistant"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">{t('voiceAssistant')}</span>
            </button>

            {/* Desktop Autocomplete & Smart Search Suggestions Dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150 max-h-[480px] overflow-y-auto">
                {queryTrimmed.length === 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {language === 'ur' ? 'مشہور سرچز' : 'Trending Fixes & Services'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trendingTags.map(tag => (
                        <button
                          key={tag.query}
                          type="button"
                          onMouseDown={() => handleSelectQuickSearch(tag.query)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                        {language === 'ur' ? 'مقبول کیٹیگریز' : 'Popular Trade Categories'}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {categories.slice(0, 6).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={() => handleSelectCategory(c.id)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition cursor-pointer text-slate-700 dark:text-slate-200"
                          >
                            <span className="font-semibold text-xs truncate">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">From ${c.basePrice}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Matching Categories */}
                    {matchedCategories.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1.5">
                          {language === 'ur' ? 'مطابقت رکھنے والی کیٹیگریز' : 'Matching Categories'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedCategories.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onMouseDown={() => handleSelectCategory(c.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
                            >
                              <span>{c.name}</span>
                              <span className="text-[10px] text-indigo-400">({c.nameUrdu})</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Direct Services */}
                    {matchedServices.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                          {language === 'ur' ? 'براہ راست سروس مینو' : 'Direct Services Available'}
                        </span>
                        <div className="space-y-1.5">
                          {matchedServices.map(srv => (
                            <div
                              key={srv.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{srv.title}</h5>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  by {srv.provider.name} • {srv.durationMins} mins
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                  {formatPrice(srv.priceUSD)}
                                </span>
                                <button
                                  type="button"
                                  onMouseDown={() => handleBookService(srv.provider)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                                >
                                  Book
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Providers */}
                    {matchedPros.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                          {language === 'ur' ? 'تصدیق شدہ ٹیکنیشنز' : 'Verified Professionals'}
                        </span>
                        <div className="space-y-1.5">
                          {matchedPros.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onMouseDown={() => handleSelectProvider(p)}
                              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={p.avatar}
                                  alt={p.name}
                                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.name}</span>
                                    {p.isVerified && <ShieldCheck className="w-3 h-3 text-indigo-500 fill-indigo-500/20 shrink-0" />}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {p.serviceCity || p.address}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="flex items-center gap-0.5 justify-end text-amber-500 text-[11px] font-bold">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  <span>{p.rating}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                  {formatPrice(p.hourlyRate)}/hr
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchedCategories.length === 0 && matchedServices.length === 0 && matchedPros.length === 0 && (
                      <div className="py-4 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Press <strong className="text-indigo-600">Enter</strong> to search all verified service records for &quot;{searchQuery}&quot;
                        </p>
                      </div>
                    )}

                    {/* View All Results Footer */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Enter ↵</kbd> to view full results
                      </span>
                      <button
                        type="button"
                        onMouseDown={() => handleSearchSubmit()}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Apply Search →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Top Bar Right: Currency Switcher & Settings Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isFirebaseConnected && (
              <div
                id="firebase-status-badge"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold"
                title="Firebase Firestore Cloud Realtime Sync Active"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Firebase Live</span>
              </div>
            )}

            {/* Language Switcher Component */}
            <LanguageSwitcher />

            <button
              id="currency-switcher-btn"
              onClick={toggleCurrency}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white text-xs font-black transition flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer"
              title={`Switch Currency (${currency})`}
            >
              <DollarSign className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black tracking-wide transition-colors ${
                  currency === 'PKR'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {currency === 'PKR' ? '₨ PKR' : '$ USD'}
              </span>
            </button>

            <button
              id="navbar-settings-btn"
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer group"
              title={language === 'ur' ? 'سیٹنگز اور ترجیحات (Settings)' : 'Settings & Preferences'}
            >
              <Settings className="w-4 h-4 text-black dark:text-white group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden sm:inline font-bold">
                {language === 'ur' ? 'سیٹنگز' : 'Settings'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          FULL MOBILE NAVIGATION DRAWER (Triggered by ☰ tap)
          Includes:
          🏠 Home | 🔧 Services | 🤖 AI Assistant | 📅 My Bookings | 💬 Messages |
          ❤️ Favorites | 👤 Login / Sign Up | 👨‍🔧 Join as Professional |
          💰 Payments | ⚙️ Settings | 🆘 Emergency Help
      ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            id="mobile-drawer-backdrop"
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Drawer Body Sliding from Left */}
          <div
            id="mobile-navigation-drawer"
            className="relative z-10 w-full max-w-[340px] sm:max-w-sm h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
              <FixoraLogo variant="header" size="sm" />

              <button
                id="close-mobile-drawer-btn"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auth Banner & Role Card */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/20">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-indigo-200 dark:border-indigo-700 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {currentUser.name}
                        </h3>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase bg-indigo-600 text-white">
                          {currentRole}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Wallet quick balance */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {t('walletBalance')}:
                    </span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                        ₨ {Math.round((currentUser.walletBalance || 0) * 280).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (${(currentUser.walletBalance || 0).toFixed(2)} USD)
                      </span>
                    </div>
                  </div>

                  {/* Switch Role Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      onClick={() => {
                        switchRole('customer');
                        setActiveTab('explore');
                        setMobileDrawerOpen(false);
                      }}
                      className={`p-1.5 rounded-lg font-semibold text-center border transition ${
                        currentRole === 'customer'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Customer
                    </button>
                    <button
                      onClick={() => {
                        switchRole('provider');
                        setActiveTab('dashboard');
                        setMobileDrawerOpen(false);
                      }}
                      className={`p-1.5 rounded-lg font-semibold text-center border transition ${
                        currentRole === 'provider'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Provider
                    </button>
                    <button
                      onClick={() => {
                        switchRole('admin');
                        setActiveTab('admin');
                        setMobileDrawerOpen(false);
                      }}
                      className={`p-1.5 rounded-lg font-semibold text-center border transition ${
                        currentRole === 'admin'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'ur' ? 'فکسورا میں خوش آمدید' : 'Welcome to Fixora'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'ur' ? 'لاگ ان کریں یا نیا اکاؤنٹ بنائیں' : 'Sign in to book verified technicians & track jobs.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="mobile-drawer-login-btn"
                      onClick={() => {
                        setAuthModalMode('login');
                        setAuthTargetRole('customer');
                        setAuthModalOpen(true);
                        setMobileDrawerOpen(false);
                      }}
                      className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{t('login')}</span>
                    </button>

                    <button
                      id="mobile-drawer-signup-btn"
                      onClick={() => {
                        setAuthModalMode('signup');
                        setAuthTargetRole('customer');
                        setAuthModalOpen(true);
                        setMobileDrawerOpen(false);
                      }}
                      className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>{t('signUp')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Main Navigation Item Links */}
            <div className="p-3 space-y-1 flex-1 text-xs font-semibold">
              {/* 1. 🏠 Home */}
              <button
                id="mobile-nav-home"
                onClick={() => {
                  setSelectedCategory('all');
                  setFilterFavoritesOnly(false);
                  setActiveTab('explore');
                  setMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'explore' && !filterFavoritesOnly
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <span>{language === 'ur' ? '🏠 ہوم پیج' : '🏠 Home & Explore'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 2. 🔧 Services */}
              <button
                id="mobile-nav-services"
                onClick={() => {
                  setActiveTab('explore');
                  setSelectedCategory('all');
                  setFilterFavoritesOnly(false);
                  setMobileDrawerOpen(false);
                }}
                className="w-full p-2.5 rounded-xl flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span>{language === 'ur' ? '🔧 تمام سروسز' : '🔧 Services Catalog'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                  12 Categories
                </span>
              </button>

              {/* 3. 🤖 AI Assistant */}
              <button
                id="mobile-nav-ai"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setVoiceModalOpen(true);
                }}
                className="w-full p-2.5 rounded-xl flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-100 dark:border-indigo-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {language === 'ur' ? '🤖 اے آئی وائس اسسٹنٹ' : '🤖 AI Voice Assistant'}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                      Urdu, Hindi & English Voice Diagnoses
                    </span>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold animate-pulse">
                  NEW
                </span>
              </button>

              {/* 4. 📅 My Bookings */}
              <button
                id="mobile-nav-bookings"
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>{currentRole === 'provider' ? '📅 Provider Jobs Queue' : '📅 My Bookings & Orders'}</span>
                </div>
                {activeBookingCount > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold animate-pulse">
                    {activeBookingCount} Active
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* 5. 💬 Messages */}
              <button
                id="mobile-nav-messages"
                onClick={handleOpenChat}
                className="w-full p-2.5 rounded-xl flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>{language === 'ur' ? '💬 پیغامات اور چیٹ' : '💬 Messages & Live Chat'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 6. ❤️ Favorites */}
              <button
                id="mobile-nav-favorites"
                onClick={() => {
                  setFilterFavoritesOnly(true);
                  setActiveTab('explore');
                  setMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                  filterFavoritesOnly
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </div>
                  <span>{language === 'ur' ? '❤️ پسندیدہ پروفیشنلز' : '❤️ Saved Favorites'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold">
                  {favorites.length}
                </span>
              </button>

              {/* 7. 👨‍🔧 JOIN AS PROFESSIONAL (Full End-to-End Registration & Onboarding Flow) */}
              <div className="p-3 my-2 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-950 text-white shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>Technician / Pro Hub</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-extrabold">
                    EARN ₨ 150K+/MO
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-300" />
                    <span>👨‍🔧 Join as Professional</span>
                  </h4>
                  <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                    Register → Profile → Add Services → Set Prices → Work Photos → KYC → Go Live
                  </p>
                </div>

                <button
                  id="mobile-join-professional-btn"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    if (!currentUser) {
                      setAuthModalMode('signup');
                      setAuthTargetRole('provider');
                      setAuthModalOpen(true);
                    } else {
                      switchRole('provider');
                      setProviderOnboardingOpen(true);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  <span>Start Provider Onboarding</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              {/* 8. 💰 SIM Wallet, Escrow & Paid Subscriptions */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-white">💰 SIM Wallet & Escrow</span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {currentUser ? formatPrice(currentUser.walletBalance) : '$0.00'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setWalletModalOpen(true);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>SIM Recharge</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setSubscriptionModalOpen(true);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-[11px] text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 fill-white" />
                    <span>VIP Pass (5%)</span>
                  </button>
                </div>
              </div>

              {/* 9. ⚙️ Settings & Preferences */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-slate-900 dark:text-white">⚙️ App Settings & Preferences</span>
                  </div>
                  <button
                    id="mobile-drawer-open-full-settings-btn"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setSettingsModalOpen(true);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                  >
                    Open All
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {/* Currency Toggle */}
                  <button
                    onClick={toggleCurrency}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 font-bold text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs"
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono text-white ${currency === 'PKR' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                      {currency === 'PKR' ? '₨ PKR' : '$ USD'}
                    </span>
                    <span className="text-[10px]">Currency</span>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs"
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                    <span className="text-[10px]">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                  </button>

                  {/* Language Toggle */}
                  <button
                    onClick={toggleLanguage}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs"
                    title="Toggle Language (English / اردو / हिन्दी)"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-bold">
                      {language === 'en' ? '🇬🇧 English' : language === 'ur' ? '🇵🇰 اردو' : '🇮🇳 हिन्दी'}
                    </span>
                  </button>
                </div>

                {/* 3-way Quick Language Switcher Bar in Mobile Drawer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {language === 'ur'
                          ? 'زبان تبدیل کریں'
                          : language === 'hi'
                          ? 'भाषा बदलें'
                          : 'Interface Language'}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                      {language}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        language === 'en'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>🇬🇧</span>
                      <span>English</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('ur')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        language === 'ur'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>🇵🇰</span>
                      <span>اردو</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('hi')}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        language === 'hi'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>🇮🇳</span>
                      <span>हिन्दी</span>
                    </button>
                  </div>
                </div>

                {/* Open Full Settings Modal Action */}
                <button
                  id="mobile-open-settings-modal-btn"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setSettingsModalOpen(true);
                  }}
                  className="w-full py-2 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-[11px] font-bold cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{language === 'ur' ? 'مکمل سیٹنگز پینل کھولیں' : 'Open All Settings & Privacy'}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Google Play Store API 36 compliance */}
                <button
                  onClick={() => {
                    setPlayStoreModalOpen(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-between text-[10px] font-bold cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Play Readiness (API 36)</span>
                  </span>
                  <span className="px-1 rounded bg-emerald-600 text-white font-mono">OK</span>
                </button>

                {/* 24/7 Support Desk */}
                <button
                  onClick={() => {
                    setSupportModalOpen(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between text-[10px] font-semibold cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    <span>24/7 Support & Dispute Desk</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* 10. 🆘 EMERGENCY HELP (15-Min SLA) */}
              <button
                id="mobile-emergency-help-btn"
                onClick={handleEmergencyClick}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold flex items-center justify-between shadow-lg shadow-red-600/30 cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wide block">
                      🆘 15-Min Emergency Help
                    </span>
                    <span className="text-[10px] text-red-100 font-normal block">
                      Gas leak, pipe burst, power blackout
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-white text-red-600 text-[10px] font-black uppercase">
                  DISPATCH
                </span>
              </button>

              {/* Logout Option (If Logged In) */}
              {currentUser && (
                <button
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
              Fixora Service Network • Verified Technicians & Workmanship Warranty
            </div>
          </div>
        </div>
      )}
    </>
  );
};

