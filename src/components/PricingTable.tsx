import { ArrowUpDown, ArrowUp, ArrowDown, Heart } from "lucide-react";
import type { PricingModel } from "../data/types";
import {
  convertPrice,
  getUnitLabelKey,
  type SupportedCurrency,
  type TokenUnit,
} from "../utils/pricing";
import { t, formatCurrency, type Language } from "./i18n";

export type SortField =
  | "inputPrice"
  | "outputPrice";
export type SortDirection = "asc" | "desc" | null;

type PricingTableProps = {
  models: PricingModel[];
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  currency: SupportedCurrency;
  unit: TokenUnit;
  onToggleFavorite: (modelId: string) => void;
  lang: Language;
};

export function PricingTable({ models, sortField, sortDirection, onSort, currency, unit, onToggleFavorite, lang }: PricingTableProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    if (sortDirection === "asc") return <ArrowUp className="ml-1 h-3 w-3" />;
    if (sortDirection === "desc") return <ArrowDown className="ml-1 h-3 w-3" />;
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  };

  const priceUnit = t(getUnitLabelKey(unit), lang);
  const priceDecimals = unit === "KTok" ? 5 : 2;

  const renderPrice = (price: number) =>
    formatCurrency(convertPrice(price, currency, unit), currency, lang, priceDecimals);

  const renderTiered = (model: PricingModel) =>
    model.isTieredPricing ? t("yes", lang) : t("no", lang);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-colors">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30 transition-colors">
            <tr>
              <th className="w-[220px] px-6 py-4 text-left">
                <span className="text-sm text-muted-foreground">{t("modelName", lang)}</span>
              </th>
              <th className="w-[130px] px-6 py-4 text-center">
                <span className="text-sm text-muted-foreground">{t("tieredPricing", lang)}</span>
              </th>
              <th className="min-w-[250px] px-6 py-4 text-left">
                <span className="text-sm text-muted-foreground">{t("tierCondition", lang)}</span>
              </th>
              <th className="w-[150px] px-6 py-4 text-right">
                <button
                  onClick={() => onSort("inputPrice")}
                  className="ml-auto flex items-center justify-end text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("officialInputPrice", lang)}
                  <SortIcon field="inputPrice" />
                </button>
              </th>
              <th className="w-[150px] px-6 py-4 text-right">
                <button
                  onClick={() => onSort("outputPrice")}
                  className="ml-auto flex items-center justify-end text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("officialOutputPrice", lang)}
                  <SortIcon field="outputPrice" />
                </button>
              </th>
              <th className="w-[80px] px-6 py-4 text-center">
                <span className="text-sm text-muted-foreground">{t("isFavorite", lang)}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {models.flatMap((model) => {
              const tiers = model.tiers.length
                ? model.tiers
                : [{ condition: "", inputPrice: model.inputPrice, outputPrice: model.outputPrice }];

              return tiers.map((tier, index) => (
                <tr
                  key={`${model.id}-${index}`}
                  className="border-b border-border transition-colors hover:bg-muted/20"
                >
                  {index === 0 && (
                    <td rowSpan={tiers.length} className="px-6 py-4 align-top">
                      <div>
                        <div>{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.provider}</div>
                      </div>
                    </td>
                  )}
                  {index === 0 && (
                    <td rowSpan={tiers.length} className="px-6 py-4 text-center text-sm align-top">
                      {renderTiered(model)}
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {tier.condition || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-mono">{renderPrice(tier.inputPrice)}</div>
                    <div className="text-xs text-muted-foreground">{priceUnit}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-mono">{renderPrice(tier.outputPrice)}</div>
                    <div className="text-xs text-muted-foreground">{priceUnit}</div>
                  </td>
                  {index === 0 && (
                    <td rowSpan={tiers.length} className="px-6 py-4 text-center align-top">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(model.id)}
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          model.isFavorite
                            ? "bg-destructive-soft text-destructive"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        }`}
                        aria-label={model.isFavorite ? "Remove favorite" : "Add favorite"}
                        aria-pressed={model.isFavorite}
                      >
                        <Heart
                          className="h-4 w-4 transition-colors"
                          strokeWidth={model.isFavorite ? 0 : 2}
                          stroke={model.isFavorite ? "none" : "currentColor"}
                          fill={model.isFavorite ? "currentColor" : "none"}
                        />
                      </button>
                    </td>
                  )}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {models.map((model) => (
          <div
            key={`${model.id}-card`}
            className="space-y-3 rounded-xl border border-border bg-background/40 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-base font-semibold leading-tight">{model.name}</div>
                <div className="text-xs text-muted-foreground">{model.provider}</div>
              </div>
              <button
                type="button"
                onClick={() => onToggleFavorite(model.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                  model.isFavorite
                    ? "border-destructive/40 bg-destructive-soft text-destructive"
                    : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                aria-label={model.isFavorite ? "Remove favorite" : "Add favorite"}
                aria-pressed={model.isFavorite}
              >
                <Heart
                  className="h-4 w-4"
                  strokeWidth={model.isFavorite ? 0 : 2}
                  stroke={model.isFavorite ? "none" : "currentColor"}
                  fill={model.isFavorite ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1">
                {t("tieredPricing", lang)}: {renderTiered(model)}
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              {(model.tiers.length
                ? model.tiers
                : [{ condition: "", inputPrice: model.inputPrice, outputPrice: model.outputPrice }]
              ).map((tier, index) => (
                <div
                  key={`${model.id}-tier-${index}`}
                  className={`grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 p-3 text-xs ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="text-muted-foreground break-all">{tier.condition || "-"}</div>
                  <div className="font-mono">{renderPrice(tier.inputPrice)}</div>
                  <div className="font-mono">{renderPrice(tier.outputPrice)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
