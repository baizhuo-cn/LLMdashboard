import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { PricingModel } from "../data/types";
import {
  convertPrice,
  getUnitLabelKey,
  type SupportedCurrency,
  type TokenUnit,
} from "../utils/pricing";
import { t, type Language } from "./i18n";

type ComparisonChartProps = {
  models: PricingModel[];
  selectedModels: string[];
  type: 'input' | 'output';
  currency: SupportedCurrency;
  unit: TokenUnit;
  lang: Language;
};

export function ComparisonChart({ models, selectedModels, type, currency, unit, lang }: ComparisonChartProps) {
  const filteredModels = models.filter((m) => selectedModels.includes(m.id));

  const data = filteredModels.map((model) => ({
    name: model.name,
    price:
      type === 'input'
        ? convertPrice(model.inputPrice, currency, unit)
        : convertPrice(model.outputPrice, currency, unit),
  }));

  const title = type === 'input' ? t('inputPriceComparison', lang) : t('outputPriceComparison', lang);
  const subtitle = t(getUnitLabelKey(unit), lang);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition-colors">
      <div className="mb-6">
        <h3 className="text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-line)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--color-base-muted)"
            tick={{ fill: 'var(--color-base-muted)', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="var(--color-base-muted)"
            tick={{ fill: 'var(--color-base-muted)', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-base-card)',
              border: '1px solid var(--color-base-line)',
              borderRadius: '8px',
              color: 'var(--color-base-fg)',
            }}
            labelStyle={{ color: 'var(--color-base-fg)' }}
          />
          <Bar
            dataKey="price"
            fill={type === 'input' ? 'var(--color-brand-primary)' : 'var(--color-brand-accent)'}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
