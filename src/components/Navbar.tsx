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
    <nav className="navbar-shell sticky top-0 z-50 border-b border-border transition-colors">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-10 xl:px-[120px]">
        <div className="navbar-layout navbar-container flex flex-col gap-3">
          <div className="flex shrink-0 items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="navbar-brand-text font-mono text-sm font-normal">LLMguide模型导员</span>
            <Badge variant="outline" className="border-muted-foreground/30 text-xs">
              {t('alpha', lang)}
            </Badge>
          </div>

          <div className="navbar-tabs-wrap flex min-w-0 items-center justify-start gap-2 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`navbar-tab-btn relative whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                    ? 'navbar-tab-active'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="navbar-controls-wrap flex items-center justify-start gap-2 overflow-x-auto border-t border-border/50 pt-3 scrollbar-none">
            <button
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              className="navbar-control-btn flex items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <Select value={lang} onValueChange={onLangChange}>
              <SelectTrigger className="navbar-control w-[84px] border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currency} onValueChange={(value) => onCurrencyChange(value as SupportedCurrency)}>
              <SelectTrigger className="navbar-control w-[110px] border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNY">CNY (￥)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={unit} onValueChange={(value) => onUnitChange(value as TokenUnit)}>
              <SelectTrigger className="navbar-control w-[96px] border-border">
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
              className="navbar-control navbar-link inline-flex items-center border border-border text-sm font-normal transition-colors"
            >
              提示词
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
