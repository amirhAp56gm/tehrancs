export type ItemRarity = 
  | 'Extraordinary' // Gold (Knives / Gloves)
  | 'Covert'        // Red
  | 'Classified'    // Purple
  | 'Restricted'    // Pink
  | 'Mil-Spec'      // Light Blue
  | 'Industrial'    // Blue
  | 'Consumer';     // Gray

export type WearCategory = 'FN' | 'MW' | 'FT' | 'WW' | 'BS';

export interface StickerItem {
  id: string;
  name: string;
  image: string;
  wear?: number;
  slot?: number;
  price?: number;
}

export interface MarketItem {
  id: string;
  assetid?: string;
  assetId?: string;
  classid?: string;
  instanceid?: string;
  market_hash_name?: string;
  name: string; // e.g. "★ Butterfly Knife | Doppler"
  shortName: string; // "Doppler"
  weapon: string; // "Butterfly Knife"
  type?: string; // e.g. "Rifle", "Knife", "Gloves", "Container", "Sticker", "Agent"
  category: 'knife' | 'glove' | 'rifle' | 'sniper' | 'pistol' | 'smg' | 'shotgun' | 'container' | 'sticker' | 'agent';
  categoryFa: string;
  condition: string; // "Factory New (Phase 2)"
  exterior?: string; // "Factory New", "Minimal Wear", etc.
  wearCategory: WearCategory;
  floatValue: number; // e.g. 0.01649299793
  floatRank?: number; // e.g. 935
  paintSeed: number; // e.g. 701
  fadePercent?: number;
  bluePercent?: number;
  priceUSD: number;
  discountPercent?: number; // e.g. 14.2%
  isStatTrak: boolean;
  isSouvenir: boolean;
  isHighlight?: boolean;
  rarity: ItemRarity;
  name_color?: string; // Hex color from Steam description (e.g. "#eb4b4b")
  icon_url?: string;
  image: string;
  marketable?: boolean;
  tradable?: boolean;
  inspectLink?: string;
  inspectUrl?: string;
  dopplerPhase?: string;
  stickers?: StickerItem[];
  sellerStatus: 'online' | 'offline';
  tradeHoldHours: number; // 0 = instant, >0 = hours
  expiresInText: string; // e.g. "04:13:36" or "ارسال فوری"
  historyLowUSD: number;
  historyAverageUSD: number;
  releaseCollection?: string;
  tags?: string[];
}

export interface SteamInventoryError {
  errorType: 'PRIVATE_INVENTORY' | 'RATE_LIMITED' | 'STEAM_ERROR';
  isPrivate?: boolean;
  isRateLimited?: boolean;
  message: string;
}

export type Currency = 'IRR' | 'USD' | 'EUR';

export interface FilterState {
  searchQuery: string;
  category: string; // 'all' or specific
  weaponType: string[];
  wearCategories: WearCategory[];
  rarities: ItemRarity[];
  minPrice: number;
  maxPrice: number;
  minFloat: number;
  maxFloat: number;
  isStatTrakOnly: boolean;
  isSouvenirOnly: boolean;
  isHighlightOnly: boolean;
  isNormalOnly: boolean;
  paintSeed?: string;
  minFade: number;
  maxFade: number;
  minBlue: number;
  maxBlue: number;
  sortOption: 'featured' | 'price_asc' | 'price_desc' | 'discount_desc' | 'float_asc' | 'newest';
  activeTab: 'all' | 'best_deals' | 'new_items' | 'unique_items';
  instantTradeOnly?: boolean;
  hasStickersOnly?: boolean;
  stickerQuery?: string;
  dopplerPhase?: string;
  collectionQuery?: string;
  minDiscount?: number;
  floatTier?: 'all' | 'zero' | 'double_zero' | 'triple_zero';
}

export type ActiveView = 'market' | 'sell' | 'wallet' | 'auth' | 'admin';

export interface CartItem {
  item: MarketItem;
  addedAt: number;
}

export interface WalletTransaction {
  id: string;
  type: string;
  description: string;
  amountUSD: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  isPositive?: boolean;
  relatedId?: string;
}

export interface UserSaleListing {
  id: string;
  itemId: string;
  item: MarketItem;
  saleType: 'instant' | 'custom'; // فروش فوری یا فروش با قیمت دلخواه
  priceUSD: number;
  feePercent: number; // 2% for instant, 10% for custom
  feeUSD: number;
  netPayoutUSD: number;
  createdAt: number;
  unlocksAt: number; // 7 days after sale (timestamp)
  status: 'pending_buyer' | 'pending_payout' | 'completed' | 'cancelled';
  tradeOfferState?: 'sent' | 'accepted' | 'pending';
}

export interface UserAccount {
  id?: string;
  steamId?: string;
  steamConnected?: boolean;
  tradeUrl?: string; // Steam Trade Offer URL
  username: string; // Synced with Steam ID / Steam Persona (read-only on site)
  email?: string;
  phone?: string;
  phoneVerified?: boolean;
  role?: 'user' | 'admin';
  avatar: string;
  level: number;
  withdrawableBalanceUSD: number;
  pendingBalanceUSD: number;
  pendingDaysRemaining: number;
  activeListingsCount: number;
  totalSalesUSD: number;
  transactions?: WalletTransaction[];
  sales?: UserSaleListing[];
  steamTradeEligible?: boolean; // ترید و مارکت استیم فعال و بدون محدودیت
}

export interface AdminPurchaseRecord {
  id: string;
  buyerName: string;
  buyerPhone: string;
  itemName: string;
  wear?: string;
  amountUSD: number;
  amountIRR?: number;
  date: string;
  paymentMethod: string; // روش پرداخت
  status: string;
}

export interface AdminSaleRecord {
  id: string;
  itemId?: string;
  marketItemId?: string;
  sellerName: string;
  sellerPhone: string;
  itemName: string;
  wear?: string;
  grossUSD: number;
  feeUSD: number;
  netPayoutUSD: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}
