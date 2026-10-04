import { WearCategory, ItemRarity, Currency } from '../types';

export const USD_TO_TOMAN_RATE = 230000;
export const USD_TO_EUR_RATE = 0.92;

export function toPersianDigits(n: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

export function formatPrice(priceUSD: number, _currency?: any): string {
  const tomans = Math.round(priceUSD * USD_TO_TOMAN_RATE);
  return `${toPersianDigits(tomans.toLocaleString('fa-IR'))} تومان`;
}

export function formatCompactPrice(priceUSD: number, _currency?: any): string {
  const tomans = Math.round(priceUSD * USD_TO_TOMAN_RATE);
  if (tomans >= 1_000_000_000) {
    return `${toPersianDigits((tomans / 1_000_000_000).toFixed(1))} میلیارد تومان`;
  }
  if (tomans >= 1_000_000) {
    return `${toPersianDigits((tomans / 1_000_000).toFixed(1))} میلیون تومان`;
  }
  return `${toPersianDigits(tomans.toLocaleString('fa-IR'))} تومان`;
}

export function getWearLabelFa(wear: WearCategory): string {
  switch (wear) {
    case 'FN': return 'کارخانه‌ای نو (FN)';
    case 'MW': return 'کم‌کارکرد (MW)';
    case 'FT': return 'تست‌شده در میدان (FT)';
    case 'WW': return 'کهنه‌شده (WW)';
    case 'BS': return 'به‌شدت فرسوده (BS)';
  }
}

export function getWearColor(wear: WearCategory): string {
  switch (wear) {
    case 'FN': return '#20df7c'; // Green
    case 'MW': return '#84cc16'; // Lime
    case 'FT': return '#eab308'; // Yellow/amber
    case 'WW': return '#f97316'; // Orange
    case 'BS': return '#ef4444'; // Red
  }
}

export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'Extraordinary': return '#ffd700'; // Gold
    case 'Covert': return '#eb4b4b';        // Red
    case 'Classified': return '#d32ce6';    // Purple
    case 'Restricted': return '#ff69b4';    // Pink
    case 'Mil-Spec': return '#4b69ff';      // Light Blue
    case 'Industrial': return '#5e98d9';    // Blue
    case 'Consumer': return '#b0c3d9';      // Gray
    default: return '#b0c3d9';
  }
}

export function getRarityLabelFa(rarity: ItemRarity): string {
  switch (rarity) {
    case 'Extraordinary': return 'طلایی (Extraordinary)';
    case 'Covert': return 'قرمز (Covert)';
    case 'Classified': return 'بنفش (Classified)';
    case 'Restricted': return 'صورتی (Restricted)';
    case 'Mil-Spec': return 'آبی روشن (Mil-Spec)';
    case 'Industrial': return 'آبی (Industrial)';
    case 'Consumer': return 'خاکستری (Consumer)';
    default: return 'خاکستری';
  }
}
