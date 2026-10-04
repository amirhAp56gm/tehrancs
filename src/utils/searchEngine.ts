import { MarketItem, FilterState, WearCategory } from '../types';
import { USD_TO_TOMAN_RATE } from './formatters';

// Persian to English Weapon and Item Synonyms Mapping
export const PERSIAN_SYNONYMS: Record<string, string[]> = {
  // Rifles
  'کلاش': ['ak-47'],
  'کلاشنیکف': ['ak-47'],
  'کلاشینکف': ['ak-47'],
  'ak': ['ak-47'],
  'ام۴': ['m4a4', 'm4a1-s'],
  'ام فور': ['m4a4', 'm4a1-s'],
  'امفور': ['m4a4', 'm4a1-s'],
  'm4': ['m4a4', 'm4a1-s'],
  'فاماس': ['famas'],
  'گالیل': ['galil'],
  'آگو': ['aug'],
  'اس جی': ['sg 553'],

  // Snipers
  'آوپ': ['awp'],
  'اوپ': ['awp'],
  'ای دبلیو پی': ['awp'],
  'اسنایپ': ['awp', 'ssg 08', 'scar-20', 'g3sg1'],
  'اسنایپر': ['awp', 'ssg 08', 'scar-20', 'g3sg1'],
  'اسکوت': ['ssg 08'],
  'اسکات': ['ssg 08'],

  // Pistols
  'دیگل': ['desert eagle'],
  'دسرتیگل': ['desert eagle'],
  'دزرت ایگل': ['desert eagle'],
  'دزرت': ['desert eagle'],
  'deagle': ['desert eagle'],
  'گلاک': ['glock-18'],
  'یو اس پی': ['usp-s'],
  'یو اس پ': ['usp-s'],
  'usp': ['usp-s'],
  'فایو سون': ['five-seven'],
  'پی۲۵۰': ['p250'],
  'برتا': ['dual berettas'],

  // Knives
  'نایف': ['knife', 'bayonet', 'karambit', 'butterfly', 'daggers'],
  'چاقو': ['knife', 'bayonet', 'karambit', 'butterfly', 'daggers'],
  'کارامبیت': ['karambit'],
  'کرامبیت': ['karambit'],
  'پروانه‌ای': ['butterfly knife'],
  'پروانه ای': ['butterfly knife'],
  'باترفلای': ['butterfly knife'],
  'بایونت': ['bayonet', 'm9 bayonet'],
  'ام۹': ['m9 bayonet'],
  'ام ۹': ['m9 bayonet'],
  'اسکلتون': ['skeleton knife'],
  'تولون': ['talon knife'],
  'هانتسمن': ['huntsman knife'],
  'بووی': ['bowie knife'],
  'فلیپ': ['flip knife'],
  'گوت': ['gut knife'],
  'فالچیون': ['falchion knife'],
  'دگر': ['shadow daggers'],

  // Gloves
  'دستکش': ['gloves', 'glove', 'sport gloves', 'specialist gloves', 'moto gloves', 'driver gloves', 'hand wraps'],
  'گلاو': ['gloves', 'glove', 'sport gloves', 'specialist gloves'],
  'اسپورت': ['sport gloves'],
  'اسپشالیست': ['specialist gloves'],
  'موتو': ['moto gloves'],
  'درایور': ['driver gloves'],

  // Popular CS2 Finishes & Skins
  'داپلر': ['doppler'],
  'گاما داپلر': ['gamma doppler'],
  'فید': ['fade'],
  'کیس هاردند': ['case hardened'],
  'آسیموف': ['asiimov'],
  'اسیماو': ['asiimov'],
  'ردلاین': ['redline'],
  'پرینت استریم': ['printstream'],
  'پرینتاستریم': ['printstream'],
  'هایپر بیست': ['hyper beast'],
  'هاول': ['howl'],
  'دراگون لور': ['dragon lore'],
  'لور': ['lore', 'dragon lore'],
  'فایر سرپنت': ['fire serpent'],
  'تایگر توث': ['tiger tooth'],
  'ماربل فید': ['marble fade'],
  'اوتول': ['autotronic'],
  'اسلاتر': ['slaughter'],
  'سفایر': ['sapphire'],
  'روبی': ['ruby'],
  'امرالد': ['emerald'],
  'بلک پرل': ['black pearl'],
  'زمرد': ['emerald'],
  'یاقوت': ['ruby', 'sapphire'],

  // Special Attributes
  'استات ترک': ['stattrak'],
  'استت ترک': ['stattrak'],
  'سوونیر': ['souvenir'],
  'یادگاری': ['souvenir'],
  'استیکردار': ['sticker'],
  'برچسب': ['sticker'],
  'تخفیف': ['discount'],
  'فوری': ['instant'],
  'بدون هولد': ['instant'],
  'تحویل فوری': ['instant']
};

// Wear category aliases
export const WEAR_ALIASES: Record<string, WearCategory> = {
  'fn': 'FN',
  'factory new': 'FN',
  'نو': 'FN',
  'کارخانه': 'FN',
  'mw': 'MW',
  'minimal wear': 'MW',
  'کم کارکرد': 'MW',
  'تست کم': 'MW',
  'ft': 'FT',
  'field tested': 'FT',
  'field-tested': 'FT',
  'میدانی': 'FT',
  'تست میدانی': 'FT',
  'ww': 'WW',
  'well worn': 'WW',
  'well-worn': 'WW',
  'فرسوده': 'WW',
  'bs': 'BS',
  'battle scarred': 'BS',
  'battle-scarred': 'BS',
  'جنگ زده': 'BS'
};

export interface ParsedSearchQuery {
  rawQuery: string;
  normalizedTokens: string[];
  wearFilter?: WearCategory;
  isStatTrak?: boolean;
  isSouvenir?: boolean;
  isInstantTrade?: boolean;
  hasStickers?: boolean;
  minPriceUSD?: number;
  maxPriceUSD?: number;
  categoryFilter?: string;
  expandedKeywords: string[];
}

/**
 * Parses user input query, expanding synonyms, extracting operators, and tokenizing
 */
export function parseAdvancedSearchQuery(rawQuery: string): ParsedSearchQuery {
  const trimmed = rawQuery.trim().toLowerCase();
  if (!trimmed) {
    return {
      rawQuery: '',
      normalizedTokens: [],
      expandedKeywords: []
    };
  }

  const tokens = trimmed.split(/[\s,،|]+/).filter(t => t.length > 0);
  const remainingTokens: string[] = [];
  const expandedKeywords: string[] = [];
  let wearFilter: WearCategory | undefined;
  let isStatTrak: boolean | undefined;
  let isSouvenir: boolean | undefined;
  let isInstantTrade: boolean | undefined;
  let hasStickers: boolean | undefined;
  let maxPriceUSD: number | undefined;
  let minPriceUSD: number | undefined;

  for (const token of tokens) {
    // 1. Wear shortcut check
    if (WEAR_ALIASES[token]) {
      wearFilter = WEAR_ALIASES[token];
      continue;
    }

    // 2. StatTrak token
    if (token === 'st' || token === 'stattrak' || token === 'استات' || token === 'استات‌ترک') {
      isStatTrak = true;
      continue;
    }

    // 3. Souvenir token
    if (token === 'souvenir' || token === 'سوونیر' || token === 'یادگاری') {
      isSouvenir = true;
      continue;
    }

    // 4. Instant delivery token
    if (token === 'فوری' || token === 'ارسال‌فوری' || token === 'instant' || token === 'nohold') {
      isInstantTrade = true;
      continue;
    }

    // 5. Sticker token
    if (token === 'استیکر' || token === 'استیکردار' || token === 'sticker' || token === 'stickered') {
      hasStickers = true;
      continue;
    }

    // 6. Price shortcut: e.g. <50$ or <100 or >20$
    const priceMaxMatch = token.match(/^[<]([0-9]+)\$?$/);
    if (priceMaxMatch) {
      maxPriceUSD = parseFloat(priceMaxMatch[1]);
      continue;
    }
    const priceMinMatch = token.match(/^[>]([0-9]+)\$?$/);
    if (priceMinMatch) {
      minPriceUSD = parseFloat(priceMinMatch[1]);
      continue;
    }

    // 7. Persian synonyms check
    if (PERSIAN_SYNONYMS[token]) {
      expandedKeywords.push(...PERSIAN_SYNONYMS[token]);
    } else {
      remainingTokens.push(token);
      expandedKeywords.push(token);
    }
  }

  return {
    rawQuery,
    normalizedTokens: remainingTokens,
    wearFilter,
    isStatTrak,
    isSouvenir,
    isInstantTrade,
    hasStickers,
    minPriceUSD,
    maxPriceUSD,
    expandedKeywords
  };
}

/**
 * Evaluates whether an individual item matches all parsed search criteria
 */
export function matchItemWithAdvancedSearch(
  item: MarketItem,
  parsed: ParsedSearchQuery,
  filterState: FilterState
): boolean {
  // A. Extracted Wear check
  if (parsed.wearFilter && item.wearCategory !== parsed.wearFilter) {
    return false;
  }

  // B. Extracted StatTrak check
  if (parsed.isStatTrak && !item.isStatTrak) {
    return false;
  }

  // C. Extracted Souvenir check
  if (parsed.isSouvenir && !item.isSouvenir) {
    return false;
  }

  // D. Extracted Instant trade check
  if ((parsed.isInstantTrade || filterState.instantTradeOnly) && item.tradeHoldHours > 0) {
    return false;
  }

  // E. Extracted Sticker check
  if ((parsed.hasStickers || filterState.hasStickersOnly) && (!item.stickers || item.stickers.length === 0)) {
    return false;
  }

  // F. Extracted Price bounds
  if (parsed.minPriceUSD !== undefined && item.priceUSD < parsed.minPriceUSD) {
    return false;
  }
  if (parsed.maxPriceUSD !== undefined && item.priceUSD > parsed.maxPriceUSD) {
    return false;
  }

  // G. Advanced Doppler Phase filter
  if (filterState.dopplerPhase && filterState.dopplerPhase !== 'all') {
    const targetPhase = filterState.dopplerPhase.toLowerCase();
    const itemCondition = (item.condition || '').toLowerCase();
    const itemShortName = (item.shortName || '').toLowerCase();
    const itemName = (item.name || '').toLowerCase();
    const matchesPhase = 
      itemCondition.includes(targetPhase) || 
      itemShortName.includes(targetPhase) || 
      itemName.includes(targetPhase);

    if (!matchesPhase) return false;
  }

  // H. Advanced Sticker Name search
  if (filterState.stickerQuery && filterState.stickerQuery.trim()) {
    const sq = filterState.stickerQuery.toLowerCase().trim();
    const hasMatchingSticker = (item.stickers || []).some(s => s.name.toLowerCase().includes(sq));
    if (!hasMatchingSticker) return false;
  }

  // I. Advanced Collection search
  if (filterState.collectionQuery && filterState.collectionQuery.trim()) {
    const cq = filterState.collectionQuery.toLowerCase().trim();
    const matchesCollection = item.releaseCollection && item.releaseCollection.toLowerCase().includes(cq);
    if (!matchesCollection) return false;
  }

  // J. Minimum Discount percent filter
  if (filterState.minDiscount && filterState.minDiscount > 0) {
    if (!item.discountPercent || item.discountPercent < filterState.minDiscount) {
      return false;
    }
  }

  // K. Text / Keywords matching
  if (parsed.expandedKeywords.length > 0) {
    // Build searchable haystack for the item
    const haystack = [
      item.name.toLowerCase(),
      item.shortName.toLowerCase(),
      item.weapon.toLowerCase(),
      item.categoryFa.toLowerCase(),
      item.category.toLowerCase(),
      item.condition.toLowerCase(),
      item.wearCategory.toLowerCase(),
      item.paintSeed.toString(),
      item.releaseCollection?.toLowerCase() || '',
      ...(item.stickers || []).map(s => s.name.toLowerCase()),
      ...(item.tags || []).map(t => t.toLowerCase())
    ].join(' ');

    // For multi-token search, all token groups must have at least one match
    for (const keyword of parsed.expandedKeywords) {
      // If keyword is mapped from Persian synonyms, it might be an array of possible weapons (e.g. ['m4a4', 'm4a1-s'])
      // Check if keyword is in the haystack
      if (!haystack.includes(keyword.toLowerCase())) {
        return false;
      }
    }
  }

  return true;
}

// Popular and trending CS2 search terms
export const TRENDING_SEARCHES = [
  { label: 'AK-47 | Asiimov', query: 'ak asiimov', category: 'rifle' },
  { label: 'M4A4 | Howl', query: 'm4a4 howl', category: 'rifle' },
  { label: '★ Butterfly Knife | Doppler', query: 'butterfly doppler', category: 'knife' },
  { label: '★ Karambit | Fade', query: 'karambit fade', category: 'knife' },
  { label: 'AWP | Dragon Lore', query: 'dragon lore', category: 'sniper' },
  { label: '★ Sport Gloves | Vice', query: 'gloves vice', category: 'glove' },
  { label: 'Desert Eagle | Printstream', query: 'deagle printstream', category: 'pistol' },
  { label: 'AK-47 | Redline (StatTrak)', query: 'ak redline st', category: 'rifle' },
  { label: 'اسکین‌های فاز ۲ داپلر', query: 'doppler phase 2', category: 'knife' },
  { label: 'اسکین‌های دارای استیکر Crown', query: 'crown', category: 'all' }
];

export const POPULAR_STICKERS = [
  'Howling Dawn',
  'Crown (Foil)',
  'Titan | Katowice 2014',
  'iBUYPOWER | Katowice 2014',
  'Cloud9 (Gold) | Boston 2018',
  'FaZe Clan (Gold) | Boston 2018',
  'Team Liquid | MLG Columbus',
  'Natus Vincere | Stockholm 2021'
];

export const POPULAR_COLLECTIONS = [
  'The Cobblestone Collection',
  'The Huntsman Collection',
  'Operation Bravo',
  'Danger Zone Collection',
  'Dreams & Nightmares',
  'Spectrum Case',
  'Gamma Case',
  'Clutch Case',
  'Arms Deal'
];

export const DOPPLER_PHASES = [
  { id: 'all', label: 'همه فازها' },
  { id: 'Phase 1', label: 'Phase 1 (تیره و آبی)', color: '#4a2574' },
  { id: 'Phase 2', label: 'Phase 2 (صورتی داپلر)', color: '#d32ce6' },
  { id: 'Phase 3', label: 'Phase 3 (آبی و سبز)', color: '#1a6f8b' },
  { id: 'Phase 4', label: 'Phase 4 (آبی روشن)', color: '#2b7fff' },
  { id: 'Sapphire', label: 'Sapphire 💎 (یاقوت کبود)', color: '#0066ff' },
  { id: 'Ruby', label: 'Ruby 🔴 (یاقوت سرخ)', color: '#ff1a40' },
  { id: 'Emerald', label: 'Emerald 🟢 (زمرد سبز)', color: '#00e676' },
  { id: 'Black Pearl', label: 'Black Pearl ⚫ (مروارید سیاه)', color: '#333333' }
];
