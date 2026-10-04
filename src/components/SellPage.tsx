import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertTriangle,
  Lock,
  RotateCw,
  ExternalLink,
  Clock,
  X,
  CheckCircle2,
  Tag,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Eye,
  Layers
} from 'lucide-react';
import {
  MarketItem,
  Currency,
  UserAccount,
  UserSaleListing,
  SteamInventoryError,
  ItemRarity,
  WearCategory
} from '../types';
import {
  formatPrice,
  toPersianDigits,
  USD_TO_TOMAN_RATE,
  getRarityColor,
  getRarityLabelFa
} from '../utils/formatters';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface SellPageProps {
  inventoryItems: MarketItem[];
  currency?: Currency;
  user: UserAccount | null;
  onConnectSteam: () => void;
  onBackToMarket: () => void;
  onInstantSell: (item: MarketItem) => void;
  onCustomPriceSell: (item: MarketItem, customPriceUSD: number) => void;
  onCancelSale: (saleId: string) => void;
  onSaveTradeUrl: (tradeUrl: string) => void;
  onRefreshInventory?: () => void;
  isLoadingInventory?: boolean;
  inventoryError?: SteamInventoryError | null;
}

const SteamLogo = ({ className = 'w-4 h-4 text-white' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-10 9.77c0 .61.06 1.21.17 1.8l5.22 2.14a3.17 3.17 0 0 1 1.77-.54c.2 0 .4.02.59.06l2.84-4.11a3.56 3.56 0 1 1 5.03 4.29l-4.11 2.84c.04.19.06.39.06.59a3.57 3.57 0 0 1-5.83 2.74L2.83 17.5A10 10 0 1 0 12 2zm-3.8 15.63a1.78 1.78 0 1 0-1.78-1.78c0 .98.8 1.78 1.78 1.78zm7.14-5.36a1.79 1.79 0 1 0 0-3.57 1.79 1.79 0 0 0 0 3.57z" />
  </svg>
);

const RARITY_RANK: Record<string, number> = {
  Extraordinary: 7,
  Covert: 6,
  Classified: 5,
  Restricted: 4,
  'Mil-Spec': 3,
  Industrial: 2,
  Consumer: 1,
};

const FALLBACK_SKIN_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'><rect width='256' height='256' fill='%23121814'/><path d='M52 142 L110 112 L196 112 L212 132 L176 144 L144 144 L126 168 L98 168 L108 144 L52 144 Z' fill='%2320df7c' fill-opacity='0.25' stroke='%2320df7c' stroke-width='3'/></svg>";

export const SellPage: React.FC<SellPageProps> = ({
  inventoryItems,
  currency = 'IRR',
  user,
  onConnectSteam,
  onBackToMarket,
  onInstantSell,
  onCustomPriceSell,
  onCancelSale,
  onSaveTradeUrl,
  onRefreshInventory,
  isLoadingInventory: propIsLoadingInventory,
  inventoryError = null,
}) => {
  const isSteamConnected = Boolean(user && user.steamId);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'my_sales'>('inventory');

  // Search, Filters, Sort & Tradable Toggle
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [wearFilter, setWearFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rarity_desc' | 'price_desc' | 'price_asc' | 'name_asc'>('rarity_desc');
  const [tradableOnly, setTradableOnly] = useState<boolean>(false);

  // Multi-select items state for the Selected Items Sidebar
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sidebarSellMode, setSidebarSellMode] = useState<'instant' | 'custom'>('instant');
  const [customPricesToman, setCustomPricesToman] = useState<Record<string, string>>({});

  // Trade URL Modal / Editing
  const [isTradeUrlModalOpen, setIsTradeUrlModalOpen] = useState(false);
  const [inputTradeUrl, setInputTradeUrl] = useState(user?.tradeUrl || '');
  const [tradeUrlError, setTradeUrlError] = useState<string | null>(null);

  // Single item sell modal (optional quick inspect/sell)
  const [itemToSell, setItemToSell] = useState<MarketItem | null>(null);
  const [sellMode, setSellMode] = useState<'instant' | 'custom'>('instant');
  const [customPriceInputUSD, setCustomPriceInputUSD] = useState<string>('');
  const [customPriceInputToman, setCustomPriceInputToman] = useState<string>('');
  const [sellModalError, setSellModalError] = useState<string | null>(null);

  const [internalLoading, setInternalLoading] = useState(false);
  const isLoadingInventory = propIsLoadingInventory ?? internalLoading;

  useEffect(() => {
    if (user?.tradeUrl) {
      setInputTradeUrl(user.tradeUrl);
    }
  }, [user?.tradeUrl]);

  // Keep selectedIds synced with available inventoryItems
  useEffect(() => {
    const validSet = new Set(inventoryItems.map((i) => i.id));
    setSelectedIds((prev) => prev.filter((id) => validSet.has(id)));
  }, [inventoryItems]);

  // Filtered and Sorted Inventory Items
  const filteredInventory = useMemo(() => {
    return inventoryItems
      .filter((item) => {
        if (tradableOnly && (item.tradable === false || item.marketable === false)) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchHash = item.market_hash_name?.toLowerCase().includes(q);
          const matchWeapon = item.weapon?.toLowerCase().includes(q);
          const matchType = item.type?.toLowerCase().includes(q);
          if (!matchName && !matchHash && !matchWeapon && !matchType) return false;
        }
        if (typeFilter !== 'all' && item.category !== typeFilter) {
          return false;
        }
        if (rarityFilter !== 'all' && item.rarity !== rarityFilter) {
          return false;
        }
        if (wearFilter !== 'all' && item.wearCategory !== wearFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rarity_desc') {
          const diff = (RARITY_RANK[b.rarity] || 0) - (RARITY_RANK[a.rarity] || 0);
          if (diff !== 0) return diff;
          return b.priceUSD - a.priceUSD;
        }
        if (sortBy === 'price_desc') return b.priceUSD - a.priceUSD;
        if (sortBy === 'price_asc') return a.priceUSD - b.priceUSD;
        if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [inventoryItems, tradableOnly, searchQuery, typeFilter, rarityFilter, wearFilter, sortBy]);

  const selectedItems = useMemo(
    () => inventoryItems.filter((item) => selectedIds.includes(item.id)),
    [inventoryItems, selectedIds]
  );

  // Toggle selection of an item card
  const handleToggleSelectItem = (item: MarketItem) => {
    if (item.tradable === false) {
      return;
    }
    setSelectedIds((prev) => {
      const exists = prev.includes(item.id);
      if (exists) {
        return prev.filter((id) => id !== item.id);
      } else {
        // Initialize custom price input in Toman if not set
        const defaultToman = Math.round(item.priceUSD * USD_TO_TOMAN_RATE).toString();
        setCustomPricesToman((curr) => ({
          ...curr,
          [item.id]: curr[item.id] || defaultToman,
        }));
        return [...prev, item.id];
      }
    });
  };

  const handleSelectAllFiltered = () => {
    const tradableFiltered = filteredInventory.filter((i) => i.tradable !== false);
    if (selectedIds.length === tradableFiltered.length && tradableFiltered.length > 0) {
      setSelectedIds([]);
    } else {
      const newPrices: Record<string, string> = { ...customPricesToman };
      tradableFiltered.forEach((item) => {
        if (!newPrices[item.id]) {
          newPrices[item.id] = Math.round(item.priceUSD * USD_TO_TOMAN_RATE).toString();
        }
      });
      setCustomPricesToman(newPrices);
      setSelectedIds(tradableFiltered.map((i) => i.id));
    }
  };

  // Batch sell selected items from sidebar
  const handleBatchSellSelected = () => {
    if (selectedItems.length === 0) return;
    if (!user?.tradeUrl) {
      setIsTradeUrlModalOpen(true);
      return;
    }

    if (sidebarSellMode === 'instant') {
      selectedItems.forEach((item) => {
        onInstantSell(item);
      });
      setSelectedIds([]);
    } else {
      selectedItems.forEach((item) => {
        const rawToman = customPricesToman[item.id];
        const numToman = Number((rawToman || '').replace(/\D/g, ''));
        const usdPrice =
          numToman > 0 ? Number((numToman / USD_TO_TOMAN_RATE).toFixed(2)) : item.priceUSD;
        onCustomPriceSell(item, usdPrice);
      });
      setSelectedIds([]);
    }
  };

  // Single item modal handlers
  const handleOpenSellModal = (item: MarketItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (item.tradable === false) return;
    if (!user?.tradeUrl) {
      setIsTradeUrlModalOpen(true);
      return;
    }
    setItemToSell(item);
    setSellMode('instant');
    setCustomPriceInputUSD(item.priceUSD.toString());
    const toman = Math.round(item.priceUSD * USD_TO_TOMAN_RATE);
    setCustomPriceInputToman(toman.toString());
    setSellModalError(null);
  };

  const handleCustomTomanChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setCustomPriceInputToman(clean);
    const numToman = Number(clean) || 0;
    const usd = (numToman / USD_TO_TOMAN_RATE).toFixed(2);
    setCustomPriceInputUSD(usd);
  };

  const handleConfirmSell = () => {
    if (!itemToSell) return;
    if (!user?.tradeUrl) {
      setIsTradeUrlModalOpen(true);
      return;
    }
    if (sellMode === 'instant') {
      onInstantSell(itemToSell);
      setItemToSell(null);
    } else {
      const parsedUSD = parseFloat(customPriceInputUSD);
      if (!parsedUSD || parsedUSD <= 0) {
        setSellModalError('لطفاً یک قیمت معتبر برای فروش وارد نمایید.');
        return;
      }
      onCustomPriceSell(itemToSell, parsedUSD);
      setItemToSell(null);
    }
  };

  const handleSaveTradeUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputTradeUrl.trim();
    if (!trimmed) {
      setTradeUrlError('لطفاً لینک ترید استیم خود را وارد کنید.');
      return;
    }
    if (!trimmed.includes('steamcommunity.com/tradeoffer/new/')) {
      setTradeUrlError(
        'لینک وارد شده نامعتبر است. لینک ترید استیم باید شامل steamcommunity.com/tradeoffer/new/ باشد.'
      );
      return;
    }
    onSaveTradeUrl(trimmed);
    setTradeUrlError(null);
    setIsTradeUrlModalOpen(false);
  };

  // Calculate sidebar totals
  const sidebarTotals = useMemo(() => {
    if (sidebarSellMode === 'instant') {
      const grossUSD = selectedItems.reduce((sum, i) => sum + i.priceUSD, 0);
      const feeUSD = Number((grossUSD * 0.02).toFixed(2));
      const netUSD = Number((grossUSD * 0.98).toFixed(2));
      return { grossUSD, feeUSD, netUSD, feePercent: 2 };
    } else {
      const grossUSD = selectedItems.reduce((sum, i) => {
        const rawToman = customPricesToman[i.id];
        const numToman = Number((rawToman || '').replace(/\D/g, ''));
        const usd = numToman > 0 ? numToman / USD_TO_TOMAN_RATE : i.priceUSD;
        return sum + usd;
      }, 0);
      const feeUSD = Number((grossUSD * 0.1).toFixed(2));
      const netUSD = Number((grossUSD * 0.9).toFixed(2));
      return { grossUSD, feeUSD, netUSD, feePercent: 10 };
    }
  }, [selectedItems, sidebarSellMode, customPricesToman]);

  // If user is not connected to Steam, display connect prompt
  if (!isSteamConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-right">
        <div className="bg-[#17241C] border border-[#b7f1d1]/15 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-white">عدم اتصال حساب استیم</h2>
            <p className="text-sm sm:text-base text-amber-200/90 leading-relaxed font-semibold">
              برای فروش آیتم حساب استیم خود را متصل کنید .
            </p>
            <p className="text-xs text-[#8F9A93] leading-relaxed pt-1">
              جهت بارگذاری موجودی آیتم‌های بازی Counter-Strike 2 و دریافت تریدآفر خودکار، نیاز به اتصال شناسه استیم خود دارید.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              id="sell-page-connect-steam-btn"
              onClick={onConnectSteam}
              className="px-4 py-2 rounded-lg bg-[#20df7c] hover:bg-[#1bc66e] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#20df7c]/25 transition-all active:scale-95 cursor-pointer"
            >
              <SteamLogo className="w-4 h-4 text-white shrink-0" />
              <span>استیم</span>
            </button>

            <button
              onClick={onBackToMarket}
              className="px-4 py-2 rounded-lg bg-[#121814] hover:bg-[#1e2a22] text-[#8F9A93] hover:text-white font-medium text-xs sm:text-sm border border-[#b7f1d1]/10 transition-colors cursor-pointer"
            >
              بازگشت به بازار
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userSales: UserSaleListing[] = user?.sales || [];
  const activeSalesCount = userSales.filter((s) => s.status !== 'cancelled').length;

  return (
    <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-6 space-y-6 text-right">
      {/* Top Banner & Steam Trade URL Status Bar */}
      <div className="bg-[#17241C] border border-[#b7f1d1]/15 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl border border-[#20df7c]/40 object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#20df7c]/10 border border-[#20df7c]/20 flex items-center justify-center text-[#20df7c] shrink-0">
              <SteamLogo className="w-6 h-6 text-[#20df7c]" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#20df7c] font-bold">اکانت متصل استیم:</span>
              <span className="text-xs font-mono font-bold text-white bg-black/30 px-2 py-0.5 rounded border border-white/10">
                {user?.username}
              </span>
            </div>
            <div className="text-xs text-[#8F9A93] mt-0.5 flex items-center gap-1.5">
              <span>SteamID64:</span>
              <span className="font-mono text-gray-300">{user?.steamId}</span>
            </div>
          </div>
        </div>

        {/* Trade Offer URL & Refresh Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {user?.tradeUrl ? (
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#121814] px-3 py-2 rounded-xl border border-[#20df7c]/30 text-xs">
              <div className="flex items-center gap-1.5 text-[#20df7c]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold">لینک ترید استیم فعال است</span>
              </div>
              <button
                onClick={() => setIsTradeUrlModalOpen(true)}
                className="text-[11px] text-[#8F9A93] hover:text-white underline cursor-pointer mr-2"
              >
                ویرایش
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/30 text-xs">
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-bold">لینک ترید استیم وارد نشده است!</span>
              </div>
              <button
                onClick={() => setIsTradeUrlModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors cursor-pointer mr-2"
              >
                ثبت لینک ترید
              </button>
            </div>
          )}

          <button
            id="refresh-steam-inventory-btn"
            onClick={() => {
              if (onRefreshInventory) {
                onRefreshInventory();
              } else {
                setInternalLoading(true);
                setTimeout(() => setInternalLoading(false), 800);
              }
            }}
            disabled={isLoadingInventory}
            className="px-4 py-2 rounded-xl bg-[#121814] hover:bg-[#1f2e24] text-white border border-[#b7f1d1]/15 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="دریافت مجدد اینونتوری از استیم"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#20df7c] ${isLoadingInventory ? 'animate-spin' : ''}`} />
            <span>به‌روزرسانی آیتم‌ها</span>
          </button>
        </div>
      </div>

      {/* Warning Notice if Trade URL is missing */}
      {!user?.tradeUrl && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-right">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-white block font-bold mb-0.5">توجه الزامی:</strong>
            برای فروش آیتم‌ها به سایت یا خریداران، وارد کردن لینک ترید استیم (Trade URL) در پروفایل الزامی است؛ در غیر اینصورت ربات سایت امکان ارسال تریدآفر به شما را نخواهد داشت.
          </div>
        </div>
      )}

      {/* Tabs: Inventory & My Sales Tracking */}
      <div className="flex items-center gap-2 border-b border-[#b7f1d1]/10 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#20df7c] text-[#0A0D0B] shadow-md shadow-[#20df7c]/20'
              : 'text-[#8F9A93] hover:text-white hover:bg-[#17241C]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>اینونتوری استیم CS2 ({toPersianDigits(inventoryItems.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_sales')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'my_sales'
              ? 'bg-[#20df7c] text-[#0A0D0B] shadow-md shadow-[#20df7c]/20'
              : 'text-[#8F9A93] hover:text-white hover:bg-[#17241C]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>فروش‌های من و در انتظار تسویه</span>
          {activeSalesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-black">
              {toPersianDigits(activeSalesCount)}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: STEAM CS2 INVENTORY SECTION */}
      {activeTab === 'inventory' && (
        <div className="space-y-5">
          {/* Inventory Filter, Search & Sort Toolbar */}
          <div className="bg-[#17241C] border border-[#b7f1d1]/15 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Search Box (4 cols) */}
              <div className="lg:col-span-4 relative">
                <Search className="w-4 h-4 text-[#8F9A93] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در اینونتوری (نام اسکین، سلاح، کیس، استیکر...)"
                  className="w-full h-10 pr-10 pl-3 rounded-xl bg-[#121814] border border-[#b7f1d1]/15 text-xs text-white placeholder-[#8F9A93] focus:outline-none focus:border-[#20df7c]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F9A93] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Type Filter (2 cols) */}
              <div className="lg:col-span-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#121814] border border-[#b7f1d1]/15 text-xs text-white focus:outline-none focus:border-[#20df7c] cursor-pointer"
                >
                  <option value="all">همه دسته‌ها (Type)</option>
                  <option value="knife">چاقو (Knife)</option>
                  <option value="glove">دستکش (Gloves)</option>
                  <option value="rifle">تفنگ (Rifle)</option>
                  <option value="sniper">تک‌تیرانداز (Sniper)</option>
                  <option value="pistol">پیستول (Pistol)</option>
                  <option value="smg">مسلسل دستی (SMG)</option>
                  <option value="shotgun">شاتگان / سنگین</option>
                  <option value="container">کیس و کانتینر (Case)</option>
                  <option value="sticker">استیکر و چارم (Sticker)</option>
                  <option value="agent">ایجنت و سایر (Agent)</option>
                </select>
              </div>

              {/* Rarity Filter (2 cols) */}
              <div className="lg:col-span-2">
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#121814] border border-[#b7f1d1]/15 text-xs text-white focus:outline-none focus:border-[#20df7c] cursor-pointer"
                >
                  <option value="all">همه کمیابی‌ها (Rarity)</option>
                  <option value="Extraordinary">طلایی (Extraordinary)</option>
                  <option value="Covert">قرمز (Covert)</option>
                  <option value="Classified">بنفش (Classified)</option>
                  <option value="Restricted">صورتی (Restricted)</option>
                  <option value="Mil-Spec">آبی (Mil-Spec)</option>
                  <option value="Industrial">آبی روشن (Industrial)</option>
                  <option value="Consumer">خاکستری (Consumer)</option>
                </select>
              </div>

              {/* Wear Filter (2 cols) */}
              <div className="lg:col-span-2">
                <select
                  value={wearFilter}
                  onChange={(e) => setWearFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#121814] border border-[#b7f1d1]/15 text-xs text-white focus:outline-none focus:border-[#20df7c] cursor-pointer"
                >
                  <option value="all">همه وضعیت‌ها (Wear)</option>
                  <option value="FN">Factory New (FN)</option>
                  <option value="MW">Minimal Wear (MW)</option>
                  <option value="FT">Field-Tested (FT)</option>
                  <option value="WW">Well-Worn (WW)</option>
                  <option value="BS">Battle-Scarred (BS)</option>
                </select>
              </div>

              {/* Sort By (2 cols) */}
              <div className="lg:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-[#121814] border border-[#b7f1d1]/15 text-xs text-white focus:outline-none focus:border-[#20df7c] cursor-pointer"
                >
                  <option value="rarity_desc">مرتب‌سازی: کمیابی (Rarity)</option>
                  <option value="price_desc">مرتب‌سازی: بیشترین قیمت</option>
                  <option value="price_asc">مرتب‌سازی: کمترین قیمت</option>
                  <option value="name_asc">مرتب‌سازی: نام (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Bottom Toolbar Row: Tradable Only Toggle & Multi-Select Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tradableOnly}
                    onChange={(e) => setTradableOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#20df7c] cursor-pointer"
                  />
                  <span className="text-gray-200 font-semibold">
                    فقط نمایش آیتم‌های قابل ترید و فروش (Tradable Only)
                  </span>
                </label>

                {filteredInventory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-[#20df7c] hover:underline font-bold cursor-pointer"
                  >
                    {selectedIds.length ===
                      filteredInventory.filter((i) => i.tradable !== false).length &&
                    selectedIds.length > 0
                      ? 'لغو انتخاب همه'
                      : 'انتخاب همه آیتم‌های قابل فروش'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-[#8F9A93]">
                <span>نمایش:</span>
                <span className="bg-[#121814] px-2.5 py-1 rounded-lg border border-[#b7f1d1]/10 text-white font-mono font-bold">
                  {toPersianDigits(filteredInventory.length)} از {toPersianDigits(inventoryItems.length)} آیتم
                </span>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT LAYOUT: Inventory Grid (Left/Right) + Selected Items Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* INVENTORY GRID AREA (cols 8 or 12) */}
            <div className={selectedItems.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
              {/* STATE 1: LOADING SKELETONS */}
              {isLoadingInventory ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#121814] px-4 py-3 rounded-xl border border-[#20df7c]/25">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#20df7c] border-t-transparent animate-spin" />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        در حال دریافت اینونتوری CS2 از سرورهای استیم (AppID: 730 / Context: 2)...
                      </span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">{user?.steamId}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#121814] border border-white/10 space-y-3 animate-pulse"
                      >
                        <div className="flex justify-between">
                          <div className="h-3 w-16 bg-white/10 rounded" />
                          <div className="h-3 w-10 bg-white/10 rounded" />
                        </div>
                        <div className="h-28 w-full bg-white/5 rounded-lg" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-3/4 bg-white/10 rounded" />
                          <div className="h-3 w-1/2 bg-white/10 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : inventoryError ? (
                /* STATE 2: EXPLICIT ERROR STATE (403 Private / 429 Rate Limit / Steam Error) */
                <div className="text-center py-14 px-4 bg-[#121814] rounded-2xl border border-red-500/30 space-y-4 max-w-2xl mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 mx-auto flex items-center justify-center">
                    {inventoryError.isPrivate ? (
                      <Lock className="w-7 h-7" />
                    ) : (
                      <AlertTriangle className="w-7 h-7" />
                    )}
                  </div>

                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {inventoryError.isPrivate
                        ? 'اینونتوری استیم شما خصوصی (Private) است'
                        : inventoryError.isRateLimited
                        ? 'محدودیت موقت درخواست به سرور استیم (HTTP 429)'
                        : 'خطا در دریافت اینونتوری استیم'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {inventoryError.message}
                    </p>
                    <p className="text-[11px] text-[#8F9A93] font-mono pt-1">
                      SteamID64: {user?.steamId}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => onRefreshInventory && onRefreshInventory()}
                      className="px-4 py-2.5 rounded-xl bg-[#20df7c] hover:bg-[#1bc76e] text-[#0A0D0B] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#20df7c]/20"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>تلاش مجدد و بارگذاری اینونتوری</span>
                    </button>

                    {inventoryError.isPrivate && (
                      <a
                        href="https://steamcommunity.com/my/edit/settings"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[#17241C] hover:bg-[#1f2e24] text-white border border-[#b7f1d1]/20 font-bold text-xs flex items-center gap-2 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                        <span>تنظیمات حریم خصوصی استیم (Public کردن Inventory)</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : inventoryItems.length === 0 ? (
                /* STATE 3: EMPTY INVENTORY STATE */
                <div className="text-center py-16 px-4 bg-[#121814] rounded-2xl border border-[#b7f1d1]/10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                    <Package className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-lg mx-auto">
                    <p className="text-base font-bold text-white">
                      هیچ آیتم CS2 در اینونتوری اکانت استیم شما یافت نشد.
                    </p>
                    <p className="text-xs text-[#8F9A93] leading-relaxed">
                      اکانت استیم متصل (<span className="text-cyan-400 font-mono">{user?.steamId}</span>) در حال حاضر فاقد اسکین، کیس یا آیتم در بخش Counter-Strike 2 (AppID 730 / Context 2) است.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => onRefreshInventory && onRefreshInventory()}
                      className="px-4 py-2 rounded-xl bg-[#20df7c] hover:bg-[#1bc76e] text-[#0A0D0B] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#20df7c]/20"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>بررسی مجدد اینونتوری استیم</span>
                    </button>
                    <a
                      href="https://steamcommunity.com/my/edit/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#17241C] hover:bg-[#1f2e24] text-white border border-[#b7f1d1]/20 font-bold text-xs flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      <span>تنظیمات حریم خصوصی استیم</span>
                    </a>
                  </div>
                </div>
              ) : filteredInventory.length === 0 ? (
                /* STATE 4: NO FILTER MATCHES */
                <div className="text-center py-12 px-4 bg-[#121814] rounded-2xl border border-white/10 space-y-3">
                  <p className="text-sm font-bold text-white">
                    هیچ آیتمی با فیلترهای انتخابی شما مطابقت ندارد.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setRarityFilter('all');
                      setWearFilter('all');
                      setTradableOnly(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#17241C] hover:bg-[#20df7c] text-white hover:text-black text-xs font-bold border border-white/10 transition-colors cursor-pointer"
                  >
                    پاک کردن فیلترها
                  </button>
                </div>
              ) : (
                /* STATE 5: RESPONSIVE STEAM INVENTORY ITEM CARDS GRID */
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 ${
                    selectedItems.length > 0
                      ? 'md:grid-cols-3 xl:grid-cols-4'
                      : 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                  } gap-3`}
                >
                  {filteredInventory.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isTradable = item.tradable !== false;
                    const rarityColor = item.name_color || getRarityColor(item.rarity);

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelectItem(item)}
                        style={{
                          borderColor: isSelected ? '#20df7c' : `${rarityColor}55`,
                          boxShadow: isSelected
                            ? '0 0 20px rgba(32, 223, 124, 0.25)'
                            : undefined,
                        }}
                        className={`group relative rounded-xl bg-[#121814] border transition-all flex flex-col justify-between select-none overflow-hidden ${
                          isTradable
                            ? 'cursor-pointer hover:bg-[#16221a] hover:-translate-y-0.5'
                            : 'opacity-65 cursor-not-allowed'
                        } ${isSelected ? 'ring-2 ring-[#20df7c] bg-[#16271c]' : ''}`}
                      >
                        {/* Top Rarity Bar colored by name_color */}
                        <div
                          className="h-1 w-full"
                          style={{ backgroundColor: rarityColor }}
                        />

                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          {/* Top Row: Selection Checkbox, Wear & StatTrak/Souvenir */}
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              {isTradable ? (
                                <span
                                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                    isSelected
                                      ? 'bg-[#20df7c] border-[#20df7c] text-black'
                                      : 'border-white/25 bg-black/40 text-transparent group-hover:border-white/50'
                                  }`}
                                >
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              ) : (
                                <span title="غیرقابل ترید" className="inline-flex">
                                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                                </span>
                              )}
                              <span className="font-semibold text-gray-300 truncate max-w-[90px]">
                                {item.exterior || item.condition || item.categoryFa}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {item.isStatTrak && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono font-bold px-1.5 py-0.2 rounded">
                                  ST™
                                </span>
                              )}
                              {item.isSouvenir && (
                                <span className="text-[9px] bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 font-mono font-bold px-1.5 py-0.2 rounded">
                                  SV
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Center: Lazy-loaded 256x256 Item Image with Rarity Glow & Fallback */}
                          <div className="relative my-1.5 flex items-center justify-center h-28">
                            <div
                              className="pointer-events-none absolute w-20 h-20 rounded-full blur-xl opacity-25 group-hover:opacity-45 transition-opacity"
                              style={{ backgroundColor: rarityColor }}
                            />
                            <img
                              src={getOptimizedImageUrl(item.image) || FALLBACK_SKIN_SVG}
                              alt={item.name}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== FALLBACK_SKIN_SVG) {
                                  target.src = FALLBACK_SKIN_SVG;
                                }
                              }}
                              className="relative z-10 max-h-24 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                            />

                            {/* Optional Inspect in Game Link */}
                            {item.inspectLink && (
                              <a
                                href={item.inspectLink}
                                onClick={(e) => e.stopPropagation()}
                                title="بررسی سه‌بعدی در داخل بازی (Inspect in Game)"
                                className="absolute bottom-0 left-0 z-20 p-1 rounded-lg bg-black/60 hover:bg-black text-gray-300 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          {/* Stickers Row (if weapon has stickers applied) */}
                          {item.stickers && item.stickers.length > 0 && (
                            <div className="flex items-center justify-center gap-1 py-0.5">
                              {item.stickers.slice(0, 5).map((stk, sIdx) => (
                                <div
                                  key={stk.id || sIdx}
                                  title={stk.name}
                                  className="w-6 h-6 rounded bg-black/50 p-0.5 border border-white/10 flex items-center justify-center"
                                >
                                  <img
                                    src={getOptimizedImageUrl(stk.image)}
                                    alt={stk.name}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Bottom Info: Item Name, Tradable Status & Quick Sell */}
                          <div className="space-y-1.5 pt-1 border-t border-white/5">
                            <h3
                              className="text-xs font-bold text-white truncate font-sans"
                              title={item.market_hash_name || item.name}
                            >
                              {item.name}
                            </h3>

                            <div className="flex items-center justify-between text-[10px]">
                              <span
                                className="font-semibold truncate"
                                style={{ color: rarityColor }}
                              >
                                {item.type || item.categoryFa}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded font-bold ${
                                  isTradable
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-amber-500/15 text-amber-400'
                                }`}
                              >
                                {isTradable ? 'قابل فروش' : 'قفل ترید'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs font-mono font-bold text-[#20df7c] tabular-nums">
                                {formatPrice(item.priceUSD, currency)}
                              </span>

                              {isTradable && (
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenSellModal(item, e)}
                                  className="px-2 py-1 rounded-lg bg-[#17241C] hover:bg-[#20df7c] text-gray-200 hover:text-black text-[10px] font-bold border border-white/10 transition-colors cursor-pointer flex items-center gap-0.5"
                                >
                                  <span>فروش</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SELECTED ITEMS SIDEBAR (Appears when 1 or more items are selected) */}
            {selectedItems.length > 0 && (
              <div className="lg:col-span-4 sticky top-20 bg-[#17241C] border border-[#20df7c]/35 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#20df7c]" />
                    <h3 className="text-sm font-black text-white">
                      آیتم‌های انتخاب‌شده ({toPersianDigits(selectedItems.length)})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف همه</span>
                  </button>
                </div>

                {/* Sale Mode Toggle inside Sidebar */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSidebarSellMode('instant')}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      sidebarSellMode === 'instant'
                        ? 'bg-[#1b3425] border-[#20df7c] text-white'
                        : 'bg-[#121814] border-white/10 text-[#8F9A93]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>فروش فوری</span>
                      <span className="text-[10px] text-[#20df7c] font-mono">۲٪ کارمزد</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarSellMode('custom')}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      sidebarSellMode === 'custom'
                        ? 'bg-[#142d38] border-cyan-400 text-white'
                        : 'bg-[#121814] border-white/10 text-[#8F9A93]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>قیمت دلخواه</span>
                      <span className="text-[10px] text-cyan-400 font-mono">۱۰٪ کارمزد</span>
                    </div>
                  </button>
                </div>

                {/* Selected Items Scrollable List */}
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-[#121814] border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={getOptimizedImageUrl(item.image) || FALLBACK_SKIN_SVG}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-contain rounded bg-black/40 p-1 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate font-sans">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-[#8F9A93]">
                              {item.exterior || item.condition} • {formatPrice(item.priceUSD, currency)}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSelectItem(item)}
                          className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {sidebarSellMode === 'custom' && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-gray-400 shrink-0">قیمت شما (تومان):</span>
                          <input
                            type="text"
                            dir="ltr"
                            value={customPricesToman[item.id] || ''}
                            onChange={(e) =>
                              setCustomPricesToman((prev) => ({
                                ...prev,
                                [item.id]: e.target.value.replace(/\D/g, ''),
                              }))
                            }
                            className="w-full h-8 px-2.5 rounded-lg bg-black/50 border border-cyan-400/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="p-3.5 rounded-xl bg-[#121814] border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-[#8F9A93]">
                    <span>مجموع ارزش آیتم‌ها:</span>
                    <span className="font-mono text-white font-bold tabular-nums">
                      {formatPrice(sidebarTotals.grossUSD, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#8F9A93]">
                    <span>کارمزد سایت ({toPersianDigits(sidebarTotals.feePercent)}٪):</span>
                    <span className="font-mono text-amber-400 tabular-nums">
                      -{formatPrice(sidebarTotals.feeUSD, currency)}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm">
                    <span className="text-white">دریافتی خالص شما:</span>
                    <span className="font-mono text-[#20df7c] tabular-nums">
                      {formatPrice(sidebarTotals.netUSD, currency)}
                    </span>
                  </div>
                </div>

                {/* Confirm Batch Sale Button */}
                <button
                  type="button"
                  onClick={handleBatchSellSelected}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all ${
                    sidebarSellMode === 'instant'
                      ? 'bg-[#20df7c] hover:bg-[#1bc66e] text-black shadow-[#20df7c]/20'
                      : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-cyan-400/20'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {sidebarSellMode === 'instant'
                      ? `فروش فوری ${toPersianDigits(selectedItems.length)} آیتم انتخاب‌شده`
                      : `ثبت ${toPersianDigits(selectedItems.length)} آیتم با قیمت دلخواه`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY SALES & CANCELLATION */}
      {activeTab === 'my_sales' && (
        <div className="space-y-4">
          <div className="bg-[#17241C] border border-[#b7f1d1]/15 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#b7f1d1]/10">
              <div>
                <h2 className="text-base font-bold text-white">فروش‌های ثبت‌شده و پیگیری تسویه</h2>
                <p className="text-xs text-[#8F9A93] mt-0.5">
                  فروش‌های فوری (با قابلیت لغو در صورت پشیمانی) و فروش‌های عادی با قیمت دلخواه شما در این بخش لیست شده‌اند.
                </p>
              </div>
            </div>

            {userSales.length === 0 ? (
              <div className="text-center py-14 px-4 space-y-3">
                <FileText className="w-10 h-10 text-[#8F9A93]/40 mx-auto" />
                <p className="text-sm font-bold text-white">هنوز هیچ اسلحه یا اسکین‌ای برای فروش ثبت نکرده‌اید.</p>
                <p className="text-xs text-[#8F9A93]">
                  به تب «اینونتوری استیم» بازگردید و آیتم مورد نظر خود را جهت فروش انتخاب نمایید.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-[#b7f1d1]/10 text-[#8F9A93] font-bold">
                      <th className="py-3 px-3">تصویر و نام اسکین</th>
                      <th className="py-3 px-3">روش فروش</th>
                      <th className="py-3 px-3">قیمت معامله</th>
                      <th className="py-3 px-3">کارمزد سایت</th>
                      <th className="py-3 px-3">دریافتی نهایی</th>
                      <th className="py-3 px-3">وضعیت و تسویه</th>
                      <th className="py-3 px-3 text-center">اقدام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#b7f1d1]/5">
                    {userSales.map((sale) => {
                      const isInstant = sale.saleType === 'instant';
                      const isPending =
                        sale.status === 'pending_payout' || sale.status === 'pending_buyer';
                      const isCancelled = sale.status === 'cancelled';

                      return (
                        <tr key={sale.id} className="hover:bg-[#121814] transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={getOptimizedImageUrl(sale.item.image) || FALLBACK_SKIN_SVG}
                                alt={sale.item.name}
                                className="w-10 h-10 object-contain rounded bg-[#0E120F] p-1 border border-white/5"
                              />
                              <div>
                                <div className="font-bold text-white font-sans">{sale.item.name}</div>
                                <div className="text-[10px] text-[#8F9A93]">{sale.item.condition}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {isInstant ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#20df7c] bg-[#20df7c]/10 px-2 py-0.5 rounded border border-[#20df7c]/20">
                                <Zap className="w-3 h-3" />
                                <span>فروش فوری</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                                <Tag className="w-3 h-3" />
                                <span>قیمت دلخواه</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-white">
                            {formatPrice(sale.priceUSD, currency)}
                          </td>

                          <td className="py-3 px-3 font-mono text-amber-400 font-semibold">
                            {toPersianDigits(sale.feePercent)}٪ ({formatPrice(sale.feeUSD, currency)})
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-[#20df7c]">
                            {formatPrice(sale.netPayoutUSD, currency)}
                          </td>

                          <td className="py-3 px-3">
                            {isCancelled ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20 text-[10px] font-bold">
                                لغو شده
                              </span>
                            ) : sale.status === 'completed' ? (
                              <span className="px-2 py-0.5 rounded bg-[#20df7c]/15 text-[#20df7c] border border-[#20df7c]/20 text-[10px] font-bold">
                                تسویه شده
                              </span>
                            ) : sale.status === 'pending_buyer' ? (
                              <span className="px-2 py-0.5 rounded bg-cyan-400/15 text-cyan-400 border border-cyan-400/20 text-[10px] font-bold">
                                در انتظار مشتری / خرید ادمین
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded bg-amber-400/15 text-amber-400 border border-amber-400/20 text-[10px] font-bold inline-block">
                                  در انتظار آزادسازی ۷ روزه
                                </span>
                                <div className="text-[10px] text-[#8F9A93] font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>قفل ترید استیم</span>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {isPending && !isCancelled ? (
                              <button
                                onClick={() => onCancelSale(sale.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                                title="لغو فروش و بازگشت آیتم به اینونتوری"
                              >
                                {isInstant ? 'لغو فروش فوری (انصراف)' : 'حذف از لیست فروش'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#8F9A93]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SINGLE ITEM SELLING OPTION MODAL */}
      {itemToSell && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17241C] border border-[#b7f1d1]/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200 text-right">
            <button
              onClick={() => setItemToSell(null)}
              className="absolute left-4 top-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[#b7f1d1]/10">
              <img
                src={getOptimizedImageUrl(itemToSell.image) || FALLBACK_SKIN_SVG}
                alt={itemToSell.name}
                className="w-16 h-16 object-contain rounded-xl bg-[#0E120F] p-1.5 border border-white/10"
              />
              <div>
                <h3 className="text-base font-black text-white font-sans">{itemToSell.name}</h3>
                <div className="flex items-center gap-2 text-xs text-[#8F9A93] mt-0.5">
                  <span>{itemToSell.condition}</span>
                  <span>•</span>
                  <span>
                    ارزش تخمینی مارکت:{' '}
                    <strong className="text-[#20df7c] font-mono">
                      {formatPrice(itemToSell.priceUSD, currency)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {sellModalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{sellModalError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">انتخاب روش فروش:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSellMode('instant')}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    sellMode === 'instant'
                      ? 'bg-[#1b3425] border-[#20df7c] text-white ring-1 ring-[#20df7c]'
                      : 'bg-[#121814] border-[#b7f1d1]/10 text-[#8F9A93] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#20df7c]" />
                      <span>فروش فوری</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#20df7c] bg-[#20df7c]/15 px-1.5 py-0.5 rounded">
                      ۲٪ کارمزد
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8F9A93] leading-relaxed">
                    فروش فوری به سایت با قیمت کارشناسی بازار
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSellMode('custom')}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    sellMode === 'custom'
                      ? 'bg-[#142d38] border-cyan-400 text-white ring-1 ring-cyan-400'
                      : 'bg-[#121814] border-[#b7f1d1]/10 text-[#8F9A93] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      <span>فروش عادی</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-400/15 px-1.5 py-0.5 rounded">
                      ۱۰٪ کارمزد
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8F9A93] leading-relaxed">
                    تعیین قیمت دلخواه توسط شما در مارکت
                  </p>
                </button>
              </div>
            </div>

            {sellMode === 'instant' && (
              <div className="p-4 rounded-xl bg-[#121814] border border-[#20df7c]/20 space-y-2.5 text-xs">
                <div className="flex justify-between text-[#8F9A93]">
                  <span>ارزش کارشناسی اسکین در مارکت:</span>
                  <span className="font-mono text-white font-bold">
                    {formatPrice(itemToSell.priceUSD, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-[#8F9A93]">
                  <span>کارمزد فروش فوری سایت (۲٪):</span>
                  <span className="font-mono text-amber-400">
                    -{formatPrice(Number((itemToSell.priceUSD * 0.02).toFixed(2)), currency)}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-white">مبلغ واریزی به کیف پول شما:</span>
                  <span className="font-mono text-[#20df7c]">
                    {formatPrice(Number((itemToSell.priceUSD * 0.98).toFixed(2)), currency)}
                  </span>
                </div>
              </div>
            )}

            {sellMode === 'custom' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 block">
                    قیمت پیشنهادی فروش شما (تومان):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={customPriceInputToman}
                      onChange={(e) => handleCustomTomanChange(e.target.value)}
                      placeholder="مثال: ۴,۲۵۰,۰۰۰"
                      className="w-full h-11 px-3.5 pl-16 rounded-xl bg-[#121814] border border-cyan-400/30 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8F9A93]">
                      تومان
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121814] border border-cyan-400/20 space-y-2 text-xs">
                  <div className="flex justify-between text-[#8F9A93]">
                    <span>قیمت ثبت‌شده توسط شما:</span>
                    <span className="font-mono text-white font-bold">
                      {formatPrice(parseFloat(customPriceInputUSD) || 0, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#8F9A93]">
                    <span>کارمزد فروش سایت پس از یافتن مشتری (۱۰٪):</span>
                    <span className="font-mono text-amber-400">
                      -{formatPrice(Number(((parseFloat(customPriceInputUSD) || 0) * 0.1).toFixed(2)), currency)}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm">
                    <span className="text-white">سود خالص دریافتی شما:</span>
                    <span className="font-mono text-cyan-400">
                      {formatPrice(Number(((parseFloat(customPriceInputUSD) || 0) * 0.9).toFixed(2)), currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmSell}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all ${
                  sellMode === 'instant'
                    ? 'bg-[#20df7c] hover:bg-[#1bc66e] text-black shadow-[#20df7c]/20'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-cyan-400/20'
                }`}
              >
                {sellMode === 'instant' ? (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>تأیید و واگذاری فوری اسکین به سایت</span>
                  </>
                ) : (
                  <>
                    <Tag className="w-4 h-4" />
                    <span>ثبت اسکین در بازار با قیمت دلخواه</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEAM TRADE URL MODAL */}
      {isTradeUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17241C] border border-[#b7f1d1]/20 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200 text-right">
            <button
              onClick={() => {
                setIsTradeUrlModalOpen(false);
                setTradeUrlError(null);
              }}
              className="absolute left-4 top-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-[#b7f1d1]/10">
              <SteamLogo className="w-5 h-5 text-[#20df7c]" />
              <h3 className="text-base font-bold text-white">ثبت لینک ترید استیم (Trade Offer URL)</h3>
            </div>

            <p className="text-xs text-[#8F9A93] leading-relaxed">
              برای فروش اسکین‌ها، وارد کردن لینک ترید الزامی است تا خریدار یا ربات سایت بتواند تریدآفر خرید را مستقیماً به اکانت استیم شما ارسال نماید.
            </p>

            {tradeUrlError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{tradeUrlError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTradeUrlSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">لینک ترید استیم شما:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={inputTradeUrl}
                  onChange={(e) => {
                    setInputTradeUrl(e.target.value);
                    if (tradeUrlError) setTradeUrlError(null);
                  }}
                  placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
                  className="w-full h-11 px-3 rounded-xl bg-[#121814] border border-[#b7f1d1]/20 text-white font-mono text-xs focus:outline-none focus:border-[#20df7c]"
                />
              </div>

              <div className="bg-[#121814] p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <span className="text-[#8F9A93]">لینک ترید خود را بلد نیستید؟</span>
                <a
                  href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#20df7c] hover:underline flex items-center gap-1 font-bold text-[11px]"
                >
                  <span>یافتن لینک در استیم</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] text-black font-black text-xs transition-colors cursor-pointer shadow-md shadow-[#20df7c]/20"
              >
                ذخیره لینک ترید و ادامه
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
