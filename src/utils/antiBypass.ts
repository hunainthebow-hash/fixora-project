import { USD_TO_PKR_RATE } from './currency';

export const CHAT_UNLOCK_FEE_PKR = 25;
export const CHAT_UNLOCK_FEE_USD = +(25 / USD_TO_PKR_RATE).toFixed(2); // ~$0.09

export const EMERGENCY_PRIORITY_FEE_PKR = 99;
export const EMERGENCY_PRIORITY_FEE_USD = +(99 / USD_TO_PKR_RATE).toFixed(2); // ~$0.35

export const CUSTOMER_COMMISSION_PERCENT = 1.5; // 1.5% service fee charged to customer
export const PROVIDER_COMMISSION_PERCENT = 1.5; // 1.5% platform commission deducted from provider payout
export const TOTAL_PLATFORM_COMMISSION_PERCENT = 3.0; // 3.0% total platform revenue (1.5% + 1.5%)

export interface DualCommissionResult {
  customerCommissionRate: number; // 1.5%
  customerFeeUSD: number;
  customerFeePKR: number;
  providerCommissionRate: number; // 1.5%
  providerDeductionUSD: number;
  providerDeductionPKR: number;
  totalPlatformCommissionUSD: number;
  totalPlatformCommissionPKR: number;
  totalCustomerPayableUSD: number;
  totalCustomerPayablePKR: number;
  providerPayoutUSD: number;
  providerPayoutPKR: number;
  summaryLabel: string;
}

/**
 * Calculates Fixora's 1.5% Dual Commission Marketplace Model:
 * - 1.5% charged to Customer on top of base service amount
 * - 1.5% deducted from Provider upon job completion
 * - Total 3.0% goes to Fixora Platform Treasury
 */
export const calculateDualCommission = (baseServiceAmountUSD: number): DualCommissionResult => {
  const baseServicePKR = Math.round(baseServiceAmountUSD * USD_TO_PKR_RATE);

  const customerFeePKR = Math.max(1, Math.round(baseServicePKR * (CUSTOMER_COMMISSION_PERCENT / 100)));
  const customerFeeUSD = +(baseServiceAmountUSD * (CUSTOMER_COMMISSION_PERCENT / 100)).toFixed(2);

  const providerDeductionPKR = Math.max(1, Math.round(baseServicePKR * (PROVIDER_COMMISSION_PERCENT / 100)));
  const providerDeductionUSD = +(baseServiceAmountUSD * (PROVIDER_COMMISSION_PERCENT / 100)).toFixed(2);

  const totalPlatformCommissionPKR = customerFeePKR + providerDeductionPKR;
  const totalPlatformCommissionUSD = +(customerFeeUSD + providerDeductionUSD).toFixed(2);

  const totalCustomerPayableUSD = +(baseServiceAmountUSD + customerFeeUSD).toFixed(2);
  const totalCustomerPayablePKR = baseServicePKR + customerFeePKR;

  const providerPayoutUSD = +(baseServiceAmountUSD - providerDeductionUSD).toFixed(2);
  const providerPayoutPKR = baseServicePKR - providerDeductionPKR;

  return {
    customerCommissionRate: CUSTOMER_COMMISSION_PERCENT,
    customerFeeUSD,
    customerFeePKR,
    providerCommissionRate: PROVIDER_COMMISSION_PERCENT,
    providerDeductionUSD,
    providerDeductionPKR,
    totalPlatformCommissionUSD,
    totalPlatformCommissionPKR,
    totalCustomerPayableUSD,
    totalCustomerPayablePKR,
    providerPayoutUSD,
    providerPayoutPKR,
    summaryLabel: `1.5% Dual Split (Fixora Earns 3.0% Total)`
  };
};

export interface CommissionTierResult {
  commissionRate: number; // 1.5
  commissionPKR: number;
  commissionUSD: number;
  providerPayoutPKR: number;
  providerPayoutUSD: number;
  tierLabel: string;
}

/**
 * Calculates Fixora provider platform commission (1.5%)
 */
export const calculateTieredCommission = (jobAmountPKR: number): CommissionTierResult => {
  const commissionRate = PROVIDER_COMMISSION_PERCENT; // 1.5%
  const tierLabel = 'Standard Fair Tier (1.5% Provider Split)';

  const commissionPKR = Math.max(1, Math.round(jobAmountPKR * (commissionRate / 100)));
  const providerPayoutPKR = jobAmountPKR - commissionPKR;

  const commissionUSD = +(commissionPKR / USD_TO_PKR_RATE).toFixed(2);
  const providerPayoutUSD = +(providerPayoutPKR / USD_TO_PKR_RATE).toFixed(2);

  return {
    commissionRate,
    commissionPKR,
    commissionUSD,
    providerPayoutPKR,
    providerPayoutUSD,
    tierLabel
  };
};

/**
 * Anti-Bypass and Contact Sharing Detection System
 * Detects phone numbers, WhatsApp, emails, social handles, spaced numbers & Urdu digits.
 */
export interface ContactDetectionResult {
  containsContact: boolean;
  matchedTypes: ('phone' | 'whatsapp' | 'email' | 'social')[];
  maskedText: string;
  detectedSnippet?: string;
  warningMessage: string;
}

export const detectAndMaskContactInfo = (text: string): ContactDetectionResult => {
  const matchedTypes: ('phone' | 'whatsapp' | 'email' | 'social')[] = [];
  let masked = text;
  let detectedSnippet = '';

  // 1. Phone number patterns:
  // - 03XX-XXXXXXX or 03XXXXXXXXX
  // - +92 3XX XXXXXXX or 0092 3...
  // - Spaced out digits: 0 3 0 0 1 2 3 4 5 6 7
  // - Urdu digits: ۰۳۰۰۱۲۳۴۵۶۷
  const urduDigitsToEnglish: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  
  let normalizedForCheck = text;
  for (const [urdu, eng] of Object.entries(urduDigitsToEnglish)) {
    normalizedForCheck = normalizedForCheck.replaceAll(urdu, eng);
  }

  // Regex patterns
  const phonePattern1 = /(?:\+?92|0092|0)[-.\s]?(?:3\d{2})[-.\s]?\d{7}/gi;
  const phonePattern2 = /\b(?:\d[-.\s]*){10,12}\b/g;
  const whatsappPattern = /(?:wa\.me\/\S+|whatsapp|whats\s*app|watsapp|wats\s*app|wapp)/gi;
  const emailPattern = /(?:[a-zA-Z0-9._%+-]+\s*(?:@|at)\s*[a-zA-Z0-9.-]+\s*(?:\.|\bdot\b)\s*[a-zA-Z]{2,})/gi;
  const socialPattern = /(?:instagram\.com\/\S+|facebook\.com\/\S+|fb\.com\/\S+|tiktok\.com\/\S+|insta(?:gram)?\s*:\s*@?[\w.]+|fb\s*:\s*@?[\w.]+)/gi;

  let hasPhone = false;
  let hasWhatsApp = false;
  let hasEmail = false;
  let hasSocial = false;

  // Check WhatsApp
  if (whatsappPattern.test(text) || whatsappPattern.test(normalizedForCheck)) {
    hasWhatsApp = true;
    matchedTypes.push('whatsapp');
    masked = masked.replace(whatsappPattern, '[🔒 WhatsApp Link Blocked]');
  }

  // Check Email
  if (emailPattern.test(text) || emailPattern.test(normalizedForCheck)) {
    hasEmail = true;
    matchedTypes.push('email');
    masked = masked.replace(emailPattern, '[🔒 Direct Email Blocked]');
  }

  // Check Social
  if (socialPattern.test(text) || socialPattern.test(normalizedForCheck)) {
    hasSocial = true;
    matchedTypes.push('social');
    masked = masked.replace(socialPattern, '[🔒 Social Handle Blocked]');
  }

  // Check Phone
  if (phonePattern1.test(normalizedForCheck) || phonePattern2.test(normalizedForCheck)) {
    hasPhone = true;
    matchedTypes.push('phone');
    masked = masked.replace(phonePattern1, '[🔒 Phone Number Blocked]');
    masked = masked.replace(phonePattern2, '[🔒 Phone Number Blocked]');
  }

  const containsContact = hasPhone || hasWhatsApp || hasEmail || hasSocial;

  if (containsContact && !detectedSnippet) {
    detectedSnippet = matchedTypes.join(', ');
  }

  const warningMessage = containsContact
    ? '⚠️ Direct contact sharing (Phone, WhatsApp, Email, Social) is blocked to protect your service warranty, insurance & Fixora Escrow guarantee. Please unlock full in-app chat or book directly.'
    : '';

  return {
    containsContact,
    matchedTypes,
    maskedText: masked,
    detectedSnippet,
    warningMessage
  };
};
