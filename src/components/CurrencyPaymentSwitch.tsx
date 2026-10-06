import React from 'react';
import { Currency, PaymentMethod } from '../types';
import { USD_TO_PKR_RATE, formatPrice } from '../utils/currency';
import {
  CreditCard,
  Wallet,
  QrCode,
  Banknote,
  Smartphone,
  Building2,
  Globe,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface CurrencyPaymentSwitchProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  selectedPaymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  amountUSD: number;
  walletBalanceUSD?: number;
  language?: 'en' | 'ur';
  className?: string;
}

export interface PaymentOptionConfig {
  id: PaymentMethod;
  name: string;
  nameUr: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  description: string;
}

export const CurrencyPaymentSwitch: React.FC<CurrencyPaymentSwitchProps> = ({
  selectedCurrency,
  onCurrencyChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  amountUSD,
  walletBalanceUSD = 0,
  language = 'en',
  className = ''
}) => {
  const pkrPaymentOptions: PaymentOptionConfig[] = [
    {
      id: 'easypaisa',
      name: 'Easypaisa',
      nameUr: 'ایزی پیسہ',
      sub: 'Mobile Wallet / 03xx',
      icon: Smartphone,
      color: 'text-emerald-600 dark:text-emerald-400',
      badge: 'Popular',
      description: 'Instant mobile wallet debit with OTP push authorization'
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      nameUr: 'جاز کیش',
      sub: 'Jazz Wallet / QR',
      icon: Smartphone,
      color: 'text-rose-600 dark:text-rose-400',
      badge: 'Instant',
      description: 'Zero-delay digital checkout via JazzCash wallet'
    },
    {
      id: 'sadapay',
      name: 'SadaPay / NayaPay',
      nameUr: 'سادہ پے / نیا پے',
      sub: 'Raast ID & Instant IBAN',
      icon: QrCode,
      color: 'text-teal-600 dark:text-teal-400',
      badge: '0% Fee',
      description: 'Instant zero-fee transfer via National Raast Network'
    },
    {
      id: 'bank_transfer',
      name: '1Link Bank Transfer',
      nameUr: 'بینک ٹرانسفر',
      sub: 'Online Direct IBAN',
      icon: Building2,
      color: 'text-blue-600 dark:text-blue-400',
      badge: '1Link',
      description: 'Inter-bank fund transfer supported by all Pakistani banks'
    },
    {
      id: 'card',
      name: 'Debit / Credit Card',
      nameUr: 'ویزا / ماسٹر کارڈ',
      sub: 'Visa / Mastercard PKR',
      icon: CreditCard,
      color: 'text-indigo-600 dark:text-indigo-400',
      badge: 'Secure',
      description: '3D-Secure 256-bit encrypted card processing'
    },
    {
      id: 'wallet',
      name: 'Fixora Wallet',
      nameUr: 'فکسورا والٹ',
      sub: `Bal: ${formatPrice(walletBalanceUSD, 'PKR')}`,
      icon: Wallet,
      color: 'text-purple-600 dark:text-purple-400',
      badge: '1-Click',
      description: 'Instant deduction with zero wait time'
    },
    {
      id: 'cash',
      name: 'Cash on Arrival',
      nameUr: 'نقد ادائیگی (کام کے بعد)',
      sub: 'Pay after job inspection',
      icon: Banknote,
      color: 'text-amber-600 dark:text-amber-400',
      badge: 'Doorstep',
      description: 'Physical cash hand-off after work satisfaction'
    }
  ];

  const usdPaymentOptions: PaymentOptionConfig[] = [
    {
      id: 'card',
      name: 'Credit / Debit Card',
      nameUr: 'کریڈٹ کارڈ',
      sub: 'Visa, MC, Amex',
      icon: CreditCard,
      color: 'text-indigo-600 dark:text-indigo-400',
      badge: 'Instant',
      description: 'Global 3D-Secure card processing with Stripe & Apple Pay'
    },
    {
      id: 'stripe',
      name: 'Stripe & Digital Wallets',
      nameUr: 'ڈیجیٹل والٹس',
      sub: 'Apple Pay, Google Pay',
      icon: Globe,
      color: 'text-blue-600 dark:text-blue-400',
      badge: 'Protected',
      description: 'Direct contactless 1-tap checkout'
    },
    {
      id: 'wallet',
      name: 'Fixora Wallet',
      nameUr: 'فکسورا والٹ',
      sub: `Bal: ${formatPrice(walletBalanceUSD, 'USD')}`,
      icon: Wallet,
      color: 'text-purple-600 dark:text-purple-400',
      badge: '1-Click',
      description: 'Instant USD wallet payment'
    },
    {
      id: 'cash',
      name: 'Cash on Arrival',
      nameUr: 'نقد ادائیگی',
      sub: 'Pay technician directly',
      icon: Banknote,
      color: 'text-amber-600 dark:text-amber-400',
      badge: 'Doorstep',
      description: 'Cash payment upon service completion'
    }
  ];

  const currentOptions = selectedCurrency === 'PKR' ? pkrPaymentOptions : usdPaymentOptions;
  const pkrEquivalent = Math.round(amountUSD * USD_TO_PKR_RATE);

  return (
    <div className={`space-y-3.5 ${className}`} id="currency-payment-switch-container">
      {/* Top Bar: Currency Toggle & Real-time Live Exchange Rate Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pl-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            {language === 'ur' ? 'کرنسی منتخب کریں:' : 'Payment Currency:'}
          </span>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono font-bold border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>1 USD = {USD_TO_PKR_RATE} PKR</span>
          </div>
        </div>

        {/* Currency Tabs */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-700/60">
          <button
            type="button"
            id="select-pkr-currency-btn"
            onClick={() => {
              onCurrencyChange('PKR');
              if (!pkrPaymentOptions.some(opt => opt.id === selectedPaymentMethod)) {
                onPaymentMethodChange('easypaisa');
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCurrency === 'PKR'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <span>🇵🇰</span>
            <span>PKR (₨)</span>
          </button>
          <button
            type="button"
            id="select-usd-currency-btn"
            onClick={() => {
              onCurrencyChange('USD');
              if (!usdPaymentOptions.some(opt => opt.id === selectedPaymentMethod)) {
                onPaymentMethodChange('card');
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCurrency === 'USD'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <span>🇺🇸</span>
            <span>USD ($)</span>
          </button>
        </div>
      </div>

      {/* Dual Currency Converted Total Display */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {language === 'ur' ? 'کل قابل ادا رقم' : 'Multi-Currency Value'}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-mono font-extrabold text-slate-900 dark:text-white">
              {selectedCurrency === 'PKR' ? `₨ ${pkrEquivalent.toLocaleString()}` : `$${amountUSD.toFixed(2)}`}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
              {selectedCurrency === 'PKR' ? `($${amountUSD.toFixed(2)} USD)` : `(₨ ${pkrEquivalent.toLocaleString()} PKR)`}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Guaranteed Rate</span>
          </span>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {language === 'ur' ? 'ادائیگی کا ذریعہ منتخب کریں' : `Available ${selectedCurrency} Payment Channels`}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {currentOptions.map(option => {
            const Icon = option.icon;
            const isSelected = selectedPaymentMethod === option.id;

            return (
              <button
                key={option.id}
                type="button"
                id={`payment-method-${option.id}`}
                onClick={() => onPaymentMethodChange(option.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {option.badge && (
                  <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                    {option.badge}
                  </span>
                )}

                <div>
                  <Icon className={`w-4 h-4 mb-1.5 ${option.color}`} />
                  <div className="font-bold text-xs leading-tight line-clamp-1">
                    {language === 'ur' ? option.nameUr : option.name}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {option.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
