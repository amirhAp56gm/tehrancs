import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Calendar,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Zap,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { MarketItem, Currency } from '../types';
import { 
  formatPrice, 
  toPersianDigits, 
  getRarityColor,
  getRarityLabelFa
} from '../utils/formatters';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { 
  getSkinColorPalette, 
  getHighResSkinImage, 
  hexToRgbString, 
  extractDominantColorFromImage 
} from '../utils/skinColorEngine';
import { getItemPriceHistory, TimeFrame, PricePoint } from '../utils/priceHistory';

interface ItemDetailModalProps {
  item: MarketItem | null;
  onClose: () => void;
  currency: Currency;
  isInCart: boolean;
  onAddToCart: (item: MarketItem) => void;
  onInstantBuy?: (item: MarketItem) => void;
}

// Deterministic enchanted particles configuration for the showcase chamber
const ENCHANTED_PARTICLES = [
  { id: 1, left: '14%', bottom: '18%', size: 5, delay: '0s', duration: '3.8s', drift: '-14px', isAccent: false },
  { id: 2, left: '24%', bottom: '26%', size: 3, delay: '0.7s', duration: '4.4s', drift: '18px', isAccent: true },
  { id: 3, left: '35%', bottom: '14%', size: 6, delay: '1.3s', duration: '3.5s', drift: '-10px', isAccent: false },
  { id: 4, left: '46%', bottom: '22%', size: 4, delay: '0.3s', duration: '4.1s', drift: '12px', isAccent: true },
  { id: 5, left: '54%', bottom: '16%', size: 5, delay: '1.9s', duration: '3.9s', drift: '-16px', isAccent: false },
  { id: 6, left: '65%', bottom: '24%', size: 3, delay: '0.9s', duration: '4.6s', drift: '15px', isAccent: true },
  { id: 7, left: '76%', bottom: '19%', size: 6, delay: '1.5s', duration: '3.7s', drift: '-20px', isAccent: false },
  { id: 8, left: '85%', bottom: '25%', size: 4, delay: '2.2s', duration: '4.2s', drift: '10px', isAccent: true },
  { id: 9, left: '29%', bottom: '32%', size: 3, delay: '2.6s', duration: '3.6s', drift: '8px', isAccent: false },
  { id: 10, left: '70%', bottom: '30%', size: 4, delay: '1.1s', duration: '4.0s', drift: '-12px', isAccent: true },
];

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  currency,
  isInCart,
  onAddToCart,
  onInstantBuy,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('7d');
  const [selectedPoint, setSelectedPoint] = useState<PricePoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [tilt, setTilt] = useState<{ x: number; y: number; glareX: number; glareY: number }>({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 40,
  });
  const [extractedColors, setExtractedColors] = useState<{ primary: string; secondary: string } | null>(null);

  const basePalette = useMemo(() => {
    if (!item) return null;
    return getSkinColorPalette(item);
  }, [item]);

  // Attempt live pixel sampling from the skin image when opened
  useEffect(() => {
    let active = true;
    setExtractedColors(null);
    setIsZoomed(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 40 });
    if (!item?.image) return;

    extractDominantColorFromImage(getOptimizedImageUrl(item.image)).then((res) => {
      if (active && res) {
        setExtractedColors(res);
      }
    });

    return () => {
      active = false;
    };
  }, [item]);

  const historyResult = useMemo(() => {
    if (!item) return null;
    return getItemPriceHistory(item, selectedTimeframe);
  }, [item, selectedTimeframe]);

  const handleTimeframeChange = (tf: TimeFrame) => {
    setSelectedTimeframe(tf);
    setSelectedPoint(null);
    setHoveredPoint(null);
  };

  if (!item || !basePalette) return null;

  // Combine curated skin finish palette with live image extracted colors if available
  const primaryColor = extractedColors?.primary || basePalette.primary;
  const secondaryColor = extractedColors?.secondary || basePalette.secondary;
  const accentColor = basePalette.accent;
  const primaryRgb = hexToRgbString(primaryColor);
  const secondaryRgb = hexToRgbString(secondaryColor);
  const accentRgb = hexToRgbString(accentColor);
  const rarityColor = getRarityColor(item.rarity);

  const highResSkinUrl = getHighResSkinImage(getOptimizedImageUrl(item.image));

  const timeFrameButtons: { id: TimeFrame; label: string }[] = [
    { id: '24h', label: '۲۴ ساعت' },
    { id: '7d', label: 'یک هفته' },
    { id: '30d', label: 'یک ماه' },
    { id: '1y', label: 'یک سال' },
  ];

  const activePoint = hoveredPoint || selectedPoint || (historyResult?.data[historyResult.data.length - 1] ?? null);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const rotateY = (relX - 0.5) * 18;
    const rotateX = (0.5 - relY) * 14;
    setTilt({
      x: rotateX,
      y: rotateY,
      glareX: Math.round(relX * 100),
      glareY: Math.round(relY * 100),
    });
  };

  const handleStageMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 40 });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (!target.dataset.hdFallbackTried && target.src.includes('/512fx512f')) {
      target.dataset.hdFallbackTried = 'true';
      target.src = getOptimizedImageUrl(item.image);
      return;
    }
    if (!target.dataset.fallbackTried) {
      target.dataset.fallbackTried = 'true';
      if (item.name?.includes('Butterfly') || item.weapon?.includes('Butterfly')) {
        target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbsslg5t1OD3EjVP5dumnZSEheLnP7vhgneGupJ03LiU94qi0Fbg80JsYW3zLI7Ecw86aV_TrVW9wuvn0ZW5vpqcy3FiuCRx7XfZnhG1hEpSLrs42iU367A/360fx360f';
      } else if (item.weapon?.includes('AK-47') || item.name?.includes('AK-47')) {
        target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsZGHyd4_Bd1RvM1-F_la4wO7vgZe86pnMnXJjuyNwsXbUmUeyhQYMMLI30VXDZw/360fx360f';
      } else {
        target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV19m5h5S0m_7zO6-fzj9V7MR3n-rC89mm0VXs_EVvamj0cYHEIFM9YlvU81TtlOi9hMS4vZvKznZquSY8pSGK6B_V8Wk/360fx360f';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-right">
      {/* Enchanted Tinted Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 35%, rgba(${primaryRgb}, 0.22) 0%, rgba(5, 7, 10, 0.92) 70%)`,
        }}
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6">
        <div 
          className="relative w-full max-w-6xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4"
          style={{
            backgroundColor: basePalette.bgDeep,
            backgroundImage: `
              radial-gradient(110% 85% at 75% 18%, rgba(${primaryRgb}, 0.34) 0%, rgba(${secondaryRgb}, 0.16) 45%, ${basePalette.bgDeep} 88%),
              radial-gradient(80% 60% at 15% 85%, rgba(${secondaryRgb}, 0.20) 0%, transparent 75%)
            `,
            border: `1px solid rgba(${primaryRgb}, 0.38)`,
            boxShadow: `0 30px 90px -15px rgba(0, 0, 0, 0.9), 0 0 85px -20px rgba(${primaryRgb}, 0.45)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Blurred Skin Image Wash Across Modal Background (Guarantees 100% Skin Color Match) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
            <img
              src={highResSkinUrl}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-cover scale-150 blur-[95px] saturate-[2.5]"
            />
          </div>

          {/* Top Enchanted Spectrum Accent Bar */}
          <div 
            className="h-1.5 w-full relative z-20"
            style={{
              background: `linear-gradient(90deg, ${secondaryColor}, ${primaryColor}, ${accentColor}, ${primaryColor})`,
              boxShadow: `0 2px 20px rgba(${primaryRgb}, 0.8)`,
            }}
          />

          <div className="relative z-10 p-4 sm:p-6 md:p-8 space-y-7">
            
            {/* TOP HERO GRID: Enchanted Floating Weapon Showcase + Contiguous Purchase Module */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* RIGHT COLUMN IN RTL (cols 7): ENCHANTED FLOATING SKIN SHOWCASE STAGE */}
              <div 
                className="lg:col-span-7 relative rounded-3xl p-5 sm:p-7 flex flex-col justify-between overflow-hidden select-none group"
                style={{
                  background: `
                    radial-gradient(65% 60% at 50% 44%, rgba(${primaryRgb}, 0.42) 0%, rgba(${secondaryRgb}, 0.22) 48%, rgba(6, 8, 12, 0.88) 95%)
                  `,
                  border: `1px solid rgba(${primaryRgb}, 0.42)`,
                  boxShadow: `inset 0 0 80px rgba(${primaryRgb}, 0.18), 0 20px 50px rgba(0,0,0,0.6)`,
                  minHeight: '390px',
                }}
                onMouseMove={handleStageMouseMove}
                onMouseLeave={handleStageMouseLeave}
              >
                {/* Close Button: Top-Left corner of item image with small offset, white icon, no background/stroke, low-opacity black on hover/active */}
                <button
                  id="close-item-detail-modal-btn"
                  type="button"
                  onClick={onClose}
                  className="absolute top-3 left-3 z-30 p-1.5 rounded-lg text-white bg-transparent hover:bg-black/20 active:bg-black/30 transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="بستن"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Layer 1: True Skin Chromatic Backdrop inside the Showcase Stage */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={highResSkinUrl}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="w-[90%] h-[90%] object-contain scale-125 blur-[60px] saturate-[2.8] opacity-55"
                  />
                </div>

                {/* Layer 2: Volumetric Enchanted God-Rays from Top */}
                <div 
                  className="pointer-events-none absolute -top-24 inset-x-0 h-80 animate-enchanted-ray"
                  style={{
                    background: `conic-gradient(from 165deg at 50% 0%, transparent 0deg, rgba(${primaryRgb}, 0.32) 18deg, rgba(${accentRgb}, 0.22) 30deg, transparent 52deg)`,
                    filter: 'blur(22px)',
                  }}
                />

                {/* Layer 3: Interactive Mouse Glare Spotlight */}
                <div 
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-75"
                  style={{
                    background: `radial-gradient(320px circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(${accentRgb}, 0.22), transparent 70%)`,
                  }}
                />

                {/* Layer 4: Rising Enchanted Particles / Luminous Motes */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {ENCHANTED_PARTICLES.map((p) => (
                    <span
                      key={p.id}
                      className="absolute rounded-full"
                      style={{
                        left: p.left,
                        bottom: p.bottom,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.isAccent ? accentColor : primaryColor,
                        boxShadow: `0 0 ${p.size * 3}px ${p.isAccent ? accentColor : primaryColor}`,
                        animation: `enchantedParticleRise ${p.duration} ease-in-out ${p.delay} infinite`,
                        ['--drift-x' as string]: p.drift,
                      }}
                    />
                  ))}
                </div>

                {/* Stage Top Bar: Icon-Only Zoom Control on the RIGHT & StatTrak/Souvenir Badges */}
                <div className="relative z-20 flex items-center justify-start gap-2 flex-wrap pl-8">
                  {/* Icon-only Inspect Zoom Button on the Right (first in RTL) */}
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    aria-label={isZoomed ? 'کوچک‌نمایی' : 'بزرگ‌نمایی'}
                    className="p-2.5 rounded-xl bg-black/45 hover:bg-black/70 text-gray-200 hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center justify-center"
                    style={{
                      border: `1px solid rgba(${primaryRgb}, 0.35)`,
                    }}
                  >
                    {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  </button>

                  {item.isStatTrak && (
                    <span className="text-xs font-bold font-mono text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40 shadow-sm">
                      StatTrak™
                    </span>
                  )}
                  {item.isSouvenir && (
                    <span className="text-xs font-bold font-mono text-yellow-300 bg-yellow-500/20 px-2.5 py-1 rounded-full border border-yellow-400/40 shadow-sm">
                      Souvenir
                    </span>
                  )}
                </div>

                {/* CENTER: LEVITATING MID-AIR WEAPON RIG WITH 3D PARALLAX & FLOOR VORTEX */}
                <div 
                  className="relative my-4 flex flex-col items-center justify-center w-full min-h-[230px] sm:min-h-[270px] z-20"
                  style={{ perspective: '1100px' }}
                >
                  {/* 3D Interactive Tilt Wrapper */}
                  <div
                    className="relative flex items-center justify-center w-full transition-transform duration-150 ease-out"
                    style={{
                      transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isZoomed ? 1.22 : 1})`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Glowing Core Orb Directly Behind Weapon Center */}
                    <div 
                      className="pointer-events-none absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full blur-3xl opacity-50"
                      style={{
                        background: `radial-gradient(circle, ${accentColor} 0%, ${primaryColor} 50%, transparent 75%)`,
                      }}
                    />

                    {/* Chromatic Weapon Silhouette Echo (Exact shape of skin glowing right behind it) */}
                    <img
                      src={highResSkinUrl}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                      className="pointer-events-none absolute z-10 max-h-56 sm:max-h-64 w-auto object-contain animate-enchanted-echo select-none"
                      style={{
                        filter: `blur(18px) saturate(280%) brightness(1.35) drop-shadow(0 0 35px ${primaryColor})`,
                        mixBlendMode: 'screen',
                      }}
                    />

                    {/* MAIN FLOATING HERO SKIN IMAGE */}
                    <img
                      src={highResSkinUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                      className="relative z-20 max-h-56 sm:max-h-64 md:max-h-72 w-auto object-contain animate-enchanted-levitate cursor-grab active:cursor-grabbing"
                      style={{
                        filter: `
                          drop-shadow(0 32px 20px rgba(0, 0, 0, 0.88))
                          drop-shadow(0 0 22px rgba(${primaryRgb}, 0.75))
                          drop-shadow(0 0 55px rgba(${secondaryRgb}, 0.45))
                          contrast(1.06)
                          saturate(1.12)
                        `,
                      }}
                    />
                  </div>

                  {/* 3D FLOOR PEDESTAL & SYNCHRONIZED BREATHING SHADOW UNDERNEATH THE FLOATING SKIN */}
                  <div 
                    className="pointer-events-none relative w-full flex items-center justify-center mt-3 h-14"
                    style={{ perspective: '600px' }}
                  >
                    {/* Outer Rotating Enchanted Energy Ring on Floor */}
                    <div
                      className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full animate-enchanted-ring"
                      style={{
                        border: `1.5px dashed rgba(${primaryRgb}, 0.55)`,
                        boxShadow: `0 0 30px rgba(${primaryRgb}, 0.35), inset 0 0 30px rgba(${secondaryRgb}, 0.25)`,
                      }}
                    />

                    {/* Inner Counter-Rotating Enchanted Ring on Floor */}
                    <div
                      className="absolute w-44 sm:w-56 h-44 sm:h-56 rounded-full animate-enchanted-ring-reverse"
                      style={{
                        border: `1px solid rgba(${accentRgb}, 0.45)`,
                        boxShadow: `0 0 20px rgba(${accentRgb}, 0.3)`,
                      }}
                    />

                    {/* Synchronized Mid-Air Ground Shadow (Shrinks when weapon rises, expands when weapon descends) */}
                    <div
                      className="w-52 sm:w-64 h-28 rounded-full animate-enchanted-shadow"
                      style={{
                        background: `radial-gradient(ellipse at center, rgba(0, 0, 0, 0.95) 0%, rgba(${primaryRgb}, 0.45) 55%, transparent 78%)`,
                        filter: 'blur(8px)',
                      }}
                    />
                  </div>
                </div>

                {/* Stage Bottom Bar: Applied Stickers & Technical Pattern Info */}
                <div className="relative z-20 flex items-center justify-between gap-3 pt-2 border-t border-white/10 flex-wrap text-xs">
                  <div className="flex items-center gap-3 text-gray-300 font-mono">
                    <span>
                      Paint Seed: <strong className="text-white">#{item.paintSeed}</strong>
                    </span>
                    {item.floatRank && (
                      <>
                        <span className="text-white/25">•</span>
                        <span>
                          Rank: <strong style={{ color: accentColor }}>#{item.floatRank}</strong>
                        </span>
                      </>
                    )}
                    {item.releaseCollection && (
                      <>
                        <span className="text-white/25 hidden sm:inline">•</span>
                        <span className="hidden sm:inline text-gray-300 font-sans">
                          {item.releaseCollection}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Stickers Showcase Dock (if stickers exist on the weapon) */}
                  {item.stickers && item.stickers.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15">
                      <span className="text-[11px] text-gray-300 ml-1">استیکرها:</span>
                      {item.stickers.map((st) => (
                        <div
                          key={st.id}
                          className="relative group/sticker w-7 h-7 rounded-lg bg-white/5 p-0.5 border border-white/10 hover:border-white/40 transition-transform hover:scale-125"
                          title={st.name}
                        >
                          <img
                            src={getOptimizedImageUrl(st.image)}
                            alt={st.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* LEFT COLUMN IN RTL (cols 5): PRODUCT DETAILS, FLOAT GAUGE & PURCHASE MODULE */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                
                {/* Product Header & Skin Metadata */}
                <div 
                  className="p-5 rounded-3xl space-y-3 backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(10, 14, 18, 0.65)',
                    border: `1px solid rgba(${primaryRgb}, 0.28)`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold tracking-wide" style={{ color: accentColor }}>
                      {item.categoryFa} · {item.weapon}
                    </span>
                    <span 
                      className="font-bold text-[11px]"
                      style={{ color: rarityColor }}
                    >
                      {getRarityLabelFa(item.rarity)}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-sans tracking-tight leading-snug">
                    {item.name}
                  </h1>

                  <div className="flex items-center gap-2 flex-wrap text-sm text-gray-300 pt-0.5">
                    <span className="text-white font-bold">{item.condition}</span>
                    {item.fadePercent && (
                      <>
                        <span className="text-white/30">·</span>
                        <span className="text-xs font-mono font-bold text-black bg-gradient-to-r from-pink-400 via-purple-400 to-amber-300 px-2 py-0.5 rounded-md">
                          {item.fadePercent}% Fade
                        </span>
                      </>
                    )}
                    {item.bluePercent && (
                      <>
                        <span className="text-white/30">·</span>
                        <span className="text-xs font-mono font-bold text-black bg-cyan-400 px-2 py-0.5 rounded-md">
                          {item.bluePercent}% Blue Gem
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Precision Wear Float Visual Gauge */}
                <div 
                  className="p-4 sm:p-5 rounded-3xl space-y-3 backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(10, 14, 18, 0.65)',
                    border: `1px solid rgba(${primaryRgb}, 0.25)`,
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium flex items-center gap-1.5">
                      <Layers className="w-4 h-4" style={{ color: primaryColor }} />
                      <span>شاخص فرسودگی دقیق (Wear Float):</span>
                    </span>
                    <span 
                      className="font-mono font-black text-sm sm:text-base tabular-nums" 
                      dir="ltr"
                      style={{ color: accentColor }}
                    >
                      {item.floatValue.toFixed(10)}
                    </span>
                  </div>

                  {/* Float Spectrum Bar */}
                  <div className="space-y-1.5">
                    <div className="relative h-2.5 w-full bg-black/70 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-[#10B981] via-[#F59E0B] to-[#EF4444]" />
                      <div 
                        className="absolute top-0 bottom-0 w-2 bg-white ring-2 ring-black rounded-full shadow-lg"
                        style={{ left: `${Math.min(98, Math.max(1, item.floatValue * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 tabular-nums" dir="ltr">
                      <span>0.00 FN</span>
                      <span>0.07 MW</span>
                      <span>0.15 FT</span>
                      <span>0.38 WW</span>
                      <span>0.45 BS</span>
                    </div>
                  </div>
                </div>

                {/* Contiguous Price & Purchase Action Module */}
                <div 
                  className="p-5 rounded-3xl space-y-4 backdrop-blur-md relative overflow-hidden"
                  style={{
                    background: `linear-gradient(145deg, rgba(${primaryRgb}, 0.18) 0%, rgba(10, 14, 18, 0.85) 100%)`,
                    border: `1px solid rgba(${primaryRgb}, 0.42)`,
                    boxShadow: `0 12px 35px -10px rgba(${primaryRgb}, 0.25)`,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div>
                      <span className="text-xs text-gray-300 block mb-1">قیمت نهایی معامله:</span>
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums tracking-tight">
                        {formatPrice(item.priceUSD, currency)}
                      </span>
                      <span className="block text-xs font-mono text-gray-400 mt-0.5 tabular-nums">
                        معادل دلاری: ${item.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {item.discountPercent && item.discountPercent > 0 && (
                      <div className="text-left">
                        <span 
                          className="inline-block text-xs font-black px-3 py-1.5 rounded-xl font-mono"
                          style={{
                            backgroundColor: `rgba(${primaryRgb}, 0.22)`,
                            color: accentColor,
                            border: `1px solid rgba(${primaryRgb}, 0.45)`,
                          }}
                        >
                          %{toPersianDigits(item.discountPercent)} زیر قیمت استیم
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delivery & Trust Row */}
                  <div className="flex items-center justify-between text-xs text-gray-300 pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      <span>وضعیت تحویل: <strong className="text-white">{item.tradeHoldHours === 0 ? 'تحویل آنی (Trade Ready)' : item.expiresInText}</strong></span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>تضمین اصالت استیم</span>
                    </span>
                  </div>

                  {/* Main Action CTA (Add to Cart) */}
                  <div className="pt-1">
                    <button
                      id="modal-add-to-cart-btn"
                      onClick={() => onAddToCart(item)}
                      className="w-full py-3.5 px-6 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 whitespace-nowrap"
                      style={
                        isInCart
                          ? {
                              backgroundColor: 'rgba(15, 23, 20, 0.9)',
                              color: accentColor,
                              border: `1.5px solid ${primaryColor}`,
                              boxShadow: `0 0 25px rgba(${primaryRgb}, 0.25)`,
                            }
                          : {
                              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                              color: '#FFFFFF',
                              boxShadow: `0 10px 30px -5px rgba(${primaryRgb}, 0.65)`,
                              textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                            }
                      }
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isInCart ? 'در سبد خرید موجود است' : 'افزودن به سبد خرید'}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* FULL-WIDTH TRADING-STYLE INTERACTIVE PRICE CHART (Themed with Skin Color) */}
            {historyResult && (
              <div 
                className="rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(10, 14, 18, 0.72)',
                  border: `1px solid rgba(${primaryRgb}, 0.28)`,
                }}
              >
                {/* Chart Header: Title & Timeframe Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  
                  {/* Right Title */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-2xl shadow-inner"
                      style={{
                        backgroundColor: `rgba(${primaryRgb}, 0.18)`,
                        color: accentColor,
                        border: `1px solid rgba(${primaryRgb}, 0.35)`,
                      }}
                    >
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white">نمودار نوسانات قیمت اسکین</h2>
                      <p className="text-xs text-gray-400">بررسی تاریخچه معاملات و تغییرات قیمت در بازار</p>
                    </div>
                  </div>

                  {/* Left: Timeframe Selector */}
                  <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
                    {timeFrameButtons.map((tf) => {
                      const active = selectedTimeframe === tf.id;
                      return (
                        <button
                          key={tf.id}
                          id={`timeframe-btn-${tf.id}`}
                          onClick={() => handleTimeframeChange(tf.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            active
                              ? 'text-white shadow-md'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                          style={
                            active
                              ? {
                                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                  boxShadow: `0 4px 14px rgba(${primaryRgb}, 0.4)`,
                                }
                              : undefined
                          }
                        >
                          {tf.label}
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* LIVE TRADING HUD INSPECTOR */}
                <div 
                  className="bg-black/55 rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-lg"
                  style={{
                    border: `1px solid rgba(${primaryRgb}, 0.3)`,
                  }}
                >
                  {/* Selected Date/Time */}
                  <div className="sm:col-span-4 space-y-0.5">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      <span>تاریخ / بازه انتخابی:</span>
                    </span>
                    <div className="text-sm font-bold text-white font-mono">
                      {activePoint ? activePoint.fullDate : '---'}
                    </div>
                  </div>

                  {/* Selected Price */}
                  <div className="sm:col-span-5 space-y-0.5 border-r sm:border-r border-white/10 pr-0 sm:pr-4">
                    <span className="text-[11px] text-gray-400 block">قیمت ثبت‌شده در این زمان:</span>
                    <div className="flex items-baseline gap-2">
                      <span 
                        className="text-base sm:text-lg font-black font-mono tabular-nums"
                        style={{ color: accentColor }}
                      >
                        {activePoint ? activePoint.formattedToman : '---'}
                      </span>
                      {activePoint && (
                        <span className="text-xs font-mono font-bold text-gray-400 tabular-nums">
                          ({activePoint.formattedUSD})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Point Change % & Reset Button */}
                  <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                    {activePoint && (
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border tabular-nums ${
                        activePoint.changeFromStartPercent >= 0
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {activePoint.changeFromStartPercent >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {activePoint.changeFromStartPercent >= 0 ? '+' : ''}
                          %{toPersianDigits(activePoint.changeFromStartPercent)}
                        </span>
                      </div>
                    )}

                    {selectedPoint && (
                      <button
                        onClick={() => setSelectedPoint(null)}
                        className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
                        title="بازگشت به نقطه فعلی"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>بازنشانی</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Min / Max / Average Quick Stats Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
                    <span className="text-gray-400 text-[11px] block">کمترین قیمت دوره:</span>
                    <span className="font-mono font-bold text-xs mt-1 block tabular-nums" style={{ color: accentColor }}>
                      {toPersianDigits(historyResult.minPriceToman.toLocaleString('fa-IR'))} تومان (${historyResult.minPriceUSD})
                    </span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
                    <span className="text-gray-400 text-[11px] block">بیشترین قیمت دوره:</span>
                    <span className="font-mono text-white font-bold text-xs mt-1 block tabular-nums">
                      {toPersianDigits(historyResult.maxPriceToman.toLocaleString('fa-IR'))} تومان (${historyResult.maxPriceUSD})
                    </span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
                    <span className="text-gray-400 text-[11px] block">میانگین قیمت بازار:</span>
                    <span className="font-mono text-amber-300 font-bold text-xs mt-1 block tabular-nums">
                      {toPersianDigits(historyResult.averageToman.toLocaleString('fa-IR'))} تومان
                    </span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
                    <span className="text-gray-400 text-[11px] block">تغییر کل دوره:</span>
                    <span className={`font-mono font-bold text-xs mt-1 block tabular-nums ${historyResult.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {historyResult.isPositive ? '+' : ''}%{toPersianDigits(historyResult.changePercent)}
                    </span>
                  </div>
                </div>

                {/* Recharts High-Precision Trading Area Chart */}
                <div className="h-64 sm:h-72 w-full pt-2 dir-ltr select-none outline-none" tabIndex={-1}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={historyResult.data}
                      accessibilityLayer={false}
                      margin={{ top: 15, right: 15, left: 15, bottom: 0 }}
                      style={{ outline: 'none' }}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload[0]) {
                          setSelectedPoint(e.activePayload[0].payload as PricePoint);
                        }
                      }}
                      onMouseMove={(e: any) => {
                        if (e && e.activePayload && e.activePayload[0]) {
                          setHoveredPoint(e.activePayload[0].payload as PricePoint);
                        }
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-crosshair outline-none focus:outline-none"
                    >
                      <defs>
                        <linearGradient id="skinChartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={primaryColor} stopOpacity={0.55} />
                          <stop offset="65%" stopColor={secondaryColor} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={primaryColor} 
                        strokeOpacity={0.14} 
                        vertical={true}
                        horizontal={true}
                      />

                      <XAxis 
                        dataKey="label" 
                        stroke="#9CA3AF" 
                        fontSize={11} 
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                        tick={{ fill: '#9CA3AF' }}
                      />

                      <YAxis 
                        stroke="#9CA3AF" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        domain={['dataMin - 100000', 'dataMax + 100000']}
                        tickFormatter={(val) => {
                          if (val >= 1000000) {
                            return `${toPersianDigits((val / 1000000).toFixed(1))}M`;
                          }
                          if (val >= 1000) {
                            return `${toPersianDigits((val / 1000).toFixed(0))}K`;
                          }
                          return toPersianDigits(val);
                        }}
                        orientation="right"
                        tick={{ fill: '#9CA3AF' }}
                        width={50}
                      />

                      <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const pData = payload[0].payload as PricePoint;
                            return (
                              <div 
                                className="bg-black/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl text-right z-50 space-y-1 dir-rtl"
                                style={{ border: `1px solid ${primaryColor}` }}
                              >
                                <div className="text-[11px] font-bold text-gray-300 border-b border-white/10 pb-1">
                                  {pData.fullDate}
                                </div>
                                <div className="text-sm font-black font-mono" style={{ color: accentColor }}>
                                  {pData.formattedToman}
                                </div>
                                <div className="text-[11px] text-gray-400 font-mono">
                                  قیمت دلاری: {pData.formattedUSD}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="priceToman"
                        stroke={primaryColor}
                        strokeWidth={2.75}
                        fillOpacity={1}
                        fill="url(#skinChartGradient)"
                        activeDot={{
                          r: 6,
                          fill: accentColor,
                          stroke: '#000000',
                          strokeWidth: 3,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
