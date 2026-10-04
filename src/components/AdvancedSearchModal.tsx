import React from 'react';
import { 
  X, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Check, 
  Search, 
  Sliders, 
  Tag, 
  Layers, 
  Award,
  HelpCircle,
  Percent,
  Clock,
  Trash2
} from 'lucide-react';
import { FilterState } from '../types';
import { 
  DOPPLER_PHASES, 
  POPULAR_STICKERS, 
  POPULAR_COLLECTIONS 
} from '../utils/searchEngine';
import { toPersianDigits } from '../utils/formatters';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResults: number;
  onResetFilters: () => void;
  recentSearches?: string[];
  onAddRecentSearch?: (query: string) => void;
  onRemoveRecentSearch?: (query: string) => void;
  onClearRecentSearches?: () => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  filterState,
  setFilterState,
  totalResults,
  onResetFilters,
  recentSearches = [],
  onAddRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches
}) => {
  if (!isOpen) return null;

  const handlePhaseSelect = (phaseId: string) => {
    setFilterState(prev => ({
      ...prev,
      dopplerPhase: prev.dopplerPhase === phaseId ? 'all' : phaseId
    }));
  };

  const handleFloatTierSelect = (tier: 'all' | 'zero' | 'double_zero' | 'triple_zero') => {
    setFilterState(prev => {
      let minFloat = 0;
      let maxFloat = 1;
      if (tier === 'zero') {
        maxFloat = 0.05;
      } else if (tier === 'double_zero') {
        maxFloat = 0.01;
      } else if (tier === 'triple_zero') {
        maxFloat = 0.005;
      }
      return {
        ...prev,
        floatTier: tier,
        minFloat,
        maxFloat: tier === 'all' ? 1 : maxFloat
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-right font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="min-h-screen px-4 text-center flex items-center justify-center py-6">
        <div 
          className="inline-block w-full max-w-2xl bg-[#17241C] border border-[#b7f1d1]/20 rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all relative z-10 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#b7f1d1]/10 bg-[#121814]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#20df7c]/15 text-[#20df7c] flex items-center justify-center border border-[#20df7c]/30">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>جستجوی پیشرفته اسکین‌های CS2</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#20df7c]/20 text-[#20df7c] font-bold">
                    PRO
                  </span>
                </h3>
                <p className="text-[11px] text-[#8F9A93]">
                  فیلتر دقیق فازهای داپلر، استیکرها، هولد استیم و پترن‌های خاص
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8F9A93] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-[#F2F5F3]">
            
            {/* 0. Recent Searches Section */}
            <div className="space-y-2.5 bg-[#121814] border border-[#b7f1d1]/10 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#20df7c]" />
                  <span>تاریخچه جستجوهای اخیر شما</span>
                </label>
                {recentSearches && recentSearches.length > 0 && (
                  <button
                    onClick={onClearRecentSearches}
                    className="text-[11px] text-[#8F9A93] hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>پاکسازی کل تاریخچه</span>
                  </button>
                )}
              </div>

              {recentSearches && recentSearches.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recentSearches.map((term, index) => {
                    const isActive = filterState.searchQuery.toLowerCase() === term.toLowerCase();
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#20df7c] text-[#0A0D0B] border-[#20df7c]'
                            : 'bg-[#17241C] text-[#F2F5F3] border-[#b7f1d1]/15 hover:border-[#20df7c]/40 hover:text-[#20df7c]'
                        }`}
                      >
                        <span 
                          onClick={() => {
                            setFilterState(prev => ({ ...prev, searchQuery: term }));
                            if (onAddRecentSearch) onAddRecentSearch(term);
                          }}
                        >
                          {term}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onRemoveRecentSearch) onRemoveRecentSearch(term);
                          }}
                          className="hover:text-red-400 p-0.5 rounded transition-colors"
                          title="حذف این عبارت از تاریخچه"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[11px] text-[#8F9A93] py-1">
                  هیچ عبارت جستجوی اخیری در حافظه ثبت نشده است.
                </div>
              )}
            </div>

            {/* 1. Doppler Phases & Gems */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#20df7c]" />
                  <span>فازهای داپلر و جم‌های خاص (Doppler / Gems)</span>
                </label>
                {filterState.dopplerPhase && filterState.dopplerPhase !== 'all' && (
                  <button
                    onClick={() => setFilterState(prev => ({ ...prev, dopplerPhase: 'all' }))}
                    className="text-[11px] text-[#20df7c] hover:underline"
                  >
                    حذف فیلتر فاز
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DOPPLER_PHASES.map((phase) => {
                  const isSelected = (filterState.dopplerPhase || 'all') === phase.id;
                  return (
                    <button
                      key={phase.id}
                      onClick={() => handlePhaseSelect(phase.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#20df7c]/15 border-[#20df7c] text-white shadow-sm'
                          : 'bg-[#121814] border-[#b7f1d1]/10 text-[#8F9A93] hover:text-white hover:border-[#b7f1d1]/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {phase.color && (
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: phase.color }}
                          />
                        )}
                        <span className="font-semibold text-[11px]">{phase.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#20df7c] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Instant Delivery & Trade Hold */}
            <div className="space-y-2.5 bg-[#121814] border border-[#b7f1d1]/10 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#20df7c]/20 text-[#20df7c] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">تحویل فوری استیم (Trade Hold: ۰ روز)</span>
                    <span className="text-[11px] text-[#8F9A93] block">
                      فقط اسکین‌هایی که آنی و بدون دوره قفل ۷ روزه ترید تحویل می‌شوند
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!filterState.instantTradeOnly}
                    onChange={(e) => setFilterState(prev => ({ ...prev, instantTradeOnly: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#17241C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#20df7c]"></div>
                </label>
              </div>
            </div>

            {/* 3. Sticker Filter & Name Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#20df7c]" />
                  <span>جستجو بر اساس استیکر (Stickers)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#8F9A93] hover:text-white">
                  <input
                    type="checkbox"
                    checked={!!filterState.hasStickersOnly}
                    onChange={(e) => setFilterState(prev => ({ ...prev, hasStickersOnly: e.target.checked }))}
                    className="rounded accent-[#20df7c] w-3.5 h-3.5"
                  />
                  <span>فقط اسکین‌های دارای استیکر</span>
                </label>
              </div>

              {/* Sticker input */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9A93]" />
                <input
                  type="text"
                  value={filterState.stickerQuery || ''}
                  onChange={(e) => setFilterState(prev => ({ ...prev, stickerQuery: e.target.value }))}
                  placeholder="نام استیکر را وارد کنید (مثال: Crown, Titan, Katowice, Cloud9)..."
                  className="w-full bg-[#121814] border border-[#b7f1d1]/15 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-[#8F9A93] focus:outline-none focus:border-[#20df7c]"
                />
                {filterState.stickerQuery && (
                  <button
                    onClick={() => setFilterState(prev => ({ ...prev, stickerQuery: '' }))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8F9A93] hover:text-white"
                  >
                    پاک کردن
                  </button>
                )}
              </div>

              {/* Popular stickers chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_STICKERS.map((stk) => {
                  const isActive = filterState.stickerQuery === stk;
                  return (
                    <button
                      key={stk}
                      onClick={() => setFilterState(prev => ({
                        ...prev,
                        stickerQuery: isActive ? '' : stk,
                        hasStickersOnly: true
                      }))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#20df7c] text-[#0A0D0B] border-[#20df7c]'
                          : 'bg-[#121814] text-[#8F9A93] border-[#b7f1d1]/10 hover:border-[#20df7c]/40 hover:text-white'
                      }`}
                    >
                      {stk}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Float Quality Presets */}
            <div className="space-y-2.5">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#20df7c]" />
                <span>رتبه و دقت فلوت (Float Quality Presets)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'همه فلوت‌ها', desc: '0.00 الی 1.00' },
                  { id: 'zero', label: 'کم‌ساییدگی', desc: 'Float < 0.05' },
                  { id: 'double_zero', label: 'Double Zero (0.01)', desc: 'کیفیت استثنایی' },
                  { id: 'triple_zero', label: 'Triple Zero (0.00x)', desc: 'فوق کلکسیونی' },
                ].map((tier) => {
                  const isSelected = (filterState.floatTier || 'all') === tier.id;
                  return (
                    <button
                      key={tier.id}
                      onClick={() => handleFloatTierSelect(tier.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#20df7c]/15 border-[#20df7c] text-white'
                          : 'bg-[#121814] border-[#b7f1d1]/10 text-[#8F9A93] hover:text-white hover:border-[#b7f1d1]/30'
                      }`}
                    >
                      <span className="font-bold text-xs block">{tier.label}</span>
                      <span className="text-[10px] text-[#8F9A93] font-mono block mt-0.5">{tier.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Discount Threshold */}
            <div className="space-y-2.5">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-[#20df7c]" />
                <span>حداقل درصد تخفیف بازار</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { val: 0, label: 'همه' },
                  { val: 5, label: '۵٪+' },
                  { val: 10, label: '۱۰٪+' },
                  { val: 15, label: '۱۵٪+' },
                  { val: 20, label: '۲۰٪+' },
                ].map((item) => {
                  const isSelected = (filterState.minDiscount || 0) === item.val;
                  return (
                    <button
                      key={item.val}
                      onClick={() => setFilterState(prev => ({ ...prev, minDiscount: item.val }))}
                      className={`py-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#20df7c] text-[#0A0D0B] border-[#20df7c]'
                          : 'bg-[#121814] text-[#8F9A93] border-[#b7f1d1]/10 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Case / Collection Filter */}
            <div className="space-y-2.5">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#20df7c]" />
                <span>کیس یا کالکشن (Collection / Case)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterState.collectionQuery || ''}
                  onChange={(e) => setFilterState(prev => ({ ...prev, collectionQuery: e.target.value }))}
                  placeholder="نام کالکشن یا کیس (مثال: Cobblestone, Danger Zone, Huntsman)..."
                  className="w-full bg-[#121814] border border-[#b7f1d1]/15 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8F9A93] focus:outline-none focus:border-[#20df7c]"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_COLLECTIONS.map((col) => {
                  const isActive = filterState.collectionQuery === col;
                  return (
                    <button
                      key={col}
                      onClick={() => setFilterState(prev => ({ ...prev, collectionQuery: isActive ? '' : col }))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#20df7c] text-[#0A0D0B] border-[#20df7c]'
                          : 'bg-[#121814] text-[#8F9A93] border-[#b7f1d1]/10 hover:border-[#20df7c]/40 hover:text-white'
                      }`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Paint Seed / Pattern Index */}
            <div className="space-y-2.5">
              <label className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#20df7c]" />
                <span>شماره پترن یا Paint Seed</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filterState.paintSeed || ''}
                  onChange={(e) => setFilterState(prev => ({ ...prev, paintSeed: e.target.value }))}
                  placeholder="مثال: 701, 312, 421..."
                  className="flex-1 bg-[#121814] border border-[#b7f1d1]/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#20df7c]"
                />
                {filterState.paintSeed && (
                  <button
                    onClick={() => setFilterState(prev => ({ ...prev, paintSeed: '' }))}
                    className="px-3 py-2 rounded-xl bg-[#121814] text-[#8F9A93] hover:text-white border border-[#b7f1d1]/10"
                  >
                    پاک کردن
                  </button>
                )}
              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="p-3 bg-[#121814]/60 border border-[#b7f1d1]/10 rounded-xl flex items-start gap-2.5 text-[11px] text-[#8F9A93]">
              <HelpCircle className="w-4 h-4 text-[#20df7c] shrink-0 mt-0.5" />
              <p>
                <strong>راهنمای جستجوی سریع:</strong> شما می‌توانید مستقیماً در نوار جستجو عباراتی مانند{' '}
                <span className="text-[#20df7c] font-mono">ak st ft</span> یا{' '}
                <span className="text-[#20df7c] font-mono">butterfly doppler p2</span> یا نام‌های فارسی مثل{' '}
                <span className="text-white">کلاش</span>، <span className="text-white">آوپ</span> یا{' '}
                <span className="text-white">پروانه‌ای</span> را تایپ کنید.
              </p>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#121814] border-t border-[#b7f1d1]/10">
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 text-xs text-[#8F9A93] hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی پیش‌فرض</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] text-[#0A0D0B] font-extrabold text-xs transition-colors shadow-lg shadow-[#20df7c]/20 cursor-pointer"
            >
              <span>اعمال فیلترها و نمایش نتایج</span>
              <span className="font-mono bg-[#0A0D0B]/20 px-2 py-0.5 rounded-full text-[11px]">
                {toPersianDigits(totalResults)} اسکین
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
