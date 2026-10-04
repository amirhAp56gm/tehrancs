import React, { useState } from 'react';
import { 
  ShoppingCart, 
  GitCompare, 
  ShieldCheck, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { MarketItem, Currency } from '../types';
import { 
  formatPrice, 
  toPersianDigits, 
  getWearColor, 
  getRarityColor 
} from '../utils/formatters';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { getSkinColorPalette } from '../utils/skinColorEngine';

interface ProductCardProps {
  item: MarketItem;
  currency: Currency;
  isInCart: boolean;
  onAddToCart: (item: MarketItem) => void;
  onQuickView: (item: MarketItem) => void;
  viewDensity?: 'standard' | 'dense' | 'list';
}

const formatWearAbbreviation = (condition: string, wearCategory?: string): string => {
  if (wearCategory && ['FN', 'MW', 'FT', 'WW', 'BS'].includes(wearCategory)) {
    return wearCategory;
  }
  const str = (condition || '').toLowerCase();
  if (str.includes('factory new') || str.includes('fn')) return 'FN';
  if (str.includes('minimal wear') || str.includes('mw')) return 'MW';
  if (str.includes('field-tested') || str.includes('field tested') || str.includes('ft')) return 'FT';
  if (str.includes('well-worn') || str.includes('well worn') || str.includes('ww')) return 'WW';
  if (str.includes('battle-scarred') || str.includes('battle scarred') || str.includes('battle scared') || str.includes('bs')) return 'BS';
  return condition;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  currency,
  isInCart,
  onAddToCart,
  onQuickView,
  viewDensity = 'standard'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const rarityBorderColor = getRarityColor(item.rarity);
  const wearIndicatorColor = getWearColor(item.wearCategory);
  const skinPalette = getSkinColorPalette(item);

  return (
    <div 
      id={`item-card-${item.id}`}
      onClick={() => onQuickView(item)}
      className={`group relative bg-[#121814] hover:bg-[#151f18] border border-[#b7f1d1]/10 hover:border-[#20df7c]/40 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-[#20df7c]/5 hover:-translate-y-0.5 cursor-pointer ${
        item.isHighlight ? 'ring-1 ring-[#20df7c]/25' : ''
      }`}
    >
      {/* Top Rarity Accent Line */}
      <div 
        className="h-0.5 w-full transition-opacity opacity-70 group-hover:opacity-100"
        style={{ backgroundColor: skinPalette.primary || rarityBorderColor }}
      />

      {/* Top-Left Red Rounded Discount Badge */}
      {item.discountPercent && item.discountPercent > 0 && (
        <span 
          id={`discount-badge-${item.id}`}
          className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 bg-red-600 text-white text-[10px] sm:text-[11px] font-black font-mono rounded-full shadow-md shadow-red-600/30 flex items-center justify-center ring-1 ring-white/15"
        >
          {item.discountPercent}%-
        </span>
      )}

      {/* TOP HEADER: Item Name & Condition */}
      <div className={`p-2.5 pb-1 flex flex-col gap-0.5 text-right ${item.discountPercent ? 'pl-12' : ''}`}>
        <div className="flex items-start justify-between gap-1">
          {/* Item English Title */}
          <h3 
            className="text-xs sm:text-[13px] font-bold text-white leading-snug tracking-tight font-sans truncate flex-1 group-hover:text-[#20df7c] transition-colors"
            title={item.name}
          >
            {item.name}
          </h3>
        </div>

        {/* Condition & Attributes Badges */}
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            {item.isStatTrak && (
              <span className="text-[10px] font-bold font-mono text-amber-400 bg-amber-400/10 px-1 rounded border border-amber-400/20">
                StatTrak™
              </span>
            )}
            {item.isSouvenir && (
              <span className="text-[10px] font-bold font-mono text-yellow-400 bg-yellow-400/10 px-1 rounded border border-yellow-400/20">
                Souvenir
              </span>
            )}
            <span className="text-[#8F9A93] font-bold text-[11px] font-mono tracking-wider">
              {formatWearAbbreviation(item.condition, item.wearCategory)}
            </span>
          </div>
        </div>
      </div>

      {/* CENTER: Floating Item Image with Ambient Glow */}
      <div 
        className="relative px-3 py-2 flex items-center justify-center min-h-[110px] sm:min-h-[125px]"
      >
        {/* Subtle Ambient Glow matching the skin's color */}
        <div 
          className="absolute inset-0 m-auto w-24 h-24 rounded-full opacity-25 filter blur-xl transition-all group-hover:opacity-50 group-hover:scale-125"
          style={{ backgroundColor: skinPalette.primary }}
        />

        {/* The Item Image */}
        <img
          src={getOptimizedImageUrl(item.image)}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="relative z-10 max-h-24 sm:max-h-28 w-auto object-contain transition-transform duration-200 group-hover:scale-105 filter drop-shadow-md"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageLoaded(true);
            const target = e.currentTarget as HTMLImageElement;
            if (!target.dataset.fallbackTried) {
              target.dataset.fallbackTried = 'true';
              if (item.name?.includes('Butterfly') || item.weapon?.includes('Butterfly')) {
                target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbsslg5t1OD3EjVP5dumnZSEheLnP7vhgneGupJ03LiU94qi0Fbg80JsYW3zLI7Ecw86aV_TrVW9wuvn0ZW5vpqcy3FiuCRx7XfZnhG1hEpSLrs42iU367A/360fx360f';
              } else if (item.weapon?.includes('AK-47') || item.name?.includes('AK-47')) {
                target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsZGHyd4_Bd1RvM1-F_la4wO7vgZe86pnMnXJjuyNwsXbUmUeyhQYMMLI30VXDZw/360fx360f';
              } else {
                target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV19m5h5S0m_7zO6-fzj9V7MR3n-rC89mm0VXs_EVvamj0cYHEIFM9YlvU81TtlOi9hMS4vZvKznZquSY8pSGK6B_V8Wk/360fx360f';
              }
            }
          }}
        />
      </div>

      {/* BOTTOM INFO AREA: Price, Float, Status, Add to Cart */}
      <div className="p-2.5 pt-1.5 bg-[#0E120F]/60 border-t border-[#b7f1d1]/5 space-y-1.5 text-right">
        
        {/* Price Indicator */}
        <div className="flex items-center justify-between gap-1">
          <div className="text-right">
            <span className="text-sm sm:text-base font-black text-white font-mono tracking-tight block">
              {formatPrice(item.priceUSD, currency)}
            </span>
          </div>
        </div>

        {/* Float Value Bar (Visual mini bar like CSFloat) */}
        <div className="space-y-0.5">
          <div className="relative h-1 w-full bg-[#1e2a22] rounded-full overflow-hidden">
            {/* Color Gradient Track */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#20df7c] via-[#eab308] to-[#ef4444] opacity-50" />
            {/* Indicator Marker */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-xs"
              style={{ left: `${Math.min(100, Math.max(0, item.floatValue * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#8F9A93]">
            <span className="truncate max-w-[120px]" title={item.floatValue.toString()}>
              {item.floatValue.toFixed(6)}
            </span>
            {item.floatRank && (
              <span className="text-[#b7f1d1]/70">#{item.floatRank}</span>
            )}
          </div>
        </div>

        {/* Primary Action: Add to Cart */}
        <div className="pt-1">
          <button
            id={`add-to-cart-btn-${item.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isInCart
                ? 'bg-[#20df7c] text-[#0A0D0B] shadow-xs'
                : 'bg-[#17241C] hover:bg-[#20df7c] text-[#F2F5F3] hover:text-[#0A0D0B] border border-[#b7f1d1]/10 hover:border-[#20df7c]'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>در سبد خرید</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>افزودن به سبد</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
