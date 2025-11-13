import { ArrowUpDown, ArrowUp, ArrowDown, Star, Heart } from "lucide-react";
import type { PricingModel } from "../data/types";
import {
  convertPrice,
  getUnitLabelKey,
  type SupportedCurrency,
  type TokenUnit,
} from "../utils/pricing";
import { t, formatCurrency, type Language } from "./i18n";

export type SortField =
  | "name"
  | "inputPrice"
  | "outputPrice"
  | "description"
  | "temperatureRange"
  | "defaultTemperature";
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

const getSortableValue = (model: PricingModel, field: SortField): string | number => {
  switch (field) {
    case "name":
      return model.name;
    case "inputPrice":
      return model.inputPrice;
    case "outputPrice":
      return model.outputPrice;
    case "description":
      return model.description;
    case "temperatureRange":
      return model.temperatureRange;
    case "defaultTemperature":
      return model.defaultTemperature ?? Number.NEGATIVE_INFINITY;
    default:
      return "";
  }
};

export function PricingTable({ models, sortField, sortDirection, onSort, currency, unit, onToggleFavorite, lang }: PricingTableProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    if (sortDirection === "asc") return <ArrowUp className="h-3 w-3 ml-1" />;
    if (sortDirection === "desc") return <ArrowDown className="h-3 w-3 ml-1" />;
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
  };

  const priceUnit = t(getUnitLabelKey(unit), lang);
  const priceDecimals = unit === "KTok" ? 5 : 2;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30 transition-colors">
            <tr>
              <th className="px-6 py-4 text-left w-[200px]">
                <button
                  onClick={() => onSort("name")}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("modelName", lang)}
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-6 py-4 text-right w-[160px]">
                <button
                  onClick={() => onSort("inputPrice")}
                  className="flex items-center justify-end text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  {t("officialInputPrice", lang)}
                  <SortIcon field="inputPrice" />
                </button>
              </th>
              <th className="px-6 py-4 text-right w-[160px]">
                <button
                  onClick={() => onSort("outputPrice")}
                  className="flex items-center justify-end text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  {t("officialOutputPrice", lang)}
                  <SortIcon field="outputPrice" />
                </button>
              </th>
              <th className="px-6 py-4 text-left min-w-[250px]">
                <button
                  onClick={() => onSort("description")}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("description", lang)}
                  <SortIcon field="description" />
                </button>
              </th>
              <th className="px-6 py-4 text-center w-[120px]">
                <button
                  onClick={() => onSort("temperatureRange")}
                  className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                >
                  {t("temperatureRange", lang)}
                  <SortIcon field="temperatureRange" />
                </button>
              </th>
              <th className="px-6 py-4 text-center w-[110px]">
                <button
                  onClick={() => onSort("defaultTemperature")}
                  className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                >
                  {t("defaultTemperature", lang)}
                  <SortIcon field="defaultTemperature" />
                </button>
              </th>
              <th className="px-6 py-4 text-center w-[100px]">
                <span className="text-sm text-muted-foreground">{t("isPopular", lang)}</span>
              </th>
              <th className="px-6 py-4 text-center w-[80px]">
                <span className="text-sm text-muted-foreground">{t("isFavorite", lang)}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr
                key={model.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <div>{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.provider}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-mono">
                    {formatCurrency(
                      convertPrice(model.inputPrice, currency, unit),
                      currency,
                      lang,
                      priceDecimals
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{priceUnit}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-mono">
                    {formatCurrency(
                      convertPrice(model.outputPrice, currency, unit),
                      currency,
                      lang,
                      priceDecimals
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{priceUnit}</div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{model.description}</td>
                <td className="px-6 py-4 text-center text-sm">{model.temperatureRange}</td>
                <td className="px-6 py-4 text-center text-sm font-mono">
                  {model.defaultTemperature ?? "-"}
                </td>
                <td className="px-6 py-4 text-center">
                  {model.isPopular ? (
                    <Star className="h-4 w-4 mx-auto fill-primary text-primary" />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(model.id)}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      model.isFavorite
                        ? "bg-destructive-soft text-destructive"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                    aria-label={model.isFavorite ? 'Remove favorite' : 'Add favorite'}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
