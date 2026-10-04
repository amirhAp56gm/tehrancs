import React, { useState, useEffect, useRef } from 'react';
import { MarketItem, Currency } from '../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { PackageSearch, RotateCcw, Loader2 } from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface ProductGridProps {
  items: MarketItem[];
  currency: Currency;
  cartItemIds: string[];
  onAddToCart: (item: MarketItem) => void;
  onQuickView: (item: MarketItem) => void;
  onResetFilters: () => void;
  viewDensity?: 'standard' | 'dense' | 'list';
  isLoading?: boolean;
}

const BATCH_SIZE = 25;

export const ProductGrid: React.FC<ProductGridProps> = ({
  items,
  currency,
  cartItemIds,
  onAddToCart,
  onQuickView,
  onResetFilters,
  viewDensity = 'standard',
  isLoading = false
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset visible items count whenever filtered items array changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    setIsLoadingMore(false);
  }, [items]);

  // Scroll detection via IntersectionObserver
  useEffect(() => {
    if (visibleCount >= items.length || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + BATCH_SIZE);
            setIsLoadingMore(false);
          }, 1200);
        }
      },
      { rootMargin: '120px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [visibleCount, items.length, isLoadingMore]);

  const gridClasses = `grid gap-2.5 sm:gap-3 transition-all ${
    viewDensity === 'dense'
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
  }`;

  if (isLoading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 12 }).map((_, idx) => (
          <ProductCardSkeleton key={`skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center bg-[#17241C] border border-[#b7f1d1]/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#121814] flex items-center justify-center text-[#20df7c] mb-4 ring-1 ring-[#20df7c]/20">
          <PackageSearch className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          هیچ اسکین یا آیتمی با این فیلترها پیدا نشد
        </h3>
        <p className="text-xs text-[#8F9A93] max-w-md mb-6 leading-relaxed">
          لطفاً بازه قیمتی، فرسودگی Float، یا عبارت جستجو شده را بررسی کرده یا تمام فیلترها را برای مشاهده تمامی آیتم‌های بازار ریست کنید.
        </p>
        <button
          id="empty-state-reset-btn"
          onClick={onResetFilters}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] text-[#0A0D0B] font-bold text-xs transition-all shadow-md shadow-[#20df7c]/20"
        >
          <RotateCcw className="w-4 h-4" />
          <span>بازنشانی فیلترها و مشاهده همه آیتم‌ها</span>
        </button>
      </div>
    );
  }

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className={gridClasses}>
        {visibleItems.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            currency={currency}
            isInCart={cartItemIds.includes(item.id)}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
            viewDensity={viewDensity}
          />
        ))}
      </div>

      {/* 1.2-Second Pure Circular Spinner Loading Indicator */}
      {isLoadingMore && (
        <div className="w-full flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-[#20df7c]" />
        </div>
      )}

      {/* Sentinel element to trigger load when scrolled into view */}
      {!isLoadingMore && visibleCount < items.length && (
        <div ref={sentinelRef} className="w-full h-8" />
      )}
    </div>
  );
};
