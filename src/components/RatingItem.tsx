import { Star } from "lucide-react";
import { t, type Language } from "./i18n";
import { getProviderColor } from "../utils/providerColors";

export type Rating = {
  id: string;
  name: string;
  provider: string;
  quote: string;
  score: number;
  maxScore: number;
  votes: number;
};

type RatingItemProps = {
  rating: Rating;
  selected?: boolean;
  onSelect?: () => void;
  lang: Language;
};

export function RatingItem({ rating, selected = false, onSelect, lang }: RatingItemProps) {
  const stars = Math.round((rating.score / rating.maxScore) * 5);

  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left' as const,
        background: selected ? 'color-mix(in srgb, var(--color-brand-primary) 5%, var(--card))' : 'var(--card)',
        borderRadius: 14,
        border: selected ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--border)',
        padding: 20,
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = 'var(--muted-foreground)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = selected ? 'var(--color-brand-primary)' : 'var(--border)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--muted)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span className="font-mono-jet" style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)' }}>
              {rating.provider.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div className="provider-dot" style={{ background: getProviderColor(rating.provider) }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>{rating.name}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>"{rating.quote}"</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                style={{
                  width: 14, height: 14,
                  fill: i < stars ? '#F59E0B' : 'none',
                  color: i < stars ? '#F59E0B' : 'var(--muted-foreground)',
                  opacity: i < stars ? 1 : 0.3,
                }}
              />
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono-jet" style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>
              {rating.score}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>/{rating.maxScore}</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)', letterSpacing: '0.02em' }}>
            {rating.votes.toLocaleString()} {t('votes', lang)}
          </span>
        </div>
      </div>
    </button>
  );
}
