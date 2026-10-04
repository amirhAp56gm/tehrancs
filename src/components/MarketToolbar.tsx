import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Grid3X3, 
  Sliders, 
  X, 
  Clock, 
  Sparkles, 
  Zap, 
  Tag, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { FilterState, MarketItem, Currency } from '../types';
import { toPersianDigits, formatPrice, getWearColor } from '../utils/formatters';
import { parseAdvancedSearchQuery, matchItemWithAdvancedSearch } from '../utils/searchEngine';

interface MarketToolbarProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResults: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onOpenMobileFilters?: () => void;
  viewDensity: 'standard' | 'dense' | 'list';
  setViewDensity: (v: 'standard' | 'dense' | 'list') => void;
  onRefresh: () => void;
  activeFilterCount: number;
  onOpenAdvancedSearch?: () => void;
  items?: MarketItem[];
  onQuickViewItem?: (item: MarketItem) => void;
  currency?: Currency;
  recentSearches?: string[];
  onAddRecentSearch?: (query: string) => void;
  onRemoveRecentSearch?: (query: string) => void;
  onClearRecentSearches?: () => void;
}

const STORAGE_RECENT_SEARCHES = 'iran_cs2_recent_searches_v3';

export const MarketToolbar: React.FC<MarketToolbarProps> = ({
  filterState,
  setFilterState,
  totalResults,
  isSidebarOpen,
  setIsSidebarOpen,
  onOpenMobileFilters,
  viewDensity,
  setViewDensity,
  onRefresh,
  activeFilterCount,
  onOpenAdvancedSearch,
  items = [],
  onQuickViewItem,
  currency = 'IRR',
  recentSearches: propsRecentSearches,
  onAddRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Local state fallback if props not provided
  const [localRecentSearches, setLocalRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RECENT_SEARCHES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['AK-47 | Asiimov', 'Butterfly Doppler', 'Printstream'];
  });

  const recentSearches = propsRecentSearches || localRecentSearches;

  const saveRecentSearch = (query: string) => {
    if (onAddRecentSearch) {
      onAddRecentSearch(query);
      return;
    }
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setLocalRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(STORAGE_RECENT_SEARCHES, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    if (onRemoveRecentSearch) {
      onRemoveRecentSearch(query);
      return;
    }
    setLocalRecentSearches(prev => {
      const updated = prev.filter(q => q !== query);
      try {
        localStorage.setItem(STORAGE_RECENT_SEARCHES, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClearRecentSearches) {
      onClearRecentSearches();
      return;
    }
    setLocalRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_RECENT_SEARCHES);
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsDropdownOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectQuery = (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
    saveRecentSearch(query);
    setIsDropdownOpen(false);
  };

  // Live item matches preview in dropdown
  const livePreviewItems = useMemo(() => {
    if (!filterState.searchQuery.trim() || items.length === 0) return [];
    const parsed = parseAdvancedSearchQuery(filterState.searchQuery);
    return items
      .filter(item => matchItemWithAdvancedSearch(item, parsed, filterState))
      .slice(0, 4);
  }, [filterState.searchQuery, items, filterState]);

  // Count advanced filters active
  const advancedFiltersActiveCount = useMemo(() => {
    let count = 0;
    if (filterState.instantTradeOnly) count++;
    if (filterState.hasStickersOnly || filterState.stickerQuery) count++;
    if (filterState.dopplerPhase && filterState.dopplerPhase !== 'all') count++;
    if (filterState.collectionQuery) count++;
    if (filterState.minDiscount && filterState.minDiscount > 0) count++;
    if (filterState.floatTier && filterState.floatTier !== 'all') count++;
    return count;
  }, [filterState]);

  return (
    <div className="w-full space-y-2.5 mb-4" ref={dropdownRef}>
      
      {/* 1. Main Search Bar Row: Search Box + Action Buttons next to each other */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2.5 flex-wrap">
        
        {/* Search Field with Dropdown */}
        <div className="relative w-full sm:w-72 md:w-80 lg:w-96 shrink-0">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9A93] pointer-events-none" />
          
          <input
            ref={inputRef}
            id="market-search-input"
            type="text"
            value={filterState.searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setFilterState(prev => ({ ...prev, searchQuery: e.target.value }));
              setIsDropdownOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveRecentSearch(filterState.searchQuery);
                setIsDropdownOpen(false);
              } else if (e.key === 'Escape') {
                setIsDropdownOpen(false);
              }
            }}
            placeholder="جستجوی هوشمند اسکین، سلاح، فاز یا پترن (مثال: Doppler, Howl, کلاش)..."
            className="w-full bg-[#121814] border border-[#b7f1d1]/15 rounded-xl pr-10 pl-16 py-2 text-xs sm:text-sm text-[#F2F5F3] placeholder-[#8F9A93] focus:outline-none focus:border-[#20df7c] focus:ring-1 focus:ring-[#20df7c] transition-all shadow-inner"
          />

          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {filterState.searchQuery ? (
              <button
                onClick={() => {
                  setFilterState(prev => ({ ...prev, searchQuery: '' }));
                  inputRef.current?.focus();
                }}
                className="text-xs text-[#8F9A93] hover:text-white px-2 py-0.5 rounded bg-[#17241C] hover:bg-[#1f2d22] transition-colors cursor-pointer"
              >
                پاک کردن
              </button>
            ) : (
              <kbd className="hidden sm:inline-block text-[10px] text-[#8F9A93] bg-[#17241C] border border-[#b7f1d1]/10 px-1.5 py-0.5 rounded font-mono">
                /
              </kbd>
            )}
          </div>

          {/* Autocomplete & Suggestions Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 left-0 mt-1.5 bg-[#17241C] border border-[#b7f1d1]/20 rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-[#b7f1d1]/10 animate-in fade-in duration-150">
              
              {/* SECTION A: Live Matching Items (if user typed) */}
              {filterState.searchQuery.trim().length > 0 && (
                <div className="p-3">
                  <div className="text-[11px] font-bold text-[#8F9A93] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-white">
                      <Sparkles className="w-3.5 h-3.5 text-[#20df7c]" />
                      <span>اسکین‌های منطبق زنده</span>
                    </span>
                    <span className="text-[10px] text-[#20df7c] font-mono">
                      {toPersianDigits(livePreviewItems.length)} از {toPersianDigits(totalResults)} نتیجه
                    </span>
                  </div>

                  {livePreviewItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {livePreviewItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            saveRecentSearch(filterState.searchQuery);
                            setIsDropdownOpen(false);
                            if (onQuickViewItem) {
                              onQuickViewItem(item);
                            }
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-[#121814] hover:bg-[#1f2d22] border border-[#b7f1d1]/10 hover:border-[#20df7c]/40 cursor-pointer transition-all group"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-8 object-contain drop-shadow"
                          />
                          <div className="flex-1 min-w-0 text-right">
                            <div className="text-xs font-bold text-white truncate group-hover:text-[#20df7c] transition-colors">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#8F9A93]">
                              <span className={`font-mono font-bold ${getWearColor(item.wearCategory)}`}>
                                {item.wearCategory}
                              </span>
                              {item.isStatTrak && (
                                <span className="text-amber-400 font-bold">ST™</span>
                              )}
                              <span>•</span>
                              <span className="text-[#20df7c] font-mono font-bold">
                                {formatPrice(item.priceUSD, currency)}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#8F9A93] group-hover:text-[#20df7c] -rotate-180" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#8F9A93] py-2 text-center">
                      موردی با این عبارت یافت نشد. می‌توانید با فیلترهای پیشرفته جستجو کنید.
                    </div>
                  )}
                </div>
              )}

              {/* SECTION B: Recent Searches */}
              {recentSearches.length > 0 ? (
                <div className="p-3">
                  <div className="flex items-center justify-between text-[11px] text-[#8F9A93] mb-2 font-bold">
                    <span className="flex items-center gap-1.5 text-white">
                      <Clock className="w-3.5 h-3.5 text-[#8F9A93]" />
                      <span>جستجوهای اخیر شما</span>
                    </span>
                    <button
                      onClick={clearAllRecent}
                      className="text-[10px] text-[#8F9A93] hover:text-red-400 transition-colors cursor-pointer"
                    >
                      پاکسازی همه
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((query, idx) => (
                      <span
                        key={idx}
                        onClick={() => handleSelectQuery(query)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121814] text-xs text-[#F2F5F3] hover:text-[#20df7c] hover:bg-[#1a291f] border border-[#b7f1d1]/10 hover:border-[#20df7c]/30 cursor-pointer transition-all"
                      >
                        <span>{query}</span>
                        <button
                          onClick={(e) => removeRecentSearch(e, query)}
                          className="text-[#8F9A93] hover:text-red-400 p-0.5 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : filterState.searchQuery.trim().length === 0 && (
                <div className="p-3 text-xs text-[#8F9A93] text-center">
                  هنوز هیچ جستجوی اخیری ثبت نشده است.
                </div>
              )}

            </div>
          )}
        </div>

        {/* Action Controls: Filter Toggle, Sort, Density */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">

          {/* Toggle Sidebar Button */}
          <button
            id="toggle-filter-sidebar-btn"
            onClick={() => {
              if (window.innerWidth < 1024 && onOpenMobileFilters) {
                onOpenMobileFilters();
              } else {
                setIsSidebarOpen(!isSidebarOpen);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isSidebarOpen
                ? 'bg-[#20df7c]/15 text-[#20df7c] border-[#20df7c]/40'
                : 'bg-[#121814] text-[#F2F5F3] border-[#b7f1d1]/15 hover:bg-[#17241C]'
            }`}
          >
            <Filter className="w-4 h-4 text-[#20df7c]" />
            <span className="hidden xs:inline">فیلترها</span>
            {activeFilterCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-[#20df7c] text-[#0A0D0B] text-[10px] font-black flex items-center justify-center">
                {toPersianDigits(activeFilterCount)}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              id="sort-select-dropdown"
              value={filterState.sortOption}
              onChange={(e) => setFilterState(prev => ({ ...prev, sortOption: e.target.value as any }))}
              className="appearance-none bg-[#121814] border border-[#b7f1d1]/15 rounded-xl pr-3 pl-8 py-2.5 text-xs sm:text-sm text-[#F2F5F3] font-medium focus:outline-none focus:border-[#20df7c] cursor-pointer hover:bg-[#17241C] transition-colors"
            >
              <option value="featured">مرتب‌سازی: پرفروش‌ترین</option>
              <option value="price_asc">قیمت: کمترین به بیشترین</option>
              <option value="price_desc">قیمت: بیشترین به کمترین</option>
              <option value="discount_desc">بیشترین درصد تخفیف</option>
              <option value="float_asc">کمترین Float (کیفیت برتر)</option>
              <option value="newest">جدیدترین اسکین‌ها</option>
            </select>
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8F9A93] pointer-events-none" />
          </div>

          {/* Density View Toggle */}
          <div className="hidden sm:flex items-center p-1 bg-[#121814] border border-[#b7f1d1]/15 rounded-xl gap-0.5">
            <button
              id="view-mode-standard-btn"
              onClick={() => setViewDensity('standard')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewDensity === 'standard' ? 'bg-[#20df7c] text-[#0A0D0B]' : 'text-[#8F9A93] hover:text-white'
              }`}
              title="نمایش استاندارد (۵ الی ۶ ستون)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-dense-btn"
              onClick={() => setViewDensity('dense')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewDensity === 'dense' ? 'bg-[#20df7c] text-[#0A0D0B]' : 'text-[#8F9A93] hover:text-white'
              }`}
              title="نمایش فوق متراکم (۶ الی ۷ ستون)"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Active Search Filters Chips & Results Count */}
      <div className="flex items-center justify-between text-xs text-[#8F9A93] pt-0.5 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            نمایش <span className="text-[#20df7c] font-bold font-mono">{toPersianDigits(totalResults)}</span> اسکین فعال برای خرید فوری
          </span>

          {/* Active Chips */}
          {filterState.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#20df7c]/15 text-[#20df7c] border border-[#20df7c]/30 text-[11px] font-bold">
              <span>جستجو: {filterState.searchQuery}</span>
              <button
                onClick={() => setFilterState(prev => ({ ...prev, searchQuery: '' }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterState.dopplerPhase && filterState.dopplerPhase !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
              <span>فاز: {filterState.dopplerPhase}</span>
              <button
                onClick={() => setFilterState(prev => ({ ...prev, dopplerPhase: 'all' }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterState.stickerQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
              <span>استیکر: {filterState.stickerQuery}</span>
              <button
                onClick={() => setFilterState(prev => ({ ...prev, stickerQuery: '' }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterState.collectionQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
              <span>کالکشن: {filterState.collectionQuery}</span>
              <button
                onClick={() => setFilterState(prev => ({ ...prev, collectionQuery: '' }))}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setFilterState({
                searchQuery: '',
                category: 'all',
                weaponType: [],
                wearCategories: [],
                rarities: [],
                minPrice: 0,
                maxPrice: 0,
                minFloat: 0,
                maxFloat: 1,
                isStatTrakOnly: false,
                isSouvenirOnly: false,
                isHighlightOnly: false,
                isNormalOnly: false,
                paintSeed: '',
                minFade: 80,
                maxFade: 100,
                minBlue: 0,
                maxBlue: 100,
                sortOption: 'featured',
                activeTab: 'all',
                instantTradeOnly: false,
                hasStickersOnly: false,
                stickerQuery: '',
                dopplerPhase: 'all',
                collectionQuery: '',
                minDiscount: 0,
                floatTier: 'all'
              });
            }}
            className="text-[11px] text-[#8F9A93] hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>پاکسازی همه فیلترها</span>
          </button>
        )}
      </div>

    </div>
  );
};
