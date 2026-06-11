import type { PricingModel } from "../data/types";
import {
  convertPrice,
  getUnitLabelKey,
  type SupportedCurrency,
  type TokenUnit,
} from "../utils/pricing";
import { t, formatCurrency, type Language } from "./i18n";
import { getProviderColor } from "../utils/providerColors";

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
    provider: model.provider,
    price: type === 'input'
      ? convertPrice(model.inputPrice, currency, unit)
      : convertPrice(model.outputPrice, currency, unit),
    color: getProviderColor(model.provider),
  })).sort((a, b) => a.price - b.price);

  const maxPrice = Math.max(...data.map((d) => d.price), 1);
  const title = type === 'input' ? t('inputPriceComparison', lang) : t('outputPriceComparison', lang);
  const unitLabel = t(getUnitLabelKey(unit), lang);
  const priceDecimals = unit === 'KTok' ? 5 : 2;

  const currencyPrefix = currency === 'CNY' ? '￥' : currency === 'USD' ? '$' : '€';

  return (
    <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--foreground)', marginBottom: 2 }}>
        {title}
      </h3>
      <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 22 }}>
        {unitLabel} · {currency} ({currencyPrefix})
      </p>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--muted-foreground)', fontSize: 12 }}>
          {t('noModelsFound', lang)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {data.map((item) => (
            <div key={item.name}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="provider-dot" style={{ background: item.color, width: 6, height: 6 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--foreground)' }}>{item.name}</span>
                </div>
                <span className="font-mono-jet" style={{ fontSize: 12, color: 'var(--muted-foreground)', fontWeight: 500 }}>
                  {formatCurrency(item.price, currency, lang, priceDecimals)}
                </span>
              </div>
              <div className="h-bar-track">
                <div
                  className="h-bar-fill"
                  style={{
                    background: item.color,
                    width: `${Math.max(4, (item.price / maxPrice) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
