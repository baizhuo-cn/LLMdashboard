export const currencyRates = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.12,
} as const;

export type SupportedCurrency = keyof typeof currencyRates;

export const tokenUnitSizes = {
  MTok: 1_000_000,
  KTok: 1_000,
} as const;

export type TokenUnit = keyof typeof tokenUnitSizes;

export function convertPrice(
  amountPerMTok: number,
  currency: SupportedCurrency,
  unit: TokenUnit
): number {
  const rate = currencyRates[currency] ?? currencyRates.CNY;
  const unitSize = tokenUnitSizes[unit] ?? tokenUnitSizes.MTok;
  const baseUnitSize = tokenUnitSizes.MTok;

  if (!Number.isFinite(amountPerMTok) || amountPerMTok <= 0) {
    return 0;
  }

  return (amountPerMTok * rate * unitSize) / baseUnitSize;
}

export function getTokenDivisor(unit: TokenUnit): number {
  return tokenUnitSizes[unit] ?? tokenUnitSizes.MTok;
}

export function getUnitLabelKey(unit: TokenUnit): 'perMillionTokens' | 'perThousandTokens' {
  return unit === 'KTok' ? 'perThousandTokens' : 'perMillionTokens';
}
