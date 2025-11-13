import { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import type { Model, TokenUnit } from '../data/types';
import { formatPriceByUnit, formatUnitLabel } from '../utils/format';

type Props = {
  models: Model[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  unit: TokenUnit;
  showFavorites: 'on' | 'off';
  onShowFavoritesChange: (value: 'on' | 'off') => void;
};

export function DashboardSection({
  models,
  favorites,
  onToggleFavorite,
  unit,
  showFavorites,
  onShowFavoritesChange,
}: Props) {
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return models
      .map((model) => ({ ...model, isFavorite: favorites.includes(model.id) }))
      .filter((model) => (showFavorites === 'on' ? model.isFavorite : true))
      .filter((model) => {
        if (!lower) return true;
        return (
          model.searchableText.includes(lower) ||
          model.name.toLowerCase().includes(lower) ||
          model.provider.toLowerCase().includes(lower)
        );
      });
  }, [models, favorites, keyword, showFavorites]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">模型仪表盘</h2>
          <p className="text-sm text-muted-foreground">快速浏览官方价格、厂商与标签。</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={showFavorites === 'on'}
              onChange={(event) => onShowFavoritesChange(event.target.checked ? 'on' : 'off')}
            />
            仅显示收藏
          </label>
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索模型 / 厂商 / 标签"
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary md:w-[260px]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          暂无匹配的模型，可调整筛选条件。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((model) => {
            const price = model.prices[unit];
            const isFavorite = favorites.includes(model.id);
            return (
              <article
                key={model.id}
                className="relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{model.provider}</p>
                    <h3 className="text-base font-semibold">{model.name}</h3>
                    <p className="text-xs text-muted-foreground">更新于 {model.updatedAt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(model.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                      isFavorite
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label={`${isFavorite ? '取消收藏' : '收藏'} ${model.name}`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <dt className="text-xs text-muted-foreground">输入单价</dt>
                    <dd className="text-base font-medium">{formatPriceByUnit(price.input, price.currency, unit)}</dd>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <dt className="text-xs text-muted-foreground">输出单价</dt>
                    <dd className="text-base font-medium">{formatPriceByUnit(price.output, price.currency, unit)}</dd>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">{formatUnitLabel(unit)}</div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
