#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SOURCE = path.resolve(__dirname, '..', 'pricing_total.csv');
const TARGET = path.resolve(__dirname, '..', 'src', 'data', 'models.ts');
const SUPPORTED_CURRENCIES = new Set(['CNY', 'USD']);

const KIMI_OVERRIDES = {
  'kimi-k2-0905': { input: 4, output: 16 },
  'kimi-k2-thinking': { input: 4, output: 16 },
  'kimi-k2-thinking-turbo': { input: 8, output: 58 },
  'kimi-k2-turbo': { input: 8, output: 58 },
};

function readCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows = [];
  let current = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      current.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') {
        i += 1;
      }
      current.push(value);
      if (current.some((cell) => cell !== '')) {
        rows.push(current);
      }
      current = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (value.length || current.length) {
    current.push(value);
    if (current.some((cell) => cell !== '')) {
      rows.push(current);
    }
  }

  return rows;
}

function parseNumber(raw, fallback = 0) {
  if (raw === undefined || raw === null) return fallback;
  const cleaned = String(raw).trim();
  if (!cleaned) return fallback;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toCurrency(raw) {
  const value = String(raw || '').trim().toUpperCase();
  if (!SUPPORTED_CURRENCIES.has(value)) {
    throw new Error(`Unsupported currency: ${raw}`);
  }
  return value;
}

function splitTags(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/[,;|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeModel(row, updatedAt) {
  const id = String(row.id || '').trim();
  const name = String(row.name || '').trim();
  const provider = String(row.provider || '').trim();
  if (!id || !name || !provider) {
    return null;
  }

  const currency = toCurrency(row.currency || 'CNY');
  const mtokInput = parseNumber(row.mtok_input);
  const mtokOutput = parseNumber(row.mtok_output);
  const ktokInput = row.ktok_input !== undefined ? parseNumber(row.ktok_input) : mtokInput / 1000;
  const ktokOutput = row.ktok_output !== undefined ? parseNumber(row.ktok_output) : mtokOutput / 1000;

  const tags = splitTags(row.tags);
  const searchableText = [id, name, provider, ...tags]
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  return {
    id,
    name,
    provider,
    prices: {
      mtok: { unit: 'mtok', input: mtokInput, output: mtokOutput, currency },
      ktok: { unit: 'ktok', input: ktokInput, output: ktokOutput, currency },
    },
    tags,
    searchableText,
    updatedAt,
  };
}

function applyKimiOverride(model) {
  const override = KIMI_OVERRIDES[model.id];
  if (!override) return model;
  const { input, output } = override;
  const currency = 'CNY';
  return {
    ...model,
    prices: {
      mtok: { unit: 'mtok', input, output, currency },
      ktok: { unit: 'ktok', input: input / 1000, output: output / 1000, currency },
    },
  };
}

function writeModels(models) {
  const header = "import type { Model } from './types';\n\n";
  const body = `export const models: Model[] = ${JSON.stringify(models, null, 2)};\n`;
  fs.writeFileSync(TARGET, header + body, 'utf8');
}

(function main() {
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Missing data source: ${SOURCE}`);
  }
  const rows = readCsv(SOURCE);
  if (!rows.length) {
    throw new Error('CSV file is empty.');
  }
  const headers = rows[0];
  const updatedAt = new Date().toISOString().slice(0, 10);
  const dataRows = rows.slice(1);
  const models = dataRows
    .map((cells) => {
      const row = {};
      headers.forEach((key, index) => {
        row[String(key).trim()] = cells[index];
      });
      return row;
    })
    .map((row) => normalizeModel(row, updatedAt))
    .filter((model) => model !== null)
    .map((model) => applyKimiOverride(model));

  writeModels(models);
  console.log(`Generated ${models.length} models.`);
})();
