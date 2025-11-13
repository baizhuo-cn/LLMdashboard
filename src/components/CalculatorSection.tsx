import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  CalculationRecord,
  CurrencyCode,
  ExchangeRates,
  Model,
  TokenUnit,
} from '../data/types';
import { usePersistentState } from '../hooks/usePersistentState';
import { convertAmount } from '../utils/currency';
import { formatMoney, formatPriceByUnit, formatUnitLabel } from '../utils/format';
import { RatesDialog } from './RatesDialog';

type Props = {
  models: Model[];
  unit: TokenUnit;
  rates: ExchangeRates;
  onRatesChange: (next: ExchangeRates) => void;
};

const TARGET_KEY = 'llmdashboard:calc:targetCurrency:v1';
const RECORDS_KEY = 'llmdashboard:calcRecords:v1';

const UNIT_DIVISOR: Record<TokenUnit, number> = {
  mtok: 1_000_000,
  ktok: 1_000,
};

const DEFAULT_RATES: ExchangeRates = {
  'USD:CNY': 7.2,
  'CNY:USD': 0.14,
};

function getNextSeq(records: CalculationRecord[]): number {
  const current = records.reduce((max, record) => Math.max(max, record.seq ?? 0), 0);
  return current + 1;
}

function formatTitle(seq: number) {
  return `计算 #${seq.toString().padStart(3, '0')}`;
}

export function CalculatorSection({ models, unit, rates, onRatesChange }: Props) {
  const [targetCurrency, setTargetCurrency] = usePersistentState<CurrencyCode>(TARGET_KEY, 'CNY');
  const [records, setRecords] = usePersistentState<CalculationRecord[]>(RECORDS_KEY, []);
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id ?? '');
  const [inputTokens, setInputTokens] = useState('1000');
  const [outputTokens, setOutputTokens] = useState('500');
  const [note, setNote] = useState('');
  const [title, setTitle] = useState(() => formatTitle(getNextSeq(records)));
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedModel = models.find((model) => model.id === selectedModelId) ?? null;
  const price = selectedModel ? selectedModel.prices[unit] : null;

  const preview = useMemo(() => {
    if (!price) return null;
    const divisor = UNIT_DIVISOR[unit];
    const input = Math.max(Number.parseFloat(inputTokens) || 0, 0);
    const output = Math.max(Number.parseFloat(outputTokens) || 0, 0);
    const inputCost = (input / divisor) * price.input;
    const outputCost = (output / divisor) * price.output;
    return {
      currency: price.currency,
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }, [price, unit, inputTokens, outputTokens]);

  const handleAddRecord = () => {
    if (!price || !preview) return;
    const seq = getNextSeq(records);
    const newRecord: CalculationRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      seq,
      title: title.trim() || formatTitle(seq),
      inputCost: preview.inputCost,
      outputCost: preview.outputCost,
      totalCost: preview.totalCost,
      note: note.trim(),
      currency: preview.currency,
    };
    const nextRecords = [...records, newRecord];
    setRecords(nextRecords);
    setTitle(formatTitle(getNextSeq(nextRecords)));
    setNote('');
  };

  const handleRemoveRecord = (recordId: string) => {
    const nextRecords = records.filter((record) => record.id !== recordId);
    setRecords(nextRecords);
    setTitle(formatTitle(getNextSeq(nextRecords)));
  };

  const handleClear = () => {
    setRecords([]);
    setTitle(formatTitle(1));
  };

  const missingRates = new Set<string>();
  const summaryTotal = records.reduce((sum, record) => {
    const converted = convertAmount(record.totalCost, record.currency, targetCurrency, {
      ...DEFAULT_RATES,
      ...rates,
    });
    if (converted === null) {
      missingRates.add(`${record.currency}:${targetCurrency}`);
      return sum;
    }
    return sum + converted;
  }, 0);

  const hasMissingRate = missingRates.size > 0;
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">用量估算</h2>
            <p className="text-sm text-muted-foreground">按官方单价快速预估输入/输出成本。</p>
          </div>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            汇率设置
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">选择模型</span>
            <select
              value={selectedModelId}
              onChange={(event) => setSelectedModelId(event.target.value)}
              className="rounded-xl border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} · {model.provider}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">记录标题</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-xl border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">输入 Tokens</span>
            <input
              type="number"
              min="0"
              value={inputTokens}
              onChange={(event) => setInputTokens(event.target.value)}
              className="rounded-xl border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">输出 Tokens</span>
            <input
              type="number"
              min="0"
              value={outputTokens}
              onChange={(event) => setOutputTokens(event.target.value)}
              className="rounded-xl border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="text-muted-foreground">备注</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="可添加备注"
              className="min-h-[80px] rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        {price && (
          <div className="mt-4 grid gap-4 rounded-2xl border border-dashed border-border p-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">输入单价</p>
              <p className="text-base font-semibold">{formatPriceByUnit(price.input, price.currency, unit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">输出单价</p>
              <p className="text-base font-semibold">{formatPriceByUnit(price.output, price.currency, unit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">计价单位</p>
              <p className="text-base font-semibold">{formatUnitLabel(unit)}</p>
            </div>
          </div>
        )}
        {preview && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">输入费用</p>
              <p className="text-xl font-semibold">{formatMoney(preview.inputCost, preview.currency)}</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">输出费用</p>
              <p className="text-xl font-semibold">{formatMoney(preview.outputCost, preview.currency)}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-xs text-muted-foreground">本次合计</p>
              <p className="text-xl font-semibold text-primary">{formatMoney(preview.totalCost, preview.currency)}</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={handleAddRecord}
            disabled={!preview}
            className={`rounded-full px-6 py-2 text-sm font-medium text-white ${
              preview ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground'
            }`}
          >
            新增记录
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={records.length === 0}
            className={`rounded-full border px-6 py-2 text-sm ${
              records.length ? 'border-destructive text-destructive hover:bg-destructive/10' : 'border-border text-muted-foreground'
            }`}
          >
            一键清空
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">结果保留区</h3>
            <p className="text-sm text-muted-foreground">保存的测算记录会在此展示并参与跨币种汇总。</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">目标币种</span>
            <select
              value={targetCurrency}
              onChange={(event) => setTargetCurrency(event.target.value as CurrencyCode)}
              className="rounded-full border border-border bg-transparent px-3 py-1 text-sm outline-none focus:border-primary"
            >
              <option value="CNY">CNY</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
        {records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            还没有记录，先在上方完成一次估算吧。
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="rounded-2xl border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{record.title}</p>
                    <p className="text-xs text-muted-foreground">原币种：{record.currency}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecord(record.id)}
                    className="rounded-full border border-border p-2 text-destructive hover:bg-destructive/10"
                    aria-label="删除记录"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-muted/50 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">输入费用</p>
                    <p className="font-semibold">{formatMoney(record.inputCost, record.currency)}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">输出费用</p>
                    <p className="font-semibold">{formatMoney(record.outputCost, record.currency)}</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">合计</p>
                    <p className="font-semibold text-primary">{formatMoney(record.totalCost, record.currency)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {record.note ? record.note : '可添加备注'}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 rounded-2xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">跨币种汇总（目标：{targetCurrency}）</p>
          <p className="text-2xl font-semibold">
            {records.length === 0
              ? '--'
              : hasMissingRate
              ? '待完善汇率'
              : formatMoney(summaryTotal, targetCurrency)}
          </p>
          {hasMissingRate && (
            <p className="mt-2 text-xs text-amber-600">
              缺少 {Array.from(missingRates).join(', ')} 汇率，请点击上方“汇率设置”完善。
            </p>
          )}
        </div>
      </div>

      <RatesDialog
        open={dialogOpen}
        rates={{ ...DEFAULT_RATES, ...rates }}
        onClose={() => setDialogOpen(false)}
        onSave={(next) => {
          onRatesChange({ ...next });
          setDialogOpen(false);
        }}
      />
    </section>
  );
}
