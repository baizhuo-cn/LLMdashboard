import { useState } from 'react';
import { models } from './data/models';
import type { ExchangeRates, Model, TokenUnit } from './data/types';
import { DashboardSection } from './components/DashboardSection';
import { CompareSection } from './components/CompareSection';
import { CalculatorSection } from './components/CalculatorSection';
import { usePersistentState } from './hooks/usePersistentState';

const FAVORITES_KEY = 'llmdashboard:favorites:v1';
const SHOW_FAVORITES_KEY = 'llmdashboard:dashboard:showFavorites:v1';
const UNIT_KEY = 'llmdashboard:unit:v1';
const RATES_KEY = 'llmdashboard:calc:rates:v1';

const DEFAULT_RATES: ExchangeRates = {
  'USD:CNY': 7.2,
  'CNY:USD': 0.14,
};

type Tab = 'dashboard' | 'compare' | 'calculator';

function getInitialCompare(list: Model[]): string[] {
  const seed = list.slice(0, 2).map((model) => model.id);
  while (seed.length < 2) {
    seed.push('');
  }
  return seed;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [unit, setUnit] = usePersistentState<TokenUnit>(UNIT_KEY, 'mtok');
  const [favorites, setFavorites] = usePersistentState<string[]>(FAVORITES_KEY, []);
  const [showFavorites, setShowFavorites] = usePersistentState<'on' | 'off'>(SHOW_FAVORITES_KEY, 'off');
  const [compareIds, setCompareIds] = useState<string[]>(() => getInitialCompare(models));
  const [rates, setRates] = usePersistentState<ExchangeRates>(RATES_KEY, DEFAULT_RATES);

  const handleToggleFavorite = (modelId: string) => {
    setFavorites((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  const handleUnitChange = (next: TokenUnit) => {
    setUnit(next);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: '仪表盘' },
    { id: 'compare', label: '对比' },
    { id: 'calculator', label: '计算' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">LLMdashboard</p>
            <h1 className="text-2xl font-semibold">模型价格一览</h1>
            <p className="text-sm text-muted-foreground">
              数据源自 pricing_total.csv，支持收藏、对比与成本计算。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-border p-1">
              {(['mtok', 'ktok'] as TokenUnit[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleUnitChange(option)}
                  className={`px-4 py-2 text-sm font-medium ${
                    unit === option
                      ? 'rounded-full bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-pressed={unit === option}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 px-6 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {activeTab === 'dashboard' && (
          <DashboardSection
            models={models}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            unit={unit}
            showFavorites={showFavorites}
            onShowFavoritesChange={setShowFavorites}
          />
        )}

        {activeTab === 'compare' && (
          <CompareSection
            models={models}
            selectedIds={compareIds}
            onChange={setCompareIds}
            unit={unit}
            rates={{ ...DEFAULT_RATES, ...rates }}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorSection
            models={models}
            unit={unit}
            rates={{ ...DEFAULT_RATES, ...rates }}
            onRatesChange={setRates}
          />
        )}
      </main>
    </div>
  );
}
