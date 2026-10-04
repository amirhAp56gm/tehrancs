import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// Function to read products from persistent file
function readProductsFromFile(): any[] | null {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading products file:', err);
  }
  return null;
}

// Function to save products to persistent file
function saveProductsToFile(products: any[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving products file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Steam OpenID 2.0 Auth Endpoint
  app.get('/api/auth/steam', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const returnTo = `${baseUrl}/api/auth/steam/callback`;

    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnTo,
      'openid.realm': baseUrl,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    res.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`);
  });

  // Steam OpenID Callback Endpoint
  app.get(['/api/auth/steam/callback', '/api/auth/steam/callback/'], async (req, res) => {
    try {
      const claimedId = (req.query['openid.claimed_id'] as string) || '';
      if (!claimedId) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html lang="fa" dir="rtl">
            <body style="background:#1b2838;color:#ff6b6b;font-family:sans-serif;text-align:center;padding:40px;">
              <h2>خطا در ورود با استیم</h2>
              <p>اطلاعات برگشتی از استیم معتبر نیست.</p>
              <script>setTimeout(() => window.close(), 3000);</script>
            </body>
          </html>
        `);
      }

      const steamId = claimedId.replace('https://steamcommunity.com/openid/id/', '').replace('/', '');
      let personaName = `Steam_${steamId.slice(-6)}`;
      let avatarUrl = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

      // Fetch profile XML from public Steam Community
      try {
        const profileRes = await fetch(`https://steamcommunity.com/profiles/${steamId}/?xml=1`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (profileRes.ok) {
          const xmlText = await profileRes.text();
          const nameMatch = xmlText.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/) || xmlText.match(/<steamID>(.*?)<\/steamID>/);
          const avatarMatch = xmlText.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/) || xmlText.match(/<avatarFull>(.*?)<\/avatarFull>/);
          if (nameMatch && nameMatch[1]) personaName = nameMatch[1];
          if (avatarMatch && avatarMatch[1]) avatarUrl = avatarMatch[1];
        }
      } catch (err) {
        console.error('Failed to fetch Steam profile XML:', err);
      }

      const steamUser = {
        steamId,
        username: personaName,
        phone: '',
        role: 'user',
        avatar: avatarUrl,
        level: 1,
        withdrawableBalanceUSD: 0,
        pendingBalanceUSD: 0,
        pendingDaysRemaining: 0,
        activeListingsCount: 0,
        totalSalesUSD: 0,
        transactions: [],
      };

      res.send(`
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
          <head>
            <meta charset="utf-8">
            <title>ورود موفق به استیم</title>
            <style>
              body {
                background: #1b2838;
                color: #ffffff;
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .card {
                background: #171a21;
                border: 1px solid #2a475e;
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                max-width: 320px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              }
              .avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                border: 3px solid #20df7c;
                margin: 0 auto 12px;
                object-fit: cover;
              }
              h2 { color: #20df7c; margin: 0 0 8px; font-size: 18px; }
              p { color: #8F9A93; font-size: 13px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <img src="${avatarUrl}" class="avatar" alt="Steam Avatar" />
              <h2>اتصال به استیم موفقیت‌آمیز بود</h2>
              <p>خوش آمدید، <strong>${personaName}</strong>!</p>
              <p style="margin-top: 10px; font-size: 11px; color: #66c0f4;">در حال انتقال به سایت...</p>
            </div>
            <script>
              const steamData = ${JSON.stringify(steamUser)};
              try {
                localStorage.setItem('iran_cs2_steam_auth_pending', JSON.stringify(steamData));
              } catch (e) {}
              if (window.opener) {
                try {
                  window.opener.postMessage({ type: 'STEAM_AUTH_SUCCESS', user: steamData }, '*');
                } catch (e) {}
                setTimeout(() => { window.close(); }, 800);
              } else {
                setTimeout(() => { window.location.href = '/'; }, 800);
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Steam callback error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  // In-memory cache for Steam CS2 Inventories (TTL: 3 minutes)
  const INVENTORY_CACHE_TTL_MS = 3 * 60 * 1000;
  const inventoryCache = new Map<string, { timestamp: number; payload: any }>();

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Fetches a single page of Steam CS2 inventory (appid=730, contextid=2, count=75)
   * with exponential backoff on HTTP 429 and automatic edge relay fallback when
   * shared datacenter IPs hit Steam's rate limiter.
   */
  async function fetchSteamInventoryPage(
    steamId64: string,
    startAssetId?: string
  ): Promise<{ status: number; data: any }> {
    const query = new URLSearchParams({
      l: 'english',
      count: '75',
    });
    if (startAssetId) {
      query.set('start_assetid', startAssetId);
    }

    const targetUrl = `https://steamcommunity.com/inventory/${steamId64}/730/2?${query.toString()}`;
    const maxRetries = 3;

    const uas = [
      'Valve/Steam HTTP Client 1.0 (730)',
      'okhttp/4.9.3',
      'PostmanRuntime/7.39.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    ];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const currentUa = uas[attempt % uas.length];

        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': currentUa,
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.9',
            Referer: `https://steamcommunity.com/profiles/${steamId64}/inventory`,
          },
        });
        clearTimeout(timeoutId);

        if (response.status === 200) {
          const text = await response.text();
          if (!text || text.trim() === 'null') {
            return { status: 403, data: null };
          }
          try {
            const parsed = JSON.parse(text);
            return { status: 200, data: parsed };
          } catch {
            return { status: 500, data: null };
          }
        }

        if (response.status === 403 || response.status === 401) {
          return { status: 403, data: null };
        }

        if (response.status === 429) {
          // Try edge relay fallback before sleeping if datacenter IP is rate-limited by Steam
          try {
            const relayCtrl = new AbortController();
            const relayTimeout = setTimeout(() => relayCtrl.abort(), 9000);
            const relayRes = await fetch(`https://r.jina.ai/${targetUrl}`, {
              signal: relayCtrl.signal,
              headers: {
                'X-Return-Format': 'text',
              },
            });
            clearTimeout(relayTimeout);

            const relayText = await relayRes.text();
            if (
              relayText.includes(' returned error 403') ||
              relayText.includes(' returned error 401') ||
              relayText.trim() === 'null'
            ) {
              return { status: 403, data: null };
            }

            const jsonStart = relayText.indexOf('{');
            const jsonEnd = relayText.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
              const parsed = JSON.parse(relayText.slice(jsonStart, jsonEnd + 1));
              if (parsed && (parsed.assets || parsed.total_inventory_count === 0 || parsed.success === 1)) {
                return { status: 200, data: parsed };
              }
            }
          } catch {
            // Ignore relay error and proceed with exponential backoff
          }

          if (attempt < maxRetries - 1) {
            const backoffMs = 600 * Math.pow(2, attempt);
            await sleep(backoffMs);
            continue;
          }
          return { status: 429, data: null };
        }

        return { status: response.status, data: null };
      } catch (err) {
        if (attempt < maxRetries - 1) {
          await sleep(500 * Math.pow(2, attempt));
          continue;
        }
        return { status: 500, data: null };
      }
    }

    return { status: 429, data: null };
  }

  // Steam Inventory Endpoint for CS2 (App ID: 730, Context: 2)
  // Supports both /api/inventory/:steamId64 and /api/steam/inventory/:steamId64
  app.get(['/api/inventory/:steamId', '/api/steam/inventory/:steamId'], async (req, res) => {
    const { steamId } = req.params;
    const forceRefresh = req.query.refresh === 'true';

    if (!steamId) {
      return res.status(400).json({
        success: false,
        errorType: 'STEAM_ERROR',
        message: 'شناسه استیم (SteamID64) ارسال نشده است.',
      });
    }

    // Clean steamId64 (extract 17-digit SteamID64 if full URL was passed)
    const cleanSteamId = steamId.replace(/\D/g, '').trim() || steamId.trim();

    if (!/^\d{17}$/.test(cleanSteamId)) {
      return res.json({
        success: false,
        errorType: 'STEAM_ERROR',
        message: `شناسه استیم (${cleanSteamId}) معتبر نیست. شناسه SteamID64 باید ۱۷ رقم باشد.`,
      });
    }

    // 1. Check 3-minute in-memory cache unless forceRefresh requested
    if (!forceRefresh) {
      const cached = inventoryCache.get(cleanSteamId);
      if (cached && Date.now() - cached.timestamp < INVENTORY_CACHE_TTL_MS) {
        return res.json({ ...cached.payload, cached: true });
      }
    }

    try {
      // Check actual privacy state from Steam XML profile before deciding error type
      let isVerifiedPublic = false;
      try {
        const xmlCheck = await fetch(`https://steamcommunity.com/profiles/${cleanSteamId}/?xml=1`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
          }
        });
        if (xmlCheck.ok) {
          const xmlText = await xmlCheck.text();
          const privMatch = xmlText.match(/<privacyState>(.*?)<\/privacyState>/);
          const visMatch = xmlText.match(/<visibilityState>(.*?)<\/visibilityState>/);
          if (privMatch && privMatch[1] === 'public') {
            isVerifiedPublic = true;
          } else if (visMatch && visMatch[1] === '3') {
            isVerifiedPublic = true;
          }
        }
      } catch (err) {
        console.warn('Could not verify Steam XML privacy state:', err);
      }

      // 2. Paginate through Steam Inventory (count=75 + start_assetid)
      const allAssets: any[] = [];
      const allDescriptions: any[] = [];
      let startAssetId: string | undefined = undefined;
      let pageCount = 0;
      let latestTotalCount = 0;
      const maxPages = 10; // Up to 750 items

      while (pageCount < maxPages) {
        pageCount++;
        const pageResult = await fetchSteamInventoryPage(cleanSteamId, startAssetId);

        if (pageResult.status === 403 || pageResult.status === 401) {
          // If the profile is verified public, 403 is a temporary Steam edge rate limit, NOT a private inventory!
          if (isVerifiedPublic) {
            return res.json({
              success: false,
              errorType: 'RATE_LIMITED',
              isRateLimited: true,
              isPrivate: false,
              message:
                'اکانت استیم شما عمومی (Public) است، اما سرورهای استیم (Steam Community) موقتاً ترافیک ورودی را محدود کرده‌اند. لطفاً چند لحظه دیگر روی «به‌روزرسانی آیتم‌ها» کلیک کنید.',
            });
          }

          return res.json({
            success: false,
            errorType: 'PRIVATE_INVENTORY',
            isPrivate: true,
            message:
              'اینونتوری استیم شما در حالت Private یا Friends-Only قرار دارد. لطفاً در تنظیمات حریم خصوصی استیم (Steam Privacy Settings)، گزینه Inventory را روی Public قرار دهید.',
          });
        }

        if (pageResult.status === 429) {
          // If we already fetched at least 1 page, break and return what we have
          if (allAssets.length > 0) break;
          return res.json({
            success: false,
            errorType: 'RATE_LIMITED',
            isRateLimited: true,
            isPrivate: false,
            message:
              'محدودیت موقت درخواست از سمت سرورهای استیم (Rate Limit 429). لطفاً چند لحظه صبر کرده و دوباره روی «به‌روزرسانی آیتم‌ها» کلیک کنید.',
          });
        }

        if (pageResult.status !== 200 || !pageResult.data) {
          if (allAssets.length > 0) break;
          return res.json({
            success: false,
            errorType: 'STEAM_ERROR',
            isPrivate: false,
            message: `خطا در دریافت اطلاعات از سرور استیم (کد وضعیت: ${pageResult.status}). لطفاً مجدداً تلاش کنید.`,
          });
        }

        const pageData = pageResult.data;
        if (typeof pageData?.total_inventory_count === 'number') {
          latestTotalCount = pageData.total_inventory_count;
        }

        if (Array.isArray(pageData.assets)) {
          allAssets.push(...pageData.assets);
        }
        if (Array.isArray(pageData.descriptions)) {
          allDescriptions.push(...pageData.descriptions);
        }

        if (pageData.more_items && pageData.last_assetid) {
          startAssetId = String(pageData.last_assetid);
        } else {
          break;
        }
      }

      // Empty inventory check vs temporary Steam payload delay
      if (allAssets.length === 0 || allDescriptions.length === 0) {
        if (latestTotalCount > 0) {
          return res.json({
            success: false,
            errorType: 'RATE_LIMITED',
            isRateLimited: true,
            isPrivate: false,
            message: `استیم تعداد ${latestTotalCount} آیتم در اینونتوری شما شناسایی کرده است، اما ارسال جزییات آیتم‌ها با تاخیر مواجه شده است. لطفاً چند لحظه بعد روی دکمه «به‌روزرسانی آیتم‌ها» کلیک کنید.`,
          });
        }

        const emptyPayload = {
          success: true,
          steamId64: cleanSteamId,
          count: 0,
          items: [],
        };
        inventoryCache.set(cleanSteamId, { timestamp: Date.now(), payload: emptyPayload });
        return res.json(emptyPayload);
      }

      // 3. Join assets and descriptions by classid + instanceid
      const descMap = new Map<string, any>();
      for (const d of allDescriptions) {
        const key = `${d.classid}_${d.instanceid || '0'}`;
        descMap.set(key, d);
        if (!descMap.has(String(d.classid))) {
          descMap.set(String(d.classid), d);
        }
      }

      const items: any[] = [];
      for (const asset of allAssets) {
        const key = `${asset.classid}_${asset.instanceid || '0'}`;
        const desc = descMap.get(key) || descMap.get(String(asset.classid));
        if (!desc) continue;

        const tags: any[] = Array.isArray(desc.tags) ? desc.tags : [];
        const getTagObj = (cat: string) =>
          tags.find(
            (t) =>
              (t.category && t.category.toLowerCase() === cat.toLowerCase()) ||
              (t.localized_category_name && t.localized_category_name.toLowerCase() === cat.toLowerCase())
          );

        const weaponTagObj = getTagObj('Weapon');
        const exteriorTagObj = getTagObj('Exterior');
        const rarityTagObj = getTagObj('Rarity') || getTagObj('Quality');
        const typeTagObj = getTagObj('Type');
        const qualityTagObj = getTagObj('Quality');
        const collectionTagObj = getTagObj('ItemSet');

        const weaponTag = weaponTagObj?.localized_tag_name || weaponTagObj?.name || '';
        const exteriorTag = exteriorTagObj?.localized_tag_name || exteriorTagObj?.name || '';
        const rarityTag = rarityTagObj?.localized_tag_name || rarityTagObj?.name || 'Mil-Spec Grade';
        const typeTag = typeTagObj?.localized_tag_name || typeTagObj?.name || desc.type || 'Item';
        const releaseCollection = collectionTagObj?.localized_tag_name || collectionTagObj?.name || undefined;

        const marketHashName = desc.market_hash_name || desc.market_name || desc.name || 'CS2 Item';
        const displayName = desc.name || desc.market_name || marketHashName;
        const lowerType = (typeTag || '').toLowerCase();
        const lowerName = marketHashName.toLowerCase();

        // Categorization across all CS2 item types (skins, knives, gloves, cases, stickers, agents)
        let category: string = 'rifle';
        let categoryFa = 'تفنگ';

        if (
          lowerType.includes('knife') ||
          lowerName.includes('knife') ||
          lowerName.includes('karambit') ||
          lowerName.includes('bayonet') ||
          lowerName.includes('daggers') ||
          lowerName.includes('kukri')
        ) {
          category = 'knife';
          categoryFa = 'چاقو';
        } else if (
          lowerType.includes('glove') ||
          lowerName.includes('gloves') ||
          lowerName.includes('hand wraps')
        ) {
          category = 'glove';
          categoryFa = 'دستکش';
        } else if (
          lowerType.includes('sniper') ||
          weaponTag.includes('AWP') ||
          weaponTag.includes('SSG') ||
          weaponTag.includes('SCAR') ||
          weaponTag.includes('G3SG1')
        ) {
          category = 'sniper';
          categoryFa = 'تک‌تیرانداز';
        } else if (
          lowerType.includes('pistol') ||
          weaponTag.includes('USP') ||
          weaponTag.includes('Glock') ||
          weaponTag.includes('Desert Eagle') ||
          weaponTag.includes('P250') ||
          weaponTag.includes('Five-SeveN') ||
          weaponTag.includes('Dual Berettas') ||
          weaponTag.includes('CZ75') ||
          weaponTag.includes('Tec-9') ||
          weaponTag.includes('R8') ||
          weaponTag.includes('P2000')
        ) {
          category = 'pistol';
          categoryFa = 'کلت / پیستول';
        } else if (
          lowerType.includes('smg') ||
          lowerType.includes('submachine') ||
          weaponTag.includes('MP9') ||
          weaponTag.includes('MAC-10') ||
          weaponTag.includes('MP7') ||
          weaponTag.includes('MP5') ||
          weaponTag.includes('UMP') ||
          weaponTag.includes('P90') ||
          weaponTag.includes('PP-Bizon')
        ) {
          category = 'smg';
          categoryFa = 'مسلسل دستی';
        } else if (
          lowerType.includes('shotgun') ||
          lowerType.includes('machinegun') ||
          weaponTag.includes('Nova') ||
          weaponTag.includes('XM1014') ||
          weaponTag.includes('MAG-7') ||
          weaponTag.includes('Sawed-Off') ||
          weaponTag.includes('M249') ||
          weaponTag.includes('Negev')
        ) {
          category = 'shotgun';
          categoryFa = 'شاتگان / سنگین';
        } else if (lowerType.includes('sticker') || lowerName.startsWith('sticker |') || lowerType.includes('patch') || lowerType.includes('charm')) {
          category = 'sticker';
          categoryFa = 'استیکر / چارم';
        } else if (
          lowerType.includes('container') ||
          lowerType.includes('case') ||
          lowerName.includes('case') ||
          lowerName.includes('capsule') ||
          lowerName.includes('package')
        ) {
          category = 'container';
          categoryFa = 'کیس / کانتینر';
        } else if (lowerType.includes('agent') || lowerType.includes('music kit') || lowerType.includes('graffiti') || lowerType.includes('collectible')) {
          category = 'agent';
          categoryFa = lowerType.includes('agent') ? 'کاراکتر ایجنت' : 'آیتم ویژه';
        }

        // Wear / Exterior mapping
        let wearCategory: 'FN' | 'MW' | 'FT' | 'WW' | 'BS' = 'FT';
        let floatValue = 0.20;
        if (exteriorTag.includes('Factory New')) {
          wearCategory = 'FN';
          floatValue = 0.032;
        } else if (exteriorTag.includes('Minimal Wear')) {
          wearCategory = 'MW';
          floatValue = 0.095;
        } else if (exteriorTag.includes('Field-Tested')) {
          wearCategory = 'FT';
          floatValue = 0.215;
        } else if (exteriorTag.includes('Well-Worn')) {
          wearCategory = 'WW';
          floatValue = 0.41;
        } else if (exteriorTag.includes('Battle-Scarred')) {
          wearCategory = 'BS';
          floatValue = 0.64;
        } else {
          wearCategory = 'FN';
          floatValue = 0.0;
        }

        // Normalize Rarity & Rarity Hex Color (name_color)
        let normalizedRarity: string = 'Mil-Spec';
        const rLower = rarityTag.toLowerCase();
        if (rLower.includes('extraordinary') || rLower.includes('contraband') || category === 'knife' || category === 'glove') {
          normalizedRarity = 'Extraordinary';
        } else if (rLower.includes('covert') || rLower.includes('ancient') || rLower.includes('master')) {
          normalizedRarity = 'Covert';
        } else if (rLower.includes('classified') || rLower.includes('legendary') || rLower.includes('superior') || rLower.includes('exotic')) {
          normalizedRarity = 'Classified';
        } else if (rLower.includes('restricted') || rLower.includes('mythical') || rLower.includes('exceptional') || rLower.includes('remarkable')) {
          normalizedRarity = 'Restricted';
        } else if (rLower.includes('mil-spec') || rLower.includes('rare') || rLower.includes('high grade') || rLower.includes('distinguished')) {
          normalizedRarity = 'Mil-Spec';
        } else if (rLower.includes('industrial')) {
          normalizedRarity = 'Industrial';
        } else if (rLower.includes('consumer') || rLower.includes('base grade')) {
          normalizedRarity = 'Consumer';
        }

        const rawHexColor = (desc.name_color || rarityTagObj?.color || '').replace('#', '').trim();
        const fallbackColorMap: Record<string, string> = {
          Extraordinary: '#ffd700',
          Covert: '#eb4b4b',
          Classified: '#d32ce6',
          Restricted: '#8847ff',
          'Mil-Spec': '#4b69ff',
          Industrial: '#5e98d9',
          Consumer: '#b0c3d9',
        };
        const nameColor =
          rawHexColor && /^[0-9a-fA-F]{6}$/.test(rawHexColor) && rawHexColor.toLowerCase() !== 'd2d2d2'
            ? `#${rawHexColor}`
            : fallbackColorMap[normalizedRarity] || '#4b69ff';

        // Parse Stickers (both images and names) from descriptions HTML (sticker_info)
        const stickers: Array<{ id: string; name: string; image: string; slot: number }> = [];
        if (Array.isArray(desc.descriptions)) {
          for (const dRow of desc.descriptions) {
            if (dRow.value && (dRow.value.includes('sticker_info') || dRow.value.includes('Sticker:') || dRow.value.includes('Charm:'))) {
              const htmlVal = String(dRow.value);
              const imgUrls: string[] = [];
              const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
              let imgMatch: RegExpExecArray | null;
              while ((imgMatch = imgRegex.exec(htmlVal)) !== null) {
                if (imgMatch[1]) imgUrls.push(imgMatch[1]);
              }

              const nameMatch = htmlVal.match(/(?:Sticker|Charm|Patch):\s*([^<]+)/i);
              const stickerNames = nameMatch && nameMatch[1]
                ? nameMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean)
                : [];

              const count = Math.max(imgUrls.length, stickerNames.length);
              for (let idx = 0; idx < count; idx++) {
                stickers.push({
                  id: `stk-${asset.assetid}-${idx}`,
                  name: stickerNames[idx] || `Sticker #${idx + 1}`,
                  image:
                    imgUrls[idx] ||
                    'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ5BhMYY45uhUPQ1PE1eq54ptWQ1d5GQBcvrWsJAh318z3fTxQ69n4k4XYwq-gYuqIxj0GucEpi-yUoNqg3VDhrRFsMDrwIoSTcwE2NF2Cq1jswb2715W1vcuYznEwuiVz7S2MnUeyh0xLcKUx0uvnQf-L/100fx100f',
                  slot: idx,
                });
              }
            }
          }
        }

        // Detect Doppler Phase
        let dopplerPhase: string | undefined = undefined;
        if (lowerName.includes('phase 1')) dopplerPhase = 'Phase 1';
        else if (lowerName.includes('phase 2')) dopplerPhase = 'Phase 2';
        else if (lowerName.includes('phase 3')) dopplerPhase = 'Phase 3';
        else if (lowerName.includes('phase 4')) dopplerPhase = 'Phase 4';
        else if (lowerName.includes('sapphire')) dopplerPhase = 'Sapphire';
        else if (lowerName.includes('ruby')) dopplerPhase = 'Ruby';
        else if (lowerName.includes('emerald')) dopplerPhase = 'Emerald';
        else if (lowerName.includes('black pearl')) dopplerPhase = 'Black Pearl';

        // Estimate market price USD for selling calculation
        let priceUSD = 4.5;
        if (category === 'knife') {
          if (dopplerPhase === 'Sapphire' || dopplerPhase === 'Ruby' || dopplerPhase === 'Emerald') priceUSD = 1850.0;
          else if (lowerName.includes('karambit') || lowerName.includes('butterfly') || lowerName.includes('m9')) priceUSD = 650.0;
          else priceUSD = 240.0;
        } else if (category === 'glove') {
          priceUSD = 210.0;
        } else if (normalizedRarity === 'Covert') {
          priceUSD = 65.0;
        } else if (normalizedRarity === 'Classified') {
          priceUSD = 22.0;
        } else if (normalizedRarity === 'Restricted') {
          priceUSD = 6.5;
        } else if (category === 'container') {
          priceUSD = 1.85;
        } else if (category === 'sticker') {
          priceUSD = 1.25;
        } else if (category === 'agent') {
          priceUSD = 14.5;
        } else if (normalizedRarity === 'Mil-Spec') {
          priceUSD = 1.6;
        } else {
          priceUSD = 0.45;
        }

        if (exteriorTag) {
          if (wearCategory === 'FN') priceUSD = Number((priceUSD * 1.45).toFixed(2));
          else if (wearCategory === 'MW') priceUSD = Number((priceUSD * 1.15).toFixed(2));
          else if (wearCategory === 'BS') priceUSD = Number((priceUSD * 0.75).toFixed(2));
        }

        const isStatTrak =
          marketHashName.includes('StatTrak™') ||
          displayName.includes('StatTrak™') ||
          qualityTagObj?.internal_name === 'strange';
        const isSouvenir =
          marketHashName.includes('Souvenir') ||
          displayName.includes('Souvenir') ||
          qualityTagObj?.internal_name === 'tournament';

        if (isStatTrak) {
          priceUSD = Number((priceUSD * 1.35).toFixed(2));
        }

        // Steam CDN 256fx256f image URL
        const rawIcon = (desc.icon_url_large || desc.icon_url || '').trim();
        const imageUrl = rawIcon
          ? `https://community.cloudflare.steamstatic.com/economy/image/${rawIcon}/256fx256f`
          : '';

        // Parse Inspect in Game link from actions
        let inspectLink: string | undefined = undefined;
        const actionsList = Array.isArray(desc.actions)
          ? desc.actions
          : Array.isArray(desc.market_actions)
          ? desc.market_actions
          : [];
        if (actionsList.length > 0 && actionsList[0]?.link) {
          inspectLink = String(actionsList[0].link)
            .replace('%owner_steamid%', cleanSteamId)
            .replace('%assetid%', String(asset.assetid));
        }

        const isTradable = desc.tradable === 1 || desc.tradable === true;
        const isMarketable = desc.marketable === 1 || desc.marketable === true;

        items.push({
          id: `steam-${asset.assetid}`,
          assetid: String(asset.assetid),
          assetId: String(asset.assetid),
          classid: String(asset.classid),
          instanceid: String(asset.instanceid || '0'),
          market_hash_name: marketHashName,
          name: displayName,
          shortName: displayName.includes('|') ? displayName.split('|')[1].trim() : displayName,
          weapon: weaponTag || typeTag || 'CS2 Item',
          type: typeTag,
          category,
          categoryFa,
          condition: exteriorTag || typeTag,
          exterior: exteriorTag || '',
          wearCategory,
          floatValue,
          paintSeed: (Number(String(asset.assetid).slice(-3)) || 412) % 1000,
          priceUSD,
          isStatTrak,
          isSouvenir,
          rarity: normalizedRarity,
          name_color: nameColor,
          icon_url: imageUrl,
          image: imageUrl,
          marketable: isMarketable,
          tradable: isTradable,
          inspectLink,
          inspectUrl: inspectLink,
          dopplerPhase,
          releaseCollection,
          stickers: stickers.length > 0 ? stickers : undefined,
          sellerStatus: 'online',
          tradeHoldHours: isTradable ? 0 : 168,
          expiresInText: isTradable ? 'قابل معامله' : 'قفل ترید',
          historyLowUSD: Number((priceUSD * 0.9).toFixed(2)),
          historyAverageUSD: priceUSD,
        });
      }

      const payload = {
        success: true,
        steamId64: cleanSteamId,
        count: items.length,
        items,
      };

      // Cache successful response for 3 minutes
      inventoryCache.set(cleanSteamId, { timestamp: Date.now(), payload });

      return res.json(payload);
    } catch (err) {
      console.error('Error fetching Steam CS2 inventory:', err);
      return res.json({
        success: false,
        errorType: 'STEAM_ERROR',
        message: 'خطا در برقراری ارتباط با سرور استیم. لطفاً چند لحظه دیگر تلاش کنید.',
      });
    }
  });

  // Image Proxy Endpoint for bypassing external CORS/hotlink restrictions safely
  app.get('/api/image-proxy', async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return res.status(400).send('Invalid URL');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const fetchResponse = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (!fetchResponse.ok) {
        return res.redirect(302, imageUrl);
      }

      const contentType = fetchResponse.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      const arrayBuffer = await fetchResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    } catch {
      // Gracefully redirect directly to client
      return res.redirect(302, imageUrl);
    }
  });

  // GET products
  app.get('/api/products', (req, res) => {
    const products = readProductsFromFile();
    res.json({ products: products || [] });
  });

  // POST initial sync / seed products (if empty)
  app.post('/api/products/sync', (req, res) => {
    const { products } = req.body;
    if (Array.isArray(products) && products.length > 0) {
      const existing = readProductsFromFile();
      // If server has no items yet, save the initial catalogue
      if (!existing || existing.length === 0) {
        saveProductsToFile(products);
        return res.json({ success: true, count: products.length, source: 'synced_initial' });
      }
      return res.json({ success: true, count: existing.length, source: 'server_existing' });
    }
    res.status(400).json({ error: 'Invalid products array' });
  });

  // POST add new product
  app.post('/api/products', (req, res) => {
    const newItem = req.body;
    if (!newItem || !newItem.id || !newItem.name) {
      return res.status(400).json({ error: 'Product name and id are required' });
    }

    let products = readProductsFromFile() || [];
    // Check if duplicate id
    products = products.filter(p => p.id !== newItem.id);
    products.unshift(newItem);
    saveProductsToFile(products);

    res.json({ success: true, product: newItem, total: products.length });
  });

  // PUT update existing product
  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;

    let products = readProductsFromFile() || [];
    let updatedProduct: any = null;

    products = products.map(item => {
      if (item.id === id) {
        updatedProduct = { ...item, ...updatedFields };
        return updatedProduct;
      }
      return item;
    });

    if (!updatedProduct) {
      // If not found in file, append it
      updatedProduct = updatedFields;
      products.unshift(updatedProduct);
    }

    saveProductsToFile(products);
    res.json({ success: true, product: updatedProduct });
  });

  // DELETE product
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    let products = readProductsFromFile() || [];
    products = products.filter(item => item.id !== id);
    saveProductsToFile(products);
    res.json({ success: true, deletedId: id, total: products.length });
  });

  // POST reset to defaults
  app.post('/api/products/reset', (req, res) => {
    const { defaultProducts } = req.body;
    if (Array.isArray(defaultProducts)) {
      saveProductsToFile(defaultProducts);
      return res.json({ success: true, products: defaultProducts });
    }
    res.status(400).json({ error: 'defaultProducts must be an array' });
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
