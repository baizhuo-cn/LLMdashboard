import { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { KPIChip, KPIGroup } from './components/KPIChip';
import { FiltersBar } from './components/FiltersBar';
import { PricingTable, type SortField, type SortDirection } from './components/PricingTable';
import { ComparisonChart } from './components/ComparisonChart';
import { CalculatorPanel } from './components/CalculatorPanel';
import { RatingItem, type Rating } from './components/RatingItem';
import { t, formatNumber, formatDate, formatCurrency, type Language } from './components/i18n';
import { usePricingData } from './data/usePricing';
import type { PricingModel } from './data/types';
import { ModelCompareSelect } from './components/ModelCompareSelect';
import { Button } from './components/ui/button';
import { Plus } from 'lucide-react';

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

const getSortValue = (model: PricingModel, field: SortField): string | number | null => {
  switch (field) {
    case 'name':
      return model.name;
    case 'inputPrice':
      return model.inputPrice;
    case 'outputPrice':
      return model.outputPrice;
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

const MIN_COMPARE_SLOTS = 2;
const MAX_COMPARE_SLOTS = 5;

export default function App() {
  const { models, providers } = usePricingData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currency, setCurrency] = useState<SupportedCurrency>('CNY');
  const [unit, setUnit] = useState<TokenUnit>('MTok');
  const [provider, setProvider] = useState('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('zh');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'popular'>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const favoritesInitialized = useRef(false);
  const [compareSlots, setCompareSlots] = useState<string[]>(() => Array.from({ length: MIN_COMPARE_SLOTS }, () => ''));

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
      const cleaned = prev.filter((id) => availableIds.has(id));

      if (!favoritesInitialized.current) {
        favoritesInitialized.current = true;
        if (cleaned.length === 0) {
          const initial = models.filter((model) => model.isFavorite).map((model) => model.id);
          return initial.length ? initial : cleaned;
        }
      }

      if (cleaned.length !== prev.length) {
        return cleaned;
      }
      return prev;
    });
  }, [models]);

  useEffect(() => {
    if (!models.length) return;

    setCompareSlots((prev) => {
      const normalized = prev.length
        ? [...prev]
        : Array.from({ length: MIN_COMPARE_SLOTS }, () => '');

      const availableIds = new Set(models.map((model) => model.id));
      let changed = false;
      for (let i = 0; i < normalized.length; i += 1) {
        if (normalized[i] && !availableIds.has(normalized[i])) {
          normalized[i] = '';
          changed = true;
        }
      }

      if (normalized.length < MIN_COMPARE_SLOTS) {
        return [...normalized, ...Array.from({ length: MIN_COMPARE_SLOTS - normalized.length }, () => '')];
      }

      if (normalized.length > MAX_COMPARE_SLOTS) {
        return normalized.slice(0, MAX_COMPARE_SLOTS);
      }

      return changed ? normalized : prev;
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

        const aVal = getSortValue(a, sortField);
        const bVal = getSortValue(b, sortField);

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
  }, [displayModels, filterMode, provider, search, sortField, sortDirection, lang]);

  const toggleFavorite = (modelId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleCompareSlotChange = (index: number, modelId: string) => {
    setCompareSlots((prev) => {
      const next = [...prev];
      next[index] = modelId;
      return next;
    });
  };

  const handleAddCompareSlot = () => {
    setCompareSlots((prev) => {
      if (prev.length >= MAX_COMPARE_SLOTS) return prev;
      return [...prev, ''];
    });
  };

  const handleRemoveCompareSlot = (index: number) => {
    setCompareSlots((prev) => {
      if (prev.length <= MIN_COMPARE_SLOTS) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const selectedCompareIds = useMemo(
    () => compareSlots.filter((slot) => Boolean(slot)),
    [compareSlots]
  );

  const handleExport = () => {
    if (!filteredModels.length) return;

    const yesLabel = t('yes', lang);
    const noLabel = t('no', lang);

    const rows = [
      ['厂商', '模型名称', '官方输入价格', '官方输出价格', '模型说明', '温度范围', '默认温度', '常用模型', '收藏'],
      ...filteredModels.map((model) => [
        model.provider,
        model.name,
        formatCurrency(model.inputPrice, currency, lang),
        formatCurrency(model.outputPrice, currency, lang),
        model.description,
        model.temperatureRange,
        model.defaultTemperature ?? '',
        model.isPopular ? yesLabel : noLabel,
        model.isFavorite ? yesLabel : noLabel,
      ]),
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

  const lastUpdate = new Date();

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

      <main className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-6 sm:py-8 md:px-8 lg:px-12 xl:px-[120px]">
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
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg">{t('selectModelsToCompare', lang)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('perMillionTokens', lang)} / {t('perThousandTokens', lang)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 border-border"
                  onClick={handleAddCompareSlot}
                  disabled={compareSlots.length >= MAX_COMPARE_SLOTS}
                >
                  <Plus className="h-4 w-4" />
                  {t('addComparisonSlot', lang)}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {compareSlots.map((slot, index) => (
                  <div
                    key={`compare-slot-${index}`}
                    className="rounded-xl border border-dashed border-border/70 bg-muted/5 p-4"
                  >
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      {t('comparisonSlotLabel', lang, { index: index + 1 })}
                    </p>
                    <ModelCompareSelect
                      models={models}
                      value={slot}
                      placeholder={t('selectModel', lang)}
                      onChange={(modelId) => handleCompareSlotChange(index, modelId)}
                      lang={lang}
                      canRemove={compareSlots.length > MIN_COMPARE_SLOTS}
                      onRemove={compareSlots.length > MIN_COMPARE_SLOTS ? () => handleRemoveCompareSlot(index) : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ComparisonChart
                models={models}
                selectedModels={selectedCompareIds}
                type="input"
                currency={currency}
                unit={unit}
                lang={lang}
              />
              <ComparisonChart
                models={models}
                selectedModels={selectedCompareIds}
                type="output"
                currency={currency}
                unit={unit}
                lang={lang}
              />
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="mx-auto max-w-3xl">
            <CalculatorPanel models={models} currency={currency} unit={unit} lang={lang} />
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
