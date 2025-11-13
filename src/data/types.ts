export type CurrencyCode = 'CNY' | 'USD';
export type TokenUnit = 'mtok' | 'ktok';

export type TokenPrice = {
  unit: TokenUnit;
  input: number;
  output: number;
  currency: CurrencyCode;
};

export type Model = {
  id: string;
  name: string;
  provider: string;
  prices: {
    mtok: TokenPrice;
    ktok: TokenPrice;
  };
  tags: string[];
  searchableText: string;
  updatedAt: string;
};

export type ExchangeRates = {
  'USD:CNY'?: number;
  'CNY:USD'?: number;
};

export type CalculationRecord = {
  id: string;
  seq: number;
  title: string;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  note: string;
  currency: CurrencyCode;
};
