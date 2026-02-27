import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
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
    <div className="rounded-2xl border border-border bg-card p-6 transition-colors">
      <h3 className="text-lg mb-6">{t('singleRequestCalculator', lang)}</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('model', lang)}</Label>
          <Select
            value={selectedModel}
            onValueChange={(value) => {
              setSelectedModel(value);
              setResult(null);
            }}
          >
            <SelectTrigger className="border-border">
              <SelectValue placeholder={t('selectModel', lang)} />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            className="border-border min-h-[120px] resize-y font-mono text-sm"
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
              onChange={(e) => {
                setInputTokens(e.target.value);
                setResult(null);
              }}
              placeholder="1000"
              className="border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('outputTokens', lang)}</Label>
            <Input
              type="number"
              value={outputTokens}
              onChange={(e) => {
                setOutputTokens(e.target.value);
                setResult(null);
              }}
              placeholder="500"
              className="border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('callsPerMonth', lang)}</Label>
          <Input
            type="number"
            value={callsPerMonth}
            onChange={(e) => {
              setCallsPerMonth(e.target.value);
              setResult(null);
            }}
            placeholder="1000"
            className="border-border"
          />
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!selectedModel}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {t('calculateBudget', lang)}
        </Button>

        {result && selectedModel && (
          <div className="mt-6 space-y-3">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-muted-foreground mb-1">{t('perCallCost', lang)}</p>
              <p className="text-2xl">{formatPerCallCurrency(result.perCall, currency, lang)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('basedOnTokens', lang, {
                  input: formatNumber(parseFloat(inputTokens) || 0, lang),
                  output: formatNumber(parseFloat(outputTokens) || 0, lang),
                })}
              </p>
              {result.matchedTierCondition && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('matchedTier', lang)}: {result.matchedTierCondition}
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-sm text-muted-foreground mb-1">{t('monthlyEstimate', lang)}</p>
              <p className="text-2xl">{formatCurrency(result.monthly, currency, lang)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('basedOnCalls', lang, { calls: formatNumber(parseFloat(callsPerMonth) || 0, lang) })}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleSaveResult}
              className="w-full gap-2 border-border"
            >
              <BookmarkPlus className="h-4 w-4" />
              {t('saveCalculation', lang)}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border/80 bg-background/40 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{t('savedCalculations', lang)}</p>
            <p className="text-xs text-muted-foreground">{t('savedCalculationsDesc', lang)}</p>
          </div>
          {savedResults.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive"
              onClick={handleClearSaved}
            >
              <Trash2 className="h-4 w-4" />
              {t('clearAll', lang)}
            </Button>
          )}
        </div>

        {savedResults.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noSavedCalculations', lang)}</p>
        ) : (
          <div className="space-y-3">
            {savedResults.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/70 p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.modelName}</p>
                  <p className="text-xs text-muted-foreground">{item.provider}</p>
                  {item.matchedTierCondition && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('matchedTier', lang)}: {item.matchedTierCondition}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">
                    {formatPerCallCurrency(item.perCall, currency, lang)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('monthlyEstimate', lang)}: {formatCurrency(item.monthly, currency, lang)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveSaved(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('savedTotals', lang)}</span>
                <span className="text-xs text-muted-foreground">{t('savedTotalsDesc', lang)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>{t('totalPerCallCost', lang)}</span>
                <span className="font-mono">{formatPerCallCurrency(totalPerCall, currency, lang)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>{t('totalMonthlyCost', lang)}</span>
                <span className="font-mono">{formatCurrency(totalMonthly, currency, lang)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
