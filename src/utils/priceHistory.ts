import { MarketItem } from '../types';
import { USD_TO_TOMAN_RATE, toPersianDigits } from './formatters';

export type TimeFrame = '24h' | '7d' | '30d' | '1y';

export interface PricePoint {
  label: string;
  fullDate: string;
  priceToman: number;
  priceUSD: number;
  formattedToman: string;
  formattedUSD: string;
  changeFromStartPercent: number;
}

export interface PriceHistoryResult {
  data: PricePoint[];
  changePercent: number;
  isPositive: boolean;
  minPriceToman: number;
  maxPriceToman: number;
  minPriceUSD: number;
  maxPriceUSD: number;
  averageToman: number;
}

export function getItemPriceHistory(item: MarketItem, timeframe: TimeFrame = '7d'): PriceHistoryResult {
  const currentToman = Math.round(item.priceUSD * USD_TO_TOMAN_RATE);
  const seed = (item.paintSeed || 100) + Math.round(item.floatValue * 1000);

  let pointCount = 14;
  let baseVolatility = 0.035;
  let tfMultiplier = 0.95;

  switch (timeframe) {
    case '24h':
      pointCount = 24;
      baseVolatility = 0.018;
      tfMultiplier = 0.985;
      break;
    case '7d':
      pointCount = 14;
      baseVolatility = 0.035;
      tfMultiplier = 0.95;
      break;
    case '30d':
      pointCount = 20;
      baseVolatility = 0.065;
      tfMultiplier = 0.91;
      break;
    case '1y':
      pointCount = 24;
      baseVolatility = 0.14;
      tfMultiplier = 0.82;
      break;
  }

  const points: number[] = [];
  const startPrice = Math.round(currentToman * (tfMultiplier + ((seed % 15) / 100) * (timeframe === '1y' ? 0.25 : 0.08)));
  points.push(startPrice);

  for (let i = 1; i < pointCount - 1; i++) {
    const progress = i / (pointCount - 1);
    const wave = Math.sin(seed + i * 1.5) * baseVolatility;
    const wave2 = Math.cos(seed * 0.7 + i * 2.2) * (baseVolatility * 0.5);
    const interp = startPrice + (currentToman - startPrice) * progress;
    const jittered = Math.round(interp * (1 + wave + wave2));
    points.push(Math.max(1000, jittered));
  }
  points.push(currentToman);

  const initial = points[0];
  const final = points[points.length - 1];
  const changePercent = Number((((final - initial) / (initial || 1)) * 100).toFixed(1));
  const isPositive = changePercent >= 0;

  const minPriceToman = Math.min(...points);
  const maxPriceToman = Math.max(...points);
  const averageToman = Math.round(points.reduce((a, b) => a + b, 0) / points.length);

  const minPriceUSD = Number((minPriceToman / USD_TO_TOMAN_RATE).toFixed(2));
  const maxPriceUSD = Number((maxPriceToman / USD_TO_TOMAN_RATE).toFixed(2));

  // Generate date labels
  const now = new Date();
  
  const data: PricePoint[] = points.map((p, idx) => {
    let label = '';
    let fullDate = '';

    if (timeframe === '24h') {
      const hour = (idx * 1) % 24;
      label = `${toPersianDigits(hour < 10 ? '0' + hour : '' + hour)}:۰۰`;
      fullDate = `امروز - ساعت ${label}`;
    } else if (timeframe === '7d') {
      const daysAgo = pointCount - 1 - idx;
      if (daysAgo === 0) {
        label = 'امروز';
        fullDate = 'امروز (قیمت زنده)';
      } else if (daysAgo === 1) {
        label = 'دیروز';
        fullDate = 'دیروز';
      } else {
        label = `${toPersianDigits(daysAgo)} روز پیش`;
        fullDate = `${toPersianDigits(daysAgo)} روز قبل`;
      }
    } else if (timeframe === '30d') {
      const daysAgo = Math.round((pointCount - 1 - idx) * 1.5);
      if (daysAgo === 0) {
        label = 'امروز';
        fullDate = 'امروز (قیمت زنده)';
      } else {
        label = `${toPersianDigits(daysAgo)} روز پیش`;
        fullDate = `${toPersianDigits(daysAgo)} روز پیش`;
      }
    } else {
      const monthsAgo = Math.round((pointCount - 1 - idx) * 0.5);
      if (monthsAgo === 0) {
        label = 'اکنون';
        fullDate = 'هم‌اکنون';
      } else {
        label = `${toPersianDigits(monthsAgo)} ماه پیش`;
        fullDate = `${toPersianDigits(monthsAgo)} ماه قبل`;
      }
    }

    const priceUSD = Number((p / USD_TO_TOMAN_RATE).toFixed(2));
    const changeFromStartPercent = Number((((p - initial) / (initial || 1)) * 100).toFixed(1));

    return {
      label,
      fullDate,
      priceToman: p,
      priceUSD,
      formattedToman: `${toPersianDigits(p.toLocaleString('fa-IR'))} تومان`,
      formattedUSD: `$${priceUSD}`,
      changeFromStartPercent,
    };
  });

  return {
    data,
    changePercent,
    isPositive,
    minPriceToman,
    maxPriceToman,
    minPriceUSD,
    maxPriceUSD,
    averageToman,
  };
}
