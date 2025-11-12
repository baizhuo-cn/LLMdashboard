import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPIChip, KPIGroup } from './components/KPIChip';
import { FiltersBar } from './components/FiltersBar';
import { PricingTable, type LLMModel } from './components/PricingTable';
import { ComparisonChart } from './components/ComparisonChart';
import { ModelPill } from './components/ModelPill';
import { CalculatorPanel } from './components/CalculatorPanel';
import { BudgetPanel } from './components/BudgetPanel';
import { RatingItem, type Rating } from './components/RatingItem';
import { t, formatNumber, formatDate, type Language } from './components/i18n';

const sampleModels: LLMModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputPrice: 0.50,
    outputPrice: 1.50,
    contextWindow: '128k',
    tags: ['general', 'cheap'],
    description: '高性价比的通用模型，适合日常任务',
    temperatureRange: '0-2',
    defaultTemperature: 1.0,
    isPopular: true,
    isFavorite: false,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputPrice: 5.00,
    outputPrice: 15.00,
    contextWindow: '128k',
    tags: ['general', 'premium'],
    description: '强大的多模态模型，支持文本、图像和音频',
    temperatureRange: '0-2',
    defaultTemperature: 1.0,
    isPopular: true,
    isFavorite: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    inputPrice: 3.00,
    outputPrice: 10.00,
    contextWindow: '1M',
    tags: ['general', 'long-context'],
    description: '超长上下文窗口，适合处理大量文档',
    temperatureRange: '0-2',
    defaultTemperature: 1.0,
    isPopular: false,
    isFavorite: true,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPrice: 3.00,
    outputPrice: 15.00,
    contextWindow: '200k',
    tags: ['general', 'reasoning'],
    description: '擅长长文写作和深度分析推理',
    temperatureRange: '0-1',
    defaultTemperature: 1.0,
    isPopular: true,
    isFavorite: true,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    inputPrice: 0.27,
    outputPrice: 1.10,
    contextWindow: '64k',
    tags: ['general', 'budget'],
    description: '极具性价比的国产模型，推理能力强',
    temperatureRange: '0-2',
    defaultTemperature: 1.0,
    isPopular: true,
    isFavorite: false,
  },
  {
    id: 'qwen2.5-72b',
    name: 'Qwen2.5-72B',
    provider: 'Qwen',
    inputPrice: 0.80,
    outputPrice: 2.40,
    contextWindow: '128k',
    tags: ['general', 'multilingual'],
    description: '强大的多语言支持，中文表现优秀',
    temperatureRange: '0-2',
    defaultTemperature: 0.7,
    isPopular: false,
    isFavorite: false,
  },
];

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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currency, setCurrency] = useState('CNY');
  const [unit, setUnit] = useState('MTok');
  const [provider, setProvider] = useState('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'inputPrice' | 'outputPrice' | 'description' | 'temperatureRange' | 'defaultTemperature' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4o-mini', 'gpt-4o', 'claude-3.5-sonnet']);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'popular'>('all');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSort = (field: 'name' | 'inputPrice' | 'outputPrice' | 'description' | 'temperatureRange' | 'defaultTemperature') => {
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

  const filteredModels = useMemo(() => {
    let filtered = [...sampleModels];

    // Apply filter mode
    if (filterMode === 'favorites') {
      filtered = filtered.filter((m) => m.isFavorite);
    } else if (filterMode === 'popular') {
      filtered = filtered.filter((m) => m.isPopular);
    }

    if (provider !== 'all') {
      filtered = filtered.filter((m) => m.provider.toLowerCase() === provider.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.provider.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase()) ||
          m.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aVal: string | number = a[sortField];
        let bVal: string | number = b[sortField];

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [provider, search, sortField, sortDirection, filterMode]);

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  const handleExport = () => {
    const csv = [
      ['Model', 'Provider', 'Input Price', 'Output Price', 'Context Window', 'Tags'],
      ...filteredModels.map((m) => [
        m.name,
        m.provider,
        m.inputPrice.toString(),
        m.outputPrice.toString(),
        m.contextWindow,
        m.tags.join('; '),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llm-pricing.csv';
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
              <KPIChip label={t('totalModels', lang)} value={formatNumber(sampleModels.length, lang)} variant="default" />
              <KPIChip label={t('lastUpdate', lang)} value={formatDate(lastUpdate, lang)} variant="accent" />
            </KPIGroup>

            <FiltersBar
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
              lang={lang}
            />
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg mb-4">{t('selectModelsToCompare', lang)}</h3>
              <div className="flex flex-wrap gap-2">
                {sampleModels.map((model) => (
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
              <ComparisonChart models={sampleModels} selectedModels={selectedModels} type="input" lang={lang} />
              <ComparisonChart models={sampleModels} selectedModels={selectedModels} type="output" lang={lang} />
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="grid grid-cols-2 gap-6">
            <CalculatorPanel models={sampleModels} currency={currency} lang={lang} />
            <BudgetPanel models={sampleModels} currency={currency} lang={lang} />
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
