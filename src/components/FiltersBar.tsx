import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Download, Heart } from "lucide-react";
import { t, type Language } from "./i18n";

type FiltersBarProps = {
  providers: string[];
  provider: string;
  onProviderChange: (provider: string) => void;
  tieredFilter: 'all' | 'yes' | 'no';
  onTieredFilterChange: (filter: 'all' | 'yes' | 'no') => void;
  tierConditionFilter: string;
  onTierConditionFilterChange: (value: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onExport: () => void;
  filterMode: 'all' | 'favorites';
  onFilterModeChange: (mode: 'all' | 'favorites') => void;
  lang: Language;
};

export function FiltersBar({
  providers,
  provider,
  onProviderChange,
  tieredFilter,
  onTieredFilterChange,
  tierConditionFilter,
  onTierConditionFilterChange,
  search,
  onSearchChange, 
  onExport, 
  filterMode, 
  onFilterModeChange,
  lang 
}: FiltersBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => onFilterModeChange('all')}
          variant={filterMode === 'all' ? 'default' : 'outline'}
          className="gap-2 border-border"
          size="sm"
        >
          {t('allModels', lang)}
        </Button>
        <Button 
          onClick={() => onFilterModeChange('favorites')}
          variant={filterMode === 'favorites' ? 'default' : 'outline'}
          className="gap-2 border-border"
          size="sm"
        >
          <Heart className="h-4 w-4" />
          {t('showFavorites', lang)}
        </Button>
      </div>
      
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors sm:flex-row sm:flex-wrap sm:items-center">
        <Select value={provider} onValueChange={onProviderChange}>
          <SelectTrigger className="w-full border-border sm:w-[200px]">
            <SelectValue placeholder={t('allProviders', lang)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allProviders', lang)}</SelectItem>
            {providers.map((providerName) => (
              <SelectItem key={providerName} value={providerName}>
                {providerName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tieredFilter} onValueChange={(value) => onTieredFilterChange(value as 'all' | 'yes' | 'no')}>
          <SelectTrigger className="w-full border-border sm:w-[180px]">
            <SelectValue placeholder={t('tieredFilter', lang)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tieredAll', lang)}</SelectItem>
            <SelectItem value="yes">{t('tieredOnly', lang)}</SelectItem>
            <SelectItem value="no">{t('nonTieredOnly', lang)}</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder={t('tierConditionPlaceholder', lang)}
          value={tierConditionFilter}
          onChange={(e) => onTierConditionFilterChange(e.target.value)}
          className="w-full border-border sm:w-[240px]"
        />

        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder', lang)}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-border"
          />
        </div>

        <Button onClick={onExport} variant="outline" className="gap-2 border-border w-full sm:w-auto">
          <Download className="h-4 w-4" />
          {t('export', lang)}
        </Button>
      </div>
    </div>
  );
}
