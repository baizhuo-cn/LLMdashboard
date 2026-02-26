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
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-[120px]">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="font-mono text-sm">LLMguide模型导员</span>
          <Badge variant="outline" className="ml-2 border-muted-foreground/30 text-xs">
            {t('alpha', lang)}
          </Badge>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-auto">
          <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
            <div className="flex flex-wrap items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <a
              href="https://prompt-free.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-lg border border-primary/40 px-4 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:w-auto"
            >
              提示词
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-between lg:justify-end">
            <button
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              className="flex h-10 w-full items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-9 sm:w-9"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Select value={lang} onValueChange={onLangChange}>
              <SelectTrigger className="h-10 w-full border-border sm:h-9 sm:w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currency} onValueChange={(value) => onCurrencyChange(value as SupportedCurrency)}>
              <SelectTrigger className="h-10 w-full border-border sm:h-9 sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNY">CNY (￥)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={unit} onValueChange={(value) => onUnitChange(value as TokenUnit)}>
              <SelectTrigger className="h-10 w-full border-border sm:h-9 sm:w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTok">MTok</SelectItem>
                <SelectItem value="KTok">KTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </nav>
  );
}
