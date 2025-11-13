import { Plus, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import type { ExchangeRates, Model, TokenUnit } from '../data/types';
import { ComparisonChart } from './ComparisonChart';

const MAX_COMPARE = 5;
const MIN_COMPARE = 2;

type Props = {
  models: Model[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
  unit: TokenUnit;
  rates: ExchangeRates;
};

export function CompareSection({ models, selectedIds, onChange, unit, rates }: Props) {
  const canAdd = selectedIds.length < MAX_COMPARE;

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([...selectedIds, '']);
  };

  const handleRemove = (index: number) => {
    if (selectedIds.length <= MIN_COMPARE) return;
    const next = selectedIds.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleValueChange = (index: number, value: string) => {
    const next = [...selectedIds];
    next[index] = value;
    onChange(next);
  };

  const sanitizedSelections = useMemo(() => selectedIds.slice(0, MAX_COMPARE), [selectedIds]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">模型对比</h2>
            <p className="text-sm text-muted-foreground">可搜索选择 2-5 个模型进行价格对比。</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              canAdd ? 'border-primary text-primary hover:bg-primary/10' : 'border-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Plus className="h-4 w-4" /> 添加对比项
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sanitizedSelections.map((value, index) => (
            <div key={`${index}-${value}`} className="rounded-2xl border border-border bg-background/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">对比项 #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={sanitizedSelections.length <= MIN_COMPARE}
                  className={`rounded-full border p-1 ${
                    sanitizedSelections.length > MIN_COMPARE
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'cursor-not-allowed text-muted-foreground/60'
                  }`}
                  aria-label="移除对比项"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ComparisonCombobox
                models={models}
                value={value}
                onChange={(next) => handleValueChange(index, next)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ComparisonChart
          models={models}
          selectedIds={sanitizedSelections.filter(Boolean)}
          unit={unit}
          type="input"
          rates={rates}
          displayCurrency="CNY"
        />
        <ComparisonChart
          models={models}
          selectedIds={sanitizedSelections.filter(Boolean)}
          unit={unit}
          type="output"
          rates={rates}
          displayCurrency="CNY"
        />
      </div>
    </section>
  );
}

type ComboboxProps = {
  models: Model[];
  value: string;
  onChange: (next: string) => void;
};

function ComparisonCombobox({ models, value, onChange }: ComboboxProps) {
  const selectedModel = models.find((model) => model.id === value) ?? null;
  const [inputValue, setInputValue] = useState(selectedModel?.name ?? '');
  const [open, setOpen] = useState(false);
  const listId = useId();

  const options = useMemo(() => {
    const keyword = inputValue.trim().toLowerCase();
    if (!keyword) return models;
    return models.filter((model) =>
      model.searchableText.includes(keyword) ||
      model.name.toLowerCase().includes(keyword) ||
      model.provider.toLowerCase().includes(keyword)
    );
  }, [inputValue, models]);

  const handleSelect = (model: Model) => {
    setInputValue(model.name);
    setOpen(false);
    onChange(model.id);
  };

  const handleBlur = () => {
    setOpen(false);
    setInputValue(selectedModel?.name ?? '');
  };

  const handleFocus = () => {
    setOpen(true);
    setInputValue('');
  };

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        value={inputValue}
        placeholder="输入关键字搜索"
        onChange={(event) => {
          setInputValue(event.target.value);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-border bg-card shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">未找到匹配模型</li>
          ) : (
            options.map((model) => (
              <li key={model.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(model)}
                  className={`flex w-full flex-col items-start gap-1 px-3 py-2 text-left text-sm ${
                    model.id === value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.provider}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {selectedModel && !open && (
        <p className="mt-2 text-xs text-muted-foreground">
          已选择：{selectedModel.name} · {selectedModel.provider}
        </p>
      )}
    </div>
  );
}
