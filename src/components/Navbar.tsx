import { Moon, Sun } from "lucide-react";
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

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="seg-control">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`seg-control-btn ${value === opt.value ? 'seg-control-btn-active' : 'seg-control-btn-inactive'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

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
  onLangChange,
}: NavbarProps) {
  const tabs = [
    { id: 'dashboard', label: t('dashboard', lang) },
    { id: 'compare', label: t('compare', lang) },
    { id: 'calculator', label: t('calculator', lang) },
    { id: 'ratings', label: t('ratings', lang) },
  ];

  return (
    <nav className="navbar-redesign">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', height: 56, gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand-primary)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--foreground)' }}>LLMguide</span>
          <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4, background: 'var(--muted)', color: 'var(--muted-foreground)', letterSpacing: '0.03em' }}>
            {t('alpha', lang).toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <SegmentedControl
            options={[
              { value: 'CNY' as SupportedCurrency, label: 'CNY ￥' },
              { value: 'USD' as SupportedCurrency, label: 'USD' },
              { value: 'EUR' as SupportedCurrency, label: 'EUR' },
            ]}
            value={currency}
            onChange={onCurrencyChange}
          />

          <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 2px' }} />

          <SegmentedControl
            options={[
              { value: 'MTok' as TokenUnit, label: 'MTok' },
              { value: 'KTok' as TokenUnit, label: 'KTok' },
            ]}
            value={unit}
            onChange={onUnitChange}
          />

          <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 2px' }} />

          <SegmentedControl
            options={[
              { value: 'zh' as Language, label: '中文' },
              { value: 'en' as Language, label: 'EN' },
            ]}
            value={lang}
            onChange={onLangChange}
          />

          <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 2px' }} />

          <button
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--card)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted-foreground)', fontSize: 15, transition: 'all 0.15s',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon style={{ width: 14, height: 14 }} /> : <Sun style={{ width: 14, height: 14 }} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
