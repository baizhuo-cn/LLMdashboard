import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CurrencyCode, ExchangeRates, Model, TokenUnit } from '../data/types';
import { convertAmount } from '../utils/currency';
import { formatMoney, formatUnitLabel } from '../utils/format';

const CHART_COLORS = {
  input: 'var(--color-brand-primary)',
  output: 'var(--color-brand-accent)',
} as const;

type Props = {
  models: Model[];
  selectedIds: string[];
  unit: TokenUnit;
  type: 'input' | 'output';
  rates: ExchangeRates;
  displayCurrency: CurrencyCode;
};

export function ComparisonChart({ models, selectedIds, unit, type, rates, displayCurrency }: Props) {
  const missingRates = new Set<string>();

  const data = selectedIds
    .map((id) => models.find((model) => model.id === id))
    .filter((model): model is Model => Boolean(model))
    .map((model) => {
      const price = model.prices[unit][type];
      const converted = convertAmount(price, model.prices[unit].currency, displayCurrency, rates);
      if (converted === null) {
        missingRates.add(`${model.prices[unit].currency}:${displayCurrency}`);
        return null;
      }
      return { name: model.name, price: converted };
    })
    .filter((item): item is { name: string; price: number } => Boolean(item));

  const currencyLabel = displayCurrency === 'CNY' ? '人民币' : '美元';
  const title = type === 'input' ? '输入单价对比' : '输出单价对比';

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">
          {formatUnitLabel(unit)} · 以{currencyLabel}展示
        </p>
      </div>
      <div className="h-[280px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 36 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                width={60}
                tickFormatter={(value) => `${value.toFixed(2)}`}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.75rem',
                }}
                formatter={(value: number) => formatMoney(value, displayCurrency)}
              />
              <Bar dataKey="price" radius={[8, 8, 0, 0]} fill={CHART_COLORS[type]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            暂无可展示数据
          </div>
        )}
      </div>
      {missingRates.size > 0 && (
        <p className="mt-3 text-xs text-amber-600">
          缺少 {Array.from(missingRates).join(', ')} 汇率，请在计算页打开“汇率设置”。
        </p>
      )}
    </div>
  );
}
