import { CurrencyCode } from '../types/crm';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  AED: 'AED '
};

export const EXCHANGE_RATES_TO_NGN: Record<CurrencyCode, number> = {
  NGN: 1,
  USD: 1520,
  GBP: 1980,
  EUR: 1680,
  GHS: 98,
  KES: 11.8,
  ZAR: 86,
  AED: 414
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'NGN'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₦';
  
  // Format with commas and no unnecessary decimals
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: currency === 'USD' || currency === 'GBP' || currency === 'EUR' ? 2 : 0,
    minimumFractionDigits: currency === 'USD' || currency === 'GBP' || currency === 'EUR' ? 2 : 0
  }).format(amount);

  return `${symbol}${formattedNumber}`;
}

export function convertAmount(amountInNgn: number, targetCurrency: CurrencyCode): number {
  if (targetCurrency === 'NGN') return amountInNgn;
  const rate = EXCHANGE_RATES_TO_NGN[targetCurrency] || 1;
  return amountInNgn / rate;
}

export function createWhatsAppLink(phoneNumber: string, message: string): string {
  // Strip non-numeric chars except leading +
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
