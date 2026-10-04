import React, { useState, useMemo, useEffect } from 'react';
import { Instagram, Send } from 'lucide-react';
import { Header } from './components/Header';
import { AnnouncementBar } from './components/AnnouncementBar';
import { MarketToolbar } from './components/MarketToolbar';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductGrid } from './components/ProductGrid';
import { CartDrawer } from './components/CartDrawer';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SellPage } from './components/SellPage';
import { WalletDashboard } from './components/WalletDashboard';
import { AuthPage } from './components/AuthPage';
import { AdminPanel } from './components/AdminPanel';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AdvancedSearchModal } from './components/AdvancedSearchModal';

import { MOCK_ITEMS, MOCK_USER, MOCK_INVENTORY } from './data/mockItems';
import { MarketItem, FilterState, CartItem, Currency, UserAccount, ActiveView, AdminPurchaseRecord, AdminSaleRecord, UserSaleListing, SteamInventoryError } from './types';
import { USD_TO_TOMAN_RATE, formatPrice } from './utils/formatters';
import { parseAdvancedSearchQuery, matchItemWithAdvancedSearch } from './utils/searchEngine';

const INITIAL_FILTERS: FilterState = {
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
  floatTier: 'all',
};

const STORAGE_KEY_ITEMS = 'iran_cs2_market_items_v3';
const STORAGE_KEY_USER = 'iran_cs2_user_session_v3';
const STORAGE_KEY_ACTIVE_VIEW = 'iran_cs2_active_view_v3';
const STORAGE_KEY_CART = 'iran_cs2_cart_v3';
const STORAGE_KEY_CURRENCY = 'iran_cs2_currency_v3';
const STORAGE_KEY_RECENT_SEARCHES = 'iran_cs2_recent_searches_v3';
const STORAGE_KEY_TRADE_URL = 'iran_cs2_saved_trade_url_v3';

export default function App() {
  // Navigation & Views - Persisted so user stays on the same page across reloads
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    try {
      const savedView = localStorage.getItem(STORAGE_KEY_ACTIVE_VIEW);
      if (savedView && ['market', 'sell', 'wallet', 'auth', 'admin'].includes(savedView)) {
        if (savedView === 'admin') {
          const savedUser = localStorage.getItem(STORAGE_KEY_USER);
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser?.role === 'admin') return 'admin';
          }
          return 'market';
        }
        return savedView as ActiveView;
      }
    } catch (e) {
      console.error(e);
    }
    return 'market';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_VIEW, activeView);
    } catch (e) {
      console.error(e);
    }
  }, [activeView]);

  // Toasts - Defined at top level so all hooks can access addToast safely
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = React.useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Market State - Loaded persistently from localStorage & synced with server backend
  const [items, setItems] = useState<MarketItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load items from localStorage', e);
    }
    return MOCK_ITEMS;
  });

  // Fetch persistent products from server API on mount and sync if needed
  useEffect(() => {
    let isMounted = true;
    async function syncProductsWithServer() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.products) && data.products.length > 0) {
            if (isMounted) {
              setItems(data.products);
              localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(data.products));
            }
          } else {
            // Seed server if server storage is empty
            const currentItems = items.length > 0 ? items : MOCK_ITEMS;
            await fetch('/api/products/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ products: currentItems }),
            });
          }
        }
      } catch (err) {
        console.warn('Backend server sync not reachable or offline, using local storage fallback:', err);
      }
    }

    syncProductsWithServer();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save items to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items to localStorage', e);
    }
  }, [items]);

  const [inventoryItems, setInventoryItems] = useState<MarketItem[]>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.steamId) {
          const cachedInv = localStorage.getItem(`iran_cs2_inventory_${parsedUser.steamId}`);
          if (cachedInv) {
            const parsed = JSON.parse(cachedInv);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load cached inventory from localStorage', e);
    }
    return [];
  });
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTERS);
  
  // Currency state - Persisted
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (saved === 'IRR' || saved === 'USD') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'IRR';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
    } catch (e) {
      console.error(e);
    }
  }, [currency]);

  const [viewDensity, setViewDensity] = useState<'standard' | 'dense' | 'list'>('standard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Recent Searches state with LocalStorage persistence
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT_SEARCHES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['AK-47 | Asiimov', 'Butterfly Doppler', 'Printstream'];
  });

  const handleAddRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleRemoveRecentSearch = (query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(q => q !== query);
      try {
        localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY_RECENT_SEARCHES);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast('لیست قیمت‌ها و محصولات به‌روزرسانی شد.', 'info');
    }, 600);
  };
  
  // User session - Persisted across reloads and navigation
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      const savedTradeUrl = localStorage.getItem(STORAGE_KEY_TRADE_URL);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.username) {
          // Clear transaction history as requested
          parsed.transactions = [];
          if (!parsed.transactions || parsed.transactions.length === 0) {
            parsed.withdrawableBalanceUSD = 0;
            parsed.pendingBalanceUSD = 0;
            parsed.totalSalesUSD = 0;
          }
          if (savedTradeUrl && !parsed.tradeUrl) {
            parsed.tradeUrl = savedTradeUrl;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
    return null;
  });

  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState<SteamInventoryError | null>(null);

  // Check for Steam OpenID redirect completion from localStorage
  useEffect(() => {
    try {
      const pendingSteam = localStorage.getItem('iran_cs2_steam_auth_pending');
      if (pendingSteam) {
        localStorage.removeItem('iran_cs2_steam_auth_pending');
        const steamUser: UserAccount = JSON.parse(pendingSteam);
        const savedTradeUrl = localStorage.getItem(STORAGE_KEY_TRADE_URL) || '';

        setUser(prev => {
          if (prev) {
            return {
              ...prev,
              steamId: steamUser.steamId,
              username: steamUser.username || prev.username,
              avatar: steamUser.avatar || prev.avatar,
              steamConnected: true,
              steamTradeEligible: true,
              tradeUrl: prev.tradeUrl || savedTradeUrl || '',
            };
          }
          return {
            ...steamUser,
            steamConnected: true,
            steamTradeEligible: true,
            tradeUrl: savedTradeUrl || '',
          };
        });
        addToast(`ورود با حساب استیم با موفقیت انجام شد (${steamUser.username})`, 'success');
      }
    } catch (e) {
      console.error('Error checking steam auth pending:', e);
    }
  }, [addToast]);

  // Ensure transaction history is cleared immediately for current session
  useEffect(() => {
    setUser(prev => {
      if (!prev) return null;
      if (prev.transactions && prev.transactions.length > 0) {
        return {
          ...prev,
          transactions: [],
        };
      }
      return prev;
    });
  }, []);

  // Listen for Steam auth success messages from popups
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STEAM_AUTH_SUCCESS' && event.data?.user) {
        const steamUser: UserAccount = event.data.user;
        const savedTradeUrl = localStorage.getItem(STORAGE_KEY_TRADE_URL) || '';

        setUser(prev => {
          if (prev) {
            return {
              ...prev,
              steamId: steamUser.steamId,
              username: steamUser.username || prev.username,
              avatar: steamUser.avatar || prev.avatar,
              steamConnected: true,
              steamTradeEligible: true,
              tradeUrl: prev.tradeUrl || savedTradeUrl || '',
            };
          }
          return {
            ...steamUser,
            steamConnected: true,
            steamTradeEligible: true,
            tradeUrl: savedTradeUrl || '',
          };
        });
        addToast(`حساب استیم با موفقیت متصل گردید (${steamUser.username})`, 'success');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addToast]);

  // Connect real Steam account via Steam OpenID 2.0
  const handleConnectSteam = () => {
    const width = 800;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/api/auth/steam',
      'steam_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      // If popup was blocked by browser, redirect directly
      window.location.href = '/api/auth/steam';
    } else {
      addToast('در حال اتصال به درگاه رسمی استیم (Steam Community)...', 'info');
    }
  };

  const handleUpdateUserProfile = (data: Partial<UserAccount>) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...data,
      };
    });
    addToast('اطلاعات پروفایل کاربری با موفقیت به‌روزرسانی شد.', 'success');
  };

  // Fetch real Steam CS2 inventory from backend proxy (/api/inventory/:steamId64)
  const fetchRealSteamInventory = React.useCallback(async (steamId: string, showToast = true, forceRefresh = false) => {
    if (!steamId) return;
    setIsLoadingInventory(true);
    setInventoryError(null);

    try {
      const endpoint = `/api/inventory/${encodeURIComponent(steamId)}${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.items)) {
        setInventoryItems(data.items);
        setInventoryError(null);
        try {
          localStorage.setItem(`iran_cs2_inventory_${steamId}`, JSON.stringify(data.items));
        } catch (e) {
          console.error('Failed to cache inventory:', e);
        }

        if (data.items.length > 0) {
          if (showToast) {
            addToast(`اینونتوری CS2 استیم با موفقیت بارگذاری شد (${data.items.length} آیتم).`, 'success');
          }
        } else {
          if (showToast) {
            addToast('اینونتوری CS2 اکانت استیم شما در حال حاضر خالی است.', 'info');
          }
        }
      } else if (data && (data.isPrivate || data.errorType === 'PRIVATE_INVENTORY')) {
        const errObj: SteamInventoryError = {
          errorType: 'PRIVATE_INVENTORY',
          isPrivate: true,
          message:
            data.message ||
            'اینونتوری استیم شما در حالت Private قرار دارد. لطفاً از تنظیمات حریم خصوصی استیم آن را روی Public قرار دهید.',
        };
        setInventoryError(errObj);
        if (showToast) {
          addToast(errObj.message, 'error');
        }
      } else if (data && (data.isRateLimited || data.errorType === 'RATE_LIMITED')) {
        const errObj: SteamInventoryError = {
          errorType: 'RATE_LIMITED',
          isRateLimited: true,
          message:
            data.message ||
            'محدودیت موقت درخواست از سمت سرورهای استیم (Rate Limit 429). لطفاً چند لحظه دیگر مجدداً تلاش کنید.',
        };
        setInventoryError(errObj);
        if (showToast) {
          addToast(errObj.message, 'info');
        }
      } else {
        const errObj: SteamInventoryError = {
          errorType: 'STEAM_ERROR',
          message: data?.message || 'عدم دسترسی موقت به سرورهای استیم. لطفاً چند لحظه بعد مجدداً تلاش کنید.',
        };
        setInventoryError(errObj);
        if (showToast) {
          addToast(errObj.message, 'info');
        }
      }
    } catch (err) {
      console.warn('Could not fetch Steam inventory:', err);
      setInventoryError({
        errorType: 'STEAM_ERROR',
        message: 'خطا در برقراری ارتباط با سرور پروکسی اینونتوری استیم. لطفاً اتصال خود را بررسی کرده و مجدداً تلاش کنید.',
      });
    } finally {
      setIsLoadingInventory(false);
    }
  }, [addToast]);

  // Fetch real Steam CS2 inventory when user connects Steam account or on logout
  useEffect(() => {
    if (user?.steamId) {
      fetchRealSteamInventory(user.steamId, false, false);
    } else {
      setInventoryItems([]);
      setInventoryError(null);
    }
  }, [user?.steamId, fetchRealSteamInventory]);
  useEffect(() => {
    try {
      if (user) {
        // Auto-cleanup any requested deleted items like Howl if present
        if (user.transactions && user.transactions.some(tx => tx.description.toLowerCase().includes('howl'))) {
          const cleanedTxs = user.transactions.filter(tx => !tx.description.toLowerCase().includes('howl'));
          setUser(prev => prev ? { ...prev, transactions: cleanedTxs } : null);
          return;
        }
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  }, [user]);

  // Cart - Persisted
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);
  
  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedInspectItem, setSelectedInspectItem] = useState<MarketItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Cart operations
  const handleAddToCart = (item: MarketItem) => {
    const exists = cart.some(c => c.item.id === item.id);
    if (exists) {
      addToast(`${item.name} از قبل در سبد خرید شما موجود است.`, 'info');
      return;
    }
    setCart(prev => [...prev, { item, addedAt: Date.now() }]);
    addToast(`اسکین ${item.name} به سبد خرید اضافه گردید.`, 'success');
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
    addToast('آیتم از سبد خرید حذف شد.', 'info');
  };

  const handleClearCart = () => {
    setCart([]);
    addToast('سبد خرید با موفقیت خالی شد.', 'info');
  };

  const handleResetFilters = () => {
    setFilterState(INITIAL_FILTERS);
    setSelectedCategory('all');
    addToast('تمام فیلترها بازنشانی شدند.', 'info');
  };

  // Admin Purchases & Sales state - Persisted (default [] for clean deployment)
  const [adminPurchases, setAdminPurchases] = useState<AdminPurchaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tehran_cs_purchases');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [adminSales, setAdminSales] = useState<AdminSaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tehran_cs_sales');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('tehran_cs_purchases', JSON.stringify(adminPurchases));
    } catch (e) {
      console.error(e);
    }
  }, [adminPurchases]);

  useEffect(() => {
    try {
      localStorage.setItem('tehran_cs_sales', JSON.stringify(adminSales));
    } catch (e) {
      console.error(e);
    }
  }, [adminSales]);

  const handleInstantBuy = (item: MarketItem) => {
    setSelectedInspectItem(null);
    if (!cart.some(c => c.item.id === item.id)) {
      setCart(prev => [...prev, { item, addedAt: Date.now() }]);
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (paymentMethodLabel: string, totalUSD: number) => {
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowPersian = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const itemsNames = cart.map(c => c.item.name).join(' + ');

    // 1. Add to Admin Purchases list
    const newPurchaseRecord: AdminPurchaseRecord = {
      id: orderId,
      buyerName: user?.username || 'کاربر بازار',
      buyerPhone: user?.phone || '۰۹۱۲۰۰۰۰۰۰۰',
      itemName: itemsNames || 'خرید اسکین',
      amountUSD: totalUSD,
      amountIRR: Math.round(totalUSD * USD_TO_TOMAN_RATE),
      date: nowPersian,
      paymentMethod: paymentMethodLabel,
      status: 'تکمیل شده و تحویل فوری',
    };
    setAdminPurchases(prev => [newPurchaseRecord, ...prev]);

    // 2. Add transaction to User Wallet & update balance if paid via wallet
    if (user) {
      const isWalletPayment = paymentMethodLabel.includes('کیف پول');
      setUser(prev => {
        if (!prev) return null;
        const currentBalance = prev.withdrawableBalanceUSD || 0;
        const newBalance = isWalletPayment ? Math.max(0, currentBalance - totalUSD) : currentBalance;
        
        const newTx = {
          id: `TX-${Date.now()}`,
          relatedId: orderId,
          type: 'purchase' as const,
          amountUSD: totalUSD,
          description: `خرید ${itemsNames || 'اسکین'} (${paymentMethodLabel})`,
          date: nowPersian,
          status: 'completed' as const,
        };

        return {
          ...prev,
          withdrawableBalanceUSD: newBalance,
          transactions: [newTx, ...(prev.transactions || [])],
        };
      });
    }

    setCart([]);
    addToast('سفارش خرید با موفقیت ثبت و تحویل فوری شد!', 'success');
  };

  // Save Steam Trade Offer URL - Permanently stored in localStorage and user profile
  const handleSaveTradeUrl = (tradeUrl: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_TRADE_URL, tradeUrl);
    } catch (e) {
      console.error('Failed to save trade URL to localStorage:', e);
    }
    setUser(prev => prev ? { ...prev, tradeUrl } : null);
    addToast('لینک ترید استیم با موفقیت و به صورت دائمی ذخیره شد.', 'success');
  };

  // Instant Sell to site (2% fee, added to pending balance, 7-day hold, cancellable)
  const handleInstantSell = (item: MarketItem) => {
    const feeUSD = Number((item.priceUSD * 0.02).toFixed(2));
    const netPayoutUSD = Number((item.priceUSD * 0.98).toFixed(2));
    const saleId = `SAL-INST-${Date.now()}`;
    const nowPersian = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const newSale: UserSaleListing = {
      id: saleId,
      itemId: item.id,
      item,
      saleType: 'instant',
      priceUSD: item.priceUSD,
      feePercent: 2,
      feeUSD,
      netPayoutUSD,
      createdAt: Date.now(),
      unlocksAt: Date.now() + 7 * 24 * 3600 * 1000,
      status: 'pending_payout',
      tradeOfferState: 'sent',
    };

    // Remove from inventory
    setInventoryItems(prev => prev.filter(i => i.id !== item.id));

    // Update user state
    setUser(prev => {
      if (!prev) return null;
      const updatedPending = (prev.pendingBalanceUSD || 0) + netPayoutUSD;
      const updatedTotalSales = (prev.totalSalesUSD || 0) + netPayoutUSD;
      const newTx = {
        id: `TX-${Date.now()}`,
        relatedId: saleId,
        type: 'فروش فوری به سایت',
        amountUSD: netPayoutUSD,
        description: `فروش فوری ${item.name} با کسر ۲٪ کارمزد (قفل ۷ روزه استیم)`,
        date: nowPersian,
        status: 'pending' as const,
        isPositive: true,
      };

      return {
        ...prev,
        pendingBalanceUSD: updatedPending,
        totalSalesUSD: updatedTotalSales,
        sales: [newSale, ...(prev.sales || [])],
        transactions: [newTx, ...(prev.transactions || [])],
      };
    });

    // Record in Admin sales list
    const adminSaleRecord: AdminSaleRecord = {
      id: saleId,
      itemId: item.id,
      marketItemId: `instant-${saleId}`,
      sellerName: user?.username || 'فروشنده استیم',
      sellerPhone: user?.phone || 'کاربر استیم',
      itemName: `${item.name} (فروش فوری ۲٪ کارمزد)`,
      wear: item.wearCategory || item.condition,
      grossUSD: item.priceUSD,
      feeUSD,
      netPayoutUSD,
      date: nowPersian,
      status: 'approved',
    };
    setAdminSales(prev => [adminSaleRecord, ...prev]);

    addToast(`اسکین «${item.name}» به صورت فوری به سایت فروخته شد و مبلغ پس از کسر ۲٪ کارمزد به موجودی در انتظار اضافه گردید (آزادسازی پس از ۷ روز).`, 'success');
  };

  // Custom Price Sale (10% fee, queued for customer / admin purchase, 7-day hold)
  const handleCustomPriceSell = (item: MarketItem, customPriceUSD: number) => {
    const feeUSD = Number((customPriceUSD * 0.10).toFixed(2));
    const netPayoutUSD = Number((customPriceUSD * 0.90).toFixed(2));
    const saleId = `SAL-CUST-${Date.now()}`;
    const nowPersian = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    const newSale: UserSaleListing = {
      id: saleId,
      itemId: item.id,
      item: { ...item, priceUSD: customPriceUSD },
      saleType: 'custom',
      priceUSD: customPriceUSD,
      feePercent: 10,
      feeUSD,
      netPayoutUSD,
      createdAt: Date.now(),
      unlocksAt: Date.now() + 7 * 24 * 3600 * 1000,
      status: 'pending_buyer',
      tradeOfferState: 'pending',
    };

    // Remove from user's inventory
    setInventoryItems(prev => prev.filter(i => i.id !== item.id));

    // Add to public market items so customers can view it
    const marketListedItem: MarketItem = {
      ...item,
      id: `custom-${saleId}`,
      priceUSD: customPriceUSD,
      discountPercent: 0,
    };
    setItems(prev => [marketListedItem, ...prev]);

    // Sync custom price listed item to server storage
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(marketListedItem),
    }).catch(err => console.warn('Could not sync custom item to server:', err));

    // Update user state
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sales: [newSale, ...(prev.sales || [])],
      };
    });

    // Record in Admin sales list as pending approval/purchase
    const adminSaleRecord: AdminSaleRecord = {
      id: saleId,
      itemId: item.id,
      marketItemId: `custom-${saleId}`,
      sellerName: user?.username || 'فروشنده استیم',
      sellerPhone: user?.phone || 'کاربر استیم',
      itemName: `${item.name} (فروش عادی ۱۰٪ کارمزد)`,
      wear: item.wearCategory || item.condition,
      grossUSD: customPriceUSD,
      feeUSD,
      netPayoutUSD,
      date: nowPersian,
      status: 'pending',
    };
    setAdminSales(prev => [adminSaleRecord, ...prev]);

    addToast(`اسکین «${item.name}» با قیمت دلخواه در بازار ثبت شد. پس از یافتن مشتری یا خرید سایت، با کسر ۱۰٪ کارمزد به کیف پول شما واریز خواهد شد.`, 'success');
  };

  // Cancel Sale (Restores item to inventory and reverses pending balance if instant)
  const handleCancelSale = (saleId: string) => {
    const targetUserSale = user?.sales?.find(s => s.id === saleId);
    const targetAdminSale = adminSales.find(s => s.id === saleId);
    const restoredItem: MarketItem | null = targetUserSale?.item || null;
    const refundPendingUSD = targetUserSale?.netPayoutUSD || 0;
    const nowPersian = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    setUser(prev => {
      if (!prev) return null;
      const targetSale = (prev.sales || []).find(s => s.id === saleId);
      if (!targetSale) return prev;

      // Remove from pending/active sales completely (or mark cancelled)
      const updatedSales = (prev.sales || []).filter(s => s.id !== saleId);
      const updatedPending = Math.max(0, (prev.pendingBalanceUSD || 0) - refundPendingUSD);

      // Check if there was an existing transaction for this sale
      let transactionFound = false;
      const updatedTransactions = (prev.transactions || []).map(tx => {
        if (
          (tx.relatedId && tx.relatedId === saleId) ||
          (targetSale?.item?.name && tx.description.includes(targetSale.item.name) && tx.status === 'pending')
        ) {
          transactionFound = true;
          return {
            ...tx,
            description: `لغو فروش ${targetSale.item.name} (بازگشت به اینونتوری)`,
            status: 'cancelled' as const,
            isPositive: false,
          };
        }
        return tx;
      });

      // If no matching pending transaction was found, prepend a new cancelled transaction
      if (!transactionFound) {
        const cancelTx = {
          id: `TX-CANCEL-${Date.now()}`,
          relatedId: saleId,
          type: 'لغو فروش اسکین',
          amountUSD: refundPendingUSD || targetSale.netPayoutUSD || targetSale.priceUSD,
          description: `لغو فروش ${targetSale.item.name} و بازگشت آیتم به اینونتوری`,
          date: nowPersian,
          status: 'cancelled' as const,
          isPositive: false,
        };
        updatedTransactions.unshift(cancelTx);
      }

      return {
        ...prev,
        pendingBalanceUSD: updatedPending,
        sales: updatedSales,
        transactions: updatedTransactions,
      };
    });

    // 1. Restore item back into user's CS2 inventory
    if (restoredItem) {
      setInventoryItems(prev => prev.some(i => i.id === restoredItem.id) ? prev : [restoredItem, ...prev]);
    }

    // 2. Remove corresponding item from marketplace / shop (فروشگاه و بازار)
    const removedProductIds: string[] = [];
    const cleanItemName = (targetAdminSale?.itemName || restoredItem?.name || '').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
    
    setItems(prev => {
      return prev.filter(item => {
        const isMatch =
          item.id.includes(saleId) ||
          (targetAdminSale?.marketItemId && item.id === targetAdminSale.marketItemId) ||
          (targetAdminSale?.itemId && item.id === targetAdminSale.itemId) ||
          (cleanItemName && item.name.trim().toLowerCase() === cleanItemName);

        if (isMatch) {
          removedProductIds.push(item.id);
          return false;
        }
        return true;
      });
    });

    // 3. Remove product from server persistence
    setTimeout(() => {
      removedProductIds.forEach(prodId => {
        fetch(`/api/products/${encodeURIComponent(prodId)}`, {
          method: 'DELETE',
        }).catch(err => console.warn('Could not delete product from server on cancel sale:', err));
      });
    }, 0);

    // 4. Remove from carts if any user added it
    setCart(prev => prev.filter(c => {
      if (
        c.item.id.includes(saleId) ||
        (targetAdminSale?.marketItemId && c.item.id === targetAdminSale.marketItemId) ||
        (cleanItemName && c.item.name.trim().toLowerCase() === cleanItemName)
      ) {
        return false;
      }
      return true;
    }));

    // 5. Remove completely from admin sales / settlements table
    setAdminSales(prev => prev.filter(s => s.id !== saleId));

    addToast('فروش اسکین با موفقیت لغو شد؛ از فروشگاه و لیست تسویه حذف گردید و آیتم به اینونتوری استیم بازگردانده شد.', 'info');
  };

  // Withdraw request with 2% bank transfer fee
  const handleRequestWithdraw = (amountUSD: number, sheba: string, accountName: string) => {
    if (!user || user.withdrawableBalanceUSD < amountUSD) {
      addToast('موجودی قابل برداشت کافی نمی‌باشد.', 'error');
      return;
    }

    const feeUSD = Number((amountUSD * 0.02).toFixed(2));
    const netBankUSD = Number((amountUSD * 0.98).toFixed(2));
    const nowPersian = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    setUser(prev => {
      if (!prev) return null;
      const updatedBalance = Math.max(0, (prev.withdrawableBalanceUSD || 0) - amountUSD);
      const newTx = {
        id: `TX-WD-${Date.now()}`,
        type: 'تسویه حساب بانکی',
        amountUSD: amountUSD,
        description: `برداشت به شماره شبا ${sheba} (${accountName}) - کسر ۲٪ کارمزد سایت`,
        date: nowPersian,
        status: 'completed' as const,
        isPositive: false,
      };

      return {
        ...prev,
        withdrawableBalanceUSD: updatedBalance,
        transactions: [newTx, ...(prev.transactions || [])],
      };
    });

    addToast(`درخواست تسویه حساب به مبلغ ${formatPrice(netBankUSD, currency)} پس از کسر ۲٪ کارمزد با موفقیت ثبت شد و ظرف ۲۴ ساعت آینده واریز می‌گردد.`, 'success');
  };

  const handleClearTransactions = () => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        transactions: [],
      };
    });
    addToast('تاریخچه تراکنش‌های مالی با موفقیت خالی شد.', 'info');
  };

  const handleApproveSale = (saleId: string) => {
    const targetSale = adminSales.find(s => s.id === saleId);
    if (!targetSale || targetSale.status !== 'pending') return;

    // Approve sale in admin list
    setAdminSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'approved' } : s));

    // When customer/admin buys custom item, credit seller's pending balance with 7-day hold
    if (user) {
      setUser(prev => {
        if (!prev) return null;
        const netAmount = targetSale.netPayoutUSD;
        const updatedPending = (prev.pendingBalanceUSD || 0) + netAmount;
        const updatedTotalSales = (prev.totalSalesUSD || 0) + netAmount;

        const updatedSales = (prev.sales || []).map(s => {
          if (s.id === saleId) {
            return { ...s, status: 'pending_payout' as const };
          }
          return s;
        });

        const newTx = {
          id: `TX-SALE-BUY-${Date.now()}`,
          relatedId: saleId,
          type: 'فروش به خریدار / ادمین',
          amountUSD: netAmount,
          description: `خریداری شدن ${targetSale.itemName} با کسر ۱۰٪ کارمزد (قفل ۷ روزه استیم)`,
          date: new Date().toLocaleDateString('fa-IR'),
          status: 'pending' as const,
          isPositive: true,
        };

        return {
          ...prev,
          pendingBalanceUSD: updatedPending,
          totalSalesUSD: updatedTotalSales,
          sales: updatedSales,
          transactions: [newTx, ...(prev.transactions || [])],
        };
      });
    }

    addToast(`اسکین «${targetSale.itemName}» توسط سایت برای مشتری خریداری شد و مبلغ ${targetSale.netPayoutUSD}$ پس از کسر ۱۰٪ کارمزد به کیف پول در انتظار واریز گردید (آزادسازی پس از ۷ روز).`, 'success');
  };

  const handleDeletePurchase = (purchaseId: string) => {
    const targetPurchase = adminPurchases.find(p => p.id === purchaseId);
    setAdminPurchases(prev => prev.filter(p => p.id !== purchaseId));

    // Automatically remove matching transaction from user's transaction history
    if (user) {
      setUser(prev => {
        if (!prev) return null;
        const updatedTransactions = (prev.transactions || []).filter(tx => {
          if (tx.relatedId && tx.relatedId === purchaseId) return false;
          if (targetPurchase && targetPurchase.itemName && tx.description.includes(targetPurchase.itemName)) return false;
          if (tx.description.toLowerCase().includes('howl')) return false;
          return true;
        });

        return {
          ...prev,
          transactions: updatedTransactions
        };
      });
    }

    addToast('سفارش خرید و تراکنش مربوط به آن در پنل کاربری با موفقیت حذف گردید.', 'info');
  };

  const handleDeleteTransaction = (txId: string) => {
    if (user) {
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          transactions: (prev.transactions || []).filter(tx => tx.id !== txId),
        };
      });
      addToast('تراکنش با موفقیت از تاریخچه حذف گردید.', 'info');
    }
  };

  const handleDeleteSale = (saleId: string) => {
    const targetSale = adminSales.find(s => s.id === saleId);
    setAdminSales(prev => prev.filter(s => s.id !== saleId));

    // Extract clean skin name (removes "(فروش عادی ۱۰٪ کارمزد)" or "(فروش فوری ۲٪ کارمزد)" suffixes)
    const rawName = targetSale?.itemName || '';
    const cleanItemName = rawName.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();

    // 1. Remove corresponding item from shop / market list (فروشگاه و بازار)
    const removedProductIds: string[] = [];
    setItems(prev => {
      // Check if there is an exact ID match first
      const hasIdMatch = prev.some(item =>
        item.id.includes(saleId) ||
        (targetSale?.marketItemId && item.id === targetSale.marketItemId) ||
        (targetSale?.itemId && item.id === targetSale.itemId)
      );

      return prev.filter(item => {
        const isIdMatch =
          item.id.includes(saleId) ||
          (targetSale?.marketItemId && item.id === targetSale.marketItemId) ||
          (targetSale?.itemId && item.id === targetSale.itemId);

        if (isIdMatch) {
          removedProductIds.push(item.id);
          return false;
        }

        // If no direct ID match was found, match by clean skin name
        if (!hasIdMatch && cleanItemName && item.name.trim().toLowerCase() === cleanItemName) {
          removedProductIds.push(item.id);
          return false;
        }

        return true;
      });
    });

    // 2. Persist deletion of the item from server /api/products
    setTimeout(() => {
      removedProductIds.forEach(prodId => {
        fetch(`/api/products/${encodeURIComponent(prodId)}`, {
          method: 'DELETE',
        }).catch(err => console.warn('Could not sync delete product from server:', err));
      });
    }, 0);

    // 3. Remove from cart if any customer had added this item to their cart
    setCart(prev => prev.filter(c => {
      if (
        c.item.id.includes(saleId) ||
        (targetSale?.marketItemId && c.item.id === targetSale.marketItemId) ||
        (targetSale?.itemId && c.item.id === targetSale.itemId) ||
        (cleanItemName && c.item.name.trim().toLowerCase() === cleanItemName)
      ) {
        return false;
      }
      return true;
    }));

    // 4. Update user's sales listings and transaction history, and restore skin to inventory if needed
    if (user) {
      const targetUserSale = (user.sales || []).find(s => s.id === saleId);
      const itemToRestore = targetUserSale?.item;

      setUser(prev => {
        if (!prev) return null;
        const currentTarget = (prev.sales || []).find(s => s.id === saleId);

        let refundPending = 0;
        if (currentTarget && currentTarget.saleType === 'instant') {
          refundPending = currentTarget.netPayoutUSD;
        }

        const updatedSales = (prev.sales || []).filter(s => s.id !== saleId);
        const updatedPending = Math.max(0, (prev.pendingBalanceUSD || 0) - refundPending);
        // Mark the transaction as cancelled so user sees 'لغو شده' in red in wallet history
        let txFound = false;
        const nowPersian = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        const updatedTransactions = (prev.transactions || []).map(tx => {
          const isMatch = (tx.relatedId && tx.relatedId === saleId) ||
            (targetSale && targetSale.itemName && tx.description.includes(targetSale.itemName)) ||
            (cleanItemName && tx.description.toLowerCase().includes(cleanItemName));
          
          if (isMatch) {
            txFound = true;
            return {
              ...tx,
              description: `لغو و حذف سفارش ${targetSale?.itemName || cleanItemName} توسط مدیر`,
              status: 'cancelled' as const,
              isPositive: false,
            };
          }
          return tx;
        });

        if (!txFound && targetSale) {
          updatedTransactions.unshift({
            id: `TX-CANCEL-ADMIN-${Date.now()}`,
            relatedId: saleId,
            type: 'لغو فروش اسکین',
            amountUSD: refundPending || targetSale.netPayoutUSD || targetSale.grossUSD,
            description: `لغو فروش ${targetSale.itemName} و حذف توسط مدیریت سایت`,
            date: nowPersian,
            status: 'cancelled' as const,
            isPositive: false,
          });
        }

        return {
          ...prev,
          pendingBalanceUSD: updatedPending,
          sales: updatedSales,
          transactions: updatedTransactions
        };
      });

      if (itemToRestore) {
        setInventoryItems(prev => prev.some(i => i.id === itemToRestore.id) ? prev : [itemToRestore, ...prev]);
      }
    }

    addToast(`سفارش فروش «${targetSale?.itemName || saleId}» و اسکین مربوطه با موفقیت از لیست فروشگاه (بازار) حذف گردید.`, 'info');
  };

  const handleAddNewProduct = (newItem: MarketItem) => {
    setItems(prev => [newItem, ...prev]);
    addToast(`محصول «${newItem.name}» با موفقیت ثبت شد و در سرور ذخیره گردید.`, 'success');
    
    // Server persistence
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(err => console.warn('Could not sync add to server:', err));
  };

  const handleUpdateProduct = (updatedItem: MarketItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    addToast(`تغییرات محصول «${updatedItem.name}» با موفقیت در سرور ذخیره شد.`, 'success');

    // Server persistence
    fetch(`/api/products/${encodeURIComponent(updatedItem.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    }).catch(err => console.warn('Could not sync update to server:', err));
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = items.find(i => i.id === itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    addToast(`محصول «${itemToDelete?.name || ''}» از لیست بازار و سرور حذف گردید.`, 'info');

    // Server persistence
    fetch(`/api/products/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Could not sync delete to server:', err));
  };

  const handleResetDefaultItems = () => {
    setItems(MOCK_ITEMS);
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(MOCK_ITEMS));
    } catch (e) {
      console.error(e);
    }
    fetch('/api/products/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultProducts: MOCK_ITEMS }),
    }).catch(err => console.warn('Could not sync reset to server:', err));

    addToast('لیست محصولات به کاتالوگ پیش‌فرض اولیه بازنشانی شد.', 'info');
  };

  const handleLoginSuccess = (loggedInUser: UserAccount) => {
    const savedTradeUrl = localStorage.getItem(STORAGE_KEY_TRADE_URL) || '';
    const mergedUser = {
      ...loggedInUser,
      tradeUrl: loggedInUser.tradeUrl || savedTradeUrl || '',
    };
    setUser(mergedUser);
    if (mergedUser.role === 'admin') {
      setActiveView('admin');
      addToast('خوش آمدید مدیر گرامی! پنل مدیریت با دسترسی کامل فعال گردید.', 'success');
    } else {
      setActiveView('market');
      addToast(`خوش آمدید ${mergedUser.username}! ورود با موفقیت انجام شد.`, 'success');
    }
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterState.minPrice > 0 || filterState.maxPrice > 0) count++;
    if (filterState.minFloat > 0 || filterState.maxFloat < 1) count++;
    if (filterState.wearCategories.length > 0) count++;
    if (filterState.rarities && filterState.rarities.length > 0) count++;
    if (filterState.isStatTrakOnly) count++;
    if (filterState.isSouvenirOnly) count++;
    if (filterState.isHighlightOnly) count++;
    if (filterState.paintSeed) count++;
    if (filterState.minFade > 80) count++;
    if (filterState.minBlue > 0) count++;
    if (filterState.searchQuery) count++;
    if (selectedCategory !== 'all') count++;
    if (filterState.instantTradeOnly) count++;
    if (filterState.hasStickersOnly || filterState.stickerQuery) count++;
    if (filterState.dopplerPhase && filterState.dopplerPhase !== 'all') count++;
    if (filterState.collectionQuery) count++;
    if (filterState.minDiscount && filterState.minDiscount > 0) count++;
    if (filterState.floatTier && filterState.floatTier !== 'all') count++;
    return count;
  }, [filterState, selectedCategory]);

  // Filter & Sort Logic with Intelligent Advanced Search
  const filteredItems = useMemo(() => {
    const parsedQuery = parseAdvancedSearchQuery(filterState.searchQuery);

    return items.filter((item) => {
      // 1. Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (filterState.category !== 'all' && item.category !== filterState.category) {
        return false;
      }

      // 2. Intelligent Advanced Search Query & Attribute Matching
      if (!matchItemWithAdvancedSearch(item, parsedQuery, filterState)) {
        return false;
      }

      // 3. Active Tab Filter
      if (filterState.activeTab === 'best_deals') {
        if (!item.discountPercent || item.discountPercent < 10) return false;
      } else if (filterState.activeTab === 'new_items') {
        if (!item.isHighlight) return false;
      } else if (filterState.activeTab === 'unique_items') {
        if (!item.fadePercent && !item.bluePercent && (!item.stickers || item.stickers.length === 0)) return false;
      }

      // 4. Price range (Toman evaluation)
      const itemPriceToman = Math.round(item.priceUSD * USD_TO_TOMAN_RATE);
      if (filterState.minPrice > 0 && itemPriceToman < filterState.minPrice) {
        return false;
      }
      if (filterState.maxPrice > 0 && itemPriceToman > filterState.maxPrice) {
        return false;
      }

      // 5. Float range
      if (item.floatValue < filterState.minFloat || item.floatValue > filterState.maxFloat) {
        return false;
      }

      // 6. Wear categories
      if (filterState.wearCategories.length > 0) {
        if (!filterState.wearCategories.includes(item.wearCategory)) {
          return false;
        }
      }

      // 6.5. Rarity filter
      if (filterState.rarities && filterState.rarities.length > 0) {
        if (!filterState.rarities.includes(item.rarity)) {
          return false;
        }
      }

      // 7. Specials
      if (filterState.isStatTrakOnly && !item.isStatTrak) return false;
      if (filterState.isSouvenirOnly && !item.isSouvenir) return false;
      if (filterState.isHighlightOnly && !item.isHighlight) return false;

      // 8. Paint seed
      if (filterState.paintSeed && !item.paintSeed.toString().includes(filterState.paintSeed)) {
        return false;
      }

      // 10. Fade %
      if (filterState.minFade > 80) {
        if (!item.fadePercent || item.fadePercent < filterState.minFade) return false;
      }

      // 11. Blue %
      if (filterState.minBlue > 0) {
        if (!item.bluePercent || item.bluePercent < filterState.minBlue) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filterState.sortOption) {
        case 'price_asc':
          return a.priceUSD - b.priceUSD;
        case 'price_desc':
          return b.priceUSD - a.priceUSD;
        case 'discount_desc':
          return (b.discountPercent || 0) - (a.discountPercent || 0);
        case 'float_asc':
          return a.floatValue - b.floatValue;
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'featured':
        default:
          return (b.isHighlight ? 1 : 0) - (a.isHighlight ? 1 : 0);
      }
    });
  }, [items, selectedCategory, filterState]);

  return (
    <div className={`min-h-screen bg-[#1d1d1f] text-[#F2F5F3] font-['Vazirmatn',sans-serif] ${activeView === 'auth' ? '' : 'pb-16 lg:pb-0'} flex flex-col`}>
      
      {/* Top Sticky Header (Hidden on auth page) */}
      {activeView !== 'auth' && (
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          cartCount={cart.length}
          openCart={() => setIsCartOpen(true)}
          currency={currency}
          user={user}
          setUser={setUser}
          openMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={filterState.searchQuery}
          setSearchQuery={(q) => setFilterState(prev => ({ ...prev, searchQuery: q }))}
        />
      )}

      {/* Slim Info Announcement Bar (shown on market, database, etc.) */}
      {activeView !== 'auth' && activeView !== 'admin' && (
        <AnnouncementBar />
      )}

      {/* View: Auth Page */}
      {activeView === 'auth' && (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setActiveView('market')}
          onSteamLogin={handleConnectSteam}
        />
      )}

      {/* View: Admin Panel */}
      {activeView === 'admin' && (
        <AdminPanel
          items={items}
          onAddNewProduct={handleAddNewProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteItem={handleDeleteItem}
          onResetDefaultItems={handleResetDefaultItems}
          currency={currency}
          onNavigateToMarket={() => setActiveView('market')}
          purchases={adminPurchases}
          sales={adminSales}
          onApproveSale={handleApproveSale}
          onDeletePurchase={handleDeletePurchase}
          onDeleteSale={handleDeleteSale}
        />
      )}

      {/* Main View Router */}
      {activeView === 'market' && (
        <main className="flex-1 flex flex-col">
          {/* Core Marketplace Container */}
          <div className="max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 flex-1">
            {/* Toolbar: Search input, filter toggle, quick tabs, sort dropdown, density controls */}
            <MarketToolbar
              filterState={filterState}
              setFilterState={setFilterState}
              totalResults={filteredItems.length}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
              viewDensity={viewDensity}
              setViewDensity={setViewDensity}
              onRefresh={handleRefresh}
              activeFilterCount={activeFilterCount}
              onOpenAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
              items={items}
              onQuickViewItem={(item) => setSelectedInspectItem(item)}
              currency={currency}
              recentSearches={recentSearches}
              onAddRecentSearch={handleAddRecentSearch}
              onRemoveRecentSearch={handleRemoveRecentSearch}
              onClearRecentSearches={handleClearRecentSearches}
            />

            {/* Marketplace Layout: Right Sidebar + Left Product Grid (in RTL) */}
            <div className="flex flex-row items-start gap-4">
              
              {/* RIGHT SIDE: Filter Sidebar (Desktop) */}
              {isSidebarOpen && (
                <div className="hidden lg:block shrink-0">
                  <FilterSidebar
                    filterState={filterState}
                    setFilterState={setFilterState}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(catId) => setSelectedCategory(catId)}
                    currency={currency}
                    onResetFilters={handleResetFilters}
                    totalResults={filteredItems.length}
                  />
                </div>
              )}

              {/* LEFT SIDE: Product Grid */}
              <div className="flex-1 min-w-0">
                <ProductGrid
                  items={filteredItems}
                  currency={currency}
                  cartItemIds={cart.map(c => c.item.id)}
                  onAddToCart={handleAddToCart}
                  onQuickView={(item) => setSelectedInspectItem(item)}
                  onResetFilters={handleResetFilters}
                  viewDensity={viewDensity}
                  isLoading={isLoading}
                />
              </div>

            </div>
          </div>
        </main>
      )}

      {/* View: Sell Skins */}
      {activeView === 'sell' && (
        <SellPage
          inventoryItems={inventoryItems}
          currency={currency}
          user={user}
          onConnectSteam={handleConnectSteam}
          onBackToMarket={() => setActiveView('market')}
          onInstantSell={handleInstantSell}
          onCustomPriceSell={handleCustomPriceSell}
          onCancelSale={handleCancelSale}
          onSaveTradeUrl={handleSaveTradeUrl}
          onRefreshInventory={() => {
            if (user?.steamId) {
              fetchRealSteamInventory(user.steamId, true, true);
            } else {
              handleConnectSteam();
            }
          }}
          isLoadingInventory={isLoadingInventory}
          inventoryError={inventoryError}
        />
      )}

      {/* View: User Wallet & Orders */}
      {activeView === 'wallet' && (
        <WalletDashboard
          user={user}
          currency={currency}
          onOpenDeposit={() => addToast('درگاه بانکی برای شارژ کیف پول باز شد.', 'info')}
          onRequestWithdraw={handleRequestWithdraw}
          onCancelSale={handleCancelSale}
          onClearTransactions={handleClearTransactions}
          onUpdateUserProfile={handleUpdateUserProfile}
          onConnectSteam={handleConnectSteam}
        />
      )}

      {/* Mobile Filter Drawer (when filter button tapped on mobile) */}
      {!isSidebarOpen && (
        <div className="lg:hidden" />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        currency={currency}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 3-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        currency={currency}
        user={user}
        onSuccessOrder={handleOrderCompleted}
      />

      {/* Full CS2 Inspect / Item Detail Modal */}
      <ItemDetailModal
        item={selectedInspectItem}
        onClose={() => setSelectedInspectItem(null)}
        currency={currency}
        isInCart={selectedInspectItem ? cart.some(c => c.item.id === selectedInspectItem.id) : false}
        onAddToCart={handleAddToCart}
        onInstantBuy={handleInstantBuy}
      />

      {/* Mobile Navigation Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        currency={currency}
        user={user}
        onSteamLogin={() => {
          setActiveView('auth');
        }}
        onLogout={() => {
          setUser(null);
          addToast('از حساب کاربری خارج شدید.', 'info');
        }}
      />

      {/* Advanced Search Modal Dialog */}
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        filterState={filterState}
        setFilterState={setFilterState}
        totalResults={filteredItems.length}
        onResetFilters={handleResetFilters}
        recentSearches={recentSearches}
        onAddRecentSearch={handleAddRecentSearch}
        onRemoveRecentSearch={handleRemoveRecentSearch}
        onClearRecentSearches={handleClearRecentSearches}
      />

      {/* Mobile Filter Drawer Modal (Full feature parity with desktop) */}
      {isMobileFilterOpen && (
        <FilterSidebar
          filterState={filterState}
          setFilterState={setFilterState}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
          currency={currency}
          onResetFilters={handleResetFilters}
          totalResults={filteredItems.length}
          isMobileDrawer={true}
          onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation (Hidden on auth page) */}
      {activeView !== 'auth' && (
        <MobileBottomNav
          activeView={activeView}
          setActiveView={setActiveView}
          cartCount={cart.length}
          openCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer (Hidden on auth page) */}
      {activeView !== 'auth' && (
        <footer className="mt-auto bg-[#161617] border-t border-white/10 text-xs text-[#8F9A93]">
          {/* Main Footer Content */}
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-right">
              
              {/* Right Side: Logo, Larger Title, About Us Description & Social Icons */}
              <div className="space-y-3 max-w-2xl text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <img 
                    src="https://i.postimg.cc/jd0sH0kD/logo.png" 
                    alt="تهران cs" 
                    referrerPolicy="no-referrer" 
                    className="w-9 h-9 sm:w-10 sm:h-10 object-contain" 
                  />
                  <span className="font-black text-xl sm:text-2xl text-white tracking-tight">
                    تهران cs
                  </span>
                </div>

                {/* About Us Description without heading */}
                <p className="text-xs sm:text-sm text-[#8F9A93] leading-relaxed">
                  مرجع تخصصی و امن خرید، فروش و ترید اسکین‌های بازی Counter-Strike 2 با تحویل آنی و تمام‌خودکار ترید آفر استیم، تسویه حساب ریالی سریع و تضمین اصالت و بهترین قیمت برای بازیکنان ایرانی.
                </p>

                {/* Social Media & Support Links */}
                <div className="flex items-center justify-center md:justify-start gap-2.5 pt-1">
                  <a
                    id="footer-telegram-btn"
                    href="https://t.me/tehrancs_ir"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="کانال تلگرام"
                    title="کانال رسمی تلگرام تهران cs"
                    className="w-9 h-9 rounded-xl bg-[#262629] hover:bg-[#229ED9] text-gray-300 hover:text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </a>

                  <a
                    id="footer-instagram-btn"
                    href="https://www.instagram.com/tehrancs_ir/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="اینستاگرام"
                    title="صفحه رسمی اینستاگرام تهران cs"
                    className="w-9 h-9 rounded-xl bg-[#262629] hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] text-gray-300 hover:text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>

                  <a
                    href="https://t.me/tehrancs_support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#262629] hover:bg-[#229ED9]/20 hover:text-[#229ED9] text-gray-300 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="پشتیبانی"
                  >
                    <span>پشتیبانی</span>
                  </a>
                </div>
              </div>

              {/* Left Side: Plain Enamad Image without box or effects */}
              <div className="shrink-0 flex items-center justify-center">
                <img 
                  src="https://i.postimg.cc/dtLPBVcc/8e092dc9-9e3c-4ea1-9bb3-e1983604fce0-removebg-preview.png" 
                  alt="اینماد - نماد اعتماد" 
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                />
              </div>

            </div>
          </div>

          {/* Bottom Box (Darker than footer) */}
          <div className="bg-[#0c0d0e] border-t border-white/5 py-3.5 px-4 text-center">
            <p className="text-[11px] sm:text-xs text-[#8F9A93]/90">
              امنیت معاملات ۱۰۰٪ تضمین شده با سیستم خودکار ترید آفر استیم | کلیه حقوق محفوظ است © ۱۴۰۳
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}
