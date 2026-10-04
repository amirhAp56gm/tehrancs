import { MarketItem } from '../types';
import { getRarityColor } from './formatters';

export interface SkinColorPalette {
  primary: string;       // Main vibrant skin color (Hex)
  secondary: string;     // Secondary complementary skin color (Hex)
  accent: string;        // Bright highlight / particle color (Hex)
  bgDeep: string;        // Deep background base tinted with skin hue
  bgSurface: string;     // Card/panel surface tinted with skin hue
  borderGlow: string;    // Subtle glowing border color
  themeNameFa: string;   // Enchanted aura title in Persian
  isLightSkin?: boolean; // If skin has bright white/silver body like Printstream/Asiimov
}

/**
 * Upgrades Steam economy 360fx360f URLs to higher resolution 512fx512f for the product showcase.
 */
export function getHighResSkinImage(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('/360fx360f')) {
    return trimmed.replace('/360fx360f', '/512fx512f');
  }
  if (trimmed.includes('/256fx256f')) {
    return trimmed.replace('/256fx256f', '/512fx512f');
  }
  return trimmed;
}

/**
 * Converts a hex color (#RRGGBB) to "r, g, b" string for rgba() usage in CSS variables.
 */
export function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '32, 223, 124';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '32, 223, 124';
  return `${r}, ${g}, ${b}`;
}

/**
 * Determines the exact chromatic theme of a CS2 skin based on its finish, phase, name, and rarity.
 * Ensures the product page background and enchanted aura match the actual visual colors of the skin.
 */
export function getSkinColorPalette(item: MarketItem): SkinColorPalette {
  const fullText = `${item.name} ${item.shortName || ''} ${item.condition || ''}`.toLowerCase();

  // 1. Emerald / Gamma Doppler
  if (fullText.includes('emerald') || fullText.includes('gamma doppler')) {
    if (fullText.includes('phase 3') || fullText.includes('phase 4')) {
      return {
        primary: '#00E5A3',
        secondary: '#06B6D4',
        accent: '#6EE7B7',
        bgDeep: '#041712',
        bgSurface: '#08261E',
        borderGlow: 'rgba(0, 229, 163, 0.35)',
        themeNameFa: 'هاله زمرد و فیروزه‌ای (Gamma Aura)',
      };
    }
    return {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#6EE7B7',
      bgDeep: '#041A11',
      bgSurface: '#08291B',
      borderGlow: 'rgba(16, 185, 129, 0.4)',
      themeNameFa: 'هاله جادویی زمرد خالص (Emerald Enchanted)',
    };
  }

  // 2. Doppler Ruby / Crimson / Slaughter / Hot Rod / Howl / Wildfire / Redline / Kill Confirmed
  if (
    fullText.includes('ruby') ||
    fullText.includes('hot rod') ||
    fullText.includes('slaughter') ||
    fullText.includes('crimson') ||
    fullText.includes('kill confirmed')
  ) {
    return {
      primary: '#F43F5E',
      secondary: '#BE123C',
      accent: '#FDA4AF',
      bgDeep: '#1A050A',
      bgSurface: '#290911',
      borderGlow: 'rgba(244, 63, 94, 0.4)',
      themeNameFa: 'هاله یاقوت سرخ (Crimson Ruby Aura)',
    };
  }

  // 3. Howl / Wildfire (Fiery Molten Red-Orange)
  if (fullText.includes('howl') || fullText.includes('wildfire') || fullText.includes('blaze')) {
    return {
      primary: '#FF3B30',
      secondary: '#F97316',
      accent: '#FDBA74',
      bgDeep: '#1C0805',
      bgSurface: '#2B0E08',
      borderGlow: 'rgba(255, 59, 48, 0.4)',
      themeNameFa: 'هاله آتشین گداخته (Hellfire Aura)',
    };
  }

  // 4. Redline (Carbon Black + Racing Red)
  if (fullText.includes('redline')) {
    return {
      primary: '#EF4444',
      secondary: '#991B1B',
      accent: '#FCA5A5',
      bgDeep: '#160708',
      bgSurface: '#220C0E',
      borderGlow: 'rgba(239, 68, 68, 0.35)',
      themeNameFa: 'هاله کربن و خط سرخ (Carbon Redline)',
    };
  }

  // 5. Asiimov / Big Iron / Fuel Injector (Sci-Fi Vibrant Orange & White)
  if (fullText.includes('asiimov') || fullText.includes('big iron') || fullText.includes('fuel injector')) {
    return {
      primary: '#FF6B1A',
      secondary: '#EA580C',
      accent: '#FDE047',
      bgDeep: '#1C0E05',
      bgSurface: '#2A1609',
      borderGlow: 'rgba(255, 107, 26, 0.4)',
      themeNameFa: 'هاله سایبرنتیک نارنجی (Sci-Fi Asiimov)',
      isLightSkin: true,
    };
  }

  // 6. Dragon Lore / Gold Arabesque / Katowice 2014 / Amber / Lore
  if (
    fullText.includes('dragon lore') ||
    fullText.includes('lore') ||
    fullText.includes('katowice 2014') ||
    fullText.includes('gold') ||
    fullText.includes('tiger tooth')
  ) {
    return {
      primary: '#F59E0B',
      secondary: '#B45309',
      accent: '#FEF08A',
      bgDeep: '#1B1304',
      bgSurface: '#2B1F08',
      borderGlow: 'rgba(245, 158, 11, 0.45)',
      themeNameFa: 'هاله سلطنتی طلایی (Mythic Dragon Gold)',
    };
  }

  // 7. Fade / Ocean Drive (Iridescent Pink, Purple & Sunset Amber)
  if ((fullText.includes('fade') && !fullText.includes('marble fade')) || fullText.includes('ocean drive')) {
    return {
      primary: '#EC4899',
      secondary: '#A855F7',
      accent: '#FBBF24',
      bgDeep: '#19071B',
      bgSurface: '#280C2B',
      borderGlow: 'rgba(236, 72, 153, 0.4)',
      themeNameFa: 'هاله طیف رنگین‌کمانی (Prismatic Fade)',
    };
  }

  // 8. Marble Fade (Fire & Ice: Red, Royal Blue & Gold)
  if (fullText.includes('marble fade')) {
    return {
      primary: '#3B82F6',
      secondary: '#EF4444',
      accent: '#F59E0B',
      bgDeep: '#091024',
      bgSurface: '#131C38',
      borderGlow: 'rgba(59, 130, 246, 0.4)',
      themeNameFa: 'هاله آتش و یخ (Fire & Ice Aura)',
    };
  }

  // 9. Vice Gloves / Player Two / Hyper Beast / Neo-Noir (Neon Miami Pink & Cyan)
  if (
    fullText.includes('vice') ||
    fullText.includes('player two') ||
    fullText.includes('hyper beast') ||
    fullText.includes('neo-noir')
  ) {
    return {
      primary: '#F43F5E',
      secondary: '#06B6D4',
      accent: '#67E8F9',
      bgDeep: '#17071C',
      bgSurface: '#240C2C',
      borderGlow: 'rgba(244, 63, 94, 0.4)',
      themeNameFa: 'هاله نئون سایبرپانک (Neon Vice Aura)',
    };
  }

  // 10. Printstream (Pearlescent Opal White, Iridescent Lilac & Cyan)
  if (fullText.includes('printstream')) {
    return {
      primary: '#C084FC',
      secondary: '#38BDF8',
      accent: '#F8FAFC',
      bgDeep: '#110C1D',
      bgSurface: '#1C142E',
      borderGlow: 'rgba(192, 132, 252, 0.4)',
      themeNameFa: 'هاله صدفی مرواریدی (Pearlescent Opal)',
      isLightSkin: true,
    };
  }

  // 11. Doppler (Phase 1 / Phase 2 / Ultra Violet / Purple / Pandora)
  if (
    fullText.includes('ultra violet') ||
    fullText.includes('phase 1') ||
    fullText.includes('phase 2') ||
    fullText.includes('pandora') ||
    fullText.includes('black pearl')
  ) {
    return {
      primary: '#A855F7',
      secondary: '#EC4899',
      accent: '#E879F9',
      bgDeep: '#140621',
      bgSurface: '#210B36',
      borderGlow: 'rgba(168, 85, 247, 0.4)',
      themeNameFa: 'هاله کهکشانی بنفش (Cosmic Doppler)',
    };
  }

  // 12. Doppler (Phase 4 / Sapphire) / Gungnir / Vulcan / Amphibious / Blue Steel / Bravo
  if (
    fullText.includes('gungnir') ||
    fullText.includes('vulcan') ||
    fullText.includes('amphibious') ||
    fullText.includes('sapphire') ||
    fullText.includes('phase 4') ||
    fullText.includes('doppler') ||
    fullText.includes('blue steel') ||
    fullText.includes('bravo')
  ) {
    return {
      primary: '#0EA5E9',
      secondary: '#2563EB',
      accent: '#7DD3FC',
      bgDeep: '#051324',
      bgSurface: '#0A1F38',
      borderGlow: 'rgba(14, 165, 233, 0.4)',
      themeNameFa: 'هاله یاقوت کبود و یخ (Celestial Sapphire)',
    };
  }

  // 13. Case Hardened (Blue Gem Cyan + Tempered Gold)
  if (fullText.includes('case hardened')) {
    return {
      primary: '#38BDF8',
      secondary: '#F59E0B',
      accent: '#7DD3FC',
      bgDeep: '#071624',
      bgSurface: '#0E2438',
      borderGlow: 'rgba(56, 189, 248, 0.4)',
      themeNameFa: 'هاله بلو جم و طلای آبکاری (Blue Gem Aura)',
    };
  }

  // 14. Fire Serpent / Spearmint (Aztec Jade / Turquoise Mint)
  if (fullText.includes('fire serpent') || fullText.includes('spearmint')) {
    return {
      primary: '#14B8A6',
      secondary: '#10B981',
      accent: '#5EEAD4',
      bgDeep: '#041917',
      bgSurface: '#092926',
      borderGlow: 'rgba(20, 184, 166, 0.4)',
      themeNameFa: 'هاله یشم و فیروزه (Mystic Jade Aura)',
    };
  }

  // 15. Nocts / Black / Slate (Obsidian & tactical silver-violet)
  if (fullText.includes('nocts') || fullText.includes('slate') || fullText.includes('black')) {
    return {
      primary: '#818CF8',
      secondary: '#4F46E5',
      accent: '#C7D2FE',
      bgDeep: '#090A14',
      bgSurface: '#121526',
      borderGlow: 'rgba(129, 140, 248, 0.35)',
      themeNameFa: 'هاله شبکیه ابسیدین (Obsidian Night Aura)',
    };
  }

  // Default fallback based on Item Rarity
  const rarityHex = getRarityColor(item.rarity);
  if (item.rarity === 'Extraordinary') {
    return {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FDE68A',
      bgDeep: '#1A1205',
      bgSurface: '#291D09',
      borderGlow: 'rgba(245, 158, 11, 0.4)',
      themeNameFa: 'هاله نادر طلایی (Extraordinary Gold)',
    };
  }
  if (item.rarity === 'Covert') {
    return {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#FCA5A5',
      bgDeep: '#1A0707',
      bgSurface: '#290C0C',
      borderGlow: 'rgba(239, 68, 68, 0.4)',
      themeNameFa: 'هاله اسطوره‌ای (Covert Crimson)',
    };
  }
  if (item.rarity === 'Classified') {
    return {
      primary: '#D946EF',
      secondary: '#9333EA',
      accent: '#F0ABFC',
      bgDeep: '#18071C',
      bgSurface: '#260C2E',
      borderGlow: 'rgba(217, 70, 239, 0.4)',
      themeNameFa: 'هاله محرمانه (Classified Violet)',
    };
  }

  return {
    primary: rarityHex,
    secondary: '#3B82F6',
    accent: '#93C5FD',
    bgDeep: '#09131F',
    bgSurface: '#102033',
    borderGlow: `rgba(${hexToRgbString(rarityHex)}, 0.35)`,
    themeNameFa: 'هاله اختصاصی اسکین (Enchanted Skin Aura)',
  };
}

/**
 * Attempts to extract dominant vibrant RGB colors from an image URL via an offscreen canvas.
 * If CORS blocks pixel read (common on external CDNs), resolves null so the caller seamlessly uses
 * the skin color dictionary + CSS blurred image backdrop.
 */
export function extractDominantColorFromImage(imageUrl: string): Promise<{ primary: string; secondary: string } | null> {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let rSum = 0, gSum = 0, bSum = 0, weightSum = 0;
        let r2Sum = 0, g2Sum = 0, b2Sum = 0, weight2Sum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 120) continue; // Ignore transparent background pixels of weapon PNG

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const l = (max + min) / 2;
          const sat = max === 0 ? 0 : (max - min) / max;

          // Ignore near-black or near-white neutral pixels to capture the skin's vibrant paint
          if (l < 25 || l > 240) continue;

          const weight = (sat + 0.15) * (sat + 0.15) * 10;
          if (i < data.length / 2) {
            rSum += r * weight;
            gSum += g * weight;
            bSum += b * weight;
            weightSum += weight;
          } else {
            r2Sum += r * weight;
            g2Sum += g * weight;
            b2Sum += b * weight;
            weight2Sum += weight;
          }
        }

        if (weightSum === 0) {
          resolve(null);
          return;
        }

        const toHex = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
        const pHex = `#${toHex(rSum / weightSum)}${toHex(gSum / weightSum)}${toHex(bSum / weightSum)}`;
        const sHex = weight2Sum > 0
          ? `#${toHex(r2Sum / weight2Sum)}${toHex(g2Sum / weight2Sum)}${toHex(b2Sum / weight2Sum)}`
          : pHex;

        resolve({ primary: pHex, secondary: sHex });
      } catch {
        // SecurityError (tainted canvas) -> gracefully fall back
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
