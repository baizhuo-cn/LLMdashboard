import type { CurrencyCode, TokenUnit } from '../data/types';

const currencySymbol: Record<CurrencyCode, string> = {
  CNY: '￥',
  USD: '$',
};

const UNIT_LABEL: Record<TokenUnit, string> = {
  mtok: '每百万 Tokens',
  ktok: '每千 Tokens',
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${safeAmount.toFixed(2)}${currencySymbol[currency] ?? ''}`;
}

export function formatPriceByUnit(amount: number, currency: CurrencyCode, unit: TokenUnit): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const digits = unit === 'ktok' ? 5 : 2;
  return `${safeAmount.toFixed(digits)}${currencySymbol[currency] ?? ''}`;
}

export function formatUnitLabel(unit: TokenUnit): string {
  return UNIT_LABEL[unit] ?? UNIT_LABEL.mtok;
}
