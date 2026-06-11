import { useState, useEffect, useMemo, useRef } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { BookmarkPlus, FileText, Trash2, X } from "lucide-react";
import type { PricingModel } from "../data/types";
import {
  convertPrice,
  getTokenDivisor,
  type SupportedCurrency,
  type TokenUnit,
} from "../utils/pricing";
import {
  estimateTokensHeuristic,
  estimateTokensWithDeepSeekRule,
} from "../utils/deepseekTokenizer";
import { t, formatCurrency, formatNumber, type Language } from "./i18n";
import { getProviderColor } from "../utils/providerColors";

type CalculatorPanelProps = {
  models: PricingModel[];
  currency: SupportedCurrency;
  unit: TokenUnit;
  lang: Language;
};

type SavedResult = {
  id: string;
  modelId: string;
  modelName: string;
  provider: string;
  perCall: number;
  monthly: number;
  matchedTierCondition: string | null;
};

type TierRange = {
  lowerExclusive: number;
  upperInclusive: number | null;
};

function parseTokenBound(value: string, unit: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return Number.NaN;

  const normalizedUnit = unit.toUpperCase();
  if (normalizedUnit === "M") return parsed * 1_000_000;
  if (normalizedUnit === "K") return parsed * 1_000;
  if (parsed === 0) return 0;
  return parsed * 1_000;
}

function parseTierRange(condition: string): TierRange | null {
  if (!condition) return null;
  const compact = condition.replace(/\s+/g, "");

  const boundedMatch = compact.match(/^(\d+(?:\.\d+)?)([kKmM]?)<Token≤(\d+(?:\.\d+)?)([kKmM]?)$/i);
  if (boundedMatch) {
    const [, lowerValue, lowerUnitRaw, upperValue, upperUnitRaw] = boundedMatch;
    const lower = parseTokenBound(lowerValue, lowerUnitRaw || "");
    const upper = parseTokenBound(upperValue, upperUnitRaw || "");
    if (Number.isFinite(lower) && Number.isFinite(upper)) {
      return { lowerExclusive: lower, upperInclusive: upper };
    }
    return null;
  }

  const openMatch = compact.match(/^(\d+(?:\.\d+)?)([kKmM]?)<Token$/i);
  if (openMatch) {
    const [, lowerValue, lowerUnitRaw] = openMatch;
    const lower = parseTokenBound(lowerValue, lowerUnitRaw || "");
    if (Number.isFinite(lower)) {
      return { lowerExclusive: lower, upperInclusive: null };
    }
  }

  return null;
}

function getApplicableTier(model: PricingModel, inputTokensCount: number): PricingModel["tiers"][number] | null {
  if (!model.isTieredPricing || model.tiers.length === 0) return null;

  let firstTier: PricingModel["tiers"][number] | null = null;
  let firstRangeTier: PricingModel["tiers"][number] | null = null;
  let firstRangeLower = 0;
  let lastRangeTier: PricingModel["tiers"][number] | null = null;

  for (const tier of model.tiers) {
    if (!firstTier) firstTier = tier;

    const range = parseTierRange(tier.condition);
    if (!range) continue;
    if (!firstRangeTier) {
      firstRangeTier = tier;
      firstRangeLower = range.lowerExclusive;
    }
    lastRangeTier = tier;

    const inLowerBound = inputTokensCount > range.lowerExclusive;
    const inUpperBound = range.upperInclusive === null || inputTokensCount <= range.upperInclusive;
    if (inLowerBound && inUpperBound) {
      return tier;
    }
  }

  if (firstRangeTier && inputTokensCount <= firstRangeLower) {
    return firstRangeTier;
  }

  return lastRangeTier ?? firstTier;
}

function formatPerCallCurrency(amount: number, currency: SupportedCurrency, lang: Language): string {
  if (amount > 0 && amount < 0.01) {
    if (currency === "CNY") return "￥<0.01";
    if (currency === "USD") return "$<0.01";
    if (currency === "EUR") return "€<0.01";
  }
  return formatCurrency(amount, currency, lang);
}

export function CalculatorPanel({ models, currency, unit, lang }: CalculatorPanelProps) {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [pastedContent, setPastedContent] = useState<string>('');
  const [inputTokens, setInputTokens] = useState<string>('1000');
  const [outputTokens, setOutputTokens] = useState<string>('500');
  const [callsPerMonth, setCallsPerMonth] = useState<string>('1000');
  const [detectedTokens, setDetectedTokens] = useState<number>(0);
  const [result, setResult] = useState<{ perCall: number; monthly: number; matchedTierCondition: string | null } | null>(null);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);

  const [modelSearch, setModelSearch] = useState('');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [modelProviderFilter, setModelProviderFilter] = useState<string | null>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  const calcProviders = useMemo(() => [...new Set(models.map((m) => m.provider))], [models]);

  const modelSearchResults = useMemo(() => {
    let list = models;
    if (modelProviderFilter) {
      list = list.filter((m) => m.provider === modelProviderFilter);
    }
    if (modelSearch.trim()) {
      const kw = modelSearch.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(kw) || m.provider.toLowerCase().includes(kw));
    }
    return list;
  }, [models, modelSearch, modelProviderFilter]);

  const selectedModelObj = useMemo(() => models.find((m) => m.id === selectedModel), [models, selectedModel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const computeCosts = () => {
    const model = models.find((m) => m.id === selectedModel);
    if (!model) return null;

    const input = parseFloat(inputTokens) || 0;
    const output = parseFloat(outputTokens) || 0;
    const calls = parseFloat(callsPerMonth) || 0;
    const divisor = getTokenDivisor(unit);

    const matchedTier = getApplicableTier(model, input);
    const rawInputPrice = matchedTier?.inputPrice ?? model.inputPrice;
    const rawOutputPrice = matchedTier?.outputPrice ?? model.outputPrice;

    const inputPrice = convertPrice(rawInputPrice, currency, unit);
    const outputPrice = convertPrice(rawOutputPrice, currency, unit);

    const inputCost = (input / divisor) * inputPrice;
    const outputCost = (output / divisor) * outputPrice;
    const perCallCost = inputCost + outputCost;
    const monthlyCost = perCallCost * calls;

    return {
      perCall: perCallCost,
      monthly: monthlyCost,
      matchedTierCondition: matchedTier?.condition?.trim() ? matchedTier.condition : null,
    };
  };

  const handleCalculate = () => {
    const costs = computeCosts();
    setResult(costs);
  };

  useEffect(() => {
    if (!result) return;
    const costs = computeCosts();
    setResult(costs);
  }, [currency, unit]);

  useEffect(() => {
    let cancelled = false;
    const content = pastedContent;

    if (!content) {
      setDetectedTokens(0);
      return undefined;
    }

    const detect = async () => {
      try {
        const count = await estimateTokensWithDeepSeekRule(content);
        if (!cancelled) {
          setDetectedTokens(count);
        }
      } catch {
        if (!cancelled) {
          setDetectedTokens(estimateTokensHeuristic(content));
        }
      }
    };

    detect();
    return () => {
      cancelled = true;
    };
  }, [pastedContent]);

  const handleSaveResult = () => {
    if (!result || !selectedModel) return;
    const model = models.find((m) => m.id === selectedModel);
    if (!model) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSavedResults((prev) => [
      ...prev,
      {
        id,
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        perCall: result.perCall,
        monthly: result.monthly,
        matchedTierCondition: result.matchedTierCondition,
      },
    ]);
  };

  const handleRemoveSaved = (id: string) => {
    setSavedResults((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearSaved = () => {
    setSavedResults([]);
  };

  const totalPerCall = savedResults.reduce((sum, item) => sum + item.perCall, 0);
  const totalMonthly = savedResults.reduce((sum, item) => sum + item.monthly, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16, alignItems: 'start' }}>
      {/* Left: Calculator form */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 20, color: 'var(--foreground)' }}>
          {t('singleRequestCalculator', lang)}
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('model', lang)}</Label>
            <div ref={modelPickerRef} style={{ position: 'relative' }}>
              {selectedModelObj && !modelDropdownOpen ? (
                <button
                  type="button"
                  onClick={() => { setModelDropdownOpen(true); setModelSearch(''); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 10,
                    background: 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <div className="provider-dot" style={{ background: getProviderColor(selectedModelObj.provider) }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedModelObj.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{selectedModelObj.provider}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" style={{ marginLeft: 'auto' }}><path d="M6 9l6 6 6-6"/></svg>
                </button>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t('searchModels', lang)}
                    value={modelSearch}
                    onChange={(e) => { setModelSearch(e.target.value); setModelDropdownOpen(true); }}
                    onFocus={() => setModelDropdownOpen(true)}
                    autoFocus={modelDropdownOpen}
                    style={{
                      width: '100%', padding: '9px 14px 9px 38px',
                      border: '1px solid var(--border)', borderRadius: 10,
                      fontSize: 13, fontFamily: 'inherit', color: 'var(--foreground)',
                      background: 'var(--muted)', transition: 'border-color 0.15s',
                    }}
                  />
                </>
              )}

              {modelDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)', zIndex: 50,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '10px 12px 6px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                    {calcProviders.map((p) => (
                      <button
                        key={p}
                        onClick={(e) => { e.stopPropagation(); setModelProviderFilter(modelProviderFilter === p ? null : p); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                          fontSize: 11, fontWeight: 500, fontFamily: 'inherit',
                          background: modelProviderFilter === p ? getProviderColor(p) : 'var(--muted)',
                          color: modelProviderFilter === p ? '#fff' : 'var(--muted-foreground)',
                          transition: 'all 0.12s',
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: modelProviderFilter === p ? '#fff' : getProviderColor(p), display: 'inline-block' }} />
                        {p}
                      </button>
                    ))}
                  </div>
                  <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {modelSearchResults.length === 0 ? (
                    <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>
                      {t('noModelsFound', lang)}
                    </div>
                  ) : modelSearchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setResult(null);
                        setModelSearch('');
                        setModelDropdownOpen(false);
                      }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 14px', border: 'none', background: m.id === selectedModel ? 'var(--muted)' : 'transparent',
                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = m.id === selectedModel ? 'var(--muted)' : 'transparent'; }}
                    >
                      <div className="provider-dot" style={{ background: getProviderColor(m.provider) }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{m.provider}</div>
                      </div>
                    </button>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Label>{t('pasteContent', lang)}</Label>
            </div>
            <Textarea
              value={pastedContent}
              onChange={(e) => {
                setPastedContent(e.target.value);
                setResult(null);
              }}
              placeholder={t('pasteContentPlaceholder', lang)}
              className="border-border min-h-[100px] resize-y font-mono text-sm"
              style={{ borderRadius: 10 }}
            />
            {pastedContent && (
              <p className="text-xs text-muted-foreground">
                {t('tokensDetected', lang, { count: formatNumber(detectedTokens, lang) })}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('inputTokens', lang)}</Label>
              <Input
                type="number"
                value={inputTokens}
                onChange={(e) => { setInputTokens(e.target.value); setResult(null); }}
                placeholder="1000"
                className="border-border"
                style={{ borderRadius: 10 }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('outputTokens', lang)}</Label>
              <Input
                type="number"
                value={outputTokens}
                onChange={(e) => { setOutputTokens(e.target.value); setResult(null); }}
                placeholder="500"
                className="border-border"
                style={{ borderRadius: 10 }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('callsPerMonth', lang)}</Label>
            <Input
              type="number"
              value={callsPerMonth}
              onChange={(e) => { setCallsPerMonth(e.target.value); setResult(null); }}
              placeholder="1000"
              className="border-border"
              style={{ borderRadius: 10 }}
            />
          </div>

          <button
            onClick={handleCalculate}
            disabled={!selectedModel}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 10,
              background: selectedModel ? 'var(--color-brand-primary)' : 'var(--muted)',
              color: selectedModel ? '#fff' : 'var(--muted-foreground)',
              border: 'none', cursor: selectedModel ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
          >
            {t('calculateBudget', lang)}
          </button>

          {result && selectedModel && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <div style={{
                padding: 16, borderRadius: 12,
                background: 'color-mix(in srgb, var(--color-brand-primary) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-brand-primary) 20%, transparent)',
              }}>
                <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4 }}>{t('perCallCost', lang)}</p>
                <p className="font-mono-jet" style={{ fontSize: 22, fontWeight: 600, color: 'var(--foreground)' }}>
                  {formatPerCallCurrency(result.perCall, currency, lang)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 6 }}>
                  {t('basedOnTokens', lang, {
                    input: formatNumber(parseFloat(inputTokens) || 0, lang),
                    output: formatNumber(parseFloat(outputTokens) || 0, lang),
                  })}
                </p>
                {result.matchedTierCondition && (
                  <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    {t('matchedTier', lang)}: {result.matchedTierCondition}
                  </p>
                )}
              </div>

              <div style={{
                padding: 16, borderRadius: 12,
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4 }}>{t('monthlyEstimate', lang)}</p>
                <p className="font-mono-jet" style={{ fontSize: 22, fontWeight: 600, color: 'var(--foreground)' }}>
                  {formatCurrency(result.monthly, currency, lang)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 6 }}>
                  {t('basedOnCalls', lang, { calls: formatNumber(parseFloat(callsPerMonth) || 0, lang) })}
                </p>
              </div>

              <button
                onClick={handleSaveResult}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 10,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--foreground)', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'border-color 0.15s',
                }}
              >
                <BookmarkPlus style={{ width: 14, height: 14 }} />
                {t('saveCalculation', lang)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Saved results */}
      <div style={{
        background: 'var(--card)', borderRadius: 16, padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        border: '1px dashed var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{t('savedCalculations', lang)}</p>
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{t('savedCalculationsDesc', lang)}</p>
          </div>
          {savedResults.length > 0 && (
            <button
              onClick={handleClearSaved}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#EF4444', fontSize: 12, fontFamily: 'inherit',
              }}
            >
              <Trash2 style={{ width: 13, height: 13 }} />
              {t('clearAll', lang)}
            </button>
          )}
        </div>

        {savedResults.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', padding: '32px 0' }}>
            {t('noSavedCalculations', lang)}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {savedResults.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: 12, borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--background)',
                }}
              >
                <div className="provider-dot" style={{ background: getProviderColor(item.provider), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{item.modelName}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{item.provider}</p>
                  {item.matchedTierCondition && (
                    <p style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
                      {t('matchedTier', lang)}: {item.matchedTierCondition}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p className="font-mono-jet" style={{ fontSize: 13, fontWeight: 500 }}>
                    {formatPerCallCurrency(item.perCall, currency, lang)}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>
                    {t('monthlyEstimate', lang)}: {formatCurrency(item.monthly, currency, lang)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveSaved(item.id)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--muted-foreground)', padding: 4,
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))}

            <div style={{
              padding: 12, borderRadius: 10,
              background: 'var(--muted)', fontSize: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{t('savedTotals', lang)}</span>
                <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{t('savedTotalsDesc', lang)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                <span>{t('totalPerCallCost', lang)}</span>
                <span className="font-mono-jet">{formatPerCallCurrency(totalPerCall, currency, lang)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span>{t('totalMonthlyCost', lang)}</span>
                <span className="font-mono-jet">{formatCurrency(totalMonthly, currency, lang)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
