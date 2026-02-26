import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Sun, Moon } from "lucide-react";
import { t, type Language } from "./i18n";
import { type SupportedCurrency, type TokenUnit } from "../utils/pricing";

type NavbarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currency: SupportedCurrency;
  onCurrencyChange: (currency: SupportedCurrency) => void;
  unit: TokenUnit;
  onUnitChange: (unit: TokenUnit) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
};

export function Navbar({
  activeTab,
  onTabChange,
  currency,
  onCurrencyChange,
  unit,
  onUnitChange,
  theme,
  onThemeChange,
  lang,
  onLangChange
}: NavbarProps) {
  const tabs = [
    { id: 'dashboard', label: t('dashboard', lang) },
    { id: 'compare', label: t('compare', lang) },
    { id: 'calculator', label: t('calculator', lang) },
    { id: 'ratings', label: t('ratings', lang) },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-10 xl:px-[120px]">
        {/* Row 1: Branding + Tabs */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono text-sm font-medium">LLMguide模型导员</span>
            <Badge variant="outline" className="border-muted-foreground/30 text-xs">
              {t('alpha', lang)}
            </Badge>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Controls */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/50 pt-3 sm:justify-end">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <Select value={lang} onValueChange={onLangChange}>
              <SelectTrigger className="h-8 w-[72px] border-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currency} onValueChange={(value) => onCurrencyChange(value as SupportedCurrency)}>
              <SelectTrigger className="h-8 w-[96px] border-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNY">CNY (￥)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={unit} onValueChange={(value) => onUnitChange(value as TokenUnit)}>
              <SelectTrigger className="h-8 w-[88px] border-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTok">MTok</SelectItem>
                <SelectItem value="KTok">KTok</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <a
              href="https://prompt-free.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center rounded-md border border-primary/40 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              提示词
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
