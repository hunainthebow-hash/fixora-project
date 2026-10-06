import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  ProviderProfile,
  ServiceCategory,
  Booking,
  ChatMessage,
  CategoryId,
  VerificationDoc,
  LiveTracking,
  AppLanguage,
  AppTheme,
  Currency,
  PaymentMethod,
  Dispute,
  PromoCode,
  NotificationItem,
  UserReport,
  SavedAddress,
  SupportTicket,
  CorporatePlan,
  ReferralStat,
  ProviderOfferedService,
  BeforeAfterPortfolioItem,
  SubscriptionPlan,
  UserSubscription,
  SubscriptionTier,
  WalletTransaction,
  UserSettings,
  PriceOffer
} from '../types';
import {
  CATEGORIES,
  INITIAL_PROVIDERS,
  DEMO_USERS,
  INITIAL_BOOKINGS,
  INITIAL_PROMOS,
  INITIAL_DISPUTES,
  INITIAL_VERIFICATION_DOCS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUPPORT_TICKETS,
  CORPORATE_MAINTENANCE_PLANS,
  INITIAL_REFERRAL_DATA,
  SUBSCRIPTION_PLANS,
  INITIAL_WALLET_TRANSACTIONS
} from '../data/mockData';
import { TRANSLATIONS, getTranslation } from '../data/translations';
import { formatPrice as utilsFormatPrice, formatDualPrice, USD_TO_PKR_RATE } from '../utils/currency';
import {
  calculateTieredCommission,
  calculateDualCommission,
  detectAndMaskContactInfo,
  CHAT_UNLOCK_FEE_PKR,
  CHAT_UNLOCK_FEE_USD,
  EMERGENCY_PRIORITY_FEE_PKR,
  EMERGENCY_PRIORITY_FEE_USD
} from '../utils/antiBypass';
import {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  testFirestoreConnection,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from '../lib/firebase';

interface AIQueryResult {
  category: CategoryId;
  urgency: 'standard' | 'emergency' | 'urgent';
  problemTitle?: string;
  advice?: string;
  estimatedCostRange?: string;
  suggestedActions?: string[];
  spokenResponse?: string;
  matchScore?: number;
}

interface AppContextType {
  // App Config & Localization
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (amountUSD: number, showDecimals?: boolean) => string;
  topUpWallet: (amountUSD: number, method: string) => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;

  // User & Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentRole: 'customer' | 'provider' | 'admin';
  activeTab: 'explore' | 'services' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'explore' | 'services' | 'dashboard' | 'admin') => void;
  allUsers: User[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  login: (emailOrPhone: string, role?: 'customer' | 'provider' | 'admin') => boolean;
  signup: (userData: Partial<User>, providerDetails?: Partial<ProviderProfile>) => void;
  logout: () => void;
  switchRole: (role: 'customer' | 'provider' | 'admin') => void;

  // Catalog & Filters
  categories: ServiceCategory[];
  providers: ProviderProfile[];
  setProviders: React.Dispatch<React.SetStateAction<ProviderProfile[]>>;
  filteredProviders: ProviderProfile[];
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterEmergencyOnly: boolean;
  setFilterEmergencyOnly: (val: boolean) => void;
  filterVerifiedOnly: boolean;
  setFilterVerifiedOnly: (val: boolean) => void;
  filterFavoritesOnly: boolean;
  setFilterFavoritesOnly: (val: boolean) => void;
  sortBy: 'recommended' | 'rating' | 'distance' | 'price_low' | 'completed';
  setSortBy: (sort: 'recommended' | 'rating' | 'distance' | 'price_low' | 'completed') => void;
  userAddress: string;
  setUserAddress: (addr: string) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (providerId: string) => void;
  isFavorite: (providerId: string) => boolean;

  // Bookings
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'otp' | 'createdAt' | 'status'>) => Booking;
  updateBookingStatus: (bookingId: string, newStatus: Booking['status']) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;

  // Active modals & drawers
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  authTargetRole: 'customer' | 'provider' | 'admin';
  setAuthTargetRole: (role: 'customer' | 'provider' | 'admin') => void;

  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;

  selectedProvider: ProviderProfile | null;
  setSelectedProvider: (prov: ProviderProfile | null) => void;

  bookingModalProvider: ProviderProfile | null;
  setBookingModalProvider: (prov: ProviderProfile | null) => void;
  bookingIsEmergency: boolean;
  setBookingIsEmergency: (val: boolean) => void;

  activeTrackingBooking: Booking | null;
  setActiveTrackingBooking: (b: Booking | null) => void;

  chatModalBooking: Booking | null;
  setChatModalBooking: (b: Booking | null) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (bookingId: string | undefined, providerId: string, text: string, imageUrl?: string, isAudio?: boolean) => { success: boolean; blockedContact?: boolean; maskedText?: string };
  unlockedChatThreads: string[];
  unlockChatThread: (threadId: string) => { success: boolean; message: string };
  isChatUnlocked: (threadId: string) => boolean;

  reviewModalBooking: Booking | null;
  setReviewModalBooking: (b: Booking | null) => void;
  submitReview: (bookingId: string, rating: number, comment: string, tags?: string) => void;

  receiptModalBooking: Booking | null;
  setReceiptModalBooking: (b: Booking | null) => void;

  // Real-Time Price Bargaining / Counter-Offer Negotiation
  bargainingModalBooking: Booking | null;
  setBargainingModalBooking: (b: Booking | null) => void;
  sendBargainOffer: (bookingId: string, offerAmountUSD: number, offerAmountPKR: number) => { success: boolean; message: string };
  respondBargainOffer: (bookingId: string, offerId: string, action: 'accept' | 'decline' | 'counter', counterAmountUSD?: number, counterAmountPKR?: number) => void;

  // Disputes & Refunds
  disputes: Dispute[];
  disputeModalOpen: boolean;
  setDisputeModalOpen: (open: boolean) => void;
  activeDisputeBooking: Booking | null;
  setActiveDisputeBooking: (b: Booking | null) => void;
  raiseDispute: (bookingId: string, reason: Dispute['reason'], description: string) => void;
  resolveDispute: (disputeId: string, status: Dispute['status'], refundAmount?: number, notes?: string) => void;

  // Promo Codes & Loyalty
  promos: PromoCode[];
  activePromo: PromoCode | null;
  appliedDiscount: number;
  applyPromoCode: (code: string, orderTotal: number) => { success: boolean; message: string; discount: number };
  removePromoCode: () => void;
  createPromoCode: (promo: Omit<PromoCode, 'id' | 'usageCount'>) => void;
  togglePromoCodeActive: (id: string) => void;

  // Verification & CNIC approval
  verificationDocs: VerificationDoc[];
  uploadVerificationDoc: (doc: Omit<VerificationDoc, 'id' | 'uploadedAt' | 'status'>) => void;
  reviewVerificationDoc: (id: string, status: 'verified' | 'rejected', rejectionReason?: string) => void;

  // User Reporting & Safety
  reports: UserReport[];
  reportModalOpen: boolean;
  setReportModalOpen: (open: boolean) => void;
  reportTargetUser: { id: string; name: string; role: 'customer' | 'provider' } | null;
  setReportTargetUser: (user: { id: string; name: string; role: 'customer' | 'provider' } | null) => void;
  reportUser: (reportedUserId: string, reportedUserName: string, role: 'customer' | 'provider', reason: string, details: string) => void;
  resolveReport: (reportId: string, action: 'dismiss' | 'ban') => void;

  // Provider Settings
  updateProviderOnlineStatus: (providerId: string, isOnline: boolean, emergencyReady: boolean) => void;
  updateProviderProfile: (providerId: string, updates: Partial<ProviderProfile>) => void;
  requestProviderWithdrawal: (providerId: string, amount: number, method: string) => boolean;

  // AI Voice Assistant Helper
  isProcessingAI: boolean;
  lastAIResult: AIQueryResult | null;
  processVoiceOrTextAI: (query: string, city?: string) => Promise<AIQueryResult | null>;

  // Notifications
  notifications: NotificationItem[];
  notifDrawerOpen: boolean;
  setNotifDrawerOpen: (open: boolean) => void;
  unreadNotifCount: number;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markNotifAsRead: (id: string) => void;
  markAllNotifsRead: () => void;

  // Direct Call Simulation
  activeCallProvider: ProviderProfile | null;
  setActiveCallProvider: (p: ProviderProfile | null) => void;

  // Saved Addresses & Family members
  savedAddresses: SavedAddress[];
  addSavedAddress: (addr: Omit<SavedAddress, 'id'>) => void;
  removeSavedAddress: (id: string) => void;
  selectedFamilyMember: string | null;
  setSelectedFamilyMember: (name: string | null) => void;

  // In-App Support & Dispute Escalation
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
  supportTickets: SupportTicket[];
  createSupportTicket: (subject: string, category: SupportTicket['category'], priority: SupportTicket['priority'], message: string) => SupportTicket;
  replySupportTicket: (ticketId: string, text: string) => void;

  // Referral & Growth
  referralModalOpen: boolean;
  setReferralModalOpen: (open: boolean) => void;
  referralData: ReferralStat;

  // Corporate & Society Plans
  corporatePlans: CorporatePlan[];

  // Fast Rebook Favorite
  fastRebookProvider: (provider: ProviderProfile) => void;

  // Provider Onboarding & Service Listing Catalog
  providerOnboardingOpen: boolean;
  setProviderOnboardingOpen: (open: boolean) => void;
  addProviderOfferedService: (providerId: string, service: Omit<ProviderOfferedService, 'id'>) => void;
  updateProviderOfferedService: (providerId: string, serviceId: string, updates: Partial<ProviderOfferedService>) => void;
  deleteProviderOfferedService: (providerId: string, serviceId: string) => void;
  addProviderBeforeAfterItem: (providerId: string, item: Omit<BeforeAfterPortfolioItem, 'id'>) => void;
  deleteProviderBeforeAfterItem: (providerId: string, itemId: string) => void;

  // Account Management & Google Play Compliance
  deleteAccount: (userId: string, reason?: string) => void;
  playStoreModalOpen: boolean;
  setPlayStoreModalOpen: (open: boolean) => void;
  playStoreReviewerLogin: (role?: 'customer' | 'provider' | 'admin') => void;

  // Paid Subscription & VIP Passes
  subscriptionModalOpen: boolean;
  setSubscriptionModalOpen: (open: boolean) => void;
  subscribeToPlan: (planId: string, paymentMethod?: PaymentMethod | string) => boolean;
  cancelSubscription: () => void;

  // Wallet, SIM-Style Topup & Escrow Protection
  walletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  walletTransactions: WalletTransaction[];
  setWalletTransactions: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
  rechargeWallet: (amountUSD: number, method: PaymentMethod | string, voucherCode?: string) => void;
  redeemVoucher: (code: string) => { success: boolean; message: string; amount?: number };

  // Settings & App Preferences
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  userSettings: UserSettings;
  updateUserSettings: (partial: Partial<UserSettings>) => void;
  resetUserSettings: () => void;
  clearAppCache: () => { success: boolean; message: string };
  updateUserProfile: (updates: Partial<User>) => void;
  isFirebaseConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Localization & Theme
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('fixora_lang');
      if (saved === 'en' || saved === 'ur' || saved === 'hi') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('fixora_lang', lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguageState(prev => {
      const next = prev === 'en' ? 'ur' : prev === 'ur' ? 'hi' : 'en';
      try {
        localStorage.setItem('fixora_lang', next);
        document.documentElement.lang = next;
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [theme, setTheme] = useState<AppTheme>('light');
  const [currency, setCurrency] = useState<Currency>('PKR'); // Default to PKR, supports USD
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  const toggleCurrency = () => {
    setCurrency(prev => (prev === 'PKR' ? 'USD' : 'PKR'));
  };

  const formatPrice = (amountUSD: number, showDecimals: boolean = false): string => {
    return utilsFormatPrice(amountUSD, currency, showDecimals);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Test Firestore Connection & Setup Realtime Sync
  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeBookings: (() => void) | undefined;

    async function initFirebase() {
      try {
        const connected = await testFirestoreConnection();
        setIsFirebaseConnected(connected);

        // Listen to Firebase Auth state
        unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log('[Firebase Auth] User active:', firebaseUser.uid, firebaseUser.email);
            // Check if profile exists in Firestore
            try {
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                const data = userSnap.data();
                const syncedUser: User = {
                  id: firebaseUser.uid,
                  name: data.name || firebaseUser.displayName || 'Fixora Member',
                  email: firebaseUser.email || data.email || 'user@fixora.pk',
                  phone: data.phone || firebaseUser.phoneNumber || '+92 300 1234567',
                  role: data.role || 'customer',
                  avatar: data.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                  address: data.address || userAddress,
                  isVerified: true,
                  walletBalance: typeof data.walletBalance === 'number' ? data.walletBalance : 150,
                  loyaltyPoints: data.loyaltyPoints || 50,
                  referralCode: data.referralCode || `FIX-${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
                };
                setCurrentUser(syncedUser);
                setAllUsers(prev => {
                  const filtered = prev.filter(u => u.id !== syncedUser.id);
                  return [syncedUser, ...filtered];
                });
              }
            } catch (err) {
              console.warn('[Firebase] Could not fetch Firestore user profile:', err);
            }
          }
        });

        // Realtime Firestore listener for Bookings collection
        const bookingsCol = collection(db, 'bookings');
        unsubscribeBookings = onSnapshot(bookingsCol, (snapshot) => {
          if (!snapshot.empty) {
            const cloudBookings: Booking[] = [];
            snapshot.forEach((docSnap) => {
              const bData = docSnap.data() as any;
              if (bData && bData.id) {
                cloudBookings.push(bData as Booking);
              }
            });
            if (cloudBookings.length > 0) {
              setBookings(prev => {
                // Merge cloud bookings with initial demo bookings
                const cloudIds = new Set(cloudBookings.map(b => b.id));
                const nonOverlapping = prev.filter(b => !cloudIds.has(b.id));
                return [...cloudBookings, ...nonOverlapping];
              });
            }
          }
        }, (err) => {
          console.warn('[Firebase Firestore] Bookings snapshot listener note:', err);
        });

      } catch (e) {
        console.warn('[Firebase] Init error (graceful fallback active):', e);
      }
    }

    initFirebase();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeBookings) unsubscribeBookings();
    };
  }, []);

  const t = (key: keyof typeof TRANSLATIONS.en): string => {
    return getTranslation(language, key);
  };

  // Current user defaults to Demo Customer "Hunain"
  const [allUsers, setAllUsers] = useState<User[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0]);
  const [activeTab, setActiveTab] = useState<'explore' | 'services' | 'dashboard' | 'admin'>('explore');
  const currentRole = currentUser?.role || 'customer';

  const [categories] = useState<ServiceCategory[]>(CATEGORIES);
  const [providers, setProviders] = useState<ProviderProfile[]>(INITIAL_PROVIDERS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [favorites, setFavorites] = useState<string[]>(['prov-plumb-1', 'prov-ac-1']);

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState<boolean>(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'distance' | 'price_low' | 'completed'>('recommended');
  const [userAddress, setUserAddress] = useState<string>('Sector 18, Royal Palms Residency, Central City');

  // Promos, Disputes, Verifications, Reports & Notifications
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [verificationDocs, setVerificationDocs] = useState<VerificationDoc[]>(INITIAL_VERIFICATION_DOCS);
  const [reports, setReports] = useState<UserReport[]>(INITIAL_REPORTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authTargetRole, setAuthTargetRole] = useState<'customer' | 'provider' | 'admin'>('customer');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [bookingModalProvider, setBookingModalProvider] = useState<ProviderProfile | null>(null);
  const [bookingIsEmergency, setBookingIsEmergency] = useState(false);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);
  const [chatModalBooking, setChatModalBooking] = useState<Booking | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [receiptModalBooking, setReceiptModalBooking] = useState<Booking | null>(null);
  const [bargainingModalBooking, setBargainingModalBooking] = useState<Booking | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [activeDisputeBooking, setActiveDisputeBooking] = useState<Booking | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetUser, setReportTargetUser] = useState<{ id: string; name: string; role: 'customer' | 'provider' } | null>(null);
  const [activeCallProvider, setActiveCallProvider] = useState<ProviderProfile | null>(null);

  // Saved Addresses & Family
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    { id: 'addr-1', label: 'Home', address: 'Flat 402, Royal Palms Residency, Sector 18', lat: 28.6139, lng: 77.2090, isDefault: true },
    { id: 'addr-2', label: 'Work', address: 'Cyber Tower 4, Tech Park, Sector 62', lat: 28.6280, lng: 77.3600 },
    { id: 'addr-3', label: 'Parents', address: 'B-12, Officers Colony, Civil Lines', lat: 28.6700, lng: 77.2200 }
  ]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string | null>(null);

  // In-App Support, Disputes & Referrals
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [providerOnboardingOpen, setProviderOnboardingOpen] = useState(false);
  const [playStoreModalOpen, setPlayStoreModalOpen] = useState(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [corporatePlans] = useState<CorporatePlan[]>(CORPORATE_MAINTENANCE_PLANS);
  const [referralData, setReferralData] = useState<ReferralStat>(INITIAL_REFERRAL_DATA);

  // Paid Subscriptions & Wallet Balance
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(INITIAL_WALLET_TRANSACTIONS);
  const [unlockedChatThreads, setUnlockedChatThreads] = useState<string[]>(['prov-1', 'BOOK-101']);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    pushNotifications: true,
    smsAlerts: true,
    whatsappAlerts: true,
    emergencySirenAudio: true,
    liveTrackingHaptics: true,
    maskedPhoneNumbers: true,
    biometricLock: false,
    twoFactorAuth: false,
    autoWalletDeduct: true,
    lowBalanceAlert: true,
    defaultCity: 'Karachi',
    distanceUnit: 'km',
    appTheme: 'light',
    language: 'en',
    currency: 'PKR',
    hapticFeedback: true,
    soundEffects: true,
    emailReceipts: true,
    autoAddressDetection: true,
  });

  const updateUserSettings = (partial: Partial<UserSettings>) => {
    setUserSettings(prev => {
      const next = { ...prev, ...partial };
      if (partial.appTheme && (partial.appTheme === 'light' || partial.appTheme === 'dark')) {
        setTheme(partial.appTheme);
      }
      if (partial.language) {
        setLanguage(partial.language);
      }
      if (partial.currency) {
        setCurrency(partial.currency);
      }
      return next;
    });
    addNotification('Settings Updated', 'Your preferences have been updated successfully.', 'system');
  };

  const resetUserSettings = () => {
    setUserSettings({
      pushNotifications: true,
      smsAlerts: true,
      whatsappAlerts: true,
      emergencySirenAudio: true,
      liveTrackingHaptics: true,
      maskedPhoneNumbers: true,
      biometricLock: false,
      twoFactorAuth: false,
      autoWalletDeduct: true,
      lowBalanceAlert: true,
      defaultCity: 'Karachi',
      distanceUnit: 'km',
      appTheme: 'light',
      language: 'en',
      currency: 'PKR',
      hapticFeedback: true,
      soundEffects: true,
      emailReceipts: true,
      autoAddressDetection: true,
    });
    setTheme('light');
    setLanguage('en');
    setCurrency('PKR');
    addNotification('Settings Reset', 'All settings restored to system defaults.', 'system');
  };

  const clearAppCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    addNotification('Cache Cleared', 'Temporary cache and storage data purged successfully.', 'system');
    return { success: true, message: 'App cache cleared successfully!' };
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    addNotification('Profile Updated', 'Your account profile information has been saved.', 'system');
  };

  const isChatUnlocked = (threadId: string) => {
    return unlockedChatThreads.includes(threadId);
  };

  const unlockChatThread = (threadId: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to unlock conversation.' };
    }

    if (unlockedChatThreads.includes(threadId)) {
      return { success: true, message: 'Conversation is already unlocked.' };
    }

    const costUSD = CHAT_UNLOCK_FEE_USD;
    const costPKR = CHAT_UNLOCK_FEE_PKR;

    if (currentUser.walletBalance < costUSD) {
      addNotification(
        'Insufficient Balance for Chat',
        `Recharge PKR ${costPKR} (Current balance: PKR ${Math.round(currentUser.walletBalance * USD_TO_PKR_RATE)}) to unlock full conversation.`,
        'system'
      );
      return {
        success: false,
        message: `Insufficient wallet balance. You need PKR ${costPKR} to unlock unlimited messaging.`
      };
    }

    // Deduct from wallet
    const updatedBalance = +(currentUser.walletBalance - costUSD).toFixed(2);
    const updatedUser = { ...currentUser, walletBalance: updatedBalance };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    const unlockTx: WalletTransaction = {
      id: `tx-chat-${Date.now()}`,
      userId: currentUser.id,
      type: 'chat_unlock',
      amountUSD: costUSD,
      amountPKR: costPKR,
      currency: 'PKR',
      description: `Unlocked Fixora In-App Chat Conversation (${threadId})`,
      descriptionUrdu: `فکسورا چیٹ گفتگو کو بغیر رکاوٹ ان لاک کیا گیا (PKR 25)`,
      method: 'wallet',
      status: 'completed',
      timestamp: 'Just now',
      referenceNumber: `CHAT-${Date.now().toString().slice(-6)}`
    };

    setWalletTransactions(prev => [unlockTx, ...prev]);
    setUnlockedChatThreads(prev => [...prev, threadId]);

    addNotification(
      '💬 Chat Unlocked',
      `Full conversation unlocked for PKR ${costPKR}. You can now discuss work and quotes freely!`,
      'payment'
    );

    return {
      success: true,
      message: `Full conversation thread unlocked for PKR ${costPKR}!`
    };
  };

  const createSupportTicket = (
    subject: string,
    category: SupportTicket['category'],
    priority: SupportTicket['priority'],
    message: string
  ): SupportTicket => {
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      userId: currentUser?.id || 'demo-user',
      userName: currentUser?.name || 'Customer',
      userEmail: currentUser?.email || 'customer@fixora.pk',
      userRole: currentUser?.role || 'customer',
      subject,
      category,
      priority,
      status: 'open',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      assignedAgentName: 'Fixora AI Support Desk',
      messages: [
        {
          id: `msg-1`,
          sender: 'user',
          senderName: currentUser?.name || 'Customer',
          text: message,
          timestamp: 'Just now'
        },
        {
          id: `msg-2`,
          sender: 'agent',
          senderName: 'Fixora AI Support Desk',
          text: `Thank you for reaching out to Fixora Customer Care. Your priority ticket has been registered under case #${Date.now().toString().slice(-4)}. A support specialist or automated dispute arbiter is reviewing your request with money-back guarantee protection.`,
          timestamp: 'Just now'
        }
      ]
    };

    setSupportTickets(prev => [newTicket, ...prev]);
    addNotification(
      'Support Ticket Opened',
      `Ticket #${newTicket.id} created: "${subject}". Our team will respond shortly.`,
      'system'
    );
    return newTicket;
  };

  const replySupportTicket = (ticketId: string, text: string) => {
    setSupportTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const userMsg = {
            id: `msg-${Date.now()}`,
            sender: 'user' as const,
            senderName: currentUser?.name || 'Customer',
            text,
            timestamp: 'Just now'
          };
          const aiResponse = {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent' as const,
            senderName: 'Fixora AI Resolution Arbiter',
            text: `We received your update: "${text}". If this is related to a technician job or payment refund, our financial dispute desk is verifying the escrow ledger.`,
            timestamp: 'Just now'
          };
          return {
            ...t,
            updatedAt: 'Just now',
            messages: [...t.messages, userMsg, aiResponse]
          };
        }
        return t;
      })
    );
  };

  const fastRebookProvider = (provider: ProviderProfile) => {
    setBookingModalProvider(provider);
    setBookingIsEmergency(false);
  };

  // Synonym & keyword dictionary for intelligent multi-lingual and colloquial search
  const checkSynonymMatch = (query: string, categoryId: CategoryId): boolean => {
    const SYNONYM_MAP: Record<string, string[]> = {
      plumbing: ['plumber', 'plumbing', 'nal', 'leakage', 'leak', 'pipe', 'paani', 'water', 'tanki', 'tank', 'geyser', 'drain', 'drainage', 'sewer', 'tonti', 'tap', 'commode', 'flush', 'sink', 'sanitary', 'faucet', 'motor', 'boring', 'water tank', 'پلمبر', 'نل', 'پانی', 'لیکج', 'گیزر'],
      electrical: ['electric', 'electrician', 'bijli', 'short circuit', 'mcb', 'tripping', 'switch', 'socket', 'pankha', 'fan', 'ceiling fan', 'taar', 'wiring', 'inverter', 'ups', 'generator', 'light', 'bulb', 'fuse', 'sub meter', 'solar', 'alectric', 'بجلی', 'پنکھا', 'تار', 'شارٹ سرکٹ', 'الیکٹریشن'],
      carpentry: ['carpenter', 'carpentry', 'lakri', 'wood', 'darwaza', 'door', 'lock', 'kunda', 'qulaf', 'wardrobe', 'almari', 'bed', 'furniture', 'table', 'chair', 'sofa frame', 'hinges', 'qabza', 'fitting', 'assembly', 'woodwork', 'بڑھئی', 'لکڑی', 'دروازہ', 'لاک', 'فرنیچر'],
      ac_repair: ['ac', 'air conditioner', 'inverter ac', 'ac gas', 'cooling', 'jet wash', 'compressor', 'split ac', 'chilling', 'service ac', 'ac repair', 'ac master', 'ac installation', 'gas leak', 'اے سی', 'گیس', 'کولنگ'],
      appliance_repair: ['fridge', 'refrigerator', 'freezer', 'washing machine', 'dryer', 'microwave', 'oven', 'chulha', 'stove', 'tv', 'led', 'lcd', 'appliance', 'deep freezer', 'dispenser', 'فریج', 'واشنگ مشین', 'اوون', 'ٹی وی'],
      painting: ['paint', 'painter', 'painting', 'rang', 'distemper', 'putty', 'waterproofing', 'seepage', 'deewar', 'chatt', 'chhat', 'texture', 'weather sheet', 'emulsion', 'berger', 'dulux', 'پینٹ', 'رنگ', 'سیپج', 'واٹر پروفنگ'],
      cleaning: ['clean', 'cleaning', 'safai', 'deep clean', 'sofa', 'carpet', 'bathroom', 'kitchen', 'dust', 'dhona', 'scrubbing', 'sanitiz', 'maid', 'sweeper', 'sofa wash', 'صفائی', 'قالین', 'صوفہ'],
      it_services: ['wifi', 'router', 'cctv', 'camera', 'security camera', 'internet', 'network', 'cabling', 'lan', 'data recovery', 'server', 'it support', 'net', 'اینٹرنیٹ', 'کیمرہ', 'وائی فائی'],
      tutoring: ['tutor', 'tutoring', 'teacher', 'sir', 'madam', 'math', 'maths', 'physics', 'chemistry', 'study', 'parhai', 'online class', 'o level', 'a level', 'fsc', 'matric', 'kids', 'تیاری', 'ٹیوٹر', 'استاد', 'پڑھائی'],
      mechanic: ['mechanic', 'car', 'gari', 'auto', 'puncture', 'tyre', 'battery', 'jumpstart', 'oil', 'brakes', 'engine', 'tow', 'roadside', 'oil change', 'spark plug', 'گاڑی', 'میکینک', 'پنکچر', 'بیٹری'],
      moving: ['mover', 'packers', 'moving', 'shifting', 'transport', 'truck', 'shehzore', 'luggage', 'saman', 'relocation', 'house shift', 'سامان', 'شفٹنگ', 'ٹرانسپورٹ'],
      maintenance: ['pest', 'pest control', 'keeray', 'cockroach', 'termite', 'deemak', 'khatmal', 'spray', 'ro', 'water filter', 'purifier', 'tds', 'کیکڑے', 'دیمک', 'کیڑے مکوڑے', 'پیسٹ کنٹرول'],
      healthcare: ['doctor', 'dr', 'nurse', 'injection', 'drip', 'bp', 'sugar', 'physio', 'physiotherapy', 'dressing', 'wound', 'patient', 'medical', 'health', 'hospital', 'home care', 'ڈاکٹر', 'نرس', 'انجکشن', 'مرہم پٹی'],
      handyman: ['handyman', 'drill', 'drilling', 'curtain', 'parda', 'bracket', 'shelf', 'mirror', 'sheesha', 'mistri', 'repair', 'hanging', 'tv mount', 'ہینڈی مین', 'ڈرل'],
      gardening: ['gardener', 'gardening', 'mali', 'lawn', 'plants', 'grass', 'ghas', 'trees', 'flowers', 'balcony', 'pruning', 'مالی', 'پودے', 'باغ'],
      car_wash: ['car wash', 'wash', 'gari dhona', 'foam wash', 'car detailing', 'interior cleaning', 'carnauba wax', 'pressure wash', 'گاڑی دھونا', 'کار واش'],
      mobile_repair: ['mobile', 'phone', 'iphone', 'samsung', 'screen', 'display', 'touch', 'battery', 'charging port', 'lcd', 'oled', 'glass', 'موبائل', 'اسکرین', 'ڈسپلے'],
      computer_repair: ['laptop', 'macbook', 'computer', 'pc', 'windows', 'motherboard', 'ssd', 'ram', 'hard drive', 'slow', 'chip level', 'کمپیوٹر', 'لیپ ٹاپ']
    };

    const synonyms = SYNONYM_MAP[categoryId] || [];
    return synonyms.some(syn => query.includes(syn) || syn.includes(query));
  };

  // Filtered providers memoized computation
  const filteredProviders = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();

    return providers
      .filter(p => {
        // Exclude suspended
        if (p.isSuspended) return false;

        // Emergency only filter
        if (filterEmergencyOnly && !p.emergencyReady) {
          return false;
        }
        // Verified only filter
        if (filterVerifiedOnly && !p.isVerified && !p.backgroundChecked) {
          return false;
        }
        // Favorites only filter
        if (filterFavoritesOnly && !favorites.includes(p.id)) {
          return false;
        }

        // Search query filter (Multi-field Deep Match + Synonyms + Sub-services)
        if (rawQuery) {
          const matchName = (p.name || '').toLowerCase().includes(rawQuery);
          const matchTitle = (p.title || '').toLowerCase().includes(rawQuery);
          const matchBio = (p.bio || '').toLowerCase().includes(rawQuery);
          const matchAddress = (p.address || '').toLowerCase().includes(rawQuery);
          const matchCity = (p.serviceCity || '').toLowerCase().includes(rawQuery);
          const matchSpecialty = (p.specialties || []).some(s => s.toLowerCase().includes(rawQuery));
          const matchBadge = (p.badges || []).some(b => b.toLowerCase().includes(rawQuery));
          const matchCat = (p.categoryId || '').toLowerCase().includes(rawQuery);
          const matchLicense = (p.licenseNumber || '').toLowerCase().includes(rawQuery);

          // Match inside offered services
          const matchService = (p.offeredServices || []).some(
            srv => srv.title.toLowerCase().includes(rawQuery) || srv.description.toLowerCase().includes(rawQuery)
          );

          // Match category definitions and tags
          const catObj = CATEGORIES.find(c => c.id === p.categoryId);
          const matchCatMeta = catObj
            ? (catObj.name.toLowerCase().includes(rawQuery) ||
               (catObj.nameUrdu || '').toLowerCase().includes(rawQuery) ||
               (catObj.nameUrduHindi || '').toLowerCase().includes(rawQuery) ||
               (catObj.description || '').toLowerCase().includes(rawQuery) ||
               (catObj.popularTags || []).some(t => t.toLowerCase().includes(rawQuery)))
            : false;

          // Match synonyms
          const matchSynonym = checkSynonymMatch(rawQuery, p.categoryId);

          const isMatch = (
            matchName ||
            matchTitle ||
            matchBio ||
            matchAddress ||
            matchCity ||
            matchSpecialty ||
            matchBadge ||
            matchCat ||
            matchLicense ||
            matchService ||
            matchCatMeta ||
            matchSynonym
          );

          if (!isMatch) {
            return false;
          }

          // If a category was explicitly selected, prioritize matches in selected category unless cross-search
          if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
            // If the query is specifically targeting another category or general terms, allow it
            const queryMatchesSelectedCat = checkSynonymMatch(rawQuery, selectedCategory as CategoryId);
            if (queryMatchesSelectedCat) {
              return false;
            }
          }
        } else {
          // If no search query, strictly filter by selectedCategory
          if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'distance') {
          return a.distanceKm - b.distanceKm;
        }
        if (sortBy === 'price_low') {
          return a.hourlyRate - b.hourlyRate;
        }
        if (sortBy === 'completed') {
          return b.completedJobs - a.completedJobs;
        }
        // Default / recommended: rating + active online weighting
        return b.rating - a.rating;
      });
  }, [providers, selectedCategory, filterEmergencyOnly, filterVerifiedOnly, filterFavoritesOnly, favorites, searchQuery, sortBy]);

  // Favorites toggling
  const toggleFavorite = (providerId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(providerId);
      const updated = exists ? prev.filter(id => id !== providerId) : [...prev, providerId];
      addNotification(
        exists ? 'Removed from Wishlist' : 'Saved to Wishlist',
        exists ? 'Provider removed from your favorites.' : 'Provider added to your favorite wishlist for 1-tap rebooking.',
        'system'
      );
      return updated;
    });
  };

  const isFavorite = (providerId: string) => favorites.includes(providerId);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      bookingId: 'BOOK-89421',
      providerId: 'prov-plumb-1',
      customerId: 'user-hunain',
      senderId: 'prov-plumb-1',
      senderName: 'Vikram Sharma',
      senderRole: 'provider',
      text: 'Namaste Hunain! I have accepted your emergency request and I am on my bike. Reaching in ~6 minutes with spare brass valves.',
      timestamp: '6 mins ago',
      read: true,
    },
    {
      id: 'msg-2',
      bookingId: 'BOOK-89421',
      providerId: 'prov-plumb-1',
      customerId: 'user-hunain',
      senderId: 'user-hunain',
      senderName: 'Hunain',
      senderRole: 'customer',
      text: 'Thank you Vikram! Please ring bell 402 once you enter gate 1.',
      timestamp: '4 mins ago',
      read: true,
    }
  ]);

  // AI query state
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [lastAIResult, setLastAIResult] = useState<AIQueryResult | null>(null);

  // Notification helpers
  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'system') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotifAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Auth Methods
  const login = (emailOrPhone: string, role?: 'customer' | 'provider' | 'admin'): boolean => {
    const found = allUsers.find(
      u => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone
    );

    if (found) {
      if (found.isBlocked) {
        addNotification('Account Suspended', 'This account has been suspended by Admin. Contact support@servisync.com', 'system');
        return false;
      }
      setCurrentUser(found);
      if (found.role === 'admin') {
        setActiveTab('admin');
      }
      addNotification('Signed In', `Welcome back, ${found.name}!`, 'system');
      return true;
    }

    // Create session user if not matched
    const isProv = role === 'provider';
    const isAdmin = role === 'admin';
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: emailOrPhone.split('@')[0] || 'User',
      email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@user.local`,
      phone: emailOrPhone.includes('@') ? '+91 98700 12345' : emailOrPhone,
      role: isAdmin ? 'admin' : isProv ? 'provider' : 'customer',
      avatar: isAdmin
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
        : isProv
        ? 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      address: userAddress,
      isVerified: true,
      walletBalance: 100,
      loyaltyPoints: 50,
      referralCode: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      providerProfileId: isProv ? 'prov-plumb-1' : undefined,
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    if (isAdmin) setActiveTab('admin');

    // Persist User Profile & Wallet to Firebase Firestore
    try {
      setDoc(doc(db, 'users', newUser.id), {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        address: newUser.address,
        isVerified: newUser.isVerified,
        walletBalance: newUser.walletBalance,
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('[Firebase] Firestore user sync:', err));

      setDoc(doc(db, 'wallets', newUser.id), {
        userId: newUser.id,
        balancePkr: newUser.walletBalance * USD_TO_PKR_RATE,
        balanceUsd: newUser.walletBalance,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('[Firebase] Firestore wallet sync:', err));
    } catch (e) {
      console.warn('[Firebase] User document creation note:', e);
    }

    addNotification('Signed In', `Welcome to Fixora, ${newUser.name}!`, 'system');
    return true;
  };

  const signup = (userData: Partial<User>, providerDetails?: Partial<ProviderProfile>) => {
    const isProv = userData.role === 'provider';
    const isAdmin = userData.role === 'admin';
    let provProfileId: string | undefined = undefined;

    if (isProv) {
      const newProvId = `prov-${Date.now()}`;
      provProfileId = newProvId;
      const newProv: ProviderProfile = {
        id: newProvId,
        name: userData.name || 'New Provider',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
        title: providerDetails?.title || 'Certified Local Professional',
        categoryId: (providerDetails?.categoryId as CategoryId) || 'plumbing',
        specialties: providerDetails?.specialties || ['General Maintenance', 'Emergency Repair'],
        experienceYears: providerDetails?.experienceYears || 5,
        rating: 5.0,
        reviewCount: 1,
        completedJobs: 0,
        hourlyRate: providerDetails?.hourlyRate || 35,
        emergencyRate: (providerDetails?.hourlyRate || 35) * 1.4,
        distanceKm: 0.8,
        isVerified: true,
        backgroundChecked: true,
        certifiedPro: true,
        licenseNumber: `PRO-${Math.floor(10000 + Math.random() * 90000)}`,
        emergencyReady: true,
        isOnline: true,
        etaMinutes: 15,
        phone: userData.phone || '+91 99999 00000',
        address: userData.address || userAddress,
        lat: 28.6140,
        lng: 77.2095,
        bio: providerDetails?.bio || 'Dedicated professional verified on Fixora.',
        portfolio: [
          { title: 'Quality Workmanship', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80' }
        ],
        badges: ['Verified Pro', 'Fast Responder'],
        reviews: []
      };

      setProviders(prev => [newProv, ...prev]);

      // Write provider to Firestore
      try {
        setDoc(doc(db, 'providers', newProv.id), {
          ...newProv,
          createdAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.warn('[Firebase] Firestore provider sync:', err));
      } catch (err) {
        console.warn('[Firebase] Provider doc note:', err);
      }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'New Member',
      email: userData.email || 'user@fixora.pk',
      phone: userData.phone || '+92 300 1234567',
      role: userData.role || 'customer',
      avatar: userData.avatar || (isAdmin
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
        : isProv
        ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
      address: userData.address || userAddress,
      isVerified: true,
      walletBalance: 150,
      loyaltyPoints: 100,
      referralCode: `FIX-${Math.floor(1000 + Math.random() * 9000)}`,
      providerProfileId: provProfileId,
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setAuthModalOpen(false);
    if (isAdmin) setActiveTab('admin');

    // Persist User Profile & Wallet to Firebase Firestore
    try {
      setDoc(doc(db, 'users', newUser.id), {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        address: newUser.address,
        isVerified: newUser.isVerified,
        walletBalance: newUser.walletBalance,
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('[Firebase] Firestore user signup sync:', err));

      setDoc(doc(db, 'wallets', newUser.id), {
        userId: newUser.id,
        balancePkr: newUser.walletBalance * USD_TO_PKR_RATE,
        balanceUsd: newUser.walletBalance,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('[Firebase] Firestore wallet signup sync:', err));
    } catch (e) {
      console.warn('[Firebase] User signup document creation note:', e);
    }

    addNotification('Account Created', `Welcome to Fixora, ${newUser.name}!`, 'system');
  };

  const logout = () => {
    try {
      signOut(auth).catch(() => {});
    } catch {}
    setCurrentUser(null);
    setActiveTab('explore');
    addNotification('Logged Out', 'You have been signed out safely.', 'system');
  };

  const switchRole = (newRole: 'customer' | 'provider' | 'admin') => {
    if (newRole === 'admin') {
      const adminUser = allUsers.find(u => u.role === 'admin') || DEMO_USERS[3];
      setCurrentUser(adminUser);
      setActiveTab('admin');
      addNotification('Admin Mode Active', 'Central Platform Governance & Verification enabled.', 'system');
      return;
    }

    if (newRole === 'provider') {
      const provUser = allUsers.find(u => u.role === 'provider') || DEMO_USERS[1];
      setCurrentUser(provUser);
      setActiveTab('dashboard');
      addNotification('Switched to Provider Portal', 'Now viewing orders, active jobs & earnings.', 'system');
    } else {
      const custUser = allUsers.find(u => u.role === 'customer') || DEMO_USERS[0];
      setCurrentUser(custUser);
      setActiveTab('explore');
      addNotification('Switched to Customer View', 'Browse services and book professionals.', 'system');
    }
  };

  const blockUser = (userId: string) => {
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, isBlocked: true } : u)));
    setProviders(prev => prev.map(p => (p.id === userId ? { ...p, isSuspended: true } : p)));
    addNotification('User Suspended', `User #${userId} has been suspended from platform.`, 'system');
  };

  const unblockUser = (userId: string) => {
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, isBlocked: false } : u)));
    setProviders(prev => prev.map(p => (p.id === userId ? { ...p, isSuspended: false } : p)));
    addNotification('User Restored', `User #${userId} suspension has been lifted.`, 'system');
  };

  // Promo Code Methods
  const applyPromoCode = (code: string, orderTotal: number) => {
    const clean = code.toUpperCase().trim();
    const promo = promos.find(p => p.code === clean && p.isActive);

    if (!promo) {
      return { success: false, message: 'Invalid or expired coupon code.', discount: 0 };
    }

    if (orderTotal < promo.minOrder) {
      return { success: false, message: `Minimum order amount of $${promo.minOrder} required for ${promo.code}.`, discount: 0 };
    }

    const calculated = Math.min((orderTotal * promo.discountPercent) / 100, promo.maxDiscount);
    setActivePromo(promo);
    setAppliedDiscount(calculated);
    addNotification('Coupon Applied', `Code ${promo.code} applied! Saved $${calculated.toFixed(2)}`, 'promo');
    return { success: true, message: `Promo applied! You saved $${calculated.toFixed(2)}`, discount: calculated };
  };

  const removePromoCode = () => {
    setActivePromo(null);
    setAppliedDiscount(0);
  };

  const createPromoCode = (promoData: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const newPromo: PromoCode = {
      ...promoData,
      id: `promo-${Date.now()}`,
      usageCount: 0,
    };
    setPromos(prev => [newPromo, ...prev]);
    addNotification('Promo Created', `Code ${newPromo.code} is now live with ${newPromo.discountPercent}% off.`, 'promo');
  };

  const togglePromoCodeActive = (id: string) => {
    setPromos(prev => prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  // Disputes & Refunds
  const raiseDispute = (bookingId: string, reason: Dispute['reason'], description: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const newDispute: Dispute = {
      id: `DSP-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId,
      serviceTitle: booking.serviceTitle,
      customerName: booking.customerName,
      providerName: booking.provider.name,
      amount: booking.totalAmount,
      reason,
      description,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    setDisputes(prev => [newDispute, ...prev]);
    setDisputeModalOpen(false);
    setActiveDisputeBooking(null);
    addNotification(
      'Dispute Submitted',
      `Dispute #${newDispute.id} created. Admin team will review within 2 hours.`,
      'dispute'
    );
  };

  const resolveDispute = (disputeId: string, status: Dispute['status'], refundAmount?: number, notes?: string) => {
    setDisputes(prev =>
      prev.map(d => {
        if (d.id === disputeId) {
          return {
            ...d,
            status,
            refundAmount: refundAmount || d.refundAmount,
            resolutionNotes: notes || 'Resolved by Super Admin'
          };
        }
        return d;
      })
    );

    if (status === 'refunded' && refundAmount) {
      addNotification(
        'Refund Processed',
        `$${refundAmount} has been credited back to customer wallet.`,
        'payment'
      );
    } else {
      addNotification('Dispute Updated', `Dispute #${disputeId} marked as ${status}.`, 'system');
    }
  };

  // CNIC & Verification Docs Approval
  const uploadVerificationDoc = (doc: Omit<VerificationDoc, 'id' | 'uploadedAt' | 'status'>) => {
    const newDoc: VerificationDoc = {
      ...doc,
      id: `doc-${Date.now()}`,
      status: 'pending',
      uploadedAt: new Date().toISOString().split('T')[0],
      documentImageUrl: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&auto=format&fit=crop&q=80'
    };
    setVerificationDocs(prev => [newDoc, ...prev]);
    addNotification('Document Submitted', `${doc.name} submitted for Admin review.`, 'system');
  };

  const reviewVerificationDoc = (id: string, status: 'verified' | 'rejected', rejectionReason?: string) => {
    let targetProvId = '';
    setVerificationDocs(prev =>
      prev.map(d => {
        if (d.id === id) {
          targetProvId = d.providerId;
          return { ...d, status, rejectionReason };
        }
        return d;
      })
    );

    if (status === 'verified' && targetProvId) {
      // Grant verified pro badge to provider
      setProviders(prev =>
        prev.map(p => (p.id === targetProvId ? { ...p, isVerified: true, backgroundChecked: true, certifiedPro: true } : p))
      );
      addNotification('Verification Approved', `Provider verification approved and Verified Badge granted!`, 'system');
    } else {
      addNotification('Verification Rejected', `Document was rejected. Reason: ${rejectionReason || 'Incomplete document'}`, 'system');
    }
  };

  // Safety Reporting
  const reportUser = (
    reportedUserId: string,
    reportedUserName: string,
    role: 'customer' | 'provider',
    reason: string,
    details: string
  ) => {
    const newReport: UserReport = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      reportedUserId,
      reportedUserName,
      reportedRole: role,
      reportedByUserId: currentUser?.id || 'anonymous',
      reportedByName: currentUser?.name || 'Customer',
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setReports(prev => [newReport, ...prev]);
    setReportModalOpen(false);
    setReportTargetUser(null);
    addNotification('Report Logged', `Report #${newReport.id} registered for safety audit.`, 'system');
  };

  const resolveReport = (reportId: string, action: 'dismiss' | 'ban') => {
    let targetUserId = '';
    setReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          targetUserId = r.reportedUserId;
          return { ...r, status: action === 'ban' ? 'banned' : 'resolved' };
        }
        return r;
      })
    );

    if (action === 'ban' && targetUserId) {
      blockUser(targetUserId);
    }
    addNotification('Safety Audit Complete', `Report #${reportId} has been ${action === 'ban' ? 'banned & locked' : 'dismissed'}.`, 'system');
  };

  // Saved addresses
  const addSavedAddress = (addr: Omit<SavedAddress, 'id'>) => {
    const newAddr: SavedAddress = {
      ...addr,
      id: `addr-${Date.now()}`
    };
    setSavedAddresses(prev => [...prev, newAddr]);
    addNotification('Address Saved', `Added "${addr.label}" to your saved locations.`, 'system');
  };

  const removeSavedAddress = (id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  // Provider Portal updates
  const updateProviderOnlineStatus = (providerId: string, isOnline: boolean, emergencyReady: boolean) => {
    setProviders(prev =>
      prev.map(p => (p.id === providerId ? { ...p, isOnline, emergencyReady } : p))
    );
    addNotification(
      'Status Updated',
      `You are now ${isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'} & ${emergencyReady ? '⚡ EMERGENCY ON-CALL' : 'Standard schedule only'}.`,
      'system'
    );
  };

  const updateProviderProfile = (providerId: string, updates: Partial<ProviderProfile>) => {
    setProviders(prev =>
      prev.map(p => (p.id === providerId ? { ...p, ...updates } : p))
    );
    addNotification('Profile Updated', 'Your service settings have been saved.', 'system');
  };

  const addProviderOfferedService = (providerId: string, serviceData: Omit<ProviderOfferedService, 'id'>) => {
    const newService: ProviderOfferedService = {
      ...serviceData,
      id: `srv-${Date.now()}`
    };
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId) {
          const currentServices = p.offeredServices || [];
          return {
            ...p,
            offeredServices: [...currentServices, newService]
          };
        }
        return p;
      })
    );
    addNotification('Service Added', `"${serviceData.title}" added to your live catalog.`, 'system');
  };

  const updateProviderOfferedService = (providerId: string, serviceId: string, updates: Partial<ProviderOfferedService>) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId && p.offeredServices) {
          return {
            ...p,
            offeredServices: p.offeredServices.map(s => (s.id === serviceId ? { ...s, ...updates } : s))
          };
        }
        return p;
      })
    );
    addNotification('Service Updated', 'Service details and pricing updated successfully.', 'system');
  };

  const deleteProviderOfferedService = (providerId: string, serviceId: string) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId && p.offeredServices) {
          return {
            ...p,
            offeredServices: p.offeredServices.filter(s => s.id !== serviceId)
          };
        }
        return p;
      })
    );
    addNotification('Service Removed', 'The service item has been removed from your profile.', 'system');
  };

  const addProviderBeforeAfterItem = (providerId: string, itemData: Omit<BeforeAfterPortfolioItem, 'id'>) => {
    const newItem: BeforeAfterPortfolioItem = {
      ...itemData,
      id: `ba-${Date.now()}`
    };
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId) {
          const currentBA = p.beforeAfterPortfolio || [];
          return {
            ...p,
            beforeAfterPortfolio: [...currentBA, newItem]
          };
        }
        return p;
      })
    );
    addNotification('Portfolio Updated', `New before/after work showcase added for "${itemData.title}".`, 'system');
  };

  const deleteProviderBeforeAfterItem = (providerId: string, itemId: string) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id === providerId && p.beforeAfterPortfolio) {
          return {
            ...p,
            beforeAfterPortfolio: p.beforeAfterPortfolio.filter(ba => ba.id !== itemId)
          };
        }
        return p;
      })
    );
    addNotification('Portfolio Item Removed', 'Showcase removed from your profile.', 'system');
  };

  const deleteAccount = (userId: string, reason?: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      setActiveTab('explore');
    }
    addNotification(
      'Account Deleted',
      'Your account and all associated personal data have been permanently removed per Google Play Data Safety compliance.',
      'system'
    );
  };

  const playStoreReviewerLogin = (role: 'customer' | 'provider' | 'admin' = 'customer') => {
    if (role === 'admin') {
      const adminUser = DEMO_USERS[3];
      setCurrentUser(adminUser);
      setActiveTab('admin');
    } else if (role === 'provider') {
      const provUser = DEMO_USERS[1]; // Vikram Sharma
      setCurrentUser(provUser);
      setActiveTab('dashboard');
    } else {
      const custUser = DEMO_USERS[0]; // Hunain
      setCurrentUser(custUser);
      setActiveTab('explore');
    }
    setPlayStoreModalOpen(false);
    addNotification('Play Store Reviewer Mode', `Signed in as Google Play App Tester (${role.toUpperCase()}).`, 'system');
  };

  const requestProviderWithdrawal = (providerId: string, amount: number, method: string): boolean => {
    if (!currentUser || currentUser.walletBalance < amount) {
      addNotification('Withdrawal Failed', 'Insufficient wallet balance.', 'system');
      return false;
    }

    setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance - amount } : null);
    addNotification(
      'Withdrawal Initiated',
      `Payout of $${amount} to ${method.toUpperCase()} will be credited in 24 hours.`,
      'payment'
    );
    return true;
  };

  // Booking Methods
  const createBooking = (bookingData: Omit<Booking, 'id' | 'otp' | 'createdAt' | 'status'>): Booking => {
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Determine platform commission rate based on job amount tier:
    // - Up to PKR 2,000: 10%
    // - PKR 2,001 - PKR 5,000: 8%
    // - PKR 5,001+: 7%
    const totalPKR = Math.round(bookingData.totalAmount * USD_TO_PKR_RATE);
    const tierCalculation = calculateTieredCommission(totalPKR);

    const commissionRate = tierCalculation.commissionRate;
    const commissionAmount = +(bookingData.totalAmount * (commissionRate / 100)).toFixed(2);
    const providerPayout = +(bookingData.totalAmount - commissionAmount).toFixed(2);

    const newBooking: Booking = {
      ...bookingData,
      id: `BOOK-${Math.floor(10000 + Math.random() * 90000)}`,
      otp: randomOtp,
      status: bookingData.urgency === 'emergency' ? 'en_route' : 'accepted',
      platformCommissionRate: commissionRate,
      platformCommissionAmount: commissionAmount,
      providerPayoutAmount: providerPayout,
      escrowStatus: 'held_in_escrow',
      createdAt: new Date().toISOString(),
      liveTracking: {
        currentLat: bookingData.provider.lat,
        currentLng: bookingData.provider.lng,
        customerLat: bookingData.customerLat || 28.6139,
        customerLng: bookingData.customerLng || 77.2090,
        progressPercent: bookingData.urgency === 'emergency' ? 20 : 0,
        etaMinutes: bookingData.urgency === 'emergency' ? 14 : 35,
        distanceKm: bookingData.provider.distanceKm || 1.8,
        speedKmh: 32,
        step: bookingData.urgency === 'emergency' ? 'en_route' : 'dispatched',
        lastUpdated: new Date().toISOString(),
      }
    };

    // If paid by wallet, deduct from current customer balance and add ledger record
    if (bookingData.paymentMethod === 'wallet' && currentUser) {
      const deductionUSD = bookingData.totalAmount;
      const updatedBalance = Math.max(0, currentUser.walletBalance - deductionUSD);
      const updatedUser = { ...currentUser, walletBalance: updatedBalance };
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

      const newTx: WalletTransaction = {
        id: `tx-book-${Date.now()}`,
        userId: currentUser.id,
        type: 'booking_payment',
        amountUSD: deductionUSD,
        amountPKR: Math.round(deductionUSD * USD_TO_PKR_RATE),
        currency: 'PKR',
        description: `Escrow Hold for ${bookingData.serviceTitle} (${newBooking.id})`,
        descriptionUrdu: `بکنگ کے لیے اسکرو رقم محفوظ کی گئی (${newBooking.id})`,
        method: 'wallet',
        status: 'completed',
        bookingId: newBooking.id,
        timestamp: 'Just now',
        referenceNumber: `ESC-${newBooking.id}`
      };
      setWalletTransactions(prev => [newTx, ...prev]);
    }

    setBookings(prev => [newBooking, ...prev]);

    // Persist to Firebase Firestore
    try {
      setDoc(doc(db, 'bookings', newBooking.id), {
        ...newBooking,
        syncedAt: new Date().toISOString()
      }).catch(err => {
        console.warn('[Firebase Firestore] Booking sync note:', err);
      });
    } catch (fsErr) {
      console.warn('[Firebase Firestore] Could not write booking:', fsErr);
    }

    // Send initial greeting in chat
    const introMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId: newBooking.id,
      providerId: newBooking.providerId,
      customerId: newBooking.customerId,
      senderId: newBooking.providerId,
      senderName: newBooking.provider.name,
      senderRole: 'provider',
      text: `Hello ${newBooking.customerName}! I have accepted your ${newBooking.urgency === 'emergency' ? '⚡ Emergency' : 'Scheduled'} booking for ${newBooking.serviceTitle}. I am preparing tools and on my way!`,
      timestamp: 'Just now',
      read: false,
    };
    setChatMessages(prev => [...prev, introMsg]);

    addNotification(
      newBooking.urgency === 'emergency' ? '⚡ Emergency Dispatched' : 'Booking Confirmed',
      `${newBooking.provider.name} is assigned to your request (${newBooking.id}). Funds held in Escrow. OTP: ${randomOtp}`,
      'emergency'
    );

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const updated: Booking = {
            ...b,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : b.completedAt,
            paymentStatus: newStatus === 'completed' ? 'paid' : b.paymentStatus,
            escrowStatus: newStatus === 'completed' ? 'released_to_provider' : b.escrowStatus
          };
          if (updated.liveTracking) {
            let step: LiveTracking['step'] = 'dispatched';
            if (newStatus === 'en_route') step = 'en_route';
            if (newStatus === 'arrived') step = 'arrived';
            if (newStatus === 'in_progress') step = 'in_progress';
            if (newStatus === 'completed') step = 'completed';
            updated.liveTracking.step = step;
          }
          return updated;
        }
        return b;
      })
    );

    // On completion: Release Escrow payout to Provider wallet & record platform commission
    if (newStatus === 'completed') {
      const targetBooking = bookings.find(b => b.id === bookingId);
      if (targetBooking) {
        const commissionRate = targetBooking.platformCommissionRate || 12;
        const commissionAmount = targetBooking.platformCommissionAmount || +(targetBooking.totalAmount * (commissionRate / 100)).toFixed(2);
        const payoutAmount = targetBooking.providerPayoutAmount || +(targetBooking.totalAmount - commissionAmount).toFixed(2);

        // Credit provider user wallet & completedJobs
        setAllUsers(prev =>
          prev.map(u => {
            if (u.id === targetBooking.providerId || u.providerProfileId === targetBooking.providerId) {
              return { ...u, walletBalance: (u.walletBalance || 0) + payoutAmount };
            }
            return u;
          })
        );

        setProviders(prev =>
          prev.map(p => {
            if (p.id === targetBooking.providerId) {
              return {
                ...p,
                walletBalance: (p.walletBalance || 0) + payoutAmount,
                completedJobs: p.completedJobs + 1
              };
            }
            return p;
          })
        );

        // Record Provider Payout in ledger
        const payoutTx: WalletTransaction = {
          id: `tx-payout-${Date.now()}`,
          userId: targetBooking.providerId,
          type: 'booking_payout',
          amountUSD: payoutAmount,
          amountPKR: Math.round(payoutAmount * USD_TO_PKR_RATE),
          currency: 'PKR',
          description: `Released Escrow Payout for ${targetBooking.serviceTitle} (${targetBooking.id})`,
          descriptionUrdu: `مکمل شدہ کام کی تصدیق شدہ رقم کاریگر کو منتقل کر دی گئی (${targetBooking.id})`,
          method: 'wallet',
          status: 'completed',
          bookingId: targetBooking.id,
          timestamp: 'Just now',
          referenceNumber: `PAYOUT-${targetBooking.id}`
        };

        // Record Platform Commission Deduction in ledger
        const commTx: WalletTransaction = {
          id: `tx-comm-${Date.now() + 1}`,
          userId: targetBooking.providerId,
          type: 'commission_deduction',
          amountUSD: commissionAmount,
          amountPKR: Math.round(commissionAmount * USD_TO_PKR_RATE),
          currency: 'PKR',
          description: `Fixora Platform Fee (${commissionRate}% Commission) (${targetBooking.id})`,
          descriptionUrdu: `فکسورا سروس کمیشن کٹوتی (${commissionRate}%)`,
          method: 'wallet',
          status: 'completed',
          bookingId: targetBooking.id,
          timestamp: 'Just now',
          referenceNumber: `COMM-${targetBooking.id}`
        };

        setWalletTransactions(prev => [payoutTx, commTx, ...prev]);

        addNotification(
          'Escrow Released',
          `Payment of ${formatPrice(payoutAmount)} released to ${targetBooking.provider.name}. Fixora fee: ${formatPrice(commissionAmount)}.`,
          'payment'
        );
      }
    }

    if (activeTrackingBooking && activeTrackingBooking.id === bookingId) {
      setActiveTrackingBooking(prev => (prev ? { ...prev, status: newStatus } : null));
    }

    // Sync status with Firestore
    try {
      setDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => {
        console.warn('[Firebase Firestore] Update status note:', err);
      });
    } catch (e) {
      console.warn('[Firebase Firestore] Could not update booking doc:', e);
    }

    addNotification('Status Update', `Booking #${bookingId} is now: ${newStatus.replace('_', ' ').toUpperCase()}`, 'booking');
  };

  const cancelBooking = (bookingId: string, reason: string = 'Cancelled by user') => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    
    // Sync cancellation with Firestore
    try {
      setDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        escrowStatus: 'refunded',
        cancellationReason: reason,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => {
        console.warn('[Firebase Firestore] Cancel sync note:', err);
      });
    } catch (e) {
      console.warn('[Firebase Firestore] Could not cancel booking doc:', e);
    }
    
    // If booking was paid via wallet and held in escrow, refund automatically to customer wallet
    if (targetBooking && targetBooking.escrowStatus === 'held_in_escrow' && targetBooking.paymentMethod === 'wallet') {
      const refundAmt = targetBooking.totalAmount;
      if (currentUser && currentUser.id === targetBooking.customerId) {
        const updatedUser = { ...currentUser, walletBalance: currentUser.walletBalance + refundAmt };
        setCurrentUser(updatedUser);
      }
      setAllUsers(prev =>
        prev.map(u => (u.id === targetBooking.customerId ? { ...u, walletBalance: u.walletBalance + refundAmt } : u))
      );

      const refundTx: WalletTransaction = {
        id: `tx-ref-${Date.now()}`,
        userId: targetBooking.customerId,
        type: 'refund',
        amountUSD: refundAmt,
        amountPKR: Math.round(refundAmt * USD_TO_PKR_RATE),
        currency: 'PKR',
        description: `Full Escrow Refund for Cancelled Booking #${targetBooking.id}`,
        descriptionUrdu: `کینسل شدہ بکنگ کی رقم کا مکمل ریفنڈ والٹ میں واپس منتقل کیا گیا (#${targetBooking.id})`,
        method: 'wallet',
        status: 'completed',
        bookingId: targetBooking.id,
        timestamp: 'Just now',
        referenceNumber: `REF-${targetBooking.id}`
      };
      setWalletTransactions(prev => [refundTx, ...prev]);

      addNotification(
        'Escrow Refunded',
        `Full refund of ${formatPrice(refundAmt)} has been returned to your Fixora Wallet balance.`,
        'payment'
      );
    }

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled', escrowStatus: 'refunded' } : b))
    );
    if (activeTrackingBooking && activeTrackingBooking.id === bookingId) {
      setActiveTrackingBooking(null);
    }
    addNotification('Booking Cancelled', `Booking #${bookingId} has been cancelled. Reason: ${reason}`, 'booking');
  };

  // Real-time Bidding & Price Bargaining System
  const sendBargainOffer = (
    bookingId: string,
    offerAmountUSD: number,
    offerAmountPKR: number
  ): { success: boolean; message: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    const newOffer: PriceOffer = {
      id: `offer-${Date.now()}`,
      amountPKR: offerAmountPKR,
      amountUSD: offerAmountUSD,
      offeredBy: currentUser?.role === 'provider' ? 'provider' : 'customer',
      offeredByName: currentUser?.name || 'Customer',
      status: 'pending',
      timestamp: 'Just now'
    };

    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const prevOffers = b.offersHistory || [];
          return {
            ...b,
            status: 'bargaining',
            isBargainingActive: true,
            customerProposedFare: currentUser?.role === 'customer' ? offerAmountUSD : b.customerProposedFare,
            providerCounterFare: currentUser?.role === 'provider' ? offerAmountUSD : b.providerCounterFare,
            offersHistory: [...prevOffers, newOffer]
          };
        }
        return b;
      })
    );

    // If customer offered, simulate realistic provider counter-offer or acceptance after 2.5s
    if (currentUser?.role === 'customer' || !currentUser) {
      setTimeout(() => {
        setBookings(prev =>
          prev.map(b => {
            if (b.id === bookingId && b.status === 'bargaining') {
              const diffPercent = (offerAmountUSD - b.baseFare) / b.baseFare;
              
              // If offer is within 15% of baseFare, provider accepts!
              if (diffPercent >= -0.15) {
                const updatedOffers = (b.offersHistory || []).map(o =>
                  o.id === newOffer.id ? { ...o, status: 'accepted' as const } : o
                );
                
                // Recalculate 1.5% dual commissions on accepted price
                const finalDual = calculateDualCommission(offerAmountUSD);
                const finalTax = +(offerAmountUSD * 0.05).toFixed(2);
                const finalTotal = +(offerAmountUSD + finalDual.customerFeeUSD + finalTax).toFixed(2);

                addNotification(
                  '🎉 Offer Accepted!',
                  `${b.provider.name} accepted your price of ₨ ${offerAmountPKR.toLocaleString()} (PKR). Technician is preparing dispatch!`,
                  'emergency'
                );

                return {
                  ...b,
                  status: b.urgency === 'emergency' ? 'en_route' : 'accepted',
                  baseFare: offerAmountUSD,
                  totalAmount: finalTotal,
                  customerPlatformFeeAmount: finalDual.customerFeeUSD,
                  platformCommissionAmount: finalDual.providerDeductionUSD,
                  providerPayoutAmount: finalDual.providerPayoutUSD,
                  isBargainingActive: false,
                  offersHistory: updatedOffers
                };
              } else {
                // Provider counters with a balanced middle price
                const counterUSD = +(offerAmountUSD + (b.baseFare - offerAmountUSD) * 0.55).toFixed(2);
                const counterPKR = Math.round(counterUSD * USD_TO_PKR_RATE);

                const counterOffer: PriceOffer = {
                  id: `offer-${Date.now() + 1}`,
                  amountPKR: counterPKR,
                  amountUSD: counterUSD,
                  offeredBy: 'provider',
                  offeredByName: b.provider.name,
                  status: 'pending',
                  timestamp: 'Just now'
                };

                addNotification(
                  '💬 Counter Offer Received',
                  `${b.provider.name} proposed a counter-fare of ₨ ${counterPKR.toLocaleString()} PKR for "${b.serviceTitle}".`,
                  'booking'
                );

                return {
                  ...b,
                  providerCounterFare: counterUSD,
                  offersHistory: [...(b.offersHistory || []), counterOffer]
                };
              }
            }
            return b;
          })
        );
      }, 2500);
    }

    return { success: true, message: 'Offer sent to technician' };
  };

  const respondBargainOffer = (
    bookingId: string,
    offerId: string,
    action: 'accept' | 'decline' | 'counter',
    counterAmountUSD?: number,
    counterAmountPKR?: number
  ) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const targetOffer = (b.offersHistory || []).find(o => o.id === offerId);
          const acceptedUSD = targetOffer ? targetOffer.amountUSD : b.baseFare;

          if (action === 'accept') {
            const finalDual = calculateDualCommission(acceptedUSD);
            const finalTax = +(acceptedUSD * 0.05).toFixed(2);
            const finalTotal = +(acceptedUSD + finalDual.customerFeeUSD + finalTax).toFixed(2);

            addNotification(
              'Deal Agreed!',
              `Agreed fare: ₨ ${Math.round(acceptedUSD * USD_TO_PKR_RATE).toLocaleString()} PKR. Status updated to Confirmed.`,
              'booking'
            );

            return {
              ...b,
              status: b.urgency === 'emergency' ? 'en_route' : 'accepted',
              baseFare: acceptedUSD,
              totalAmount: finalTotal,
              customerPlatformFeeAmount: finalDual.customerFeeUSD,
              platformCommissionAmount: finalDual.providerDeductionUSD,
              providerPayoutAmount: finalDual.providerPayoutUSD,
              isBargainingActive: false,
              offersHistory: (b.offersHistory || []).map(o =>
                o.id === offerId ? { ...o, status: 'accepted' as const } : o
              )
            };
          } else if (action === 'decline') {
            return {
              ...b,
              offersHistory: (b.offersHistory || []).map(o =>
                o.id === offerId ? { ...o, status: 'declined' as const } : o
              )
            };
          } else if (action === 'counter' && counterAmountUSD && counterAmountPKR) {
            const counterObj: PriceOffer = {
              id: `offer-${Date.now()}`,
              amountPKR: counterAmountPKR,
              amountUSD: counterAmountUSD,
              offeredBy: currentUser?.role === 'provider' ? 'provider' : 'customer',
              offeredByName: currentUser?.name || 'User',
              status: 'pending',
              timestamp: 'Just now'
            };

            return {
              ...b,
              customerProposedFare: currentUser?.role === 'customer' ? counterAmountUSD : b.customerProposedFare,
              providerCounterFare: currentUser?.role === 'provider' ? counterAmountUSD : b.providerCounterFare,
              offersHistory: [
                ...(b.offersHistory || []).map(o => (o.id === offerId ? { ...o, status: 'countered' as const } : o)),
                counterObj
              ]
            };
          }
        }
        return b;
      })
    );
  };

  // Live GPS simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setBookings(prevBookings =>
        prevBookings.map(b => {
          if (b.status === 'en_route' && b.liveTracking) {
            const currentProgress = b.liveTracking.progressPercent;
            if (currentProgress < 95) {
              const newProgress = Math.min(95, currentProgress + 3);
              const remainingEta = Math.max(1, Math.round(15 * (1 - newProgress / 100)));
              const remainingDist = Number((b.provider.distanceKm * (1 - newProgress / 100)).toFixed(1));

              return {
                ...b,
                liveTracking: {
                  ...b.liveTracking,
                  progressPercent: newProgress,
                  etaMinutes: remainingEta,
                  distanceKm: remainingDist,
                  lastUpdated: new Date().toISOString(),
                }
              };
            } else if (currentProgress >= 95 && b.status === 'en_route') {
              return {
                ...b,
                status: 'arrived',
                liveTracking: {
                  ...b.liveTracking,
                  step: 'arrived',
                  progressPercent: 100,
                  etaMinutes: 0,
                  distanceKm: 0,
                  lastUpdated: new Date().toISOString(),
                }
              };
            }
          }
          return b;
        })
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Sync active tracking state
  useEffect(() => {
    if (activeTrackingBooking) {
      const match = bookings.find(b => b.id === activeTrackingBooking.id);
      if (match) {
        setActiveTrackingBooking(match);
      }
    }
  }, [bookings]);

  // Chat message sending
  const sendChatMessage = (
    bookingId: string | undefined,
    providerId: string,
    text: string,
    imageUrl?: string,
    isAudio?: boolean
  ): { success: boolean; blockedContact?: boolean; maskedText?: string } => {
    if (!currentUser) return { success: false };
    
    // Anti-Bypass Contact Filter
    const detection = detectAndMaskContactInfo(text);
    const sanitizedText = detection.maskedText;

    if (detection.containsContact) {
      addNotification(
        '🛡️ Anti-Bypass Shield Active',
        'Direct phone/social sharing is blocked to protect your Fixora Escrow Warranty & Insurance.',
        'system'
      );
    }

    const isCustomerSender = currentUser.role === 'customer';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId,
      providerId,
      customerId: isCustomerSender ? currentUser.id : 'user-hunain',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: sanitizedText,
      imageUrl,
      isAudio,
      timestamp: 'Just now',
      read: true,
    };

    setChatMessages(prev => [...prev, newMsg]);

    if (isCustomerSender) {
      setTimeout(() => {
        const replies = [
          'Understood! I have noted down the problem details.',
          'Okay, almost there near your street entrance.',
          'Got it. I have brought original replacement parts with warranty.',
          'Please keep the work area clear, starting inspection in 2 mins.'
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          bookingId,
          providerId,
          customerId: currentUser.id,
          senderId: providerId,
          senderName: 'Technician',
          senderRole: 'provider',
          text: randomReply,
          timestamp: 'Just now',
          read: true,
        };
        setChatMessages(prev => [...prev, replyMsg]);
      }, 1500);
    }

    return {
      success: true,
      blockedContact: detection.containsContact,
      maskedText: sanitizedText
    };
  };

  // Review submission
  const submitReview = (bookingId: string, rating: number, comment: string, tags?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || !currentUser) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      customerName: currentUser.name,
      customerAvatar: currentUser.avatar,
      rating,
      date: 'Today',
      comment,
      serviceTag: tags || booking.serviceTitle,
      helpfulCount: 0,
      verifiedBuyer: true,
    };

    setProviders(prev =>
      prev.map(p => {
        if (p.id === booking.providerId) {
          const updatedReviews = [newRev, ...p.reviews];
          const avg = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(2));
          return {
            ...p,
            rating: avg,
            reviewCount: p.reviewCount + 1,
            reviews: updatedReviews,
          };
        }
        return p;
      })
    );

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, hasCustomerReviewed: true } : b))
    );

    setReviewModalBooking(null);
    addNotification('Review Submitted', 'Thank you for sharing your feedback with the community!', 'system');
  };

  // AI Voice & Natural Language Assistant call
  const processVoiceOrTextAI = async (query: string, city?: string): Promise<AIQueryResult | null> => {
    setIsProcessingAI(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          userLocation: userAddress,
          city: city || 'Karachi',
          language
        })
      });

      if (!res.ok) {
        throw new Error('Server returned error');
      }

      const data: AIQueryResult = await res.json();
      data.matchScore = Math.floor(90 + Math.random() * 9);
      setLastAIResult(data);

      if (data.category) {
        setSelectedCategory(data.category);
      }
      if (data.urgency === 'emergency') {
        setFilterEmergencyOnly(true);
      }

      setIsProcessingAI(false);
      return data;
    } catch (err) {
      console.warn('Falling back to client heuristics for AI query:', err);

      const lower = query.toLowerCase();
      let matchedCat: CategoryId = 'plumbing';
      let isEmerg = false;
      let costRange = '₨ 1,200 - ₨ 2,500';

      if (lower.includes('electric') || lower.includes('short') || lower.includes('bijli') || lower.includes('mcb') || lower.includes('light') || lower.includes('wire')) {
        matchedCat = 'electrical';
        costRange = '₨ 1,200 - ₨ 3,000';
      } else if (lower.includes('ac') || lower.includes('cooling') || lower.includes('gas refill') || lower.includes('split')) {
        matchedCat = 'ac_repair';
        costRange = '₨ 2,500 - ₨ 5,500';
      } else if (lower.includes('fridge') || lower.includes('washing') || lower.includes('appliance') || lower.includes('geyser') || lower.includes('microwave')) {
        matchedCat = 'appliance_repair';
        costRange = '₨ 1,800 - ₨ 4,000';
      } else if (lower.includes('clean') || lower.includes('safai') || lower.includes('sofa') || lower.includes('carpet')) {
        matchedCat = 'cleaning';
        costRange = '₨ 3,500 - ₨ 8,500';
      } else if (lower.includes('carpenter') || lower.includes('wood') || lower.includes('door') || lower.includes('lock') || lower.includes('bed') || lower.includes('furniture')) {
        matchedCat = 'carpentry';
        costRange = '₨ 1,500 - ₨ 3,500';
      } else if (lower.includes('mechanic') || lower.includes('car') || lower.includes('bike') || lower.includes('puncture') || lower.includes('jumpstart') || lower.includes('gaadi')) {
        matchedCat = 'mechanic';
        costRange = '₨ 1,000 - ₨ 2,500';
      } else if (lower.includes('doctor') || lower.includes('nurse') || lower.includes('health') || lower.includes('medical') || lower.includes('sugar') || lower.includes('bp')) {
        matchedCat = 'healthcare';
        costRange = '₨ 1,500 - ₨ 3,000';
      } else if (lower.includes('tutor') || lower.includes('maths') || lower.includes('teacher') || lower.includes('padhai') || lower.includes('science')) {
        matchedCat = 'tutoring';
        costRange = '₨ 5,000 - ₨ 12,000/mo';
      } else if (lower.includes('mover') || lower.includes('pack') || lower.includes('shifting') || lower.includes('tempo') || lower.includes('truck')) {
        matchedCat = 'moving';
        costRange = '₨ 6,000 - ₨ 18,000';
      } else if (lower.includes('paint') || lower.includes('rang') || lower.includes('wall') || lower.includes('waterproof')) {
        matchedCat = 'painting';
        costRange = '₨ 4,000 - ₨ 12,000';
      } else if (lower.includes('it') || lower.includes('laptop') || lower.includes('computer') || lower.includes('wifi') || lower.includes('windows')) {
        matchedCat = 'it_services';
        costRange = '₨ 1,500 - ₨ 4,000';
      }

      if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('jaldi') || lower.includes('turant') || lower.includes('burst') || lower.includes('leak') || lower.includes('pani')) {
        isEmerg = true;
      }

      const fallbackResult: AIQueryResult = {
        category: matchedCat,
        urgency: isEmerg ? 'emergency' : 'standard',
        problemTitle: `Assistance with ${matchedCat.replace('_', ' ').toUpperCase()}`,
        advice: isEmerg
          ? 'Emergency priority detected. Main line shut-off / safety isolation advised until technician arrives in 15 mins.'
          : 'Matched top-rated certified service professionals in your area.',
        estimatedCostRange: costRange,
        suggestedActions: [isEmerg ? 'Book 15-Min Emergency Dispatch' : 'Browse Top Rated', 'Calculate Estimate', 'Start Chat'],
        spokenResponse: `Found top-rated ${matchedCat} professionals ready in your area.`,
        matchScore: 94
      };

      setLastAIResult(fallbackResult);
      setSelectedCategory(matchedCat);
      if (isEmerg) setFilterEmergencyOnly(true);
      setIsProcessingAI(false);
      return fallbackResult;
    }
  };

  // SIM-Style Wallet Recharge & Voucher Logic
  const rechargeWallet = (amountUSD: number, method: PaymentMethod | string, voucherCode?: string) => {
    if (!currentUser) return;
    const updatedBalance = currentUser.walletBalance + amountUSD;
    const updatedUser = { ...currentUser, walletBalance: updatedBalance };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    const newTx: WalletTransaction = {
      id: `tx-topup-${Date.now()}`,
      userId: currentUser.id,
      type: 'topup',
      amountUSD,
      amountPKR: Math.round(amountUSD * USD_TO_PKR_RATE),
      currency: 'PKR',
      description: voucherCode
        ? `SIM Recharge via Voucher [${voucherCode}]`
        : `Quick Mobile Recharge via ${String(method).toUpperCase()}`,
      descriptionUrdu: voucherCode
        ? `واؤچر کوڈ کے ذریعے والٹ ری چارج [${voucherCode}]`
        : `${String(method).toUpperCase()} کے ذریعے فوری موبائل سم والٹ ری چارج`,
      method,
      status: 'completed',
      timestamp: 'Just now',
      referenceNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setWalletTransactions(prev => [newTx, ...prev]);

    const formatted = formatPrice(amountUSD);
    addNotification(
      'Wallet Recharged',
      `Successfully credited ${formatted} to your Fixora balance. Ready for instant booking!`,
      'payment'
    );
  };

  const redeemVoucher = (code: string): { success: boolean; message: string; amount?: number } => {
    const cleanCode = code.trim().toUpperCase();
    const voucherMap: Record<string, number> = {
      FIXORA1000: 1000 / USD_TO_PKR_RATE,
      EASY500: 500 / USD_TO_PKR_RATE,
      VIPBONUS: 2000 / USD_TO_PKR_RATE,
      BONUS50: 50,
      FIXORA500: 500 / USD_TO_PKR_RATE,
      FREE100: 100 / USD_TO_PKR_RATE
    };

    const amountUSD = voucherMap[cleanCode];
    if (!amountUSD) {
      return {
        success: false,
        message: 'Invalid or expired voucher code. Try FIXORA1000 or EASY500.'
      };
    }

    rechargeWallet(amountUSD, 'wallet', cleanCode);
    return {
      success: true,
      message: `Congratulations! ${formatPrice(amountUSD)} has been added to your balance.`,
      amount: amountUSD
    };
  };

  // Subscription Management Logic
  const subscribeToPlan = (planId: string, paymentMethod: PaymentMethod | string = 'wallet'): boolean => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan || !currentUser) return false;

    // Check if paying with wallet
    if (paymentMethod === 'wallet') {
      if (currentUser.walletBalance < plan.priceUSD) {
        addNotification(
          'Insufficient Balance',
          `Please recharge your wallet balance by ${formatPrice(plan.priceUSD - currentUser.walletBalance)} to subscribe.`,
          'system'
        );
        return false;
      }

      // Deduct from wallet
      const updatedBalance = currentUser.walletBalance - plan.priceUSD;
      const updatedUser = { ...currentUser, walletBalance: updatedBalance };
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

      const subTx: WalletTransaction = {
        id: `tx-sub-${Date.now()}`,
        userId: currentUser.id,
        type: 'subscription_charge',
        amountUSD: plan.priceUSD,
        amountPKR: plan.pricePKR,
        currency: 'PKR',
        description: `Subscription activation: ${plan.name} (${plan.billingPeriod})`,
        descriptionUrdu: `پریمیم ممبرشپ فیس: ${plan.nameUrdu}`,
        method: 'wallet',
        status: 'completed',
        timestamp: 'Just now',
        referenceNumber: `SUB-${plan.id.slice(-6).toUpperCase()}`
      };
      setWalletTransactions(prev => [subTx, ...prev]);
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const newSub: UserSubscription = {
      planId: plan.id,
      tier: plan.tier,
      name: plan.name,
      nameUrdu: plan.nameUrdu,
      priceUSD: plan.priceUSD,
      pricePKR: plan.pricePKR,
      billingCycle: 'monthly',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      discountPercent: plan.discountPercent,
      freeInspectionsLeft: plan.freeInspectionsCount,
      zeroPlatformFee: plan.tier === 'plus' || plan.tier === 'home_shield',
      priorityDispatch: true,
      commissionDiscountPercent: plan.commissionRatePercent,
      badgeName: plan.tier === 'pro_vip' ? 'VIP Pro Club' : 'Fixora Plus Member'
    };

    const updatedUserWithSub: User = {
      ...currentUser,
      subscription: newSub
    };

    setCurrentUser(updatedUserWithSub);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUserWithSub : u)));

    // If provider subscribed to Pro VIP, update provider profile commission rate to 5%
    if (plan.tier === 'pro_vip' || plan.targetRole === 'provider') {
      setProviders(prev =>
        prev.map(p => {
          if (p.id === currentUser.id || p.id === currentUser.providerProfileId) {
            return {
              ...p,
              commissionRate: 5,
              subscription: newSub,
              isFeatured: true
            };
          }
          return p;
        })
      );
    }

    addNotification(
      'Membership Activated',
      `Welcome to ${plan.name}! All tier benefits and discount rates are now applied to your account.`,
      'promo'
    );

    return true;
  };

  const cancelSubscription = () => {
    if (!currentUser || !currentUser.subscription) return;
    const updatedUser: User = {
      ...currentUser,
      subscription: undefined
    };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    addNotification('Subscription Cancelled', 'Your membership has been reverted to Free Basic.', 'system');
  };

  const topUpWallet = (amountUSD: number, method: string) => {
    rechargeWallet(amountUSD, method);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        topUpWallet,
        t,
        currentUser,
        setCurrentUser,
        currentRole,
        activeTab,
        setActiveTab,
        allUsers,
        blockUser,
        unblockUser,
        login,
        signup,
        logout,
        switchRole,
        categories,
        providers,
        setProviders,
        filteredProviders,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filterEmergencyOnly,
        setFilterEmergencyOnly,
        filterVerifiedOnly,
        setFilterVerifiedOnly,
        filterFavoritesOnly,
        setFilterFavoritesOnly,
        sortBy,
        setSortBy,
        userAddress,
        setUserAddress,
        favorites,
        toggleFavorite,
        isFavorite,
        bookings,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        authTargetRole,
        setAuthTargetRole,
        voiceModalOpen,
        setVoiceModalOpen,
        selectedProvider,
        setSelectedProvider,
        bookingModalProvider,
        setBookingModalProvider,
        bookingIsEmergency,
        setBookingIsEmergency,
        activeTrackingBooking,
        setActiveTrackingBooking,
        chatModalBooking,
        setChatModalBooking,
        chatMessages,
        sendChatMessage,
        reviewModalBooking,
        setReviewModalBooking,
        submitReview,
        receiptModalBooking,
        setReceiptModalBooking,
        bargainingModalBooking,
        setBargainingModalBooking,
        sendBargainOffer,
        respondBargainOffer,
        disputes,
        disputeModalOpen,
        setDisputeModalOpen,
        activeDisputeBooking,
        setActiveDisputeBooking,
        raiseDispute,
        resolveDispute,
        promos,
        activePromo,
        appliedDiscount,
        applyPromoCode,
        removePromoCode,
        createPromoCode,
        togglePromoCodeActive,
        verificationDocs,
        uploadVerificationDoc,
        reviewVerificationDoc,
        reports,
        reportModalOpen,
        setReportModalOpen,
        reportTargetUser,
        setReportTargetUser,
        reportUser,
        resolveReport,
        updateProviderOnlineStatus,
        updateProviderProfile,
        requestProviderWithdrawal,
        isProcessingAI,
        lastAIResult,
        processVoiceOrTextAI,
        notifications,
        notifDrawerOpen,
        setNotifDrawerOpen,
        unreadNotifCount,
        addNotification,
        markNotifAsRead,
        markAllNotifsRead,
        activeCallProvider,
        setActiveCallProvider,
        savedAddresses,
        addSavedAddress,
        removeSavedAddress,
        selectedFamilyMember,
        setSelectedFamilyMember,
        supportModalOpen,
        setSupportModalOpen,
        supportTickets,
        createSupportTicket,
        replySupportTicket,
        referralModalOpen,
        setReferralModalOpen,
        referralData,
        corporatePlans,
        fastRebookProvider,
        providerOnboardingOpen,
        setProviderOnboardingOpen,
        addProviderOfferedService,
        updateProviderOfferedService,
        deleteProviderOfferedService,
        addProviderBeforeAfterItem,
        deleteProviderBeforeAfterItem,
        deleteAccount,
        playStoreModalOpen,
        setPlayStoreModalOpen,
        playStoreReviewerLogin,
        subscriptionModalOpen,
        setSubscriptionModalOpen,
        subscribeToPlan,
        cancelSubscription,
        walletModalOpen,
        setWalletModalOpen,
        settingsModalOpen,
        setSettingsModalOpen,
        userSettings,
        updateUserSettings,
        resetUserSettings,
        clearAppCache,
        updateUserProfile,
        walletTransactions,
        setWalletTransactions,
        rechargeWallet,
        redeemVoucher,
        unlockedChatThreads,
        unlockChatThread,
        isChatUnlocked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
