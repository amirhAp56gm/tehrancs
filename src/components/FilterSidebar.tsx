import React, { useState } from 'react';
import { 
  ChevronDown, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Sliders, 
  Coins, 
  Percent, 
  X, 
  Shield, 
  LayoutGrid,
  Award
} from 'lucide-react';
import { FilterState, WearCategory, Currency, ItemRarity } from '../types';
import { formatPrice, toPersianDigits, getWearColor, USD_TO_TOMAN_RATE } from '../utils/formatters';

interface FilterSidebarProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  currency: Currency;
  onResetFilters: () => void;
  totalResults?: number;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const CATEGORIES_LIST = [
  { id: 'all', labelFa: 'همه دسته‌ها' },
  { id: 'knife', labelFa: 'چاقوها' },
  { id: 'glove', labelFa: 'دستکش‌ها' },
  { id: 'rifle', labelFa: 'تفنگ‌ها' },
  { id: 'sniper', labelFa: 'تک‌تیرانداز' },
  { id: 'pistol', labelFa: 'تپانچه‌ها' },
  { id: 'smg', labelFa: 'اسلحه سبک' },
  { id: 'shotgun', labelFa: 'شاتگان و سنگین' },
  { id: 'container', labelFa: 'جعبه و کانتینر' },
  { id: 'sticker', labelFa: 'استیکرها' },
  { id: 'agent', labelFa: 'ایجنت‌ها' },
  { id: 'collectibles', labelFa: 'کلکسیون‌ها' }
];

const RARITY_CIRCLES: { id: ItemRarity; nameFa: string; color: string; borderGlow: string }[] = [
  { id: 'Extraordinary', nameFa: 'طلایی', color: '#ffd700', borderGlow: 'shadow-[0_0_12px_rgba(255,215,0,0.6)] border-[#ffd700]' },
  { id: 'Covert', nameFa: 'قرمز', color: '#eb4b4b', borderGlow: 'shadow-[0_0_12px_rgba(235,75,75,0.6)] border-[#eb4b4b]' },
  { id: 'Classified', nameFa: 'بنفش', color: '#d32ce6', borderGlow: 'shadow-[0_0_12px_rgba(211,44,230,0.6)] border-[#d32ce6]' },
  { id: 'Restricted', nameFa: 'صورتی', color: '#ff69b4', borderGlow: 'shadow-[0_0_12px_rgba(255,105,180,0.6)] border-[#ff69b4]' },
  { id: 'Mil-Spec', nameFa: 'آبی روشن', color: '#4b69ff', borderGlow: 'shadow-[0_0_12px_rgba(75,105,255,0.6)] border-[#4b69ff]' },
  { id: 'Industrial', nameFa: 'آبی', color: '#5e98d9', borderGlow: 'shadow-[0_0_12px_rgba(94,152,217,0.6)] border-[#5e98d9]' },
  { id: 'Consumer', nameFa: 'خاکستری', color: '#b0c3d9', borderGlow: 'shadow-[0_0_12px_rgba(176,195,217,0.6)] border-[#b0c3d9]' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterState,
  setFilterState,
  selectedCategory,
  onSelectCategory,
  currency,
  onResetFilters,
  totalResults,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) => {
  // Collapsible section open states
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    wear: true,
    rarity: true,
    special: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleWearCategoryToggle = (wear: WearCategory) => {
    setFilterState(prev => {
      const exists = prev.wearCategories.includes(wear);
      return {
        ...prev,
        wearCategories: exists 
          ? prev.wearCategories.filter(w => w !== wear)
          : [...prev.wearCategories, wear]
      };
    });
  };

  const handleRarityToggle = (rarity: ItemRarity) => {
    setFilterState(prev => {
      const current = prev.rarities || [];
      const exists = current.includes(rarity);
      return {
        ...prev,
        rarities: exists ? current.filter(r => r !== rarity) : [...current, rarity]
      };
    });
  };

  // Helper to format number to 3-digit comma separated string
  const formatNumberWithCommas = (num: number | string): string => {
    if (num === undefined || num === null || num === '' || num === 0) return '';
    const cleanDigits = num.toString().replace(/[^0-9]/g, '');
    if (!cleanDigits) return '';
    return parseInt(cleanDigits, 10).toLocaleString('en-US');
  };

  // Helper to parse string with commas to clean number
  const parseNumberFromCommas = (str: string): number => {
    const cleanDigits = str.replace(/[^0-9]/g, '');
    return cleanDigits ? parseInt(cleanDigits, 10) : 0;
  };

  const content = (
    <div className="space-y-4 text-right">
      {/* Sidebar Header with Reset & Close */}
      <div className="flex items-center justify-between pb-3 border-b border-[#b7f1d1]/10">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#20df7c]" />
          <h2 className="text-sm font-bold text-white">فیلترهای پیشرفته بازار</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="reset-all-filters-btn"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] text-[#8F9A93] hover:text-[#20df7c] px-2 py-1 rounded bg-[#121814] hover:bg-[#0E120F] transition-colors cursor-pointer"
            title="بازنشانی تمام فیلترها"
          >
            <RotateCcw className="w-3 h-3" />
            <span>بازنشانی</span>
          </button>
          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              id="close-mobile-filter-drawer-btn"
              onClick={onCloseMobileDrawer}
              className="p-1.5 text-[#8F9A93] hover:text-white rounded-lg bg-[#121814] hover:bg-[#1f2d22] transition-colors"
              aria-label="بستن پنجره فیلترها"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: CATEGORIES (دسته‌بندی‌ها) */}
      <div className="space-y-2 border-b border-[#b7f1d1]/5 pb-3">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between text-xs font-bold text-[#F2F5F3] hover:text-[#20df7c] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-[#20df7c]" />
            <span>دسته‌بندی اصلی آیتم‌ها</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.categories ? 'rotate-180' : ''}`} />
        </button>

        {openSections.categories && (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`filter-cat-${cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-right transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#20df7c]/15 text-[#20df7c] border-[#20df7c] shadow-xs font-bold'
                      : 'bg-[#121814] text-[#8F9A93] border-[#b7f1d1]/10 hover:text-[#F2F5F3] hover:bg-[#151f18] hover:border-[#b7f1d1]/20'
                  }`}
                >
                  <span className={`text-xs ${isSelected ? 'text-[#20df7c]' : 'text-white'}`}>
                    {cat.labelFa}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#20df7c]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: PRICE (قیمت) */}
      <div className="space-y-2 border-b border-[#b7f1d1]/5 pb-3">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-bold text-[#F2F5F3] hover:text-[#20df7c] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#20df7c]" />
            <span className="text-xs sm:text-sm font-bold">محدوده قیمت (تومان)</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-1">
            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-2 text-right">
              <div>
                <label className="text-xs font-bold text-[#8F9A93] block mb-1">از حداقل:</label>
                <div className="relative flex items-center">
                  <input
                    id="filter-min-price-input"
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithCommas(filterState.minPrice)}
                    onChange={(e) => {
                      const val = parseNumberFromCommas(e.target.value);
                      setFilterState(prev => ({ ...prev, minPrice: val }));
                    }}
                    placeholder="۰"
                    className="w-full bg-[#121814] border border-[#b7f1d1]/20 focus:border-[#20df7c] rounded-xl pr-2.5 pl-12 py-2 text-sm sm:text-base font-bold font-mono text-[#20df7c] text-left focus:outline-none transition-colors shadow-inner"
                  />
                  <span className="absolute left-2 text-xs font-bold text-[#8F9A93] pointer-events-none select-none">
                    تومان
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#8F9A93] block mb-1">تا حداکثر:</label>
                <div className="relative flex items-center">
                  <input
                    id="filter-max-price-input"
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithCommas(filterState.maxPrice)}
                    onChange={(e) => {
                      const val = parseNumberFromCommas(e.target.value);
                      setFilterState(prev => ({ ...prev, maxPrice: val }));
                    }}
                    placeholder="نامحدود"
                    className="w-full bg-[#121814] border border-[#b7f1d1]/20 focus:border-[#20df7c] rounded-xl pr-2.5 pl-12 py-2 text-sm sm:text-base font-bold font-mono text-[#20df7c] text-left focus:outline-none transition-colors shadow-inner"
                  />
                  <span className="absolute left-2 text-xs font-bold text-[#8F9A93] pointer-events-none select-none">
                    تومان
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: 'زیر ۵ میلیون', min: 0, max: 5000000 },
                { label: 'تا ۵۰ میلیون', min: 0, max: 50000000 },
                { label: 'تا ۲۰۰ میلیون', min: 0, max: 200000000 },
                { label: 'آیتم‌های لوکس', min: 200000000, max: 0 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFilterState(prev => ({ ...prev, minPrice: p.min, maxPrice: p.max }));
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#121814] hover:bg-[#20df7c]/20 text-[#8F9A93] hover:text-[#20df7c] border border-[#b7f1d1]/10 hover:border-[#20df7c]/40 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: WEAR & FLOAT (کیفیت و فرسودگی) */}
      <div className="space-y-2 border-b border-[#b7f1d1]/5 pb-3">
        <button
          onClick={() => toggleSection('wear')}
          className="w-full flex items-center justify-between text-xs font-bold text-[#F2F5F3] hover:text-[#20df7c] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-[#20df7c]" />
            <span>کیفیت اسکین (Wear & Float)</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.wear ? 'rotate-180' : ''}`} />
        </button>

        {openSections.wear && (
          <div className="space-y-3 pt-1">
            {/* Visual Wear Color Bar */}
            <div className="space-y-1">
              <div className="h-2 rounded-full w-full bg-gradient-to-r from-[#20df7c] via-[#eab308] to-[#ef4444] shadow-inner" />
              <div className="flex justify-between text-[9px] font-mono text-[#8F9A93]">
                <span>0.00 (FN)</span>
                <span>0.15 (MW)</span>
                <span>0.38 (FT)</span>
                <span>0.45 (WW)</span>
                <span>1.00 (BS)</span>
              </div>
            </div>

            {/* Quick Wear Buttons: FN, MW, FT, WW, BS */}
            <div className="grid grid-cols-5 gap-1">
              {(['FN', 'MW', 'FT', 'WW', 'BS'] as WearCategory[]).map((wear) => {
                const isSelected = filterState.wearCategories.includes(wear);
                return (
                  <button
                    key={wear}
                    onClick={() => handleWearCategoryToggle(wear)}
                    className={`py-1 text-center rounded text-xs font-bold font-mono transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#20df7c] text-[#0A0D0B] border-[#20df7c] shadow-xs'
                        : 'bg-[#121814] text-[#8F9A93] border-[#b7f1d1]/10 hover:text-white hover:border-[#20df7c]/40'
                    }`}
                  >
                    {wear}
                  </button>
                );
              })}
            </div>

            {/* Float Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#8F9A93] block mb-1">حداقل Float:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={filterState.minFloat}
                  onChange={(e) => setFilterState(prev => ({ ...prev, minFloat: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-[#121814] border border-[#b7f1d1]/15 rounded-lg px-2 py-1 text-xs text-left text-white font-mono focus:outline-none focus:border-[#20df7c]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8F9A93] block mb-1">حداکثر Float:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={filterState.maxFloat}
                  onChange={(e) => setFilterState(prev => ({ ...prev, maxFloat: parseFloat(e.target.value) || 1 }))}
                  className="w-full bg-[#121814] border border-[#b7f1d1]/15 rounded-lg px-2 py-1 text-xs text-left text-white font-mono focus:outline-none focus:border-[#20df7c]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: RARITY (کمیابی) */}
      <div className="space-y-2 border-b border-[#b7f1d1]/5 pb-3">
        <button
          onClick={() => toggleSection('rarity')}
          className="w-full flex items-center justify-between text-xs font-bold text-[#F2F5F3] hover:text-[#20df7c] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#20df7c]" />
            <span>کمیابی (Rarity)</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.rarity ? 'rotate-180' : ''}`} />
        </button>

        {openSections.rarity && (
          <div className="pt-2">
            <div className="flex items-center justify-between gap-1 flex-row">
              {RARITY_CIRCLES.map((rc) => {
                const isSelected = (filterState.rarities || []).includes(rc.id);
                return (
                  <button
                    key={rc.id}
                    onClick={() => handleRarityToggle(rc.id)}
                    title={`${rc.nameFa} (${rc.id})`}
                    className="group relative flex flex-col items-center justify-center transition-all cursor-pointer p-0.5"
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 flex items-center justify-center border-2 ${
                        isSelected
                          ? `${rc.borderGlow} scale-110 ring-2 ring-white/20`
                          : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: rc.color }}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-black drop-shadow-md stroke-[3]" />
                      )}
                    </div>
                    <span className={`text-[9px] mt-1 font-bold transition-colors whitespace-nowrap ${isSelected ? 'text-white' : 'text-[#8F9A93] group-hover:text-white'}`}>
                      {rc.nameFa}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: SPECIAL ATTRIBUTES (ویژگی‌های ویژه) */}
      <div className="space-y-2 border-b border-[#b7f1d1]/5 pb-3">
        <button
          onClick={() => toggleSection('special')}
          className="w-full flex items-center justify-between text-xs font-bold text-[#F2F5F3] hover:text-[#20df7c] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#20df7c]" />
            <span>ویژگی‌های خاص و ارزش‌افزوده</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.special ? 'rotate-180' : ''}`} />
        </button>

        {openSections.special && (
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            {/* StatTrak */}
            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#121814] border border-[#b7f1d1]/10 cursor-pointer hover:border-amber-500/40 transition-colors">
              <input
                type="checkbox"
                checked={filterState.isStatTrakOnly}
                onChange={(e) => setFilterState(prev => ({ ...prev, isStatTrakOnly: e.target.checked }))}
                className="rounded accent-amber-500 w-3.5 h-3.5"
              />
              <span className="text-amber-400 font-bold text-[11px]">StatTrak™</span>
            </label>

            {/* Souvenir */}
            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#121814] border border-[#b7f1d1]/10 cursor-pointer hover:border-yellow-500/40 transition-colors">
              <input
                type="checkbox"
                checked={filterState.isSouvenirOnly}
                onChange={(e) => setFilterState(prev => ({ ...prev, isSouvenirOnly: e.target.checked }))}
                className="rounded accent-yellow-500 w-3.5 h-3.5"
              />
              <span className="text-yellow-400 font-bold text-[11px]">Souvenir</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  // If used as Mobile Drawer Modal
  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden text-right">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={onCloseMobileDrawer}
        />

        {/* Drawer Panel Sliding from Right in RTL */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <div className="w-screen max-w-md bg-[#17241C] border-l border-[#b7f1d1]/15 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {content}
            </div>

            {/* Sticky Mobile Drawer Footer with Apply and Results count */}
            <div className="p-4 bg-[#121814] border-t border-[#b7f1d1]/10 flex items-center gap-2">
              <button
                id="mobile-apply-filters-btn"
                onClick={onCloseMobileDrawer}
                className="flex-1 py-3 px-4 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] text-[#0A0D0B] font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#20df7c]/20 cursor-pointer"
              >
                <span>مشاهده نتایج</span>
                {totalResults !== undefined && (
                  <span className="font-mono px-2 py-0.5 rounded-full bg-[#0A0D0B]/20 text-[#0A0D0B] font-bold">
                    {toPersianDigits(totalResults)} اسکین
                  </span>
                )}
              </button>

              <button
                onClick={onResetFilters}
                className="py-3 px-3.5 rounded-xl bg-[#17241C] hover:bg-[#1f2d22] text-[#8F9A93] hover:text-white border border-[#b7f1d1]/10 transition-colors cursor-pointer"
                title="بازنشانی فیلترها"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Desktop Sticky Aside
  return (
    <aside className="w-72 lg:w-80 shrink-0 sticky top-16 max-h-[calc(100vh-5rem)] bg-[#17241C] border border-[#b7f1d1]/10 rounded-2xl p-4 overflow-y-auto transition-all">
      {content}
    </aside>
  );
};
