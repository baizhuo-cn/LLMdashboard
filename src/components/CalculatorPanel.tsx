import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";
import type { PricingModel } from '../data/types';
import { convertPrice, getTokenDivisor, type SupportedCurrency, type TokenUnit } from '../utils/pricing';
import { t, formatCurrency, formatNumber, type Language } from './i18n';

type CalculatorPanelProps = {
  models: PricingModel[];
  currency: SupportedCurrency;
  unit: TokenUnit;
  lang: Language;
};

export function CalculatorPanel({ models, currency, unit, lang }: CalculatorPanelProps) {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [pastedContent, setPastedContent] = useState<string>('');
  const [inputTokens, setInputTokens] = useState<string>('1000');
  const [outputTokens, setOutputTokens] = useState<string>('500');
  const [callsPerMonth, setCallsPerMonth] = useState<string>('1000');
  const [result, setResult] = useState<{ perCall: number; monthly: number } | null>(null);

  // Estimate tokens from pasted content (1 token ≈ 4 chars)
  const estimateTokens = (text: string): number => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  };

  // Update input tokens when content is pasted
  useEffect(() => {
    if (pastedContent) {
      const tokens = estimateTokens(pastedContent);
      setInputTokens(tokens.toString());
      setResult(null);
    }
  }, [pastedContent]);

  const computeCosts = () => {
    const model = models.find((m) => m.id === selectedModel);
    if (!model) return null;

    const input = parseFloat(inputTokens) || 0;
    const output = parseFloat(outputTokens) || 0;
    const calls = parseFloat(callsPerMonth) || 0;
    const divisor = getTokenDivisor(unit);

    const inputPrice = convertPrice(model.inputPrice, currency, unit);
    const outputPrice = convertPrice(model.outputPrice, currency, unit);

    const inputCost = (input / divisor) * inputPrice;
    const outputCost = (output / divisor) * outputPrice;
    const perCallCost = inputCost + outputCost;
    const monthlyCost = perCallCost * calls;

    return { perCall: perCallCost, monthly: monthlyCost };
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
              {t('tokensDetected', lang, { count: formatNumber(estimateTokens(pastedContent), lang) })}
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
              <p className="text-2xl">{formatCurrency(result.perCall, currency, lang)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('basedOnTokens', lang, {
                  input: formatNumber(parseFloat(inputTokens) || 0, lang),
                  output: formatNumber(parseFloat(outputTokens) || 0, lang),
                })}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-sm text-muted-foreground mb-1">{t('monthlyEstimate', lang)}</p>
              <p className="text-2xl">{formatCurrency(result.monthly, currency, lang)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('basedOnCalls', lang, { calls: formatNumber(parseFloat(callsPerMonth) || 0, lang) })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
