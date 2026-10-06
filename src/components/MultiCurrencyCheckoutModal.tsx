import React, { useState, useEffect } from 'react';
import { Currency, PaymentMethod } from '../types';
import { USD_TO_PKR_RATE, formatPrice } from '../utils/currency';
import {
  calculateFeeBreakdown,
  processMockDualCurrencyPayment,
  FeeBreakdown,
  PaymentProcessResult
} from '../services/mockPaymentService';
import { CurrencyPaymentSwitch } from './CurrencyPaymentSwitch';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  QrCode,
  Wallet,
  Banknote,
  Globe,
  AlertCircle,
  Copy,
  Check,
  Receipt,
  FileCheck2,
  Info,
  ShieldAlert,
  HelpCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultiCurrencyCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txnData: {
    paymentMethod: PaymentMethod;
    currency: Currency;
    transactionRef: string;
    paidAmountUSD: number;
    accountNumber?: string;
    accountTitle?: string;
    cardLast4?: string;
  }) => void;
  amountUSD: number;
  initialCurrency: Currency;
  initialPaymentMethod: PaymentMethod;
  serviceTitle: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  walletBalanceUSD?: number;
  isEmergency?: boolean;
  promoDiscountUSD?: number;
}

type CheckoutPhase = 'input' | 'processing' | 'success';

export const MultiCurrencyCheckoutModal: React.FC<MultiCurrencyCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amountUSD,
  initialCurrency,
  initialPaymentMethod,
  serviceTitle,
  providerName,
  customerName,
  customerPhone,
  walletBalanceUSD = 0,
  isEmergency = false,
  promoDiscountUSD = 0
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency || 'PKR');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod || 'easypaisa');
  const [phase, setPhase] = useState<CheckoutPhase>('input');
  const [processingStep, setProcessingStep] = useState<string>('Initializing Secure Session...');
  const [paymentResult, setPaymentResult] = useState<PaymentProcessResult | null>(null);

  // Form Fields
  const [accountNumber, setAccountNumber] = useState(customerPhone || '03001234567');
  const [accountTitle, setAccountTitle] = useState(customerName || 'Fixora Customer');
  const [cardHolder, setCardHolder] = useState(customerName || 'Fixora Customer');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('889');
  const [transactionRef, setTransactionRef] = useState('');
  const [copiedRaast, setCopiedRaast] = useState(false);
  const [showFeeDetails, setShowFeeDetails] = useState(true);

  // Calculate live dynamic fee breakdown for the current selection
  const fees: FeeBreakdown = calculateFeeBreakdown(
    amountUSD,
    isEmergency,
    promoDiscountUSD,
    selectedCurrency
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedCurrency(initialCurrency || 'PKR');
      setSelectedPaymentMethod(initialPaymentMethod || (initialCurrency === 'PKR' ? 'easypaisa' : 'card'));
      setPhase('input');
      setPaymentResult(null);
      setTransactionRef(`TXN-FX-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen, initialCurrency, initialPaymentMethod]);

  if (!isOpen) return null;

  const handleCopyRaast = () => {
    navigator.clipboard.writeText('03009210000');
    setCopiedRaast(true);
    setTimeout(() => setCopiedRaast(false), 2000);
  };

  const handleProcessCheckout = async () => {
    if (selectedPaymentMethod === 'cash') {
      onSuccess({
        paymentMethod: 'cash',
        currency: selectedCurrency,
        transactionRef: `COD-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAmountUSD: amountUSD,
        accountTitle,
        accountNumber
      });
      return;
    }

    setPhase('processing');

    try {
      const result = await processMockDualCurrencyPayment(
        {
          serviceTitle,
          providerName,
          providerHourlyRateUSD: amountUSD,
          isEmergency,
          promoDiscountUSD,
          selectedCurrency,
          paymentMethod: selectedPaymentMethod,
          customerName,
          customerPhone,
          accountNumber,
          accountTitle,
          cardDetails: {
            holder: cardHolder,
            number: cardNumber,
            exp: cardExp,
            cvc: cardCvc
          }
        },
        (step) => setProcessingStep(step)
      );

      setPaymentResult(result);
      setPhase('success');

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        onSuccess({
          paymentMethod: selectedPaymentMethod,
          currency: selectedCurrency,
          transactionRef: result.transactionId,
          paidAmountUSD: result.equivalentUSD,
          accountNumber,
          accountTitle,
          cardLast4: selectedPaymentMethod === 'card' ? cardNumber.slice(-4) : undefined
        });
      }, 1500);
    } catch (err) {
      console.error(err);
      setPhase('input');
    }
  };

  return (
    <div id="multi-currency-checkout-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Fixora Secure Checkout
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  DUAL-CURRENCY ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent Fee Breakdown & Dual-Currency Processing (USD ⇄ PKR)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={phase === 'processing'}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {phase === 'processing' && (
            <div className="py-12 px-4 text-center space-y-5 animate-in fade-in">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Processing {selectedCurrency} Payment
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold animate-pulse">
                  {processingStep}
                </p>
                <p className="text-[11px] text-slate-500">
                  Total Payable: <span className="font-bold text-slate-900 dark:text-white font-mono">{fees.formattedBreakdown.totalPayable}</span>
                </p>
              </div>

              <div className="max-w-xs mx-auto p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                🔒 Protected by Fixora Escrow Guarantee. Direct settlement with technician ledger upon inspection.
              </div>
            </div>
          )}

          {phase === 'success' && paymentResult && (
            <div className="py-6 px-4 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Payment Captured & Verified!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Auth Ref: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{paymentResult.transactionId}</span>
                </p>
              </div>

              {/* Verified Receipt Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold">Total Charged:</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {paymentResult.fees.formattedBreakdown.totalPayable}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Service & Labor Base:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{paymentResult.fees.formattedBreakdown.serviceBaseFare}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Platform & Insurance Fee:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {selectedCurrency === 'PKR' 
                      ? `₨ ${((paymentResult?.fees?.platformServiceFee || 0) + (paymentResult?.fees?.safetyAndInsuranceFee || 0)).toLocaleString()}` 
                      : `$${((paymentResult?.fees?.platformServiceFee || 0) + (paymentResult?.fees?.safetyAndInsuranceFee || 0)).toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Gov GST / Sales Tax:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{paymentResult.fees.formattedBreakdown.govTaxAmount}</span>
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-500">Channel / Account:</span>
                  <span className="font-bold uppercase text-slate-900 dark:text-white">
                    {paymentResult.paymentMethod} {paymentResult.maskedAccount ? `(${paymentResult.maskedAccount})` : ''}
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="max-w-sm mx-auto space-y-1.5 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Processing Audit Trail
                </span>
                {paymentResult.processingTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {item.step}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'input' && (
            <>
              {/* Order Summary Strip */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Service Order
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                    {serviceTitle}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Technician: <strong className="text-slate-700 dark:text-slate-200">{providerName}</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
                  <span className="text-base font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                    {fees.formattedBreakdown.totalPayable}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {fees.formattedBreakdown.dualTotalDisplay}
                  </span>
                </div>
              </div>

              {/* Currency & Payment Selector Component */}
              <CurrencyPaymentSwitch
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentMethodChange={setSelectedPaymentMethod}
                amountUSD={fees.totalPayable / (selectedCurrency === 'PKR' ? USD_TO_PKR_RATE : 1)}
                walletBalanceUSD={walletBalanceUSD}
              />

              {/* Transparent Dual-Currency Fee & Commission Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Transparent Cost Breakdown ({selectedCurrency})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFeeDetails(!showFeeDetails)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {showFeeDetails ? 'Compact' : 'Detailed'}
                  </button>
                </div>

                {showFeeDetails && (
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                    {/* 1. Base Service / Labor Fee */}
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        Technician Labor & Service Base:
                        <span className="text-[10px] text-slate-400">(Direct to Pro)</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {fees.formattedBreakdown.serviceBaseFare}
                      </span>
                    </div>

                    {/* 2. Platform Service Fee */}
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        Fixora Platform & Booking Fee:
                        <span className="text-[10px] text-indigo-500 font-semibold">(5% SLA)</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {fees.formattedBreakdown.platformServiceFee}
                      </span>
                    </div>

                    {/* 3. Emergency Surge (if applicable) */}
                    {isEmergency && (
                      <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                        <span className="flex items-center gap-1 font-semibold">
                          15-Min Priority Emergency Dispatch:
                        </span>
                        <span className="font-mono font-bold">
                          +{fees.formattedBreakdown.emergencySurgeFee}
                        </span>
                      </div>
                    )}

                    {/* 4. Safety & Insurance Guarantee */}
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        Fixora Workmanship Insurance:
                        <span className="text-[10px] text-emerald-500 font-semibold">(₨ 50,000 Cover)</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {fees.formattedBreakdown.safetyAndInsuranceFee}
                      </span>
                    </div>

                    {/* 5. Government Taxes */}
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        Gov GST / Sales Tax (10%):
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {fees.formattedBreakdown.govTaxAmount}
                      </span>
                    </div>

                    {/* Promo Discount if any */}
                    {promoDiscountUSD > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                        <span className="font-semibold">Promo Discount Applied:</span>
                        <span className="font-mono font-bold">-{fees.formattedBreakdown.promoDiscountAmount}</span>
                      </div>
                    )}

                    {/* Final Net Total */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-sm">
                      <span>Total Amount to Pay:</span>
                      <div className="text-right">
                        <span className="text-base font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                          {fees.formattedBreakdown.totalPayable}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Interactive Channel Inputs */}
              {(selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'jazzcash') && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      {selectedPaymentMethod === 'easypaisa' ? 'Easypaisa Direct Debit' : 'JazzCash Wallet Debit'}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-md">
                      Auto-Push MPIN
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Wallet Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={accountTitle}
                        onChange={e => setAccountTitle(e.target.value)}
                        placeholder="Account name"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>A push notification authorization prompt will appear instantly on your mobile.</span>
                  </div>
                </div>
              )}

              {(selectedPaymentMethod === 'sadapay' || selectedPaymentMethod === 'bank_transfer') && (
                <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-900 dark:text-teal-200">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      Raast / 1Link Direct Instant Deposit
                    </span>
                    <span className="text-[10px] font-mono bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded-md">
                      0% Bank Charges
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-900 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Fixora Raast ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">03009210000</span>
                        <button
                          type="button"
                          onClick={handleCopyRaast}
                          className="p-1 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 cursor-pointer"
                        >
                          {copiedRaast ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">IBAN / Bank:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-[11px]">PK88MEZN0099881122334455</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sender Name / Transaction Reference
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={e => setTransactionRef(e.target.value)}
                      placeholder="e.g. RAAST-882109"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {(selectedPaymentMethod === 'card' || selectedPaymentMethod === 'stripe') && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      {selectedCurrency === 'USD' ? 'Global Card (Stripe)' : 'Visa / Mastercard (PKR 3D-Secure)'}
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-md">
                      3D SECURE
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={e => setCardHolder(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Exp
                          </label>
                          <input
                            type="text"
                            value={cardExp}
                            onChange={e => setCardExp(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-xs font-mono text-center text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            CVC
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={e => setCardCvc(e.target.value)}
                            placeholder="•••"
                            className="w-full px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-xs font-mono text-center text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'wallet' && (
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-200">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-purple-600" />
                      Fixora Instant Wallet
                    </span>
                    <span className="text-emerald-600 font-bold font-mono">
                      Available: {formatPrice(walletBalanceUSD, selectedCurrency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-800 dark:text-purple-300">
                    Zero latency 1-tap checkout. Amount will be deducted instantly from your prepaid balance.
                  </p>
                </div>
              )}

              {selectedPaymentMethod === 'cash' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1 text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span>Cash on Service Completion</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    No immediate online charge. Pay the technician {fees.formattedBreakdown.totalPayable} directly after complete inspection and job satisfaction.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {phase === 'input' && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Charge ({selectedCurrency})
              </span>
              <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                {fees.formattedBreakdown.totalPayable}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                id="submit-multi-currency-checkout-btn"
                onClick={handleProcessCheckout}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {selectedPaymentMethod === 'cash'
                    ? 'Confirm Cash Booking'
                    : `Pay ${fees.formattedBreakdown.totalPayable} (${selectedCurrency})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
