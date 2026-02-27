import { useMemo } from 'react';
import Papa from 'papaparse';
import csvRaw from './pricing_total.csv?raw';
import type { PricingCsvRow, PricingModel } from './types';
import { currencyRates } from '../utils/pricing';

const PRICE_REGEX = /[\d.]+/g;
const CNY_PER_USD = 1 / currencyRates.USD;
const CNY_PER_EUR = 1 / currencyRates.EUR;

function parsePrice(value: string): number {
  if (!value) return 0;
  const match = value.match(PRICE_REGEX);
  if (!match) return 0;
  const numeric = match.join('');
  const parsed = Number.parseFloat(numeric);
  if (!Number.isFinite(parsed)) return 0;

  if (value.includes('$')) {
    return parsed * CNY_PER_USD;
  }
  if (value.includes('€')) {
    return parsed * CNY_PER_EUR;
  }
  return parsed;
}

function normalizeBoolean(value: string): boolean {
  return value?.trim() === '是';
}

function buildId(provider: string, name: string, index: number): string {
  const base = `${provider}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base) {
    return `${base}-${index}`;
  }
  return `model-${index}`;
}

function formatTokenBound(value: string, unit: string): string {
  if (value === '0') return '0';
  const normalizedUnit = (unit || 'K').toUpperCase();
  return `${value}${normalizedUnit}`;
}

function normalizeTierCondition(value: string): string {
  if (!value) return '';

  const compact = value
    .replace(/输入长度/g, '')
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/[【]/g, '[')
    .replace(/[】]/g, ']')
    .replace(/[，]/g, ',')
    .replace(/<=/g, '≤')
    .replace(/\s+/g, '')
    .trim();

  if (!compact) return '';

  const tokenStyle = compact.match(/^(\d+(?:\.\d+)?)([kKmM]?)<token≤(\d+(?:\.\d+)?)([kKmM]?)$/i);
  if (tokenStyle) {
    const [, lower, lowerUnit, upper, upperUnit] = tokenStyle;
    return `${formatTokenBound(lower, lowerUnit)}<Token≤${formatTokenBound(upper, upperUnit)}`;
  }

  const bracketRange = compact.match(/^[\[\(](\d+(?:\.\d+)?)([kKmM]?)[,](\d+(?:\.\d+)?)([kKmM]?)[\]\)]$/);
  if (bracketRange) {
    const [, lower, lowerUnit, upper, upperUnit] = bracketRange;
    return `${formatTokenBound(lower, lowerUnit)}<Token≤${formatTokenBound(upper, upperUnit)}`;
  }

  const plainRange = compact.match(/^(\d+(?:\.\d+)?)([kKmM]?)[,](\d+(?:\.\d+)?)([kKmM]?)$/);
  if (plainRange) {
    const [, lower, lowerUnit, upper, upperUnit] = plainRange;
    return `${formatTokenBound(lower, lowerUnit)}<Token≤${formatTokenBound(upper, upperUnit)}`;
  }

  const plusRange = compact.match(/^\[?(\d+(?:\.\d+)?)([kKmM]?)\+]?$/);
  if (plusRange) {
    const [, lower, lowerUnit] = plusRange;
    return `${formatTokenBound(lower, lowerUnit)}<Token`;
  }

  return compact;
}

type RawModelRow = {
  provider: string;
  name: string;
  isTieredPricing: boolean;
  tierCondition: string;
  inputPrice: number;
  outputPrice: number;
  isFavorite: boolean;
};

function tokenLowerBound(condition: string): number {
  if (!condition) return 0;
  const tokenStyle = condition.match(/^(\d+(?:\.\d+)?)([kKmM]?)<Token/i);
  if (!tokenStyle) return Number.POSITIVE_INFINITY;

  const value = Number.parseFloat(tokenStyle[1]);
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  const unit = (tokenStyle[2] || 'K').toUpperCase();
  if (unit === 'M') return value * 1_000_000;
  if (unit === 'K') return value * 1_000;
  return value;
}

function toRow(row: PricingCsvRow): RawModelRow {
  const provider = row['厂商']?.trim() || '';
  const name = row['模型名称']?.trim() || '';
  const tierCondition = normalizeTierCondition(row['阶梯计费条件'] || '');
  const isTieredPricing = normalizeBoolean(row['是否阶梯计费']) || Boolean(tierCondition);

  return {
    provider,
    name,
    isTieredPricing,
    tierCondition,
    inputPrice: parsePrice(row['输入']),
    outputPrice: parsePrice(row['输出']),
    isFavorite: normalizeBoolean(row['收藏']),
  };
}

function toModel(rows: RawModelRow[], index: number): PricingModel {
  const first = rows[0];

  const tierMap = new Map<string, { condition: string; inputPrice: number; outputPrice: number }>();
  for (const row of rows) {
    const key = `${row.tierCondition}::${row.inputPrice}::${row.outputPrice}`;
    if (!tierMap.has(key)) {
      tierMap.set(key, {
        condition: row.tierCondition,
        inputPrice: row.inputPrice,
        outputPrice: row.outputPrice,
      });
    }
  }

  const tiers = Array.from(tierMap.values()).sort((a, b) => {
    const lowerA = tokenLowerBound(a.condition);
    const lowerB = tokenLowerBound(b.condition);
    if (lowerA < lowerB) return -1;
    if (lowerA > lowerB) return 1;
    return 0;
  });

  const conditions = tiers.map((tier) => tier.condition).filter(Boolean);

  const inputPrices = rows.map((row) => row.inputPrice).filter((price) => Number.isFinite(price) && price > 0);
  const outputPrices = rows.map((row) => row.outputPrice).filter((price) => Number.isFinite(price) && price > 0);

  const inputPrice = inputPrices.length ? Math.min(...inputPrices) : 0;
  const outputPrice = outputPrices.length ? Math.min(...outputPrices) : 0;

  return {
    id: buildId(first.provider, first.name, index),
    provider: first.provider,
    name: first.name,
    isTieredPricing: rows.some((row) => row.isTieredPricing) || tiers.length > 1,
    tierCondition: conditions.join('；'),
    tiers,
    inputPrice,
    outputPrice,
    isFavorite: rows.some((row) => row.isFavorite),
  };
}

export function usePricingData(): { models: PricingModel[]; providers: string[] } {
  return useMemo(() => {
    const parsed = Papa.parse<PricingCsvRow>(csvRaw, {
      header: true,
      skipEmptyLines: 'greedy',
    });

    const rows = (parsed.data || [])
      .filter((row) => row['模型名称'] && row['厂商'])
      .map((row) => toRow(row));

    const grouped = new Map<string, RawModelRow[]>();
    for (const row of rows) {
      const key = `${row.provider}::${row.name}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.push(row);
      } else {
        grouped.set(key, [row]);
      }
    }

    const models = Array.from(grouped.values()).map((groupRows, index) => toModel(groupRows, index));

    const providers = Array.from(new Set(models.map((model) => model.provider))).sort();

    return { models, providers };
  }, []);
}
