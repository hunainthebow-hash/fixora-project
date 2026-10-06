import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AppLanguage, AppTheme, Currency, PaymentMethod, SavedAddress } from '../types';
import {
  Settings,
  X,
  User,
  Globe,
  Bell,
  Shield,
  MapPin,
  CreditCard,
  Smartphone,
  Trash2,
  Check,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  SmartphoneNfc,
  RefreshCw,
  Plus,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Save,
  CheckCircle2,
  Sliders,
  DollarSign,
  KeyRound,
  ShieldAlert,
  Info,
  Radio,
  Clock,
  Bot,
  Calendar,
  Heart,
  MessageSquare,
  Wrench,
  Siren,
  Crown,
  Briefcase,
  LayoutGrid,
  Zap
} from 'lucide-react';

type SettingsTab =
  | 'hub'
  | 'profile'
  | 'preferences'
  | 'notifications'
  | 'security'
  | 'addresses'
  | 'payment'
  | 'system';

export const SettingsModal: React.FC = () => {
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    userSettings,
    updateUserSettings,
    resetUserSettings,
    clearAppCache,
    currentUser,
    updateUserProfile,
    theme,
    setTheme,
    language,
    setLanguage,
    currency,
    setCurrency,
    toggleCurrency,
    toggleTheme,
    toggleLanguage,
    savedAddresses,
    addSavedAddress,
    removeSavedAddress,
    switchRole,
    currentRole,
    setWalletModalOpen,
    setSupportModalOpen,
    logout,
    deleteAccount,
    addNotification,
    setVoiceModalOpen,
    setProviderOnboardingOpen,
    setSubscriptionModalOpen,
    setPlayStoreModalOpen,
    setActiveTab: setAppActiveTab,
    favorites,
    bookings,
    setChatModalBooking,
    providers,
    setFilterEmergencyOnly,
    setBookingIsEmergency,
    setBookingModalProvider,
    setFilterFavoritesOnly,
    setSelectedCategory,
    formatPrice,
    setAuthModalMode,
    setAuthTargetRole,
    setAuthModalOpen,
    setActiveCallProvider,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('hub');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleOpenChatFromSettings = () => {
    setSettingsModalOpen(false);
    const relevantBooking = bookings.find(b => b.status !== 'cancelled') || bookings[0];
    if (relevantBooking) {
      setChatModalBooking(relevantBooking);
    } else if (providers.length > 0) {
      setChatModalBooking({
        id: 'direct-chat',
        customerId: currentUser?.id || 'u-cust-1',
        customerName: currentUser?.name || 'Customer',
        customerPhone: currentUser?.phone || '+92 300 1234567',
        customerAddress: currentUser?.address || 'Current Location',
        providerId: providers[0].id,
        providerName: providers[0].name,
        providerAvatar: providers[0].avatar,
        serviceId: 'serv-1',
        serviceName: 'General Consultation',
        scheduledTime: 'Now',
        price: 0,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleEmergencyFromSettings = () => {
    setSettingsModalOpen(false);
    setFilterEmergencyOnly(true);
    setAppActiveTab('services');
    if (providers.length > 0) {
      const emergencyProv = providers.find(p => p.emergencyReady) || providers[0];
      setActiveCallProvider(emergencyProv);
    }
  };

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || 'Hunain');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'hunain@example.com');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '+92 300 1234567');
  const [profileCity, setProfileCity] = useState(userSettings.defaultCity || 'Karachi');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || 'Sector 18, Royal Palms Residency, Central City');

  // New Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState<'Home' | 'Work' | 'Parents' | 'Other'>('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrDefault, setNewAddrDefault] = useState(false);

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!settingsModalOpen) return null;

  const showSaveBadge = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      address: profileAddress
    });
    updateUserSettings({
      defaultCity: profileCity
    });
    showSaveBadge(language === 'ur' ? 'پروفائل کامیابی سے محفوظ ہو گئی!' : 'Profile saved successfully!');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;

    addSavedAddress({
      label: newAddrLabel,
      address: newAddrText.trim(),
      isDefault: newAddrDefault,
      lat: 24.8607,
      lng: 67.0011
    });

    setNewAddrText('');
    setShowAddAddress(false);
    showSaveBadge(language === 'ur' ? 'نیا پتہ محفوظ ہو گیا!' : 'New address added!');
  };

  const handleClearCache = () => {
    const res = clearAppCache();
    showSaveBadge(res.message);
  };

  const handleResetSettings = () => {
    if (window.confirm(language === 'ur' ? 'کیا آپ تمام سیٹنگز ری سیٹ کرنا چاہتے ہیں؟' : 'Are you sure you want to restore all settings to default values?')) {
      resetUserSettings();
      showSaveBadge(language === 'ur' ? 'سیٹنگز ری سیٹ ہو گئیں!' : 'Settings restored to defaults!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        id="settings-modal-backdrop"
        onClick={() => setSettingsModalOpen(false)}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Main Settings Modal Container */}
      <div
        id="settings-modal-container"
        className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-black dark:text-white tracking-tight">
                  {language === 'ur' ? 'سیٹنگز اور ترجیحات' : 'App Settings & Preferences'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                  v2.4.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ur'
                  ? 'اکاؤنٹ، زبان، نوٹیفیکیشنز، سیکیورٹی اور محفوظ شدہ پتے کا انتظام کریں'
                  : 'Manage account, localization, notification channels, security, and addresses.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccessMsg && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveSuccessMsg}
              </motion.span>
            )}
            <button
              id="close-settings-modal-btn"
              onClick={() => setSettingsModalOpen(false)}
              className="p-2 rounded-2xl text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Body Layout: Left Tabs Sidebar + Right Content View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Tabs Nav (Horizontal scroll on mobile, Vertical list on desktop) */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
            {/* Tab 0: Features & Hub */}
            <button
              id="settings-tab-hub"
              onClick={() => setActiveTab('hub')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                activeTab === 'hub'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? '🚀 تمام فیچرز و ہب' : '🚀 Features & Quick Hub'}</span>
            </button>

            {/* Tab 1: Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? 'پروفائل اور اکاؤنٹ' : 'Profile & Account'}</span>
            </button>

            {/* Tab 2: Preferences */}
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                activeTab === 'preferences'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? 'زبان و کرنسی' : 'Language & Currency'}</span>
            </button>

            {/* Tab 3: Notifications */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                activeTab === 'notifications'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? 'نوٹیفیکیشنز و الرٹس' : 'Notifications & Alerts'}</span>
            </button>

            {/* Tab 4: Security */}
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? 'سیکیورٹی و پرائیویسی' : 'Privacy & Security'}</span>
            </button>

            {/* Tab 5: Addresses */}
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                activeTab === 'addresses'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? 'محفوظ شدہ پتے' : 'Saved Addresses'}</span>
            </button>

            {/* Tab 6: Payment */}
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                activeTab === 'payment'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? 'ادائیگی اور والٹ' : 'Payment & Escrow'}</span>
            </button>

            {/* Tab 7: System */}
            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer text-left ${
                activeTab === 'system'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? 'سسٹم اور کیشے' : 'System & Storage'}</span>
            </button>
          </div>

          {/* Right Content Panels */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[65vh] space-y-6">
            {/* =========================================================================
                TAB 0: FEATURES & QUICK HUB (Consolidated from Hamburger Menu)
            ========================================================================= */}
            {activeTab === 'hub' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-950 text-white shadow-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-400"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{currentUser?.name || 'Guest User'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black uppercase">
                          {currentRole}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        {currentUser?.phone || '+92 300 1234567'} • Fixora Certified
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {!currentUser ? (
                      <button
                        onClick={() => {
                          setSettingsModalOpen(false);
                          setAuthModalMode('login');
                          setAuthTargetRole('customer');
                          setAuthModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md cursor-pointer hover:bg-slate-100"
                      >
                        {t('login')} / {t('signUp')}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => switchRole(currentRole === 'customer' ? 'provider' : 'customer')}
                          className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 cursor-pointer transition"
                        >
                          Switch to {currentRole === 'customer' ? 'Provider' : 'Customer'}
                        </button>
                        <button
                          id="settings-hub-logout-btn"
                          onClick={() => {
                            logout();
                            setSettingsModalOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                          title="Log Out of Account"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t('logout')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3 Quick Toggles Bar: Currency | Theme | Language */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Currency Toggle */}
                  <button
                    id="settings-hub-toggle-currency"
                    onClick={toggleCurrency}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all text-center"
                  >
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black text-white ${currency === 'PKR' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                      {currency === 'PKR' ? '₨ PKR' : '$ USD'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {language === 'ur' ? 'کرنسی تبدیل کریں' : 'Switch Currency'}
                    </span>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    id="settings-hub-toggle-theme"
                    onClick={toggleTheme}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all text-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>

                  {/* Language Toggle */}
                  <button
                    id="settings-hub-toggle-language"
                    onClick={toggleLanguage}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all text-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {language === 'en' ? 'اردو زبان' : 'English'}
                    </span>
                  </button>
                </div>

                {/* Primary Hub Action Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {language === 'ur' ? 'فکسورا ایپ فیچرز اور شارٹ کٹس' : 'Fixora App Features & Services Hub'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* 1. AI Voice Assistant */}
                    <button
                      id="settings-hub-ai-assistant"
                      onClick={() => {
                        setSettingsModalOpen(false);
                        setVoiceModalOpen(true);
                      }}
                      className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{language === 'ur' ? '🤖 اے آئی وائس اسسٹنٹ' : '🤖 AI Voice Assistant'}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold">NEW</span>
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Urdu & English Voice Diagnostics
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </button>

                    {/* 2. Join as Professional (Pro Hub) */}
                    <button
                      id="settings-hub-pro-onboarding"
                      onClick={() => {
                        setSettingsModalOpen(false);
                        if (!currentUser) {
                          setAuthModalMode('signup');
                          setAuthTargetRole('provider');
                          setAuthModalOpen(true);
                        } else {
                          switchRole('provider');
                          setProviderOnboardingOpen(true);
                        }
                      }}
                      className="p-3 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 hover:border-cyan-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                          <Briefcase className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{language === 'ur' ? '👨‍🔧 بطور کاریگر شامل ہوں' : '👨‍🔧 Join as Professional'}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-black">₨ 150K+</span>
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            KYC, Profile, Rates & Portfolio
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                    </button>

                    {/* 3. My Bookings & Orders */}
                    <button
                      id="settings-hub-my-bookings"
                      onClick={() => {
                        setSettingsModalOpen(false);
                        setAppActiveTab('dashboard');
                      }}
                      className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 hover:border-amber-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {currentRole === 'provider' ? '📅 Provider Jobs Queue' : '📅 My Bookings & Orders'}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {bookings.length} Total Bookings Recorded
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold font-mono">
                        View
                      </span>
                    </button>

                    {/* 4. Live Chat & Messages */}
                    <button
                      id="settings-hub-messages"
                      onClick={handleOpenChatFromSettings}
                      className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {language === 'ur' ? '💬 پیغامات اور لائیو چیٹ' : '💬 Messages & Live Chat'}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Direct audio & text messaging with technician
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </button>

                    {/* 5. Saved Favorites */}
                    <button
                      id="settings-hub-favorites"
                      onClick={() => {
                        setSettingsModalOpen(false);
                        setFilterFavoritesOnly(true);
                        setAppActiveTab('services');
                      }}
                      className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 hover:border-rose-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/30 group-hover:scale-105 transition-transform">
                          <Heart className="w-5 h-5 fill-white" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {language === 'ur' ? '❤️ پسندیدہ کاریگر' : '❤️ Saved Favorite Pros'}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {favorites.length} Saved Pros in shortlist
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold">
                        {favorites.length}
                      </span>
                    </button>

                    {/* 6. SIM Wallet & Escrow */}
                    <button
                      id="settings-hub-wallet"
                      onClick={() => {
                        setSettingsModalOpen(false);
                        setWalletModalOpen(true);
                      }}
                      className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {language === 'ur' ? '💰 سیم والٹ اور ایسکرو' : '💰 SIM Wallet & Escrow'}
                          </h5>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            Balance: {currentUser ? formatPrice(currentUser.walletBalance) : '$0.00'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold font-mono">
                        Recharge
                      </span>
                    </button>

                    {/* 7. VIP Pass & Benefits */}
                    <button
                      id="settings-hub-vip"
                      onClick={() => {
                        setSettingsModalOpen(false);
                        setSubscriptionModalOpen(true);
                      }}
                      className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-300 dark:border-amber-700/60 hover:border-amber-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
                          <Crown className="w-5 h-5 fill-white" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {language === 'ur' ? '👑 فکسورا وی آئی پی پاس' : '👑 Fixora VIP Pass'}
                          </h5>
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            Flat 5% instant discount on every service
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-500" />
                    </button>

                    {/* 8. 24/7 Support Desk */}
                    <button
                      id="settings-hub-support"
                      onClick={() => {
                        setSettingsModalOpen(false);
                        setSupportModalOpen(true);
                      }}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs group-hover:scale-105 transition-transform">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {language === 'ur' ? '🎧 کسٹمر سپورٹ ڈیسک' : '🎧 24/7 Support & Disputes'}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Instant ticket resolution & refund helpline
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </button>
                  </div>

                  {/* 9. 🆘 15-Minute Emergency SLA Dispatch */}
                  <button
                    id="settings-hub-emergency"
                    onClick={handleEmergencyFromSettings}
                    className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold flex items-center justify-between shadow-lg shadow-red-600/30 cursor-pointer active:scale-98 transition-all"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wide block">
                          🆘 15-Minute Emergency SLA Dispatch
                        </span>
                        <span className="text-[11px] text-red-100 font-normal block">
                          Gas leak, pipe burst, electrical short circuit & emergency repairs
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white text-red-600 text-xs font-black uppercase shadow-xs">
                      DISPATCH NOW
                    </span>
                  </button>

                  {/* 10. Google Play Store Readiness (API 36) */}
                  <button
                    id="settings-hub-playstore"
                    onClick={() => {
                      setSettingsModalOpen(false);
                      setPlayStoreModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-between text-xs font-bold cursor-pointer transition"
                  >
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Google Play Store Target SDK 36 Compliance Center</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px]">
                      Verified OK
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 1: PROFILE & ACCOUNT
            ========================================================================= */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {language === 'ur' ? 'پروفائل کی ترتیبات' : 'Profile & Identity'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'ur'
                      ? 'اپنا نام، موبائل نمبر، بنیادی پتہ اور شہر کا انتخاب اپ ڈیٹ کریں'
                      : 'Update personal details, verified mobile number, and primary location.'}
                  </p>
                </div>

                {/* Avatar Preview & Role Info */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                      alt="User Avatar"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white">
                      ✓
                    </span>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-sm font-black text-black dark:text-white">
                        {currentUser?.name || 'Hunain'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[10px] font-bold uppercase">
                        {currentRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {currentUser?.email || 'hunain@example.com'} • {currentUser?.phone || '+92 300 1234567'}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <Shield className="w-3.5 h-3.5" />
                      <span>CNIC & Bio-metric Verified Pro</span>
                    </div>
                  </div>

                  {/* Switch Role Quick Switcher */}
                  <div className="flex sm:flex-col gap-1.5 w-full sm:w-auto">
                    <span className="text-[10px] text-slate-400 font-bold uppercase text-center sm:text-left hidden sm:block">
                      Role Mode:
                    </span>
                    <div className="flex gap-1 w-full">
                      {(['customer', 'provider', 'admin'] as const).map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => switchRole(role)}
                          className={`flex-1 px-2.5 py-1.5 rounded-xl font-bold text-[10px] uppercase transition cursor-pointer border ${
                            currentRole === role
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                        {language === 'ur' ? 'پورا نام (Full Name)' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                        {language === 'ur' ? 'موبائل نمبر (Phone Number)' : 'Mobile Phone'}
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                        placeholder="+92 300 1234567"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                        {language === 'ur' ? 'ای میل ایڈریس (Email Address)' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                        {language === 'ur' ? 'بنیادی سروس شہر (Operating City)' : 'Service City'}
                      </label>
                      <select
                        value={profileCity}
                        onChange={e => setProfileCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                      >
                        <option value="Karachi">Karachi (کراچی)</option>
                        <option value="Lahore">Lahore (لاہور)</option>
                        <option value="Islamabad">Islamabad (اسلام آباد)</option>
                        <option value="Rawalpindi">Rawalpindi (راولپنڈی)</option>
                        <option value="Faisalabad">Faisalabad (فیصل آباد)</option>
                        <option value="Multan">Multan (ملتان)</option>
                        <option value="Peshawar">Peshawar (پشاور)</option>
                        <option value="Quetta">Quetta (کوئٹہ)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                      {language === 'ur' ? 'بنیادی گھر کا پتہ (Primary Address)' : 'Default Home / Office Address'}
                    </label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={e => setProfileAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="e.g. House 14, Block 6, Gulshan-e-Iqbal, Karachi"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {currentUser ? (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setSettingsModalOpen(false);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-100 flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{language === 'ur' ? 'لاگ آؤٹ کریں' : 'Log Out Account'}</span>
                      </button>
                    ) : <div />}

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>{language === 'ur' ? 'پروفائل محفوظ کریں' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =========================================================================
                TAB 2: PREFERENCES (Language, Currency, Theme)
            ========================================================================= */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {language === 'ur' ? 'زبان اور علاقائی ترجیحات' : 'Language, Currency & Theme'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'ur'
                      ? 'اپنی پسندیدہ زبان، کرنسی اور لائٹ/ڈارک موڈ منتخب کریں'
                      : 'Customize interface appearance, display currency, and preferred language.'}
                  </p>
                </div>

                {/* 1. Language Preference */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs font-bold text-black dark:text-white">
                      {language === 'ur' ? 'ایپ کی زبان (Language)' : 'App Display Language'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                        updateUserSettings({ language: 'en' });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        language === 'en'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-bold">🇬🇧 English</span>
                        <span className={`text-[10px] ${language === 'en' ? 'text-indigo-100' : 'text-slate-400'}`}>
                          Standard English
                        </span>
                      </div>
                      {language === 'en' && <Check className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('ur');
                        updateUserSettings({ language: 'ur' });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        language === 'ur'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-bold">🇵🇰 اردو (Urdu)</span>
                        <span className={`text-[10px] ${language === 'ur' ? 'text-indigo-100' : 'text-slate-400'}`}>
                          پاکستانی قومی زبان
                        </span>
                      </div>
                      {language === 'ur' && <Check className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('hi');
                        updateUserSettings({ language: 'hi' });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        language === 'hi'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-bold">🇮🇳 हिन्दी (Hindi)</span>
                        <span className={`text-[10px] ${language === 'hi' ? 'text-indigo-100' : 'text-slate-400'}`}>
                          मानक हिन्दी भाषा
                        </span>
                      </div>
                      {language === 'hi' && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Currency Preference */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-xs font-bold text-black dark:text-white">
                        {language === 'ur' ? 'بنیادی کرنسی (Currency)' : 'Pricing & Billing Currency'}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">1 USD ≈ 280 PKR</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency('PKR');
                        updateUserSettings({ currency: 'PKR' });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        currency === 'PKR'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-black text-sm">₨ PKR</span>
                        <span className={`text-[10px] ${currency === 'PKR' ? 'text-emerald-100' : 'text-slate-400'}`}>
                          Pakistani Rupee (Default)
                        </span>
                      </div>
                      {currency === 'PKR' && <Check className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrency('USD');
                        updateUserSettings({ currency: 'USD' });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        currency === 'USD'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-black text-sm">$ USD</span>
                        <span className={`text-[10px] ${currency === 'USD' ? 'text-indigo-100' : 'text-slate-400'}`}>
                          United States Dollar
                        </span>
                      </div>
                      {currency === 'USD' && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Theme Preference */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-black dark:text-white">
                      {language === 'ur' ? 'تھیم اور انداز (Theme)' : 'Color Theme'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('light');
                        updateUserSettings({ appTheme: 'light' });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        theme === 'light'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-white' : 'text-amber-500'}`} />
                        <span>Light Theme (دن)</span>
                      </div>
                      {theme === 'light' && <Check className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTheme('dark');
                        updateUserSettings({ appTheme: 'dark' });
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs transition cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-indigo-400'}`} />
                        <span>Dark Theme (رات)</span>
                      </div>
                      {theme === 'dark' && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 4. Distance Unit */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-black dark:text-white">
                      {language === 'ur' ? 'فاصلے کی اکائی (Distance Unit)' : 'Distance Measurement Unit'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Show technician ETA and radius in Kilometers (KM) or Miles.
                    </p>
                  </div>
                  <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() => updateUserSettings({ distanceUnit: 'km' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        userSettings.distanceUnit === 'km' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      KM (کلومیٹر)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateUserSettings({ distanceUnit: 'miles' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        userSettings.distanceUnit === 'miles' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Miles (میل)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: NOTIFICATIONS & ALERTS
            ========================================================================= */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {language === 'ur' ? 'اطلاعات اور الرٹس' : 'Notifications & Alerts'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'ur'
                      ? 'ایمرجنسی سائرن، ایس ایم ایس الرٹس اور لائیو ٹریکنگ کے نوٹیفیکیشنز سیٹ کریں'
                      : 'Manage dispatch sound effects, WhatsApp alerts, push pings, and tracking haptics.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Push Notifications */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          {language === 'ur' ? 'پش نوٹیفیکیشنز (Push Notifications)' : 'Push Notifications'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Receive instant alerts when a technician accepts or is en-route.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.pushNotifications}
                        onChange={e => updateUserSettings({ pushNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {/* 15-Minute Emergency Siren Audio */}
                  <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-red-600" />
                        <h4 className="text-xs font-bold text-red-900 dark:text-red-300">
                          {language === 'ur' ? 'ایمرجنسی سائرن آواز (SOS Siren Alarm)' : '15-Min Emergency SOS Audio Siren'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-red-700/80 dark:text-red-400">
                        Plays high-priority alert sound when an emergency dispatch is triggered.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.emergencySirenAudio}
                        onChange={e => updateUserSettings({ emergencySirenAudio: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                    </label>
                  </div>

                  {/* SMS / WhatsApp Updates */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          {language === 'ur' ? 'واٹس ایپ اور ایس ایم ایس الرٹس (WhatsApp Alerts)' : 'SMS & WhatsApp Updates'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Receive OTP pins, job dispatch updates and invoice receipts on WhatsApp.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.whatsappAlerts}
                        onChange={e => updateUserSettings({ whatsappAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>

                  {/* Haptic Feedback */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          {language === 'ur' ? 'ہَیپٹک وائبریشن (Haptic Vibrations)' : 'Live Route & GPS Haptics'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Vibrate device on technician doorstep arrival and live status changes.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.hapticFeedback}
                        onChange={e => updateUserSettings({ hapticFeedback: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 4: PRIVACY & SECURITY
            ========================================================================= */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {language === 'ur' ? 'پرائیویسی اور سیکیورٹی' : 'Privacy & Security'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'ur'
                      ? 'فون نمبر ماسکنگ، بائیو میٹرک ایپ لاک اور ایکٹو سیشنز کا انتظام'
                      : 'Keep phone numbers private, enable biometrics, and manage active device sessions.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Masked Phone Numbers (Anti-Bypass) */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                          {language === 'ur' ? 'فون نمبر ماسکنگ (Number Masking)' : 'Anti-Bypass Virtual Number Masking'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                        Technicians never see your personal phone number; calls route via secure proxy.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.maskedPhoneNumbers}
                        onChange={e => updateUserSettings({ maskedPhoneNumbers: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {/* Biometric Lock */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <SmartphoneNfc className="w-4 h-4 text-purple-600" />
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          {language === 'ur' ? 'بائیو میٹرک لاک (Biometric Fingerprint)' : 'Biometric / Fingerprint App Lock'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Require fingerprint / Face ID to open app and confirm bookings.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.biometricLock}
                        onChange={e => updateUserSettings({ biometricLock: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-black dark:text-white">
                          {language === 'ur' ? 'دو مرحلہ تصدیق (2FA SMS OTP)' : 'Two-Factor Authentication (2FA)'}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Require SMS OTP verification when logging in from new devices.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.twoFactorAuth}
                        onChange={e => updateUserSettings({ twoFactorAuth: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>
                </div>

                {/* Active Sessions List */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-black dark:text-white">
                      {language === 'ur' ? 'فعال لاگ ان سیشنز' : 'Active Logged In Devices'}
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      2 Devices Active
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="font-bold text-black dark:text-white">Chrome on Android 14 • Karachi</p>
                          <p className="text-[10px] text-slate-400 font-mono">Current Session • IP: 182.180.x.x</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[9px] font-bold">
                        ACTIVE NOW
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-bold text-black dark:text-white">Samsung Galaxy S24 • Lahore</p>
                          <p className="text-[10px] text-slate-400 font-mono">Last active 2 hours ago</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addNotification('Session Revoked', 'Logged out of Samsung Galaxy S24.', 'system')}
                        className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Deletion / Google Play Compliance */}
                <div className="p-4 rounded-2xl bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h4 className="text-xs font-bold text-red-800 dark:text-red-300">
                      {language === 'ur' ? 'اکاؤنٹ ڈیلیٹ کریں (Danger Zone)' : 'Delete Fixora Account & Data'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-red-700/80 dark:text-red-400">
                    Compliant with Google Play Store 2026 data deletion policy. Permanently purges user profile, booking history, and wallet records.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="py-2 px-3 rounded-xl bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300 dark:border-red-800 transition cursor-pointer"
                    >
                      Request Account Deletion...
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 space-y-2">
                      <p className="text-xs text-red-900 dark:text-red-200 font-bold">
                        ⚠️ Are you absolutely sure? This action is irreversible.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (currentUser) {
                              deleteAccount(currentUser.id, 'User requested from Settings');
                            }
                            setSettingsModalOpen(false);
                          }}
                          className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
                        >
                          Yes, Delete Account Permanently
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 5: SAVED ADDRESSES
            ========================================================================= */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-black dark:text-white">
                      {language === 'ur' ? 'محفوظ شدہ پتے' : 'Saved Delivery Locations'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'ur'
                        ? 'گھر، دفتر، یا والدین کے گھر کے پتے شامل کریں اور جلدی بک کریں'
                        : 'Manage quick-book addresses with GPS pin coordinates.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddAddress ? 'Cancel' : 'Add New'}</span>
                  </button>
                </div>

                {/* Add Address Form Accordion */}
                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-bold text-black dark:text-white">
                      {language === 'ur' ? 'نیا پتہ شامل کریں' : 'Add New Address'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(['Home', 'Work', 'Parents', 'Other'] as const).map(label => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setNewAddrLabel(label)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            newAddrLabel === label
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={newAddrText}
                        onChange={e => setNewAddrText(e.target.value)}
                        placeholder="e.g. Flat 302, Al-Aziz Heights, Block 13-D, Gulshan, Karachi"
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAddrDefault}
                          onChange={e => setNewAddrDefault(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span>Set as default booking location</span>
                      </label>

                      <button
                        type="submit"
                        className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses List */}
                <div className="space-y-3">
                  {savedAddresses.map(addr => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 shadow-xs hover:border-indigo-300 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-black dark:text-white">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {addr.address}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            GPS: {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSavedAddress(addr.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 6: PAYMENT & WALLET
            ========================================================================= */}
            {activeTab === 'payment' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {language === 'ur' ? 'ادائیگی اور سم والٹ کی ترجیحات' : 'Payment & SIM Wallet Preferences'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'ur'
                      ? 'ایزی پیسہ، جاز کیش اور والٹ اسکرو پروٹیکشن کا انتظام کریں'
                      : 'Manage default payment rails (Easypaisa, JazzCash, Cards) and escrow balance.'}
                  </p>
                </div>

                {/* Wallet Balance Widget */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-100 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      <span>Fixora SIM Wallet Escrow</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase">
                      100% Escrow Protected
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono">
                      ₨ {Math.round((currentUser?.walletBalance || 0) * 280).toLocaleString()}
                    </span>
                    <span className="text-xs text-emerald-100 font-mono">
                      (${(currentUser?.walletBalance || 0).toFixed(2)} USD)
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsModalOpen(false);
                        setWalletModalOpen(true);
                      }}
                      className="py-2 px-4 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition cursor-pointer shadow-xs"
                    >
                      ⚡ SIM Recharge / Top-up
                    </button>
                  </div>
                </div>

                {/* Auto Wallet Deduct Switch */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <h4 className="text-xs font-bold text-black dark:text-white">
                        {language === 'ur' ? 'خودکار والٹ ادائیگی (Auto Escrow)' : 'Auto-Deduct from Wallet for Bookings'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Automatically lock payment in escrow on booking confirmation for hassle-free payment.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.autoWalletDeduct}
                        onChange={e => updateUserSettings({ autoWalletDeduct: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <h4 className="text-xs font-bold text-black dark:text-white">
                        {language === 'ur' ? 'کم بیلنس الرٹ (Low Balance Ping)' : 'Low Wallet Balance Alert'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Notify when wallet balance falls below PKR 500 ($2.00 USD).
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userSettings.lowBalanceAlert}
                        onChange={e => updateUserSettings({ lowBalanceAlert: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 7: SYSTEM & STORAGE
            ========================================================================= */}
            {activeTab === 'system' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    {language === 'ur' ? 'سسٹم، اسٹوریج اور ایپ تفصیلات' : 'System, Storage & App Info'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'ur'
                      ? 'کیشے میموری صاف کریں، ڈیفالٹ سیٹنگز بحال کریں اور ورژن چیک کریں'
                      : 'Purge local application cache, restore factory defaults, and verify Google Play build.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Purge Cache Action */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-black dark:text-white">
                        {language === 'ur' ? 'ایپ کا کیشے صاف کریں (Clear Cache)' : 'Purge Temporary App Cache & Local Storage'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Frees up approx. 14.8 MB of cached map assets, chat previews, and thumbnails.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Clear Cache</span>
                    </button>
                  </div>

                  {/* Reset All Settings to Factory Default */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-black dark:text-white">
                        {language === 'ur' ? 'ڈیفالٹ سیٹنگز پر واپس جائیں (Restore Defaults)' : 'Restore All Settings to Defaults'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Resets theme, audio alerts, and localization back to initial state.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetSettings}
                      className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* System Specs & Google Play Compliance Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-black dark:text-white">
                      Fixora Technical & Licensing Specifications
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] block">App Version</span>
                      <span className="font-bold text-black dark:text-white">v2.4.0 (3624)</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Google Play</span>
                      <span className="font-bold text-emerald-600">Target SDK 36 OK</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Build Date</span>
                      <span className="font-bold text-black dark:text-white">2026-08-31</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Framework</span>
                      <span className="font-bold text-black dark:text-white">React 18 + Vite</span>
                    </div>
                  </div>
                </div>

                {/* Support & Help Desk Shortcut */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsModalOpen(false);
                      setSupportModalOpen(true);
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Open 24/7 Support & Dispute Desk →</span>
                  </button>

                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setSettingsModalOpen(false);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('logout')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            {language === 'ur'
              ? 'فکسورا نیٹ ورک • جملہ حقوق محفوظ ہیں'
              : 'Fixora Technologies • 15-Minute Emergency SLA Certified'}
          </span>
          <button
            type="button"
            onClick={() => setSettingsModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition cursor-pointer"
          >
            {language === 'ur' ? 'بند کریں' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
