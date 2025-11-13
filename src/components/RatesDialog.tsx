import { useEffect, useState } from 'react';
import type { ExchangeRates } from '../data/types';

type Props = {
  open: boolean;
  rates: ExchangeRates;
  onSave: (next: ExchangeRates) => void;
  onClose: () => void;
};

export function RatesDialog({ open, rates, onSave, onClose }: Props) {
  const [usdToCny, setUsdToCny] = useState('');
  const [cnyToUsd, setCnyToUsd] = useState('');

  useEffect(() => {
    if (!open) return;
    setUsdToCny((rates['USD:CNY'] ?? '').toString());
    setCnyToUsd((rates['CNY:USD'] ?? '').toString());
  }, [open, rates]);

  if (!open) return null;

  const usdValue = Number.parseFloat(usdToCny);
  const cnyValue = Number.parseFloat(cnyToUsd);
  const canSave = usdValue > 0 && cnyValue > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ 'USD:CNY': usdValue, 'CNY:USD': cnyValue });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">汇率设置</h3>
          <p className="text-sm text-muted-foreground">配置 USD⇄CNY 的本地换算比。</p>
        </div>
        <div className="space-y-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">USD → CNY</span>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={usdToCny}
              onChange={(event) => setUsdToCny(event.target.value)}
              className="rounded-xl border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">CNY → USD</span>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={cnyToUsd}
              onChange={(event) => setCnyToUsd(event.target.value)}
              className="rounded-xl border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3 text-sm">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-muted-foreground hover:text-foreground"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`rounded-full px-4 py-2 font-medium text-white transition-colors ${
              canSave ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground'
            }`}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
