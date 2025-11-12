import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPIChip, KPIGroup } from './components/KPIChip';
import { FiltersBar } from './components/FiltersBar';
import { PricingTable, type SortField, type SortDirection } from './components/PricingTable';
import { ComparisonChart } from './components/ComparisonChart';
import { ModelPill } from './components/ModelPill';
import { CalculatorPanel } from './components/CalculatorPanel';
import { BudgetPanel } from './components/BudgetPanel';
import { RatingItem, type Rating } from './components/RatingItem';
import { t, formatNumber, formatDate, formatCurrency, type Language } from './components/i18n';
import { usePricingData } from './data/usePricing';
import type { PricingModel } from './data/types';
import { convertPrice, type SupportedCurrency, type TokenUnit } from './utils/pricing';

const sampleRatings: Rating[] = [
  {
    id: '1',
    name: 'GPT-4o',
    provider: 'OpenAI',
    quote: 'Outstanding reasoning and code generation',
    score: 9.2,
    maxScore: 10,
    votes: 15234,
  },
  {
    id: '2',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    quote: 'Best for long-form writing and analysis',
    score: 9.1,
    maxScore: 10,
    votes: 12456,
  },
  {
    id: '3',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    quote: 'Exceptional multimodal capabilities',
    score: 8.8,
    maxScore: 10,
    votes: 9872,
  },
  {
    id: '4',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    quote: 'Best value for everyday tasks',
    score: 8.4,
    maxScore: 10,
    votes: 18923,
  },
  {
    id: '5',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    quote: 'Incredible performance at this price',
    score: 7.9,
    maxScore: 10,
    votes: 7634,
  },
  {
    id: '6',
    name: 'Qwen2.5-72B',
    provider: 'Qwen',
    quote: 'Strong multilingual support',
    score: 7.6,
    maxScore: 10,
    votes: 5421,
  },
];

const getSortValue = (
  model: PricingModel,
  field: SortField,
  currency: SupportedCurrency,
  unit: TokenUnit
): string | number | null => {
  switch (field) {
    case 'name':
      return model.name;
    case 'inputPrice':
      return convertPrice(model.inputPrice, currency, unit);
    case 'outputPrice':
      return convertPrice(model.outputPrice, currency, unit);
    case 'description':
      return model.description;
    case 'temperatureRange':
      return model.temperatureRange;
    case 'defaultTemperature':
      return model.defaultTemperature;
    default:
      return null;
  }
};

export default function App() {
  const { models, providers } = usePricingData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currency, setCurrency] = useState<SupportedCurrency>('CNY');
  const [unit, setUnit] = useState<TokenUnit>('MTok');
  const [provider, setProvider] = useState('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('zh');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'popular'>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (provider !== 'all' && !providers.includes(provider)) {
      setProvider('all');
    }
  }, [provider, providers]);

  useEffect(() => {
    if (!models.length) return;

    setFavoriteIds((prev) => {
      const availableIds = new Set(models.map((model) => model.id));

      if (prev.length === 0) {
        return models.filter((model) => model.isFavorite).map((model) => model.id);
      }

      return prev.filter((id) => availableIds.has(id));
    });
  }, [models]);

  useEffect(() => {
    if (!models.length) return;
    const availableIds = new Set(models.map((model) => model.id));
    setSelectedModels((prev) => {
      const filtered = prev.filter((id) => availableIds.has(id));
      if (filtered.length === 0) {
        return models.slice(0, Math.min(3, models.length)).map((model) => model.id);
      }
      if (filtered.length !== prev.length) {
        return filtered;
      }
      return prev;
    });
  }, [models]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const displayModels = useMemo(() => {
    const favoritesSet = new Set(favoriteIds);
    return models.map((model) => ({
      ...model,
      isFavorite: favoritesSet.has(model.id),
    }));
  }, [models, favoriteIds]);

  const filteredModels = useMemo(() => {
    let filtered = [...displayModels];

    if (filterMode === 'favorites') {
      filtered = filtered.filter((m) => m.isFavorite);
    } else if (filterMode === 'popular') {
      filtered = filtered.filter((m) => m.isPopular);
    }

    if (provider !== 'all') {
      filtered = filtered.filter((m) => m.provider === provider);
    }

    if (search) {
      const keyword = search.toLowerCase();
      filtered = filtered.filter((m) => {
        const fields = [m.name, m.provider, m.description, m.temperatureRange];
        return fields.some((field) => field.toLowerCase().includes(keyword));
      });
    }

    if (sortField && sortDirection) {
      const direction = sortDirection === 'asc' ? 1 : -1;
      filtered.sort((a, b) => {
        if (sortField === 'defaultTemperature') {
          const aTemp = a.defaultTemperature ?? (sortDirection === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
          const bTemp = b.defaultTemperature ?? (sortDirection === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
          if (aTemp < bTemp) return -1 * direction;
          if (aTemp > bTemp) return 1 * direction;
          return 0;
        }

        const aVal = getSortValue(a, sortField, currency, unit);
        const bVal = getSortValue(b, sortField, currency, unit);

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return direction * aVal.localeCompare(bVal, lang === 'zh' ? 'zh-CN' : 'en-US');
        }

        const aNum = typeof aVal === 'number' ? aVal : 0;
        const bNum = typeof bVal === 'number' ? bVal : 0;

        if (aNum < bNum) return -1 * direction;
        if (aNum > bNum) return 1 * direction;
        return 0;
      });
    }

    return filtered;
  }, [displayModels, filterMode, provider, search, sortField, sortDirection, lang, currency, unit]);

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  const toggleFavorite = (modelId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleExport = () => {
    if (!filteredModels.length) return;

    const yesLabel = t('yes', lang);
    const noLabel = t('no', lang);

    const rows = [
      ['厂商', '模型名称', '官方输入价格', '官方输出价格', '模型说明', '温度范围', '默认温度', '常用模型', '收藏'],
      ...filteredModels.map((model) => {
        const input = convertPrice(model.inputPrice, currency, unit);
        const output = convertPrice(model.outputPrice, currency, unit);
        return [
          model.provider,
          model.name,
          formatCurrency(input, currency, lang),
          formatCurrency(output, currency, lang),
        model.description,
        model.temperatureRange,
        model.defaultTemperature ?? '',
        model.isPopular ? yesLabel : noLabel,
        model.isFavorite ? yesLabel : noLabel,
        ];
      }),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) => {
            const cell = String(value ?? '').replace(/"/g, '""');
            return `"${cell}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_total.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const lastUpdate = new Date('2025-11-11');

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currency={currency}
        onCurrencyChange={setCurrency}
        unit={unit}
        onUnitChange={setUnit}
        theme={theme}
        onThemeChange={setTheme}
        lang={lang}
        onLangChange={setLang}
      />

      <main className="mx-auto max-w-[1440px] px-[120px] py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <KPIGroup>
              <KPIChip label={t('totalModels', lang)} value={formatNumber(models.length, lang)} variant="default" />
              <KPIChip label={t('lastUpdate', lang)} value={formatDate(lastUpdate, lang)} variant="accent" />
            </KPIGroup>

            <FiltersBar
              providers={providers}
              provider={provider}
              onProviderChange={setProvider}
              search={search}
              onSearchChange={setSearch}
              onExport={handleExport}
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              lang={lang}
            />

            <PricingTable
              models={filteredModels}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              currency={currency}
              unit={unit}
              onToggleFavorite={toggleFavorite}
              lang={lang}
            />
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg mb-4">{t('selectModelsToCompare', lang)}</h3>
              <div className="flex flex-wrap gap-2">
                {models.map((model) => (
                   <ModelPill
                     key={model.id}
                     name={model.name}
                     selected={selectedModels.includes(model.id)}
                     onToggle={() => toggleModelSelection(model.id)}
                   />
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
              <ComparisonChart
                models={displayModels}
                selectedModels={selectedModels}
                type="input"
                currency={currency}
                unit={unit}
                lang={lang}
              />
              <ComparisonChart
                models={displayModels}
                selectedModels={selectedModels}
                type="output"
                currency={currency}
                unit={unit}
                lang={lang}
              />
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="grid grid-cols-2 gap-6">
            <CalculatorPanel models={displayModels} currency={currency} unit={unit} lang={lang} />
            <BudgetPanel models={displayModels} currency={currency} unit={unit} lang={lang} />
          </div>
        )}

         {activeTab === 'ratings' && (
           <div className="space-y-4">
             <div className="rounded-2xl border border-border bg-card p-6">
               <h2 className="text-xl mb-2">{t('communityRatings', lang)}</h2>
               <p className="text-sm text-muted-foreground">
                 {t('communityRatingsDesc', lang)}
               </p>
             </div>

             <div className="space-y-3">
               {sampleRatings.map((rating) => (
                 <RatingItem
                   key={rating.id}
                   rating={rating}
                   selected={selectedRating === rating.id}
                   onSelect={() => setSelectedRating(rating.id === selectedRating ? null : rating.id)}
                   lang={lang}
                 />
               ))}
             </div>
           </div>
         )}
       </main>
     </div>
  );
}
