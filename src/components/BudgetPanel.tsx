import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import type { PricingModel } from "../data/types";
import {
  convertPrice,
  getTokenDivisor,
  type SupportedCurrency,
  type TokenUnit,
} from "../utils/pricing";
import { t, formatCurrency, formatNumber, type Language } from "./i18n";

type BudgetPanelProps = {
  models: PricingModel[];
  currency: SupportedCurrency;
  unit: TokenUnit;
  lang: Language;
};

export function BudgetPanel({ models, currency, unit, lang }: BudgetPanelProps) {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [dailyCalls, setDailyCalls] = useState<string>('1000');
  const [avgInput, setAvgInput] = useState<string>('500');
  const [avgOutput, setAvgOutput] = useState<string>('300');
  const [result, setResult] = useState<{ daily: number; monthly: number; costPerCall: number } | null>(null);

  const computeBudget = () => {
    const model = models.find((m) => m.id === selectedModel);
    if (!model) return null;

    const calls = parseFloat(dailyCalls) || 0;
    const input = parseFloat(avgInput) || 0;
    const output = parseFloat(avgOutput) || 0;

    const divisor = getTokenDivisor(unit);
    const inputPrice = convertPrice(model.inputPrice, currency, unit);
    const outputPrice = convertPrice(model.outputPrice, currency, unit);
    const inputCost = (input / divisor) * inputPrice;
    const outputCost = (output / divisor) * outputPrice;
    const costPerCall = inputCost + outputCost;

    const daily = costPerCall * calls;
    const monthly = daily * 30;

    return { daily, monthly, costPerCall };
  };

  const handleEstimate = () => {
    const budget = computeBudget();
    setResult(budget);
  };

  useEffect(() => {
    if (!result) return;
    const budget = computeBudget();
    setResult(budget);
  }, [currency, unit]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition-colors">
      <h3 className="text-lg mb-6">{t('budgetEstimator', lang)}</h3>
      
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
          <Label>{t('requestsPerDay', lang)}</Label>
          <Input
            type="number"
            value={dailyCalls}
            onChange={(e) => {
              setDailyCalls(e.target.value);
              setResult(null);
            }}
            placeholder="1000"
            className="border-border"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('avgInputTokens', lang)}</Label>
          <Input
            type="number"
            value={avgInput}
            onChange={(e) => {
              setAvgInput(e.target.value);
              setResult(null);
            }}
            placeholder="500"
            className="border-border"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('avgOutputTokens', lang)}</Label>
          <Input
            type="number"
            value={avgOutput}
            onChange={(e) => {
              setAvgOutput(e.target.value);
              setResult(null);
            }}
            placeholder="300"
            className="border-border"
          />
        </div>

        <Button
          onClick={handleEstimate}
          disabled={!selectedModel}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {t('calculateBudget', lang)}
        </Button>

        {result !== null && (
          <div className="mt-6 space-y-3">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-sm text-muted-foreground mb-1">{t('costPerRequest', lang)}</p>
              <p className="text-xl">{formatCurrency(result.costPerCall, currency, lang)}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#FFB86B]/10 border border-[#FFB86B]/30">
              <p className="text-sm text-muted-foreground mb-1">{t('estimatedMonthlyCost', lang)}</p>
              <p className="text-2xl">{formatCurrency(result.monthly, currency, lang)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('totalRequests', lang)}: {formatNumber(parseFloat(dailyCalls) * 30, lang)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
