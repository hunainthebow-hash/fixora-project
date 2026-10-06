import { Currency, PaymentMethod } from '../types';
import { USD_TO_PKR_RATE } from '../utils/currency';

export interface FeeBreakdown {
  serviceBaseFare: number;
  platformServiceFee: number;
  emergencySurgeFee: number;
  safetyAndInsuranceFee: number;
  govTaxAmount: number;
  promoDiscountAmount: number;
  subtotal: number;
  totalPayable: number;
  currency: Currency;
  exchangeRate: number;
  formattedBreakdown: {
    serviceBaseFare: string;
    platformServiceFee: string;
    emergencySurgeFee: string;
    safetyAndInsuranceFee: string;
    govTaxAmount: string;
    promoDiscountAmount: string;
    subtotal: string;
    totalPayable: string;
    dualTotalDisplay: string;
  };
}

export interface PaymentProcessRequest {
  serviceTitle: string;
  providerName: string;
  providerHourlyRateUSD: number;
  isEmergency: boolean;
  promoDiscountUSD: number;
  selectedCurrency: Currency;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  accountNumber?: string;
  accountTitle?: string;
  cardDetails?: {
    holder: string;
    number: string;
    exp: string;
    cvc: string;
  };
}

export interface PaymentProcessResult {
  success: boolean;
  transactionId: string;
  authCode: string;
  timestamp: string;
  currency: Currency;
  chargedAmount: number;
  equivalentUSD: number;
  paymentMethod: PaymentMethod;
  fees: FeeBreakdown;
  receiptUrl?: string;
  maskedAccount?: string;
  processingTimeline: {
    step: string;
    status: 'completed' | 'in_progress' | 'pending';
    time: string;
  }[];
}

/**
 * Calculates itemized marketplace fees with transparent platform commission & GST breakdown
 */
export const calculateFeeBreakdown = (
  baseFareUSD: number,
  isEmergency: boolean = false,
  promoDiscountUSD: number = 0,
  currency: Currency = 'PKR'
): FeeBreakdown => {
  // Fixora Platform Fee: Standard $2.50 USD (~₨ 700) or 5% of base
  const platformServiceFeeUSD = Math.max(2.5, +(baseFareUSD * 0.05).toFixed(2));
  
  // Emergency SLA Surge: $10 USD (~₨ 2,800) if 15-min priority dispatch is selected
  const emergencySurgeFeeUSD = isEmergency ? 10 : 0;
  
  // Platform Safety & Workmanship Guarantee Coverage (Fixora Insurance): $1.20 USD (~₨ 336)
  const safetyAndInsuranceFeeUSD = 1.20;

  // Subtotal before tax & discount
  const subtotalUSD = +(baseFareUSD + platformServiceFeeUSD + emergencySurgeFeeUSD + safetyAndInsuranceFeeUSD).toFixed(2);

  // Government GST / Sales Tax: 10% on billable platform & labor services
  const taxableAmount = Math.max(0, subtotalUSD - promoDiscountUSD);
  const govTaxAmountUSD = +(taxableAmount * 0.10).toFixed(2);

  // Net Total
  const totalPayableUSD = Math.max(0, +(taxableAmount + govTaxAmountUSD).toFixed(2));

  // Multipliers for conversion
  const rate = currency === 'PKR' ? USD_TO_PKR_RATE : 1;

  const toCurr = (amtUSD: number) => {
    if (currency === 'PKR') {
      return Math.round(amtUSD * USD_TO_PKR_RATE);
    }
    return amtUSD;
  };

  const fmtCurr = (amtUSD: number) => {
    if (currency === 'PKR') {
      return `₨ ${Math.round(amtUSD * USD_TO_PKR_RATE).toLocaleString()}`;
    }
    return `$${amtUSD.toFixed(2)}`;
  };

  const pkrTotal = Math.round(totalPayableUSD * USD_TO_PKR_RATE);
  const usdTotal = `$${totalPayableUSD.toFixed(2)}`;
  const dualTotalDisplay = currency === 'PKR'
    ? `₨ ${pkrTotal.toLocaleString()} (${usdTotal} USD)`
    : `${usdTotal} (₨ ${pkrTotal.toLocaleString()} PKR)`;

  return {
    serviceBaseFare: toCurr(baseFareUSD),
    platformServiceFee: toCurr(platformServiceFeeUSD),
    emergencySurgeFee: toCurr(emergencySurgeFeeUSD),
    safetyAndInsuranceFee: toCurr(safetyAndInsuranceFeeUSD),
    govTaxAmount: toCurr(govTaxAmountUSD),
    promoDiscountAmount: toCurr(promoDiscountUSD),
    subtotal: toCurr(subtotalUSD),
    totalPayable: toCurr(totalPayableUSD),
    currency,
    exchangeRate: USD_TO_PKR_RATE,
    formattedBreakdown: {
      serviceBaseFare: fmtCurr(baseFareUSD),
      platformServiceFee: fmtCurr(platformServiceFeeUSD),
      emergencySurgeFee: fmtCurr(emergencySurgeFeeUSD),
      safetyAndInsuranceFee: fmtCurr(safetyAndInsuranceFeeUSD),
      govTaxAmount: fmtCurr(govTaxAmountUSD),
      promoDiscountAmount: fmtCurr(promoDiscountUSD),
      subtotal: fmtCurr(subtotalUSD),
      totalPayable: fmtCurr(totalPayableUSD),
      dualTotalDisplay
    }
  };
};

/**
 * Mock Dual-Currency Payment Processing Engine
 * Simulates async multi-tier bank authorization, 1Link clearing, Raast routing, and Stripe 3D-Secure
 */
export const processMockDualCurrencyPayment = async (
  request: PaymentProcessRequest,
  onStepProgress?: (stepDescription: string) => void
): Promise<PaymentProcessResult> => {
  const fees = calculateFeeBreakdown(
    request.providerHourlyRateUSD,
    request.isEmergency,
    request.promoDiscountUSD,
    request.selectedCurrency
  );

  const stepsPKR = [
    'Initializing 256-bit SSL Session with Fixora Core...',
    `Connecting to State Bank of Pakistan Raast / 1Link Switch (${request.paymentMethod.toUpperCase()})...`,
    `Verifying Account: ${request.accountNumber || '03xx-xxxxxxx'} (${request.accountTitle || request.customerName})...`,
    `Locking Exchange Rate: 1 USD = ${USD_TO_PKR_RATE} PKR...`,
    `Authorizing Real-Time Settlement of ${fees.formattedBreakdown.totalPayable}...`,
    'Generating Cryptographic Dual-Currency Tax Invoice...'
  ];

  const stepsUSD = [
    'Establishing Secure Stripe Tokenized Gateway Session...',
    'Authenticating 3D-Secure Protocol (Visa / Mastercard / Amex)...',
    'Validating Merchant Escrow & Service Guarantee Bond...',
    `Capturing Pre-Authorization of ${fees.formattedBreakdown.totalPayable}...`,
    'Finalizing Global Multi-Currency Settlement...'
  ];

  const steps = request.selectedCurrency === 'PKR' ? stepsPKR : stepsUSD;

  // Step through simulated bank network latencies
  for (let i = 0; i < steps.length; i++) {
    if (onStepProgress) {
      onStepProgress(steps[i]);
    }
    await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 200));
  }

  const txnRand = Math.floor(100000 + Math.random() * 900000);
  const prefix = request.selectedCurrency === 'PKR' ? 'PK-FX' : 'US-STRIPE';
  const transactionId = `${prefix}-${Date.now().toString().slice(-6)}-${txnRand}`;
  const authCode = `AUTH-${Math.floor(10000 + Math.random() * 90000)}`;

  let maskedAccount: string | undefined;
  if (request.paymentMethod === 'card') {
    maskedAccount = `•••• ${request.cardDetails?.number.slice(-4) || '4242'}`;
  } else if (request.accountNumber) {
    maskedAccount = request.accountNumber.length > 7 
      ? `${request.accountNumber.slice(0, 4)}••••${request.accountNumber.slice(-3)}`
      : request.accountNumber;
  }

  return {
    success: true,
    transactionId,
    authCode,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    currency: request.selectedCurrency,
    chargedAmount: fees.totalPayable,
    equivalentUSD: request.selectedCurrency === 'PKR' 
      ? +(fees.totalPayable / USD_TO_PKR_RATE).toFixed(2)
      : fees.totalPayable,
    paymentMethod: request.paymentMethod,
    fees,
    maskedAccount,
    processingTimeline: [
      { step: 'Customer Cart & Pricing Lock', status: 'completed', time: '0.1s' },
      { step: `${request.selectedCurrency} Network Routing & Fraud Detection`, status: 'completed', time: '0.4s' },
      { step: '3D-Secure / OTP Authentication', status: 'completed', time: '0.7s' },
      { step: 'Escrow Settlement to Technician Ledger', status: 'completed', time: '1.1s' }
    ]
  };
};
