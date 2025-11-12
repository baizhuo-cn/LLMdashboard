import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Download, Heart, Star } from "lucide-react";
import { t, type Language } from "./i18n";

type FiltersBarProps = {
  providers: string[];
  provider: string;
  onProviderChange: (provider: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onExport: () => void;
  filterMode: 'all' | 'favorites' | 'popular';
  onFilterModeChange: (mode: 'all' | 'favorites' | 'popular') => void;
  lang: Language;
};

export function FiltersBar({
  providers,
  provider,
  onProviderChange,
  search,
  onSearchChange, 
  onExport, 
  filterMode, 
  onFilterModeChange,
  lang 
}: FiltersBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
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
        <Button 
          onClick={() => onFilterModeChange('popular')}
          variant={filterMode === 'popular' ? 'default' : 'outline'}
          className="gap-2 border-border"
          size="sm"
        >
          <Star className="h-4 w-4" />
          {t('showPopular', lang)}
        </Button>
      </div>
      
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors">
        <Select value={provider} onValueChange={onProviderChange}>
          <SelectTrigger className="w-[180px] border-border">
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

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder', lang)}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-border"
          />
        </div>

        <Button onClick={onExport} variant="outline" className="gap-2 border-border">
          <Download className="h-4 w-4" />
          {t('export', lang)}
        </Button>
      </div>
    </div>
  );
}
