export type UserRole = 'customer' | 'provider' | 'admin';

export type AppLanguage = 'en' | 'ur' | 'hi';
export type AppTheme = 'light' | 'dark';
export type Currency = 'USD' | 'PKR';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'easypaisa'
  | 'jazzcash'
  | 'sadapay'
  | 'nayapay'
  | 'bank_transfer'
  | 'stripe'
  | 'wallet'
  | 'upi';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  address: string;
  isVerified: boolean;
  walletBalance: number;
  providerProfileId?: string;
  isBlocked?: boolean;
  savedAddresses?: SavedAddress[];
  loyaltyPoints?: number;
  referralCode?: string;
  familyMembers?: { id: string; name: string; relation: string; phone: string }[];
  subscription?: UserSubscription;
}

export interface SavedAddress {
  id: string;
  label: 'Home' | 'Work' | 'Parents' | 'Other';
  address: string;
  isDefault?: boolean;
  lat: number;
  lng: number;
}

export interface UserSettings {
  pushNotifications: boolean;
  smsAlerts: boolean;
  whatsappAlerts: boolean;
  emergencySirenAudio: boolean;
  liveTrackingHaptics: boolean;
  maskedPhoneNumbers: boolean;
  biometricLock: boolean;
  twoFactorAuth: boolean;
  autoWalletDeduct: boolean;
  lowBalanceAlert: boolean;
  defaultCity: string;
  distanceUnit: 'km' | 'miles';
  appTheme: AppTheme | 'system';
  language: AppLanguage;
  currency: Currency;
  hapticFeedback: boolean;
  soundEffects: boolean;
  emailReceipts: boolean;
  autoAddressDetection: boolean;
}

export type CategoryId =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'ac_repair'
  | 'appliance_repair'
  | 'painting'
  | 'cleaning'
  | 'it_services'
  | 'tutoring'
  | 'mechanic'
  | 'moving'
  | 'maintenance'
  | 'healthcare'
  | 'handyman'
  | 'gardening'
  | 'car_wash'
  | 'mobile_repair'
  | 'computer_repair'
  | 'appliances';

export interface ServiceCategory {
  id: CategoryId;
  name: string;
  nameUrdu: string;
  nameHindi?: string;
  nameUrduHindi?: string;
  icon: string;
  description: string;
  basePrice: number;
  emergencyAvailable: boolean;
  popularTags: string[];
  activeProvidersCount: number;
}

export interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  date: string;
  comment: string;
  serviceTag: string;
  helpfulCount: number;
  verifiedBuyer: boolean;
  images?: string[];
  isFlagged?: boolean;
}

export interface ProviderOfferedService {
  id: string;
  title: string;
  description: string;
  pricePKR: number;
  priceUSD: number;
  durationMins: number;
  isEmergencyAllowed?: boolean;
  isPopular?: boolean;
}

export interface BeforeAfterPortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  beforeImg: string;
  afterImg: string;
  completedDate: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  categoryId: CategoryId;
  specialties: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  hourlyRate: number;
  emergencyRate: number;
  distanceKm: number;
  isVerified: boolean;
  backgroundChecked: boolean;
  certifiedPro: boolean;
  licenseNumber: string;
  cnicNumber?: string;
  serviceCity?: string;
  verificationStatus?: 'verified' | 'pending_review' | 'rejected';
  emergencyReady: boolean;
  isOnline: boolean;
  isBusy?: boolean;
  serviceRadiusKm?: number;
  etaMinutes: number;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  bio: string;
  portfolio: {
    title: string;
    imageUrl: string;
  }[];
  beforeAfterPortfolio?: BeforeAfterPortfolioItem[];
  offeredServices?: ProviderOfferedService[];
  badges: string[];
  reviews: Review[];
  availableDays?: string[];
  workingHours?: { start: string; end: string };
  payoutMethods?: { type: 'bank' | 'easypaisa' | 'jazzcash' | 'upi' | 'stripe'; accountNumber: string; title: string }[];
  isSuspended?: boolean;
  subscription?: UserSubscription;
  commissionRate?: number;
}

export type BookingStatus =
  | 'pending'
  | 'bargaining'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface PriceOffer {
  id: string;
  amountPKR: number;
  amountUSD: number;
  offeredBy: 'customer' | 'provider';
  offeredByName: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  timestamp: string;
}

export interface LiveTracking {
  currentLat: number;
  currentLng: number;
  customerLat: number;
  customerLng: number;
  progressPercent: number;
  etaMinutes: number;
  distanceKm: number;
  speedKmh: number;
  step: 'dispatched' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
  lastUpdated: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  providerId: string;
  provider: ProviderProfile;
  categoryId: CategoryId;
  serviceTitle: string;
  problemDescription: string;
  urgency: 'standard' | 'emergency';
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  baseFare: number;
  emergencySurge: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency?: Currency;
  platformCommissionRate?: number; // e.g. 1.5 (%)
  platformCommissionAmount?: number; // e.g. 1.5% from provider in USD
  customerPlatformFeeRate?: number; // e.g. 1.5 (%)
  customerPlatformFeeAmount?: number; // e.g. 1.5% from customer in USD
  totalPlatformRevenue?: number; // e.g. 3.0% (customer + provider) in USD
  providerPayoutAmount?: number; // e.g. baseFare - providerCommissionAmount
  escrowStatus?: 'held_in_escrow' | 'released_to_provider' | 'refunded';
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    accountNumber?: string;
    accountTitle?: string;
    transactionRef?: string;
    cardLast4?: string;
  };
  paymentStatus: 'pending' | 'paid' | 'refunded';
  otp: string;
  createdAt: string;
  completedAt?: string;
  liveTracking?: LiveTracking;
  hasCustomerReviewed?: boolean;
  forFamilyMember?: string;
  problemPhotos?: string[];
  completionPhotos?: string[];
  disputeId?: string;
  isBargainingActive?: boolean;
  customerProposedFare?: number;
  providerCounterFare?: number;
  offersHistory?: PriceOffer[];
}

export interface ChatMessage {
  id: string;
  bookingId?: string;
  providerId: string;
  customerId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  read: boolean;
  isAudio?: boolean;
  imageUrl?: string;
}

export interface VerificationDoc {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  type: 'cnic_id' | 'police_check' | 'trade_license' | 'skill_certificate';
  name: string;
  documentNumber: string; // Masked sensitive display like 35201-****481-9
  fullDocumentNumber?: string;
  status: 'verified' | 'pending' | 'rejected';
  uploadedAt: string;
  rejectionReason?: string;
  documentImageUrl?: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  providerName: string;
  amount: number;
  reason: 'work_incomplete' | 'overcharged' | 'no_show' | 'poor_quality' | 'damage_issue' | 'other';
  description: string;
  status: 'open' | 'under_review' | 'refunded' | 'resolved' | 'rejected';
  refundAmount?: number;
  createdAt: string;
  resolutionNotes?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
  description: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userRole: UserRole;
  subject: string;
  category: 'booking_help' | 'payment_refund' | 'provider_behavior' | 'app_bug' | 'dispute_escalation' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assignedAgentName?: string;
  messages: {
    id?: string;
    sender: 'user' | 'agent' | 'ai_bot';
    senderName?: string;
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CorporatePlan {
  id: string;
  name: string;
  nameUrdu: string;
  targetAudience: 'Offices & Commercial' | 'Residential Societies' | 'Restaurants & Retail' | 'Schools & Colleges';
  monthlyRatePkr: number;
  monthlyRateUsd: number;
  features: string[];
  dedicatedManager: boolean;
  priorityResponseMinutes: number;
  monthlyInspectionsCount: number;
  discountOnPartsPercent: number;
  isActive: boolean;
}

export interface ReferralStat {
  code: string;
  totalInvited: number;
  successfulBookings: number;
  earnedRewardsPkr: number;
  earnedRewardsUsd: number;
  rewardPerFriendPkr: number;
  friendDiscountPercent: number;
}

export interface AIDiagnosisStep {
  stepIndex: number;
  question: string;
  questionUrdu: string;
  options: {
    label: string;
    labelUrdu: string;
    inferredIssue: string;
    costImpactPercent: number;
  }[];
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'chat' | 'emergency' | 'system' | 'promo' | 'dispute';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedRole: UserRole;
  reportedByUserId: string;
  reportedByName: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'banned';
  createdAt: string;
}

export type SubscriptionTier = 'free' | 'plus' | 'pro_vip' | 'home_shield';

export interface UserSubscription {
  planId: string;
  tier: SubscriptionTier;
  name: string;
  nameUrdu: string;
  priceUSD: number;
  pricePKR: number;
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  expiryDate: string;
  discountPercent: number; // e.g. 15% discount on bookings
  freeInspectionsLeft: number;
  zeroPlatformFee: boolean;
  priorityDispatch: boolean;
  commissionDiscountPercent?: number; // for providers (e.g. 5% commission instead of 12%)
  badgeName?: string;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  targetRole: 'customer' | 'provider' | 'both';
  name: string;
  nameUrdu: string;
  tagline: string;
  taglineUrdu: string;
  description: string;
  descriptionUrdu: string;
  pricePKR: number;
  priceUSD: number;
  billingPeriod: 'monthly' | 'yearly';
  popular?: boolean;
  features: string[];
  featuresUrdu: string[];
  discountPercent: number;
  freeInspectionsCount: number;
  commissionRatePercent?: number; // e.g. 5% for Pro VIP vs 12% standard
  colorGradient: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'topup' | 'booking_payment' | 'booking_payout' | 'commission_deduction' | 'subscription_charge' | 'refund' | 'voucher_redeem' | 'chat_unlock';
  amountUSD: number;
  amountPKR: number;
  currency: Currency;
  description: string;
  descriptionUrdu: string;
  method?: PaymentMethod | string;
  status: 'completed' | 'pending' | 'failed';
  bookingId?: string;
  timestamp: string;
  referenceNumber: string;
}

