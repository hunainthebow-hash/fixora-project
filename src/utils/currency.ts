import { Currency } from '../types';

export const USD_TO_PKR_RATE = 280;

/**
 * Formats a base USD amount into the target currency string
 * e.g. formatPrice(35, 'USD') -> "$35"
 * e.g. formatPrice(35, 'PKR') -> "₨ 9,800"
 */
export const formatPrice = (amountInUSD: number | undefined | null, currency: Currency = 'PKR', showDecimals: boolean = false): string => {
  const safeAmount = typeof amountInUSD === 'number' && !isNaN(amountInUSD) ? amountInUSD : 0;

  if (currency === 'PKR') {
    const pkrAmount = Math.round(safeAmount * USD_TO_PKR_RATE);
    return `₨ ${pkrAmount.toLocaleString()}`;
  }

  // USD
  if (showDecimals || safeAmount % 1 !== 0) {
    return `$${safeAmount.toFixed(2)}`;
  }
  return `$${safeAmount.toFixed(0)}`;
};

/**
 * Returns raw numeric value in the target currency
 */
export const getConvertedAmount = (amountInUSD: number | undefined | null, currency: Currency = 'PKR'): number => {
  const safeAmount = typeof amountInUSD === 'number' && !isNaN(amountInUSD) ? amountInUSD : 0;
  if (currency === 'PKR') {
    return Math.round(safeAmount * USD_TO_PKR_RATE);
  }
  return safeAmount;
};

/**
 * Returns dual currency display string e.g. "₨ 9,800 ($35)" or "$35 (₨ 9,800)"
 */
export const formatDualPrice = (amountInUSD: number | undefined | null, primaryCurrency: Currency = 'PKR'): string => {
  const safeAmount = typeof amountInUSD === 'number' && !isNaN(amountInUSD) ? amountInUSD : 0;
  const pkrFormatted = `₨ ${(Math.round(safeAmount * USD_TO_PKR_RATE)).toLocaleString()}`;
  const usdFormatted = `$${safeAmount.toFixed(safeAmount % 1 === 0 ? 0 : 2)}`;

  if (primaryCurrency === 'PKR') {
    return `${pkrFormatted} (${usdFormatted})`;
  }
  return `${usdFormatted} (${pkrFormatted})`;
};
