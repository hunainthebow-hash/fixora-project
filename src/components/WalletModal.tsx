import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Currency, PaymentMethod } from '../types';
import { USD_TO_PKR_RATE } from '../utils/currency';
import { SafepayService } from '../services/safepayService';
import {
  X,
  Wallet,
  Zap,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Gift,
  History,
  ShieldCheck,
  Tag,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Percent,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Building2,
  Receipt,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WalletModal: React.FC = () => {
  const {
    walletModalOpen,
    setWalletModalOpen,
    currentUser,
    currency,
    setCurrency,
    formatPrice,
    rechargeWallet,
    redeemVoucher,
    walletTransactions,
    language,
    t,
    setSubscriptionModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'safepay_recharge' | 'voucher' | 'history' | 'escrow'>('safepay_recharge');
  const [rechargeAmount, setRechargeAmount] = useState<number>(currency === 'PKR' ? 1000 : 10);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '03001234567');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'hunainthebow@gmail.com');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(currency === 'PKR' ? 'easypaisa' : 'card');
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherStatus, setVoucherStatus] = useState<{ success: boolean; message: string; amount?: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [safepayStep, setSafepayStep] = useState<'idle' | 'tokenizing' | 'authenticating' | 'settled'>('idle');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);
  const [lastTxnRef, setLastTxnRef] = useState<string>('');

  if (!walletModalOpen || !currentUser) return null;

  const quickPkrAmounts = [500, 1000, 2500, 5000, 10000];
  const quickUsdAmounts = [5, 10, 25, 50, 100];
  const activeQuickAmounts = currency === 'PKR' ? quickPkrAmounts : quickUsdAmounts;

  const currentEffectiveAmount = customAmountInput ? Number(customAmountInput) : rechargeAmount;
  const equivalentOtherAmount = currency === 'PKR'
    ? (currentEffectiveAmount / USD_TO_PKR_RATE).toFixed(2)
    : Math.round(currentEffectiveAmount * USD_TO_PKR_RATE);

  const availableVouchers = [
    { code: 'FIXORA1000', amountPkr: 1000, amountUsd: 3.5, label: 'New User Welcome Bonus (₨ 1,000)' },
    { code: 'EASY500', amountPkr: 500, amountUsd: 1.8, label: 'Instant Balance Voucher (₨ 500)' },
    { code: 'HUNAINVIP', amountPkr: 2500, amountUsd: 8.9, label: 'Pro VIP Account Recharge Bonus (₨ 2,500)' }
  ];

  const handleSelectQuick = (amt: number) => {
    setCustomAmountInput('');
    setRechargeAmount(amt);
  };

  const handleExecuteSafepayRecharge = async () => {
    if (currentEffectiveAmount <= 0) return;
    setIsProcessing(true);
    setSafepayStep('tokenizing');

    const baseUsd = currency === 'PKR' ? currentEffectiveAmount / USD_TO_PKR_RATE : currentEffectiveAmount;
    const amountPKR = currency === 'PKR' ? currentEffectiveAmount : Math.round(currentEffectiveAmount * USD_TO_PKR_RATE);

    try {
      // Step 1: Initialize Safepay Hosted Session
      const session = await SafepayService.createPaymentSession({
        amountPKR,
        amountUSD: baseUsd,
        customerName: currentUser.name,
        customerEmail,
        customerPhone: phoneNumber,
        paymentMethod: selectedMethod,
        notes: `Fixora Wallet Recharge for ${currentUser.name}`
      });

      setSafepayStep('authenticating');
      await new Promise(r => setTimeout(r, 900));

      // Step 2: Verify & Credit Funds
      const verification = await SafepayService.verifyPayment(session.trackerToken, session.referenceCode);
      setLastTxnRef(verification.transactionId);

      rechargeWallet(baseUsd, selectedMethod);
      setSafepayStep('settled');
      setIsProcessing(false);

      setSuccessMessage(
        currency === 'PKR'
          ? `₨ ${amountPKR.toLocaleString()} Safepay Gateway k zariye apke Fixora Wallet me jama ho gaye hain!`
          : `$${baseUsd.toFixed(2)} credited via Safepay Gateway to your Fixora balance!`
      );

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setSafepayStep('idle');
      }, 4000);
    } catch (err) {
      console.error('Safepay error:', err);
      setIsProcessing(false);
      setSafepayStep('idle');
    }
  };

  const handleRedeemVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) return;

    const res = redeemVoucher(voucherCodeInput);
    setVoucherStatus(res);

    if (res.success) {
      setVoucherCodeInput('');
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {
        // ignore
      }
    }
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    setVoucherCodeInput(code);
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  return (
    <div
      id="wallet-recharge-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Balance Card - Refined Human FinTech Styling */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
                <Wallet className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {language === 'ur' ? 'فکسورا اکاؤنٹ والٹ اور بیلنس' : 'Fixora Account Balance & Wallet'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Safepay Certified</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'ur'
                    ? 'سروس بک کرنے سے پہلے والٹ ری چارج کریں (1.5% شفاف کمیشن ماڈل)'
                    : 'Real-time PKR & USD balance for instant 1-click service booking'}
                </p>
              </div>
            </div>

            <button
              id="close-wallet-modal-btn"
              onClick={() => setWalletModalOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Live Balance Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <div className="sm:col-span-1">
              <span className="text-[11px] text-slate-400 block font-medium">Available Balance / کل بیلنس</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {formatPrice(currentUser.walletBalance)}
              </div>
              <span className="text-[10px] text-slate-400">
                {currency === 'PKR' ? `≈ $${currentUser.walletBalance.toFixed(2)} USD` : `≈ ₨ ${Math.round(currentUser.walletBalance * USD_TO_PKR_RATE).toLocaleString()} PKR`}
              </span>
            </div>

            <div className="sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-700 sm:pl-3 pt-2 sm:pt-0">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Locked in Escrow</span>
              </span>
              <div className="text-sm sm:text-base font-bold font-mono text-amber-300 mt-0.5">
                {currency === 'PKR' ? '₨ 0' : '$0.00'}
              </div>
              <span className="text-[10px] text-slate-400">100% Safe till OTP verification</span>
            </div>

            <div className="sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-700 sm:pl-3 pt-2 sm:pt-0 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Percent className="w-3 h-3 text-indigo-400" />
                <span>Platform Commission</span>
              </span>
              <div className="mt-0.5">
                <span className="font-bold text-white text-xs block">
                  1.5% Customer + 1.5% Provider
                </span>
                <span className="text-[10px] text-emerald-400">Fixora Fair Take-Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('safepay_recharge')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'safepay_recharge'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{language === 'ur' ? 'سیف پے ری چارج (Safepay Gateway)' : 'Safepay Top-Up'}</span>
          </button>

          <button
            onClick={() => setActiveTab('voucher')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'voucher'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{language === 'ur' ? 'اسکریچ کارڈ واؤچر' : 'Vouchers & Scratch Cards'}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{language === 'ur' ? 'لیجر ہسٹری' : 'Ledger History'}</span>
          </button>

          <button
            onClick={() => setActiveTab('escrow')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'escrow'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'ur' ? '1.5% کمیشن و اسکرو قواعد' : '1.5% Commission Rules'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
              {lastTxnRef && (
                <span className="font-mono text-[10px] bg-emerald-200/50 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                  {lastTxnRef}
                </span>
              )}
            </div>
          )}

          {/* TAB 1: SAFEPAY ONLINE RECHARGE */}
          {activeTab === 'safepay_recharge' && (
            <div className="space-y-5 text-xs">
              {/* Safepay Gateway Info Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                    SP
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                      Safepay Pakistan Payment Gateway Ready
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      EasyPaisa • JazzCash • 1Link Raast QR • Visa • MasterCard • UnionPay
                    </span>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                  {SafepayService.getEnvironment().toUpperCase()} MODE
                </span>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    {language === 'ur' ? 'موبائل نمبر (EasyPaisa / JazzCash)' : 'Account Mobile Number'}
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    {language === 'ur' ? 'ای میل (رسید کے لیے)' : 'Email for Receipt'}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              {/* Quick Select Amounts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">
                    {language === 'ur' ? 'ری چارج رقم منتخب کریں' : `Select Top-Up Amount (${currency})`}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ≈ {currency === 'PKR' ? `$${equivalentOtherAmount} USD` : `₨ ${(Number(equivalentOtherAmount) || 0).toLocaleString()} PKR`}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {activeQuickAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectQuick(amt)}
                      className={`py-2.5 px-2 rounded-2xl font-bold font-mono text-center border transition cursor-pointer ${
                        !customAmountInput && rechargeAmount === amt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span>{currency === 'PKR' ? `₨ ${amt.toLocaleString()}` : `$${amt}`}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="mt-2.5">
                  <input
                    type="number"
                    value={customAmountInput}
                    onChange={e => setCustomAmountInput(e.target.value)}
                    placeholder={language === 'ur' ? 'یا اپنی مرضی کی رقم درج کریں (مثلاً 1500)...' : 'Or enter custom amount in PKR / USD...'}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              {/* Select Payment Channel */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">
                  {language === 'ur' ? 'ادائیگی کا چینل منتخب کریں' : 'Payment Channel (Safepay Rail)'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'easypaisa', label: 'EasyPaisa Wallet', icon: Smartphone, color: 'text-emerald-500' },
                    { id: 'jazzcash', label: 'JazzCash Wallet', icon: Smartphone, color: 'text-rose-500' },
                    { id: 'sadapay', label: 'SadaPay / NayaPay', icon: CreditCard, color: 'text-amber-500' },
                    { id: 'card', label: 'Debit / Credit Card', icon: CreditCard, color: 'text-indigo-500' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition cursor-pointer ${
                        selectedMethod === m.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <m.icon className={`w-5 h-5 ${m.color}`} />
                      <span className="text-[11px] leading-tight">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary and Pay Button */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Recharge Total</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {currency === 'PKR' ? `₨ ${currentEffectiveAmount.toLocaleString()}` : `$${currentEffectiveAmount.toFixed(2)}`}
                  </span>
                </div>

                <button
                  id="execute-safepay-recharge-btn"
                  onClick={handleExecuteSafepayRecharge}
                  disabled={isProcessing || currentEffectiveAmount <= 0}
                  className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>
                        {safepayStep === 'tokenizing'
                          ? 'Connecting Safepay...'
                          : 'Authenticating Payment...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>{language === 'ur' ? 'سیف پے سے فوری ری چارج کریں' : 'Recharge via Safepay'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VOUCHER / SCRATCH CARD */}
          {activeTab === 'voucher' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                  <Gift className="w-5 h-5" />
                  <span>{language === 'ur' ? 'انعامی واؤچر یا پرومو کوڈ کلیم کریں' : 'Redeem Free Balance Voucher'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  {language === 'ur'
                    ? 'فکسورا کے انعامی واؤچر یا پرومو کارڈ کوڈ درج کریں اور فوری والٹ بیلنس پائیں۔'
                    : 'Enter any promotional voucher scratch-code below to claim instant Fixora balance.'}
                </p>
              </div>

              {/* Voucher Form */}
              <form onSubmit={handleRedeemVoucherSubmit} className="space-y-3">
                <label className="block text-slate-700 dark:text-slate-300 font-bold">
                  {language === 'ur' ? 'واؤچر کوڈ درج کریں' : 'Enter Voucher Code'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={voucherCodeInput}
                      onChange={e => setVoucherCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. FIXORA1000, EASY500, HUNAINVIP"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Redeem</span>
                  </button>
                </div>

                {voucherStatus && (
                  <div
                    className={`p-3 rounded-2xl border flex items-center gap-2 ${
                      voucherStatus.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {voucherStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                    <span>{voucherStatus.message}</span>
                  </div>
                )}
              </form>

              {/* Sample Quick Voucher Codes */}
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-bold block mb-2">
                  {language === 'ur' ? 'دستیاب انعامی واؤچرز (1-کلک لاگو کریں)' : 'Active Promo Vouchers (1-Click Apply)'}
                </span>

                <div className="space-y-2">
                  {availableVouchers.map(v => (
                    <div
                      key={v.code}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                            {v.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                            {currency === 'PKR' ? `+₨ ${(v.amountPkr || 0).toLocaleString()}` : `+$${v.amountUsd || 0}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{v.label}</p>
                      </div>

                      <button
                        onClick={() => handleCopyVoucher(v.code)}
                        className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedVoucher === v.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedVoucher === v.code ? 'Applied' : 'Apply'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEDGER HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Recent Transactions & Receipts</h3>
                <span className="text-slate-400 text-[11px]">{walletTransactions.length} records</span>
              </div>

              {walletTransactions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Coins className="w-8 h-8 mx-auto text-slate-500" />
                  <p>No transactions yet. Recharge your balance via Safepay to get started.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {walletTransactions.map(tx => {
                    const isCredit = tx.type === 'topup' || tx.type === 'voucher_redeem' || tx.type === 'booking_payout' || tx.type === 'refund';
                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isCredit
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {language === 'ur' ? tx.descriptionUrdu : tx.description}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>{tx.timestamp}</span>
                              <span>•</span>
                              <span className="font-mono">{tx.referenceNumber}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono">
                          <span className={`font-bold text-sm block ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                            {isCredit ? '+' : '-'}{formatPrice(tx.amountUSD)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">{tx.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 1.5% DUAL COMMISSION & ESCROW EXPLANATION */}
          {activeTab === 'escrow' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>1.5% Dual Marketplace Commission System (Fixora Model)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'ur'
                    ? 'جب صارف کاریگر کو بلاتا ہے تو 1.5% صارف کی طرف سے پلیٹ فارم فیس چارج ہوتی ہے اور 1.5% سروس فراہم کرنے والے (کاریگر) کی طرف سے کٹتی ہے۔ فکسورا پلیٹ فارم کو کل 3.0% وصول ہوتا ہے جبکہ باقی 98.5% رقم کاریگر کو کام کی تکمیل پر منتقل ہوتی ہے۔'
                    : 'Fixora charges an ultra-fair 1.5% platform fee from the customer and deducts a 1.5% commission from the provider upon job completion. Total platform revenue is 3.0%, with 98.5% paid directly to the verified technician.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>100% Escrow Protection</span>
                  </span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Customer funds are locked safely in escrow. They are only released once the technician completes the work and customer shares the 4-digit OTP.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Percent className="w-4 h-4 text-indigo-500" />
                    <span>Mandatory Account Balance</span>
                  </span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    To prevent unpaid dispatch and secure technician fuel costs, customer account balance must cover the booking total before booking.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
