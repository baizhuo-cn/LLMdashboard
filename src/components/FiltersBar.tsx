import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Download, Heart } from "lucide-react";
import { t, type Language } from "./i18n";
import { getProviderColor } from "../utils/providerColors";

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => onFilterModeChange('all')}
          className={filterMode === 'all' ? 'tab-btn tab-btn-active' : 'tab-btn'}
          style={{ fontSize: 13, padding: '6px 16px' }}
        >
          {t('allModels', lang)}
        </button>
        <button
          onClick={() => onFilterModeChange('favorites')}
          className={filterMode === 'favorites' ? 'tab-btn tab-btn-active' : 'tab-btn'}
          style={{ fontSize: 13, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Heart style={{ width: 14, height: 14 }} />
          {t('showFavorites', lang)}
        </button>
      </div>

      <div style={{
        background: 'var(--card)', borderRadius: 14, padding: 16,
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}>
        <Select value={provider} onValueChange={onProviderChange}>
          <SelectTrigger className="w-full border-border sm:w-[200px]" style={{ borderRadius: 10 }}>
            <SelectValue placeholder={t('allProviders', lang)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allProviders', lang)}</SelectItem>
            {providers.map((providerName) => (
              <SelectItem key={providerName} value={providerName}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="provider-dot" style={{ background: getProviderColor(providerName), width: 6, height: 6, display: 'inline-block' }} />
                  {providerName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tieredFilter} onValueChange={(value) => onTieredFilterChange(value as 'all' | 'yes' | 'no')}>
          <SelectTrigger className="w-full border-border sm:w-[180px]" style={{ borderRadius: 10 }}>
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
          style={{ borderRadius: 10 }}
        />

        <div className="relative w-full flex-1" style={{ minWidth: 180 }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder', lang)}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-border"
            style={{ borderRadius: 10 }}
          />
        </div>

        <Button onClick={onExport} variant="outline" className="gap-2 border-border w-full sm:w-auto" style={{ borderRadius: 10 }}>
          <Download className="h-4 w-4" />
          {t('export', lang)}
        </Button>
      </div>
    </div>
  );
}
