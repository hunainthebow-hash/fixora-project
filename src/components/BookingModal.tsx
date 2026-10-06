import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, Currency } from '../types';
import { formatDualPrice, USD_TO_PKR_RATE } from '../utils/currency';
import { calculateDualCommission } from '../utils/antiBypass';
import { CurrencyPaymentSwitch } from './CurrencyPaymentSwitch';
import { MultiCurrencyCheckoutModal } from './MultiCurrencyCheckoutModal';
import {
  X,
  Zap,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  Info,
  Tag,
  Users,
  Image as ImageIcon,
  Check,
  Smartphone,
  Building2,
  Globe,
  Sparkles,
  Percent,
  Lock,
  PlusCircle,
  HandCoins
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingModal: React.FC = () => {
  const {
    bookingModalProvider,
    setBookingModalProvider,
    bookingIsEmergency,
    setBookingIsEmergency,
    currentUser,
    createBooking,
    setActiveTrackingBooking,
    setBargainingModalBooking,
    userAddress,
    savedAddresses,
    applyPromoCode,
    activePromo,
    appliedDiscount,
    removePromoCode,
    currency,
    setCurrency,
    formatPrice,
    language,
    t,
    lastAIResult,
    setWalletModalOpen
  } = useApp();

  const [urgencyMode, setUrgencyMode] = useState<'emergency' | 'standard'>(
    bookingIsEmergency || (lastAIResult?.urgency === 'emergency') ? 'emergency' : 'standard'
  );
  const [scheduledDate, setScheduledDate] = useState('Today');
  const [scheduledTime, setScheduledTime] = useState('11:00 AM - 01:00 PM');
  const [serviceTitle, setServiceTitle] = useState(
    lastAIResult?.problemTitle || (bookingModalProvider ? `${bookingModalProvider.title} Inspection & Repair` : '')
  );
  const [problemDescription, setProblemDescription] = useState(
    lastAIResult?.advice ? `AI Diagnosis: ${lastAIResult.advice}` : ''
  );
  const [selectedAddress, setSelectedAddress] = useState(userAddress || 'House 42-B, Block 6, PECHS, Karachi');
  const [bookingFor, setBookingFor] = useState<'Self' | 'Sister (Zainab)' | 'Father (Tariq)' | 'Other'>('Self');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(currency === 'PKR' ? 'wallet' : 'wallet');
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Dynamic Payment Details Inputs
  const [accountNumber, setAccountNumber] = useState('03001234567');
  const [accountTitle, setAccountTitle] = useState(currentUser?.name || '');
  const [cardDetails, setCardDetails] = useState({ number: '4242 •••• •••• 4242', exp: '12/28', cvc: '•••' });
  const [transactionRef, setTransactionRef] = useState('');

  if (!bookingModalProvider || !currentUser) return null;

  const standardBaseFare = bookingModalProvider.hourlyRate;
  const standardFarePKR = Math.round(standardBaseFare * USD_TO_PKR_RATE);
  const [isBargainingActive, setIsBargainingActive] = useState(false);
  const [bargainFarePKR, setBargainFarePKR] = useState<number>(standardFarePKR);

  const baseFare = isBargainingActive
    ? +(bargainFarePKR / USD_TO_PKR_RATE).toFixed(2)
    : standardBaseFare;

  const emergencySurge = urgencyMode === 'emergency' ? 15 : 0;
  
  // Calculate 1.5% Customer Platform Fee
  const dualComm = calculateDualCommission(baseFare);
  const customerPlatformFee = dualComm.customerFeeUSD; // 1.5%
  const providerCommissionDeduction = dualComm.providerDeductionUSD; // 1.5%

  const subtotal = baseFare + customerPlatformFee + emergencySurge;
  const taxAmount = Number((subtotal * 0.05).toFixed(2));
  const finalDiscount = appliedDiscount;
  const totalAmount = Math.max(0, +(subtotal + taxAmount - finalDiscount).toFixed(2));

  // Wallet Balance Check
  const currentWalletBalance = currentUser?.walletBalance || 0;
  const hasSufficientBalance = currentWalletBalance >= totalAmount;
  const missingUSD = +(totalAmount - currentWalletBalance).toFixed(2);
  const missingPKR = Math.round(missingUSD * USD_TO_PKR_RATE);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = applyPromoCode(promoInput, subtotal);
    setPromoMessage(result.message);
    if (result.success) {
      setPromoInput('');
    }
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fakeUrl = URL.createObjectURL(e.target.files[0]);
      setAttachedImage(fakeUrl);
    }
  };

  const executeFinalBookingCreation = (txnData?: {
    paymentMethod: PaymentMethod;
    currency: Currency;
    transactionRef: string;
    paidAmountUSD: number;
    accountNumber?: string;
    accountTitle?: string;
    cardLast4?: string;
  }) => {
    const finalMethod = txnData?.paymentMethod || paymentMethod;
    const finalCurr = txnData?.currency || currency;
    const finalTxnRef = txnData?.transactionRef || transactionRef || `TXN-FX-${Math.floor(100000 + Math.random() * 900000)}`;

    const created = createBooking({
      customerId: currentUser.id,
      customerName: bookingFor === 'Self' ? currentUser.name : `${currentUser.name} (For ${bookingFor})`,
      customerPhone: currentUser.phone,
      customerAddress: selectedAddress,
      customerLat: 28.6139,
      customerLng: 77.2090,
      providerId: bookingModalProvider.id,
      provider: bookingModalProvider,
      categoryId: bookingModalProvider.categoryId,
      serviceTitle: serviceTitle.trim() || `${bookingModalProvider.title} Inspection & Repair`,
      problemDescription: problemDescription.trim() || 'Service request booked via Fixora.',
      urgency: urgencyMode,
      scheduledDate: urgencyMode === 'emergency' ? 'Today' : scheduledDate,
      scheduledTime: urgencyMode === 'emergency' ? 'Immediate (15-min SLA)' : scheduledTime,
      baseFare,
      emergencySurge,
      taxAmount,
      discountAmount: finalDiscount,
      totalAmount,
      currency: finalCurr,
      platformCommissionRate: 1.5,
      platformCommissionAmount: providerCommissionDeduction,
      customerPlatformFeeRate: 1.5,
      customerPlatformFeeAmount: customerPlatformFee,
      totalPlatformRevenue: +(customerPlatformFee + providerCommissionDeduction).toFixed(2),
      providerPayoutAmount: +(baseFare + emergencySurge - providerCommissionDeduction).toFixed(2),
      paymentMethod: finalMethod,
      paymentDetails: {
        accountNumber: txnData?.accountNumber || accountNumber,
        accountTitle: txnData?.accountTitle || accountTitle,
        transactionRef: finalTxnRef,
        cardLast4: finalMethod === 'card' ? (txnData?.cardLast4 || '4242') : undefined
      },
      paymentStatus: 'paid',
      attachedMediaUrls: attachedImage ? [attachedImage] : undefined,
      isBargainingActive,
      customerProposedFare: isBargainingActive ? baseFare : undefined,
      offersHistory: isBargainingActive ? [
        {
          id: `offer-${Date.now()}`,
          amountPKR: bargainFarePKR,
          amountUSD: baseFare,
          offeredBy: 'customer',
          offeredByName: currentUser.name,
          status: 'pending',
          timestamp: 'Just now'
        }
      ] : undefined
    });

    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setIsSubmitting(false);
    setShowCheckoutModal(false);
    setBookingModalProvider(null);
    if (isBargainingActive) {
      setBargainingModalBooking(created);
    } else {
      setActiveTrackingBooking(created);
    }
  };

  const handleConfirmBookingClick = () => {
    // If balance is sufficient, create booking immediately from wallet balance
    if (hasSufficientBalance) {
      executeFinalBookingCreation({
        paymentMethod: 'wallet',
        currency: 'PKR',
        transactionRef: `WALLET-ESC-${Date.now().toString().slice(-6)}`,
        paidAmountUSD: totalAmount
      });
    } else {
      // Open multi-currency gateway or prompt Safepay recharge
      setShowCheckoutModal(true);
    }
  };

  return (
    <div id="booking-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <img
              src={bookingModalProvider.avatar}
              alt={bookingModalProvider.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Book {bookingModalProvider.name}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{bookingModalProvider.title}</p>
            </div>
          </div>

          <button
            id="close-booking-modal-btn"
            onClick={() => setBookingModalProvider(null)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Mandatory Wallet Balance Alert / Status Banner */}
          {!hasSufficientBalance ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs block">
                      {language === 'ur'
                        ? 'والٹ بیلنس ناکافی ہے (Account Balance Low)'
                        : language === 'hi'
                        ? 'वॉलेट बैलेंस कम है (Account Balance Low)'
                        : 'Insufficient Wallet Balance for Booking'}
                    </span>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      {language === 'ur'
                        ? `سروس آرڈر کرنے کے لیے آپ کے اکاؤنٹ میں کم از کم ${formatPrice(totalAmount)} ہونا ضروری ہے۔ موجودہ بیلنس: ${formatPrice(currentWalletBalance)} (کمی: ${formatPrice(missingUSD)})۔`
                        : language === 'hi'
                        ? `सेवा बुक करने के लिए आपके वॉलेट में न्यूनतम ${formatPrice(totalAmount)} होना आवश्यक है। वर्तमान बैलेंस: ${formatPrice(currentWalletBalance)} (कमी: ${formatPrice(missingUSD)})।`
                        : `You need at least ${formatPrice(totalAmount)} in your Fixora wallet to confirm this booking. Current balance: ${formatPrice(currentWalletBalance)}.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWalletModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ur'
                      ? 'سیف پے سے ری چارج کریں'
                      : language === 'hi'
                      ? 'सेफपे से रिचार्ज करें'
                      : 'Recharge via Safepay'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold">
                  {language === 'ur'
                    ? `آپ کا والٹ بیلنس کافی ہے (${formatPrice(currentWalletBalance)}) - رقم 100% اسکرو میں محفوظ رہے گی`
                    : language === 'hi'
                    ? `पर्याप्त वॉलेट बैलेंस उपलब्ध है (${formatPrice(currentWalletBalance)}) - राशि 100% एस्क्रो में सुरक्षित रहेगी`
                    : `Sufficient balance available (${formatPrice(currentWalletBalance)}). Protected by 100% Fixora Escrow.`}
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                Active Balance
              </span>
            </div>
          )}

          {/* Dispatch Urgency Selector */}
          <div>
            <label className="block font-bold text-slate-900 dark:text-white mb-2">
              Select Dispatch Speed & Urgency
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUrgencyMode('emergency')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  urgencyMode === 'emergency'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-rose-500 text-white font-bold shrink-0">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>⚡ 15-Min Emergency</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Priority on-call technician dispatch with live GPS tracking.
                  </p>
                  <span className="inline-block text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                    +$15 Priority Fee
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUrgencyMode('standard')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  urgencyMode === 'standard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-600 text-white font-bold shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Standard Scheduled
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose preferred date & time slot at regular visit fare.
                  </p>
                  <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Standard Rate ({formatPrice(baseFare)})
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Service Title and Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Service Title
              </label>
              <input
                type="text"
                value={serviceTitle}
                onChange={e => setServiceTitle(e.target.value)}
                placeholder="e.g. AC Gas Refill & Compressor Check"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Booking For
              </label>
              <select
                value={bookingFor}
                onChange={e => setBookingFor(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="Self">Self ({currentUser.name})</option>
                <option value="Sister (Zainab)">Sister (Zainab)</option>
                <option value="Father (Tariq)">Father (Tariq)</option>
                <option value="Other">Other Family Member</option>
              </select>
            </div>
          </div>

          {/* Problem Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Problem Description / Notes for Technician
            </label>
            <textarea
              rows={2}
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              placeholder="Describe the issue in detail or instructions for the visiting technician..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
            />
          </div>

          {/* Fair Price Bidding & Bargaining Section */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    {language === 'ur'
                      ? 'ریٹ کم کرائیں (Fair Price Bidding)'
                      : language === 'hi'
                      ? 'उचित मूल्य बोली एवं मोलभाव (Fair Price Bidding)'
                      : 'Fair Price Bidding & Bargaining'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'ur'
                      ? 'ٹیکنیشن کے ساتھ اپنی پسند کا ریٹ طے کریں'
                      : language === 'hi'
                      ? 'सीधे तकनीशियन के साथ अपने पसंदीदा शुल्क का प्रस्ताव करें'
                      : 'Propose your preferred fare directly to the technician'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBargainingActive(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  isBargainingActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                }`}
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>
                  {isBargainingActive
                    ? language === 'ur'
                      ? 'بارگیننگ فعال ہے'
                      : language === 'hi'
                      ? 'मोलभाव सक्रिय है'
                      : 'Bargaining Active'
                    : language === 'ur'
                    ? 'ریٹ تبدیل کریں'
                    : language === 'hi'
                    ? 'अपनी दर का प्रस्ताव दें'
                    : 'Custom Offer'}
                </span>
              </button>
            </div>

            {isBargainingActive && (
              <div className="pt-2 space-y-2.5 border-t border-amber-200/70 dark:border-amber-900/40">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 dark:text-slate-400 text-xs">
                      ₨
                    </span>
                    <input
                      type="number"
                      min="200"
                      step="50"
                      value={bargainFarePKR}
                      onChange={e => setBargainFarePKR(Math.max(100, Number(e.target.value)))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    (Standard: ₨ {standardFarePKR.toLocaleString()})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mr-1">
                    {language === 'ur' ? 'فوری تبدیل:' : 'Quick adjust:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBargainFarePKR(prev => Math.max(200, prev - 200))}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    -₨ 200
                  </button>
                  <button
                    type="button"
                    onClick={() => setBargainFarePKR(prev => Math.max(200, prev - 100))}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    -₨ 100
                  </button>
                  <button
                    type="button"
                    onClick={() => setBargainFarePKR(prev => prev + 100)}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    +₨ 100
                  </button>
                  <button
                    type="button"
                    onClick={() => setBargainFarePKR(prev => prev + 200)}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    +₨ 200
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Breakdown Card - With 1.5% Dual Commission Clarity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="font-medium">Base Service & Diagnostics Fare</span>
              <span className="font-mono font-bold">{formatPrice(baseFare)}</span>
            </div>

            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                <span>Fixora Platform Service Fee (1.5%)</span>
              </span>
              <span className="font-mono font-bold">+{formatPrice(customerPlatformFee)}</span>
            </div>

            {emergencySurge > 0 && (
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span>⚡ 15-Min Emergency Surge</span>
                <span className="font-mono font-bold">+{formatPrice(emergencySurge)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Govt. GST & Safety Cover (5%)</span>
              <span className="font-mono">+{formatPrice(taxAmount)}</span>
            </div>

            {finalDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Promo Discount</span>
                <span className="font-mono">-{formatPrice(finalDiscount)}</span>
              </div>
            )}

            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-baseline justify-between text-slate-900 dark:text-white">
              <div>
                <span className="text-xs font-bold block">Total Amount to be Paid</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currency === 'PKR' ? `Equivalent: $${(totalAmount || 0).toFixed(2)} USD` : `Equivalent: ₨ ${Math.round((totalAmount || 0) * USD_TO_PKR_RATE).toLocaleString()} PKR`}
                </span>
              </div>
              <span className="text-lg font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatPrice(totalAmount)}
              </span>
            </div>

            {/* Provider split note */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Technician Payout upon OTP verification:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {formatPrice(baseFare + emergencySurge - providerCommissionDeduction)} (1.5% commission deducted)
              </span>
            </div>
          </div>
        </div>

        {/* Footer Confirm Action */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-4">
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400 block">Payable Total:</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {formatPrice(totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBookingModalProvider(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition hover:bg-slate-300 cursor-pointer"
            >
              Cancel
            </button>

            {!hasSufficientBalance ? (
              <button
                type="button"
                id="recharge-to-book-btn"
                onClick={() => setWalletModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {language === 'ur'
                    ? `سیف پے ری چارج کریں (₨ ${missingPKR.toLocaleString()})`
                    : language === 'hi'
                    ? `सेफपे से रिचार्ज करें (₨ ${missingPKR.toLocaleString()})`
                    : `Recharge via Safepay (₨ ${missingPKR.toLocaleString()})`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                id="initiate-checkout-flow-btn"
                onClick={handleConfirmBookingClick}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center gap-2 transition cursor-pointer ${
                  urgencyMode === 'emergency'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                {isSubmitting ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {isBargainingActive
                        ? language === 'ur'
                          ? 'پیشکش بھیجیں اور بات چیت شروع کریں'
                          : language === 'hi'
                          ? 'प्रस्ताव भेजें और बातचीत शुरू करें'
                          : 'Propose Fare & Start Bargaining'
                        : urgencyMode === 'emergency'
                        ? language === 'ur'
                          ? 'تصدیق کریں اور ایمرجنسی پرو روانہ کریں'
                          : language === 'hi'
                          ? 'पुष्टि करें एवं इमरजेंसी प्रो भेजें'
                          : 'Confirm & Dispatch Emergency Pro'
                        : language === 'ur'
                          ? 'بکنگ محفوظ اور کنفرم کریں'
                          : language === 'hi'
                          ? 'बुकिंग कन्फर्म एवं एस्क्रो सुरक्षित करें'
                          : 'Confirm & Escrow Booking'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Mock Multi-Currency Gateway Checkout Flow */}
      <MultiCurrencyCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onSuccess={executeFinalBookingCreation}
        amountUSD={baseFare}
        initialCurrency={currency}
        initialPaymentMethod={paymentMethod}
        serviceTitle={serviceTitle.trim() || `${bookingModalProvider.title} Inspection & Repair`}
        providerName={bookingModalProvider.name}
        customerName={bookingFor === 'Self' ? currentUser.name : `${currentUser.name} (For ${bookingFor})`}
        customerPhone={currentUser.phone}
        walletBalanceUSD={currentUser.walletBalance || 0}
        isEmergency={urgencyMode === 'emergency'}
        promoDiscountUSD={finalDiscount}
      />
    </div>
  );
};
