import { useMemo } from 'react';
import Papa from 'papaparse';
import csvRaw from './pricing_total.csv?raw';
import type { PricingCsvRow, PricingModel } from './types';

const PRICE_REGEX = /[\d.]+/g;

function parsePrice(value: string): number {
  if (!value) return 0;
  const match = value.match(PRICE_REGEX);
  if (!match) return 0;
  const numeric = match.join('');
  const parsed = Number.parseFloat(numeric);
  return Number.isFinite(parsed) ? parsed : 0;
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

function toModel(row: PricingCsvRow, index: number): PricingModel {
  const provider = row['厂商']?.trim() || '';
  const name = row['模型名称']?.trim() || '';
  const defaultTemperatureRaw = row['默认温度']?.trim();
  const defaultTemperature = defaultTemperatureRaw
    ? Number.parseFloat(defaultTemperatureRaw.replace(/[^\d.\-]/g, ''))
    : NaN;

  return {
    id: buildId(provider, name, index),
    provider,
    name,
    inputPrice: parsePrice(row['官方输入价格']),
    outputPrice: parsePrice(row['官方输出价格']),
    description: row['模型说明']?.replace(/\s+/g, ' ').trim() || '',
    temperatureRange: row['温度范围']?.trim() || '',
    defaultTemperature: Number.isFinite(defaultTemperature) ? defaultTemperature : null,
    isPopular: normalizeBoolean(row['常用模型']),
    isFavorite: normalizeBoolean(row['收藏']),
  };
}

export function usePricingData(): { models: PricingModel[]; providers: string[] } {
  return useMemo(() => {
    const parsed = Papa.parse<PricingCsvRow>(csvRaw, {
      header: true,
      skipEmptyLines: 'greedy',
    });

    const models = (parsed.data || [])
      .filter((row) => row['模型名称'] && row['厂商'])
      .map((row, index) => toModel(row, index));

    const providers = Array.from(new Set(models.map((model) => model.provider))).sort();

    return { models, providers };
  }, []);
}
