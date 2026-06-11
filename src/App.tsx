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
import { convertPrice, type SupportedCurrency, type TokenUnit } from './utils/pricing';
import { getProviderColor } from './utils/providerColors';

const sampleRatings: Rating[] = [
  { id: '1', name: 'GPT-4o', provider: 'OpenAI', quote: 'Outstanding reasoning and code generation', score: 9.2, maxScore: 10, votes: 15234 },
  { id: '2', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', quote: 'Best for long-form writing and analysis', score: 9.1, maxScore: 10, votes: 12456 },
  { id: '3', name: 'Gemini 2.5 Pro', provider: 'Google', quote: 'Exceptional multimodal capabilities', score: 8.8, maxScore: 10, votes: 9872 },
  { id: '4', name: 'GPT-4o Mini', provider: 'OpenAI', quote: 'Best value for everyday tasks', score: 8.4, maxScore: 10, votes: 18923 },
  { id: '5', name: 'DeepSeek R1', provider: 'DeepSeek', quote: 'Incredible performance at this price', score: 7.9, maxScore: 10, votes: 7634 },
  { id: '6', name: 'Qwen2.5-72B', provider: 'Qwen', quote: 'Strong multilingual support', score: 7.6, maxScore: 10, votes: 5421 },
];

const getSortValue = (model: PricingModel, field: SortField): number => {
  switch (field) {
    case 'inputPrice': return model.inputPrice;
    case 'outputPrice': return model.outputPrice;
    default: return 0;
  }
};

const MAX_COMPARE = 10;

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
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [tieredFilter, setTieredFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [tierConditionFilter, setTierConditionFilter] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const favoritesInitialized = useRef(false);

  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [compareSearch, setCompareSearch] = useState('');
  const [compareDropdownOpen, setCompareDropdownOpen] = useState(false);
  const [compareProviderFilter, setCompareProviderFilter] = useState<string | null>(null);
  const compareRef = useRef<HTMLDivElement>(null);

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
      const availableIds = new Set(models.map((m) => m.id));
      const cleaned = prev.filter((id) => availableIds.has(id));
      if (!favoritesInitialized.current) {
        favoritesInitialized.current = true;
        if (cleaned.length === 0) {
          const initial = models.filter((m) => m.isFavorite).map((m) => m.id);
          return initial.length ? initial : cleaned;
        }
      }
      return cleaned.length !== prev.length ? cleaned : prev;
    });
  }, [models]);

  useEffect(() => {
    if (!models.length) return;
    setSelectedCompareIds((prev) => {
      const availableIds = new Set(models.map((m) => m.id));
      const cleaned = prev.filter((id) => availableIds.has(id));
      return cleaned.length !== prev.length ? cleaned : prev;
    });
  }, [models]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (compareRef.current && !compareRef.current.contains(e.target as Node)) {
        setCompareDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const displayModels = useMemo(() => {
    const favoritesSet = new Set(favoriteIds);
    return models.map((model) => ({ ...model, isFavorite: favoritesSet.has(model.id) }));
  }, [models, favoriteIds]);

  const filteredModels = useMemo(() => {
    let filtered = [...displayModels];
    if (filterMode === 'favorites') filtered = filtered.filter((m) => m.isFavorite);
    if (provider !== 'all') filtered = filtered.filter((m) => m.provider === provider);
    if (tieredFilter === 'yes') filtered = filtered.filter((m) => m.isTieredPricing);
    else if (tieredFilter === 'no') filtered = filtered.filter((m) => !m.isTieredPricing);
    if (tierConditionFilter.trim()) {
      const kw = tierConditionFilter.toLowerCase().trim();
      filtered = filtered.filter((m) => m.tierCondition.toLowerCase().includes(kw));
    }
    if (search) {
      const kw = search.toLowerCase();
      filtered = filtered.filter((m) => [m.name, m.provider, m.tierCondition].some((f) => f.toLowerCase().includes(kw)));
    }
    if (sortField && sortDirection) {
      const dir = sortDirection === 'asc' ? 1 : -1;
      filtered.sort((a, b) => (getSortValue(a, sortField) - getSortValue(b, sortField)) * dir);
    }
    return filtered;
  }, [displayModels, filterMode, provider, tieredFilter, tierConditionFilter, search, sortField, sortDirection]);

  const toggleFavorite = (modelId: string) => {
    setFavoriteIds((prev) => prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]);
  };

  const handleAddCompareModel = (modelId: string) => {
    if (selectedCompareIds.length >= MAX_COMPARE) return;
    if (selectedCompareIds.includes(modelId)) return;
    setSelectedCompareIds((prev) => [...prev, modelId]);
    setCompareSearch('');
    setCompareDropdownOpen(false);
  };

  const handleRemoveCompareModel = (modelId: string) => {
    setSelectedCompareIds((prev) => prev.filter((id) => id !== modelId));
  };

  const compareSearchResults = useMemo(() => {
    let list = models;
    if (compareProviderFilter) {
      list = list.filter((m) => m.provider === compareProviderFilter);
    }
    if (compareSearch.trim()) {
      const kw = compareSearch.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(kw) || m.provider.toLowerCase().includes(kw));
    }
    return list;
  }, [models, compareSearch, compareProviderFilter]);

  const handleExport = () => {
    if (!filteredModels.length) return;
    const yesLabel = t('yes', lang);
    const noLabel = t('no', lang);
    const rows = [
      ['厂商', '模型名称', '是否阶梯计费', '阶梯计费条件', '输入', '输出', '收藏'],
      ...filteredModels.map((model) => [
        model.provider, model.name,
        model.isTieredPricing ? yesLabel : noLabel,
        model.tierCondition,
        formatCurrency(model.inputPrice, currency, lang),
        formatCurrency(model.outputPrice, currency, lang),
        model.isFavorite ? yesLabel : noLabel,
      ]),
    ];
    const csvContent = rows.map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_total.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const cheapestInput = useMemo(() => {
    if (!models.length) return null;
    return models.reduce((min, m) => m.inputPrice < min.inputPrice ? m : min, models[0]);
  }, [models]);

  const cheapestOutput = useMemo(() => {
    if (!models.length) return null;
    return models.reduce((min, m) => m.outputPrice < min.outputPrice ? m : min, models[0]);
  }, [models]);

  const lastUpdate = new Date('2026-06-11');
  const priceDecimals = unit === 'KTok' ? 5 : 2;

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

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 80px' }}>
        {activeTab === 'dashboard' && (
          <div className="animate-fadeIn">
            <KPIGroup>
              <KPIChip
                label={t('totalModels', lang)}
                value={formatNumber(models.length, lang)}
                subtitle={t('fromProviders', lang, { count: providers.length })}
              />
              <KPIChip
                label={t('cheapestInput', lang)}
                value={cheapestInput ? formatCurrency(convertPrice(cheapestInput.inputPrice, currency, unit), currency, lang, priceDecimals) : '-'}
                subtitle={cheapestInput ? `${cheapestInput.name} · ${cheapestInput.provider}` : ''}
              />
              <KPIChip
                label={t('cheapestOutput', lang)}
                value={cheapestOutput ? formatCurrency(convertPrice(cheapestOutput.outputPrice, currency, unit), currency, lang, priceDecimals) : '-'}
                subtitle={cheapestOutput ? `${cheapestOutput.name} · ${cheapestOutput.provider}` : ''}
              />
              <KPIChip
                label={t('lastUpdate', lang)}
                value={formatDate(lastUpdate, lang)}
              />
            </KPIGroup>

            <div className="space-y-4">
              <FiltersBar
                providers={providers}
                provider={provider}
                onProviderChange={setProvider}
                tieredFilter={tieredFilter}
                onTieredFilterChange={setTieredFilter}
                tierConditionFilter={tierConditionFilter}
                onTierConditionFilterChange={setTierConditionFilter}
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
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="animate-fadeIn">
            {/* Model selector */}
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                  {t('selectModelsToCompare', lang)}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
                  {t('maxCompareHint', lang, { max: MAX_COMPARE })}
                </p>
              </div>

              {/* Search input */}
              <div ref={compareRef} style={{ position: 'relative', marginBottom: 16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder={t('searchAndAddModel', lang)}
                  value={compareSearch}
                  onChange={(e) => { setCompareSearch(e.target.value); setCompareDropdownOpen(true); }}
                  onFocus={() => setCompareDropdownOpen(true)}
                  style={{
                    width: '100%', padding: '10px 14px 10px 40px',
                    border: '1px solid var(--border)', borderRadius: 10,
                    fontSize: 13, fontFamily: 'inherit', color: 'var(--foreground)',
                    background: 'var(--muted)', transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />

                {compareDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)', zIndex: 50,
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '10px 12px 6px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                      {providers.map((p) => (
                        <button
                          key={p}
                          onClick={(e) => { e.stopPropagation(); setCompareProviderFilter(compareProviderFilter === p ? null : p); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontSize: 11, fontWeight: 500, fontFamily: 'inherit',
                            background: compareProviderFilter === p ? getProviderColor(p) : 'var(--muted)',
                            color: compareProviderFilter === p ? '#fff' : 'var(--muted-foreground)',
                            transition: 'all 0.12s',
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: compareProviderFilter === p ? '#fff' : getProviderColor(p), display: 'inline-block' }} />
                          {p}
                        </button>
                      ))}
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {compareSearchResults.filter((m) => !selectedCompareIds.includes(m.id)).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleAddCompareModel(m.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', border: 'none', background: 'transparent',
                          cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div className="provider-dot" style={{ background: getProviderColor(m.provider) }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{m.provider}</div>
                        </div>
                      </button>
                    ))}
                    {compareSearchResults.filter((m) => !selectedCompareIds.includes(m.id)).length === 0 && (
                      <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>
                        {t('noModelsFound', lang)}
                      </div>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected pills */}
              {selectedCompareIds.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedCompareIds.map((id) => {
                    const m = models.find((mod) => mod.id === id);
                    if (!m) return null;
                    return (
                      <div key={id} className="compare-pill">
                        <div className="provider-dot" style={{ background: getProviderColor(m.provider), width: 8, height: 8 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--foreground)' }}>{m.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: -2 }}>{m.provider}</span>
                        <span
                          onClick={() => handleRemoveCompareModel(id)}
                          style={{ color: '#C4C4C4', cursor: 'pointer', marginLeft: 4, fontSize: 14, lineHeight: 1 }}
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Horizontal bar charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16, marginTop: 16 }}>
              <ComparisonChart models={models} selectedModels={selectedCompareIds} type="input" currency={currency} unit={unit} lang={lang} />
              <ComparisonChart models={models} selectedModels={selectedCompareIds} type="output" currency={currency} unit={unit} lang={lang} />
            </div>

            {/* Detail comparison table */}
            {selectedCompareIds.length > 0 && (
              <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginTop: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--foreground)', marginBottom: 18 }}>
                  {t('detailComparison', lang)}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 500 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px 0', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>{t('modelName', lang)}</th>
                        <th style={{ padding: '10px 0', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>{t('supplier', lang)}</th>
                        <th style={{ padding: '10px 0', textAlign: 'right', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>{t('officialInputPrice', lang)}</th>
                        <th style={{ padding: '10px 0', textAlign: 'right', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>{t('officialOutputPrice', lang)}</th>
                        <th style={{ padding: '10px 0', textAlign: 'right', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>{t('ratio', lang)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCompareIds.map((id) => {
                        const m = models.find((mod) => mod.id === id);
                        if (!m) return null;
                        const inputP = convertPrice(m.inputPrice, currency, unit);
                        const outputP = convertPrice(m.outputPrice, currency, unit);
                        const ratio = inputP > 0 ? (outputP / inputP).toFixed(1) + 'x' : '-';
                        return (
                          <tr key={id} style={{ borderBottom: '1px solid var(--muted)' }}>
                            <td style={{ padding: '12px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="provider-dot" style={{ background: getProviderColor(m.provider), width: 6, height: 6 }} />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 0', fontSize: 12, color: 'var(--muted-foreground)' }}>{m.provider}</td>
                            <td className="font-mono-jet" style={{ padding: '12px 0', textAlign: 'right', fontSize: 12 }}>
                              {formatCurrency(inputP, currency, lang, priceDecimals)}
                            </td>
                            <td className="font-mono-jet" style={{ padding: '12px 0', textAlign: 'right', fontSize: 12 }}>
                              {formatCurrency(outputP, currency, lang, priceDecimals)}
                            </td>
                            <td className="font-mono-jet" style={{ padding: '12px 0', textAlign: 'right', fontSize: 12, color: 'var(--muted-foreground)' }}>
                              {ratio}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="animate-fadeIn">
            <CalculatorPanel models={models} currency={currency} unit={unit} lang={lang} />
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="animate-fadeIn">
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                    {t('communityRatings', lang)}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
                    {t('communityRatingsDesc', lang)}
                  </p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 20, background: '#FFFBEB', color: '#B45309', letterSpacing: '0.02em' }}>
                  {t('inDevelopment', lang)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
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

      <div style={{ position: 'fixed', bottom: 14, right: 24, fontSize: 10, color: '#D4D4D8', pointerEvents: 'none', letterSpacing: '0.02em' }}>
        developed by 白濯
      </div>
    </div>
  );
}
