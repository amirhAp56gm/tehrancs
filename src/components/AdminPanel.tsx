import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Trash2, 
  Check, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Coins, 
  Layers,
  ArrowUpRight,
  Clock,
  UserCheck,
  Pencil,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AdminPurchaseRecord, AdminSaleRecord, MarketItem, Currency, ItemRarity, WearCategory } from '../types';
import { formatPrice, toPersianDigits, USD_TO_TOMAN_RATE } from '../utils/formatters';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { 
  EditProductModal, 
  CS2_WEAPONS_LIST, 
  PRESET_SKIN_GALLERY, 
  CATEGORY_OPTIONS, 
  WEAR_OPTIONS, 
  RARITY_OPTIONS 
} from './EditProductModal';

interface AdminPanelProps {
  items: MarketItem[];
  onAddNewProduct: (item: MarketItem) => void;
  onUpdateProduct: (item: MarketItem) => void;
  onDeleteItem: (id: string) => void;
  onResetDefaultItems?: () => void;
  currency: Currency;
  onNavigateToMarket: () => void;
  purchases?: AdminPurchaseRecord[];
  sales?: AdminSaleRecord[];
  onApproveSale?: (saleId: string) => void;
  onDeletePurchase?: (purchaseId: string) => void;
  onDeleteSale?: (saleId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  items,
  onAddNewProduct,
  onUpdateProduct,
  onDeleteItem,
  onResetDefaultItems,
  currency,
  onNavigateToMarket,
  purchases = [],
  sales = [],
  onApproveSale,
  onDeletePurchase,
  onDeleteSale,
}) => {
  const [activeTab, setActiveTab] = useState<'products_list' | 'add_product' | 'purchases' | 'sales'>('products_list');
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Selected Item for Edit Modal
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);

  // New Product Form State
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const [weapon, setWeapon] = useState('AK-47');
  const [isCustomWeapon, setIsCustomWeapon] = useState(false);
  const [customWeaponName, setCustomWeaponName] = useState('');
  const [shortName, setShortName] = useState('Slate');
  const [category, setCategory] = useState<MarketItem['category']>('rifle');
  const [wearCategory, setWearCategory] = useState<WearCategory>('FN');
  const [floatValue, setFloatValue] = useState('0.01524');
  
  // Price in Toman & USD
  const [priceToman, setPriceToman] = useState('4140000');
  const [priceUSD, setPriceUSD] = useState('45.00');
  
  const [discountPercent, setDiscountPercent] = useState('12');
  const [rarity, setRarity] = useState<ItemRarity>('Restricted');
  const [isStatTrak, setIsStatTrak] = useState(false);
  const [isSouvenir, setIsSouvenir] = useState(false);
  const [image, setImage] = useState(PRESET_SKIN_GALLERY[0].url);
  const [formSuccessMessage, setFormSuccessMessage] = useState(false);
  const [addErrorMessage, setAddErrorMessage] = useState<string | null>(null);

  // Dynamic Purchases and Sales from props (default [] if no orders yet)

  // Price synchronization handlers for Add form
  const handleTomanChange = (val: string) => {
    const cleanDigits = val.replace(/\D/g, '');
    setPriceToman(cleanDigits);
    const num = parseFloat(cleanDigits);
    if (!isNaN(num) && num > 0) {
      const calculatedUSD = Number((num / USD_TO_TOMAN_RATE).toFixed(2));
      setPriceUSD(calculatedUSD.toString());
    } else {
      setPriceUSD('0');
    }
  };

  const handleUSDChange = (val: string) => {
    setPriceUSD(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const calculatedToman = Math.round(num * USD_TO_TOMAN_RATE);
      setPriceToman(calculatedToman.toString());
    } else {
      setPriceToman('0');
    }
  };

  // Image Upload handler for Add form
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAddErrorMessage('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrorMessage(null);

    const finalWeapon = isCustomWeapon ? customWeaponName.trim() : weapon;
    if (!finalWeapon) {
      setAddErrorMessage('لطفاً نام سلاح را مشخص کنید.');
      return;
    }

    if (!shortName.trim()) {
      setAddErrorMessage('لطفاً طرح اسکین را وارد کنید.');
      return;
    }

    const parsedPrice = parseFloat(priceUSD);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setAddErrorMessage('قیمت نامعتبر است.');
      return;
    }

    const parsedFloat = parseFloat(floatValue);
    if (isNaN(parsedFloat) || parsedFloat < 0 || parsedFloat > 1) {
      setAddErrorMessage('مقدار فلوت باید بین ۰ و ۱ باشد.');
      return;
    }

    const parsedDiscount = discountPercent ? parseFloat(discountPercent) : undefined;

    const conditionMap: Record<WearCategory, string> = {
      FN: 'Factory New',
      MW: 'Minimal Wear',
      FT: 'Field-Tested',
      WW: 'Well-Worn',
      BS: 'Battle-Scarred'
    };

    const categoryFaMap: Record<string, string> = {
      knife: 'چاقو',
      glove: 'دستکش',
      rifle: 'تفنگ',
      sniper: 'اسنایپر',
      pistol: 'کلت',
      smg: 'مسلسل سبک',
      shotgun: 'شات‌گان',
      container: 'کیس و جعبه',
      sticker: 'استیکر',
      agent: 'ایجنت'
    };

    const cleanName = `${finalWeapon} | ${shortName.trim()}`;
    const formattedFullName = isStatTrak ? `StatTrak™ ${cleanName}` : isSouvenir ? `Souvenir ${cleanName}` : cleanName;

    const newProduct: MarketItem = {
      id: `admin-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: formattedFullName,
      shortName: shortName.trim(),
      weapon: finalWeapon,
      category,
      categoryFa: categoryFaMap[category] || 'سلاح',
      condition: conditionMap[wearCategory],
      wearCategory,
      floatValue: parsedFloat,
      paintSeed: Math.floor(Math.random() * 999) + 1,
      priceUSD: parsedPrice,
      discountPercent: parsedDiscount && parsedDiscount > 0 ? parsedDiscount : undefined,
      isStatTrak,
      isSouvenir,
      isHighlight: true,
      rarity,
      image: image || PRESET_SKIN_GALLERY[0].url,
      sellerStatus: 'online',
      tradeHoldHours: 0,
      expiresInText: 'ارسال فوری',
      historyLowUSD: Math.round(parsedPrice * 0.9),
      historyAverageUSD: Math.round(parsedPrice * 1.05),
      tags: ['تایید شده توسط مدیریت', 'تحویل فوری']
    };

    onAddNewProduct(newProduct);
    setFormSuccessMessage(true);

    // Reset some fields for quick adding of another item
    setShortName('');
    setTimeout(() => {
      setFormSuccessMessage(false);
    }, 4000);
  };

  const [adminPage, setAdminPage] = useState(1);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    type: 'product' | 'purchase' | 'sale';
    id: string;
    name: string;
  } | null>(null);

  const filteredItems = items.filter(it => {
    const matchesSearch = 
      it.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      it.weapon.toLowerCase().includes(productSearch.toLowerCase()) ||
      it.shortName.toLowerCase().includes(productSearch.toLowerCase());
    
    const matchesCat = categoryFilter === 'all' || it.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  useEffect(() => {
    setAdminPage(1);
  }, [productSearch, categoryFilter, items.length]);

  const ADMIN_ITEMS_PER_PAGE = 25;
  const totalAdminPages = Math.ceil(filteredItems.length / ADMIN_ITEMS_PER_PAGE);

  const paginatedFilteredItems = filteredItems.slice(
    (adminPage - 1) * ADMIN_ITEMS_PER_PAGE,
    adminPage * ADMIN_ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(updated) => {
          onUpdateProduct(updated);
          setEditingItem(null);
        }}
        currency={currency}
      />

      {/* Admin Top Dashboard Header */}
      <div className="bg-[#161617] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    پنل مدیریت
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToMarket}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#262629] hover:bg-[#323236] text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-[#20df7c]" />
              <span>مشاهده و بازگشت به صفحه بازار</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-[#1d1d1f] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
              <span>تعداد کل محصولات فعال</span>
              <Package className="w-4 h-4 text-[#20df7c]" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {toPersianDigits(items.length)} عدد
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              قابلیت ویرایش و حذف تمام موارد
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1d1d1f] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
              <span>سفارش‌های موفق</span>
              <ShoppingCart className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {toPersianDigits(purchases.length)} سفارش
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              ارسال فوری به استیم خریدار
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1d1d1f] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
              <span>درخواست‌های تسویه فروش</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {toPersianDigits(sales.length)} معامله
            </div>
            <div className="text-[10px] text-blue-400 mt-1">
              کارمزد ویژه ۲٪ اعمال شده
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1d1d1f] border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
              <span>نرخ تبدیل دلار به تومان</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {toPersianDigits(USD_TO_TOMAN_RATE.toLocaleString('fa-IR'))} ت
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              محاسبه آنلاین قیمت‌ها
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Tabs */}
      <div className="space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          
          <button
            id="tab-admin-products-list"
            onClick={() => setActiveTab('products_list')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'products_list' || activeTab === 'add_product'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#161617] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>لیست تمام محصولات و ویرایش ({toPersianDigits(items.length)})</span>
          </button>

          <button
            id="tab-admin-purchases"
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#161617] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>لیست خریدهای کاربران</span>
          </button>

          <button
            id="tab-admin-sales"
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#161617] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>لیست فروش‌ها و تسویه‌ها</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS LIST & EDIT / DELETE */}
        {activeTab === 'products_list' && (
          <div className="bg-[#161617] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>لیست تمام محصولات فعال بازار</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#20df7c]/15 text-[#20df7c] font-mono font-bold">
                    {toPersianDigits(filteredItems.length)} محصول
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  تمام محصولات (محصولات پیش‌فرض و موارد ساخته شده توسط ادمین) در این جدول قرار دارند و همگی با دکمه ویرایش (مداد) و حذف قابل مدیریت هستند.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Category Dropdown Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-medium focus:border-[#20df7c] focus:outline-none"
                >
                  <option value="all">تمام دسته‌ها</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.labelFa}</option>
                  ))}
                </select>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="جستجوی محصول، سلاح، طرح..."
                    className="w-full h-10 px-3 pr-8 rounded-xl bg-[#262629] border border-white/10 text-white text-xs focus:border-[#20df7c] focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Quick Add Product Button */}
                <button
                  onClick={() => setActiveTab('add_product')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-black" />
                  <span>افزودن اسکین</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 font-bold bg-[#1d1d1f]">
                    <th className="py-3 px-3">تصویر</th>
                    <th className="py-3 px-3">نام و مشخصات اسکین</th>
                    <th className="py-3 px-2">دسته‌بندی</th>
                    <th className="py-3 px-2">کیفیت (Wear)</th>
                    <th className="py-3 px-2">فلوت (Float)</th>
                    <th className="py-3 px-3">قیمت تومانی</th>
                    <th className="py-3 px-2">کمیابی</th>
                    <th className="py-3 px-3 text-center">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400">
                        هیچ محصولی با مشخصات جستجو شده یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    paginatedFilteredItems.map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/[0.03] transition-colors group">
                        
                        {/* Image */}
                        <td className="py-2.5 px-3">
                          <div className="w-12 h-12 rounded-xl bg-[#262629] p-1 border border-white/10 flex items-center justify-center">
                            <img 
                              src={getOptimizedImageUrl(prod.image)} 
                              alt={prod.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain" 
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                if (!target.dataset.fallbackTried) {
                                  target.dataset.fallbackTried = 'true';
                                  if (prod.name?.includes('Butterfly') || prod.weapon?.includes('Butterfly')) {
                                    target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbsslg5t1OD3EjVP5dumnZSEheLnP7vhgneGupJ03LiU94qi0Fbg80JsYW3zLI7Ecw86aV_TrVW9wuvn0ZW5vpqcy3FiuCRx7XfZnhG1hEpSLrs42iU367A/360fx360f';
                                  } else {
                                    target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV19m5h5S0m_7zO6-fzj9V7MR3n-rC89mm0VXs_EVvamj0cYHEIFM9YlvU81TtlOi9hMS4vZvKznZquSY8pSGK6B_V8Wk/360fx360f';
                                  }
                                }
                              }}
                            />
                          </div>
                        </td>

                        {/* Name & Tags */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-white font-sans text-xs">
                              {prod.name}
                            </span>
                            {prod.isStatTrak && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                StatTrak™
                              </span>
                            )}
                            {prod.isSouvenir && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Souvenir
                              </span>
                            )}
                            {prod.discountPercent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400">
                                {prod.discountPercent}٪ تخفیف
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                            سلاح: {prod.weapon} • طرح: {prod.shortName}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-2 text-gray-300 font-medium">
                          {prod.categoryFa || prod.category}
                        </td>

                        {/* Wear */}
                        <td className="py-2.5 px-2 font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            prod.wearCategory === 'FN' ? 'bg-emerald-500/15 text-emerald-400' :
                            prod.wearCategory === 'MW' ? 'bg-lime-500/15 text-lime-400' :
                            prod.wearCategory === 'FT' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-rose-500/15 text-rose-400'
                          }`}>
                            {prod.wearCategory}
                          </span>
                        </td>

                        {/* Float */}
                        <td className="py-2.5 px-2 font-mono text-gray-400 text-[11px]">
                          {prod.floatValue.toFixed(4)}
                        </td>

                        {/* Toman Price */}
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          {formatPrice(prod.priceUSD, 'IRR')}
                        </td>

                        {/* Rarity */}
                        <td className="py-2.5 px-2">
                          <span className="text-[10px] font-bold text-gray-300">
                            {prod.rarity}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              id={`edit-item-btn-${prod.id}`}
                              onClick={() => setEditingItem(prod)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#262629] text-gray-200 hover:text-white hover:bg-amber-500/20 hover:border-amber-500/30 border border-white/10 transition-colors font-medium text-[11px] cursor-pointer"
                              title="ویرایش کامل کارت و مشخصات محصول"
                            >
                              <Pencil className="w-3.5 h-3.5 text-amber-400" />
                              <span>ویرایش</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              id={`delete-item-btn-${prod.id}`}
                              onClick={() => setDeleteConfirmState({
                                type: 'product',
                                id: prod.id,
                                name: `محصول «${prod.name}»`
                              })}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                              title="حذف از بازار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Admin Products Table - Only shown if total products > 25 */}
            {totalAdminPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-gray-400">
                <div>
                  نمایش <span className="font-mono text-white font-bold">{toPersianDigits((adminPage - 1) * ADMIN_ITEMS_PER_PAGE + 1)}</span> تا{' '}
                  <span className="font-mono text-white font-bold">{toPersianDigits(Math.min(adminPage * ADMIN_ITEMS_PER_PAGE, filteredItems.length))}</span> از{' '}
                  <span className="font-mono text-[#20df7c] font-bold">{toPersianDigits(filteredItems.length)}</span> محصول
                </div>

                <div className="flex items-center gap-1.5 dir-rtl">
                  <button
                    onClick={() => setAdminPage(prev => Math.max(1, prev - 1))}
                    disabled={adminPage === 1}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-xs transition-all ${
                      adminPage === 1
                        ? 'opacity-30 cursor-not-allowed text-gray-500 bg-[#262629]'
                        : 'bg-[#262629] hover:bg-[#323236] text-white border border-white/10 cursor-pointer'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>قبلی</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={`admin-page-${p}`}
                        onClick={() => setAdminPage(p)}
                        className={`w-8 h-8 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer flex items-center justify-center ${
                          adminPage === p
                            ? 'bg-[#20df7c] text-black font-black'
                            : 'bg-[#262629] hover:bg-[#323236] text-gray-300 border border-white/5'
                        }`}
                      >
                        {toPersianDigits(p)}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setAdminPage(prev => Math.min(totalAdminPages, prev + 1))}
                    disabled={adminPage === totalAdminPages}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-xs transition-all ${
                      adminPage === totalAdminPages
                        ? 'opacity-30 cursor-not-allowed text-gray-500 bg-[#262629]'
                        : 'bg-[#262629] hover:bg-[#323236] text-white border border-white/10 cursor-pointer'
                    }`}
                  >
                    <span>بعدی</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW PRODUCT FORM */}
        {activeTab === 'add_product' && (
          <div className="bg-[#161617] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  افزودن و ساخت محصول جدید به بازار
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  محصول جدید ساخته شده در لیست محصولات ذخیره گردیده، با رفرش صفحه پاک نمی‌شود و بلافاصله در فروشگاه قابل مشاهده، ویرایش و خرید خواهد بود.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('products_list')}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                بازگشت به لیست محصولات ←
              </button>
            </div>

            {formSuccessMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs font-bold animate-in fade-in duration-150">
                <Check className="w-5 h-5 shrink-0" />
                <span>محصول جدید با موفقیت ایجاد شد و در حافظه بازار ذخیره گردید! این محصول پس از رفرش نیز باقی می‌ماند.</span>
              </div>
            )}

            {addErrorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{addErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-6">
              
              {/* Top Live Preview Card */}
              <div className="p-4 rounded-xl bg-[#1d1d1f] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[#262629] rounded-xl p-1.5 flex items-center justify-center border border-white/10 shrink-0">
                    <img 
                      src={getOptimizedImageUrl(image)} 
                      alt={shortName || 'اسکین'} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.dataset.fallbackTried) {
                          target.dataset.fallbackTried = 'true';
                          target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV19m5h5S0m_7zO6-fzj9V7MR3n-rC89mm0VXs_EVvamj0cYHEIFM9YlvU81TtlOi9hMS4vZvKznZquSY8pSGK6B_V8Wk/360fx360f';
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8F9A93] font-mono">{isCustomWeapon ? customWeaponName : weapon}</span>
                      {isStatTrak && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          StatTrak™
                        </span>
                      )}
                      {isSouvenir && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          Souvenir
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-white font-sans">
                      {shortName || 'طرح اسکین'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-emerald-400 font-bold">
                        {toPersianDigits(parseInt(priceToman || '0').toLocaleString('fa-IR'))} تومان
                      </span>
                      <span className="text-gray-400 font-mono">
                        (${parseFloat(priceUSD || '0').toFixed(2)})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono">
                        {wearCategory} • {parseFloat(floatValue || '0').toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs text-gray-400">پیش‌نمایش زنده کارت جدید</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Weapon Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">
                    نام سلاح (Weapon)
                  </label>
                  <select
                    value={isCustomWeapon ? 'custom' : weapon}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomWeapon(true);
                      } else {
                        setIsCustomWeapon(false);
                        setWeapon(e.target.value);
                      }
                    }}
                    className="w-full h-11 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-medium focus:border-[#20df7c] focus:outline-none"
                  >
                    {CS2_WEAPONS_LIST.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                    <option value="custom">+ نام سلاح دلخواه / دیگر</option>
                  </select>

                  {isCustomWeapon && (
                    <input
                      type="text"
                      value={customWeaponName}
                      onChange={(e) => setCustomWeaponName(e.target.value)}
                      placeholder="نام سلاح دلخواه (مثال: CZ75-Auto)..."
                      className="w-full h-10 px-3 mt-1.5 rounded-xl bg-[#262629] border border-amber-500/40 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                      required
                    />
                  )}
                </div>

                {/* 2. Skin Pattern */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">
                    طرح اسکین (Skin Pattern)
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="مثال: Slate یا Printstream"
                    required
                    className="w-full h-11 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-medium focus:border-[#20df7c] focus:outline-none font-mono"
                  />
                </div>

                {/* 3. Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">
                    دسته‌بندی (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-medium focus:border-[#20df7c] focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.labelFa}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Wear Condition */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">
                    کیفیت اسکین (Wear Condition)
                  </label>
                  <select
                    value={wearCategory}
                    onChange={(e) => setWearCategory(e.target.value as WearCategory)}
                    className="w-full h-11 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-bold font-mono focus:border-[#20df7c] focus:outline-none"
                  >
                    {WEAR_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>{w.labelFa}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Float Value */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">
                    مقدار فلوت (Float Value)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    max="1"
                    value={floatValue}
                    onChange={(e) => setFloatValue(e.target.value)}
                    placeholder="0.0150"
                    required
                    className="w-full h-11 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-mono focus:border-[#20df7c] focus:outline-none"
                  />
                </div>

                {/* 6. Rarity */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">
                    کمیابی (Rarity)
                  </label>
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value as ItemRarity)}
                    className="w-full h-11 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-medium focus:border-[#20df7c] focus:outline-none"
                  >
                    {RARITY_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.labelFa}</option>
                    ))}
                  </select>
                </div>

                {/* 7. Price in Tomans */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-emerald-400">
                    قیمت به تومان
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      value={parseInt(priceToman || '0').toLocaleString('en-US')}
                      onChange={(e) => handleTomanChange(e.target.value)}
                      placeholder="4,140,000"
                      required
                      className="w-full h-11 px-3 pl-16 rounded-xl bg-[#262629] border border-emerald-500/40 text-emerald-300 text-sm font-mono font-bold focus:border-emerald-400 focus:outline-none"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500 font-bold">
                      تومان
                    </div>
                  </div>
                </div>

                {/* 8. Discount % */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-300">
                    درصد تخفیف (اختیاری)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="90"
                      dir="ltr"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      placeholder="12"
                      className="w-full h-11 px-3 pl-8 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-mono focus:border-[#20df7c] focus:outline-none"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
                      %
                    </div>
                  </div>
                </div>

              </div>

              {/* Flags Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 p-3.5 rounded-xl bg-[#1d1d1f] border border-white/5">
                <span className="text-xs font-bold text-gray-400">نوع ویژگی خاص:</span>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
                  <input
                    type="checkbox"
                    checked={isStatTrak}
                    onChange={(e) => {
                      setIsStatTrak(e.target.checked);
                      if (e.target.checked) setIsSouvenir(false);
                    }}
                    className="w-4 h-4 rounded text-amber-500 bg-[#262629] border-white/20 focus:ring-0"
                  />
                  <span className="font-mono text-amber-400 font-bold">StatTrak™ (شمارنده کیل)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-200">
                  <input
                    type="checkbox"
                    checked={isSouvenir}
                    onChange={(e) => {
                      setIsSouvenir(e.target.checked);
                      if (e.target.checked) setIsStatTrak(false);
                    }}
                    className="w-4 h-4 rounded text-yellow-500 bg-[#262629] border-white/20 focus:ring-0"
                  />
                  <span className="font-mono text-yellow-400 font-bold">Souvenir (یادبود مسابقات)</span>
                </label>
              </div>

              {/* Image URL Section */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-gray-300">
                  لینک مستقیم تصویر محصول (URL)
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://community.cloudflare.steamstatic.com/..."
                  required
                  className="w-full h-11 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-mono focus:border-[#20df7c] focus:outline-none"
                />
              </div>

              {/* Action Submit */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  id="submit-create-product-btn"
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-black" />
                  <span>ثبت و بارگزاری مستقیم در بازار</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 3: PURCHASES LIST */}
        {activeTab === 'purchases' && (
          <div className="bg-[#161617] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="pb-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">
                  لیست خریدهای ثبت شده کاربران
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  تمام تراکنش‌های خرید موفق و پردازش ارسال به اکانت‌های استیم خریداران
                </p>
              </div>
            </div>

            {purchases.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <ShoppingCart className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-white">هیچ خریدی هنوز ثبت نشده است.</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  به محض ثبت و تسویه خرید توسط کاربران، سفارشات با روش پرداخت مربوطه در این لیست قرار می‌گیرند.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-bold">
                      <th className="py-3 px-3">شماره سفارش</th>
                      <th className="py-3 px-3">خریدار و شماره تماس</th>
                      <th className="py-3 px-3">اسکین خریداری شده</th>
                      <th className="py-3 px-3">مبلغ پرداختی</th>
                      <th className="py-3 px-2">روش پرداخت</th>
                      <th className="py-3 px-3">وضعیت</th>
                      <th className="py-3 px-3 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {purchases.map((pur) => (
                      <tr key={pur.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-gray-300">
                          {pur.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{pur.buyerName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{pur.buyerPhone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#20df7c]">{pur.itemName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{pur.date}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          {formatPrice(pur.amountUSD, currency)}
                        </td>
                        <td className="py-3 px-2 text-amber-300 font-bold">
                          {pur.paymentMethod}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            <span>{pur.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {onDeletePurchase && (
                            <button
                              onClick={() => setDeleteConfirmState({
                                type: 'purchase',
                                id: pur.id,
                                name: `سفارش خرید شماره ${pur.id} (${pur.itemName})`
                              })}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                              title="حذف سفارش خرید"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SALES LIST */}
        {activeTab === 'sales' && (
          <div className="bg-[#161617] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="pb-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white">
                  لیست فروش‌ها و درخواست‌های تسویه کاربران
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  اسکین‌های فروخته شده توسط کاربران و واریز به کیف پول پس از تایید مدیریت
                </p>
              </div>
            </div>

            {sales.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <TrendingUp className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-white">هیچ درخواست فروش یا تسویه‌ای هنوز ثبت نشده است.</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  به محض فروش محصول توسط کاربر، درخواست با وضعیت «در انتظار تایید» در این بخش قرار می‌گیرد.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-bold">
                      <th className="py-3 px-3">شناسه معامله</th>
                      <th className="py-3 px-3">فروشنده و تماس</th>
                      <th className="py-3 px-3">اسکین واگذار شده</th>
                      <th className="py-3 px-2">ارزش ناخالص</th>
                      <th className="py-3 px-2">کارمزد ۲٪</th>
                      <th className="py-3 px-3">تسویه خالص</th>
                      <th className="py-3 px-3">وضعیت و اقدام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sales.map((sal) => (
                      <tr key={sal.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-gray-300">
                          {sal.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{sal.sellerName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{sal.sellerPhone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{sal.itemName}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{sal.date}</div>
                        </td>
                        <td className="py-3 px-2 font-mono text-gray-300">
                          {formatPrice(sal.grossUSD, currency)}
                        </td>
                        <td className="py-3 px-2 font-mono text-amber-400 font-bold">
                          {formatPrice(sal.feeUSD, currency)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          {formatPrice(sal.netPayoutUSD, currency)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {sal.status === 'pending' ? (
                              <>
                                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-[11px]">
                                  در انتظار تایید
                                </span>
                                {onApproveSale && (
                                  <button
                                    onClick={() => onApproveSale(sal.id)}
                                    className="px-3 py-1 rounded-lg bg-[#20df7c] hover:bg-[#1bc76e] text-black font-bold text-xs transition-all cursor-pointer shadow-md"
                                  >
                                    تایید و واریز به کیف پول
                                  </button>
                                )}
                              </>
                            ) : sal.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                <Check className="w-3 h-3" />
                                <span>واریز شد</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20 font-bold text-[11px]">
                                رد شده
                              </span>
                            )}

                            {onDeleteSale && (
                              <button
                                onClick={() => setDeleteConfirmState({
                                  type: 'sale',
                                  id: sal.id,
                                  name: `معامله فروش شماره ${sal.id} (${sal.itemName})`
                                })}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer ml-auto"
                                title="حذف رکورد فروش"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Custom Confirmation Modal with "بلی" and "خیر" buttons */}
      {deleteConfirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in dir-rtl">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center gap-3 text-red-400 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/20">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">تایید حذف</h3>
                <p className="text-xs text-gray-400 mt-0.5">اقدام مدیریتی غیرقابل بازگشت</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-100">
                آیا مطمئن هستید می‌خواهید سفارش / محصول زیر را حذف کنید؟
              </p>
              <div className="text-xs font-mono text-[#20df7c] bg-[#121814] p-3 rounded-xl border border-[#20df7c]/20 break-all font-bold">
                {deleteConfirmState.name}
              </div>
              {deleteConfirmState.type === 'sale' && (
                <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed">
                  ⚠️ توجه: با حذف این سفارش فروش، آیتم مربوطه به صورت خودکار از لیست فروشگاه (بازار) نیز حذف خواهد شد.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {/* Yes Button (بلی) */}
              <button
                onClick={() => {
                  if (deleteConfirmState.type === 'product') {
                    onDeleteItem(deleteConfirmState.id);
                  } else if (deleteConfirmState.type === 'purchase') {
                    onDeletePurchase?.(deleteConfirmState.id);
                  } else if (deleteConfirmState.type === 'sale') {
                    onDeleteSale?.(deleteConfirmState.id);
                  }
                  setDeleteConfirmState(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm transition-all cursor-pointer shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>بلی</span>
              </button>

              {/* No Button (خیر) */}
              <button
                onClick={() => setDeleteConfirmState(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#2c2c2e] hover:bg-[#3a3a3c] text-gray-200 hover:text-white font-bold text-sm transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-1.5"
              >
                <span>خیر</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
