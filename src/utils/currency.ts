import type { CurrencyCode, ExchangeRates } from '../data/types';

export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates
): number | null {
  if (!Number.isFinite(amount)) return null;
  if (from === to) return amount;
  const key = `${from}:${to}` as keyof ExchangeRates;
  const rate = rates?.[key];
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    return null;
  }
  return amount * rate;
}

export function isRateMissing(from: CurrencyCode, to: CurrencyCode, rates: ExchangeRates): boolean {
  if (from === to) return false;
  const key = `${from}:${to}` as keyof ExchangeRates;
  const rate = rates?.[key];
  return !rate || !Number.isFinite(rate) || rate <= 0;
}
