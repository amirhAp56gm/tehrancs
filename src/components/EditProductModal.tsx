import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  DollarSign, 
  ShieldCheck,
  Layers,
  AlertCircle
} from 'lucide-react';
import { MarketItem, Currency, ItemRarity, WearCategory } from '../types';
import { USD_TO_TOMAN_RATE, formatPrice, toPersianDigits } from '../utils/formatters';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface EditProductModalProps {
  isOpen: boolean;
  item: MarketItem | null;
  onClose: () => void;
  onSave: (updatedItem: MarketItem) => void;
  currency: Currency;
}

export const CS2_WEAPONS_LIST = [
  'AK-47',
  'AWP',
  'M4A1-S',
  'M4A4',
  'Desert Eagle',
  'USP-S',
  'Glock-18',
  'Galil AR',
  'FAMAS',
  'SSG 08',
  'MP9',
  'MAC-10',
  'P90',
  '★ Butterfly Knife',
  '★ Karambit',
  '★ M9 Bayonet',
  '★ Talon Knife',
  '★ Skeleton Knife',
  '★ Nomad Knife',
  '★ Survival Knife',
  '★ Stiletto Knife',
  '★ Ursus Knife',
  '★ Huntsman Knife',
  '★ Bowie Knife',
  '★ Falchion Knife',
  '★ Shadow Daggers',
  '★ Gut Knife',
  '★ Sport Gloves',
  '★ Specialist Gloves',
  '★ Driver Gloves',
  '★ Moto Gloves',
  '★ Hand Wraps',
  '★ Hydra Gloves',
];

export const PRESET_SKIN_GALLERY = [
  { name: 'AK-47 Asiimov', weapon: 'AK-47', category: 'rifle', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsZGHyd4_Bd1RvM1-F_la4wO7vgZe86pnMnXJjuyNwsXbUmUeyhQYMMLI30VXDZw/360fx360f' },
  { name: 'AK-47 Slate', weapon: 'AK-47', category: 'rifle', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV19m5h5S0m_7zO6-fzj9V7MR3n-rC89mm0VXs_EVvamj0cYHEIFM9YlvU81TtlOi9hMS4vZvKznZquSY8pSGK6B_V8Wk/360fx360f' },
  { name: 'AK-47 Fire Serpent', weapon: 'AK-47', category: 'rifle', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV19m5h5S0mvLwO67UqWdY781lxO2Wrd-h2wXi-0VvZm6ndYfHclA6NVzW-AC2l-jthpe1uJvMzHNquCQ8pSGKuXb5WbA/360fx360f' },
  { name: 'AK-47 Case Hardened', weapon: 'AK-47', category: 'rifle', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV19m5h5S0mvLwO67UqWdY781lxL_F89-k31DmrUFuY2rydoCWdFQ7NA6ErVO9yOm80Me9up7Iy3FkvCIq5y7cgVXp1j1mY7c2/360fx360f' },
  { name: 'AWP Asiimov', weapon: 'AWP', category: 'sniper', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwO67UqWdY781lxOiUrIin0AXh_0A9MTj6INLGdVA3YFzT_1K7yOq9g5e6vZzMzHBh73Vw4XjcyxCwhh5JbONs1qeaS12dB6YfGfyeTwvT6N8/360fx360f' },
  { name: 'AWP Dragon Lore', weapon: 'AWP', category: 'sniper', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJU5cyzhr-GkvP9Jrafw2lU6ccp0rqVpdSn2wXnqRVsZzuidY7DcA87YAuD-1Pvl73nhMC_u8iYy3Jm7iN252GdwULP_c9hDw/360fx360f' },
  { name: 'AWP Gungnir', weapon: 'AWP', category: 'sniper', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJF_9W7m5a0mvLwO67UqWdY781lxOzHpdmn3w22-kZvazqgcYeSegI9aV3SqFi_le7o05Du75yYm3s3u3Zy43mInBO1h0wdPeNs1vifHkWcBHc_ffKdTg/360fx360f' },
  { name: 'M4A1-S Printstream', weapon: 'M4A1-S', category: 'rifle', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITBhGJf_NZlmOzA-LP5gVO8v11sY277coSXdgM5aVHQ_lO7wLy9gJe7u8vMnSNluSUqsCrdywv3309aLw-FJA/360fx360f' },
  { name: 'M4A4 Howl', weapon: 'M4A4', category: 'rifle', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09izh4-GkvP9Jrafw2lU6ccp0rqVpdSn2wXnqRVsZzuidY7DcA87YAuD-1Pvl73nhMC_u8iYy3Jm7iN252GdwULP_c9hDw/360fx360f' },
  { name: 'Desert Eagle Printstream', weapon: 'Desert Eagle', category: 'pistol', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH_8-im5KGqP_xMq3ehX9u5cB1g_zMu9qi31Wy_0I5Z2H0cISVcwI-YFjRqVO4l-3v1sO5vZSan3Rh6CEq4i7fy0Hkn1gSObeI_D5Y/360fx360f' },
  { name: 'USP-S Kill Confirmed', weapon: 'USP-S', category: 'pistol', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j3KqnUjlRd4cJ5nqeWp4r23A21-ktlNWiiLITDdwQ_ZV-Dq1a5yOi905Pu7szMynExunVw53zZnkG0hh9EcKUx0k3Q2Fq_/360fx360f' },
  { name: 'Glock-18 Fade', weapon: 'Glock-18', category: 'pistol', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0v73fyhB4Nm3hr-Yksj4OrzZglRd6dd2j6eU94it3Fft-kdrMWv6LdSQc1U3N13Z_1C6xO-7hJ-7vpTByHFm7CNw-z-DyP3mH1k/360fx360f' },
  { name: '★ Butterfly Knife Doppler', weapon: '★ Butterfly Knife', category: 'knife', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbsslg5t1OD3EjVP5dumnZSEheLnP7vhgneGupJ03LiU94qi0Fbg80JsYW3zLI7Ecw86aV_TrVW9wuvn0ZW5vpqcy3FiuCRx7XfZnhG1hEpSLrs42iU367A/360fx360f' },
  { name: '★ Butterfly Knife Gamma Doppler', weapon: '★ Butterfly Knife', category: 'knife', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbss3vT3dU5h31xJ49KJnJm0gP76N4Tdn2xZ_It02erDrNyg0VXi8xBuMm-gLNXEdVI2MwqF-lW_x-rv1sS475qdyHZivnEg53qJyhTj0hxOcKUx0vFzKk39/360fx360f' },
  { name: '★ Karambit Doppler', weapon: '★ Karambit', category: 'knife', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbsslg1y1-nzcTx8_9m5h5O0m_7zO6-fwzkD6scg377D84r23gLsrkdsYmmid9TAc1M7aVjU-QDsx-7v0ce-v52cmHFm7HQ8pSGK2yE12hM/360fx360f' },
  { name: '★ Karambit Fade', weapon: '★ Karambit', category: 'knife', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbsslg5t1OD3EjVP5dumnZSEheLnP7vhgneGupJ03LiU94qi0Fbg80JsYW3zLI7Ecw86aV_TrVW9wuvn0ZW5vpqcy3FiuCRx7XfZnhG1hEpSLrs42iU367A/360fx360f' },
  { name: '★ M9 Bayonet Lore', weapon: '★ M9 Bayonet', category: 'knife', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbsslg5rq8zL Tag09mzpq5G1kPvxDLDEmmpf6sdi0-vHp7P4m1qmsRtnYGnzYdScwVsYFrSrFe_yeq6h8C4786fnXBks3In4nrczhW-0xwbObJsmv13O4zFfK0X/360fx360f' },
  { name: '★ Sport Gloves Vice', weapon: '★ Sport Gloves', category: 'glove', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJF_-O_kYGdhfjLP7LWnn8fvcZw3erH892iiwfm-0VrY2zwLdOdcVJqYFqE81Lqweq80ce17pnJzHBj7Ckj43uPzAv30B1SLrs4-4b53Zk/360fx360f' },
  { name: '★ Specialist Gloves Crimson Kimono', weapon: '★ Specialist Gloves', category: 'glove', url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLupLwJf1f_BYQJB-disjyHgk_L4OrzZglRd6dd2j6eT99qg21Xmr0s6NzqmIYfBegY5aQvWrFm6wO27hpe9upvMyCRi7iEl5y6Iygv3308bM-iZ0A/360fx360f' },
];

export const CATEGORY_OPTIONS = [
  { value: 'knife', labelFa: 'چاقو (Knife)' },
  { value: 'glove', labelFa: 'دستکش (Glove)' },
  { value: 'rifle', labelFa: 'تفنگ هجومی (Rifle)' },
  { value: 'sniper', labelFa: 'تک‌تیرانداز (Sniper)' },
  { value: 'pistol', labelFa: 'کلت و پیستول (Pistol)' },
  { value: 'smg', labelFa: 'مسلسل سبک (SMG)' },
  { value: 'shotgun', labelFa: 'شات‌گان (Shotgun)' },
  { value: 'container', labelFa: 'کیس و جعبه (Container)' },
  { value: 'sticker', labelFa: 'استیکر (Sticker)' },
  { value: 'agent', labelFa: 'ایجنت / مامور (Agent)' },
];

export const WEAR_OPTIONS: { value: WearCategory; labelFa: string; fullEn: string }[] = [
  { value: 'FN', labelFa: 'کارخانه‌ای نو (FN)', fullEn: 'Factory New' },
  { value: 'MW', labelFa: 'کم‌کارکرد (MW)', fullEn: 'Minimal Wear' },
  { value: 'FT', labelFa: 'تست‌شده در میدان (FT)', fullEn: 'Field-Tested' },
  { value: 'WW', labelFa: 'کهنه‌شده (WW)', fullEn: 'Well-Worn' },
  { value: 'BS', labelFa: 'به‌شدت فرسوده (BS)', fullEn: 'Battle-Scarred' },
];

export const RARITY_OPTIONS: { value: ItemRarity; labelFa: string; colorClass: string }[] = [
  { value: 'Extraordinary', labelFa: 'طلایی - Extraordinary (چاقو / دستکش)', colorClass: 'text-amber-400' },
  { value: 'Covert', labelFa: 'قرمز - Covert', colorClass: 'text-rose-500' },
  { value: 'Classified', labelFa: 'بنفش - Classified', colorClass: 'text-fuchsia-400' },
  { value: 'Restricted', labelFa: 'صورتی - Restricted', colorClass: 'text-pink-400' },
  { value: 'Mil-Spec', labelFa: 'آبی روشن - Mil-Spec', colorClass: 'text-sky-400' },
  { value: 'Industrial', labelFa: 'آبی - Industrial', colorClass: 'text-blue-500' },
  { value: 'Consumer', labelFa: 'خاکستری - Consumer Grade', colorClass: 'text-gray-400' },
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  currency,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [weapon, setWeapon] = useState<string>('AK-47');
  const [isCustomWeapon, setIsCustomWeapon] = useState<boolean>(false);
  const [customWeaponName, setCustomWeaponName] = useState<string>('');
  
  const [shortName, setShortName] = useState<string>('');
  const [category, setCategory] = useState<MarketItem['category']>('rifle');
  const [wearCategory, setWearCategory] = useState<WearCategory>('FN');
  const [floatValue, setFloatValue] = useState<string>('0.0150');
  
  // Price states in Tomans and USD with two-way sync
  const [priceToman, setPriceToman] = useState<string>('4000000');
  const [priceUSD, setPriceUSD] = useState<string>('43.48');
  
  const [discountPercent, setDiscountPercent] = useState<string>('10');
  const [rarity, setRarity] = useState<ItemRarity>('Covert');
  const [isStatTrak, setIsStatTrak] = useState<boolean>(false);
  const [isSouvenir, setIsSouvenir] = useState<boolean>(false);
  const [image, setImage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Populate form fields when item changes
  useEffect(() => {
    if (item) {
      const isKnown = CS2_WEAPONS_LIST.includes(item.weapon);
      if (isKnown) {
        setWeapon(item.weapon);
        setIsCustomWeapon(false);
        setCustomWeaponName('');
      } else {
        setWeapon('custom');
        setIsCustomWeapon(true);
        setCustomWeaponName(item.weapon);
      }

      setShortName(item.shortName || '');
      setCategory(item.category);
      setWearCategory(item.wearCategory);
      setFloatValue(item.floatValue.toString());
      
      const usd = item.priceUSD || 50;
      setPriceUSD(usd.toFixed(2));
      const tomanVal = Math.round(usd * USD_TO_TOMAN_RATE);
      setPriceToman(tomanVal.toString());

      setDiscountPercent(item.discountPercent ? item.discountPercent.toString() : '');
      setRarity(item.rarity);
      setIsStatTrak(!!item.isStatTrak);
      setIsSouvenir(!!item.isSouvenir);
      setImage(item.image);
      setErrorMessage(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  // Sync Price Handlers
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

  // Image Upload Handler from computer / gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalWeapon = isCustomWeapon ? customWeaponName.trim() : weapon;
    if (!finalWeapon) {
      setErrorMessage('لطفاً نام سلاح را وارد کنید.');
      return;
    }

    if (!shortName.trim()) {
      setErrorMessage('لطفاً طرح اسکین (Skin Pattern) را مشخص فرمایید.');
      return;
    }

    const parsedUSD = parseFloat(priceUSD);
    if (isNaN(parsedUSD) || parsedUSD <= 0) {
      setErrorMessage('قیمت محصول نامعتبر است.');
      return;
    }

    const parsedFloat = parseFloat(floatValue);
    if (isNaN(parsedFloat) || parsedFloat < 0 || parsedFloat > 1) {
      setErrorMessage('مقدار فلوت باید بین ۰ و ۱ باشد.');
      return;
    }

    const parsedDiscount = discountPercent ? parseFloat(discountPercent) : undefined;
    const finalImage = image.trim() || item.image;

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

    const updatedItem: MarketItem = {
      ...item,
      name: formattedFullName,
      shortName: shortName.trim(),
      weapon: finalWeapon,
      category,
      categoryFa: categoryFaMap[category] || 'سلاح',
      condition: conditionMap[wearCategory],
      wearCategory,
      floatValue: parsedFloat,
      priceUSD: parsedUSD,
      discountPercent: parsedDiscount && parsedDiscount > 0 ? parsedDiscount : undefined,
      isStatTrak,
      isSouvenir,
      rarity,
      image: finalImage,
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl my-8 bg-[#161617] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#1d1d1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                ویرایش مشخصات محصول
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                تغییر کامل کارت محصول (نام، طرح، فلوت، قیمت تومانی، کیفیت، کمیابی و تصویر)
              </p>
            </div>
          </div>

          <button
            id="close-edit-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#262629] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Top Live Preview Card */}
          <div className="p-4 rounded-xl bg-[#1d1d1f] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#262629] rounded-xl p-1.5 flex items-center justify-center border border-white/10 shrink-0">
                <img 
                  src={getOptimizedImageUrl(image || item.image)} 
                  alt={shortName || item.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.dataset.fallbackTried) {
                      target.dataset.fallbackTried = 'true';
                      const currentItemName = shortName || item.name || '';
                      const currentWeaponName = weapon || item.weapon || '';
                      if (currentItemName.includes('Butterfly') || currentWeaponName.includes('Butterfly')) {
                        target.src = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbsslg5t1OD3EjVP5dumnZSEheLnP7vhgneGupJ03LiU94qi0Fbg80JsYW3zLI7Ecw86aV_TrVW9wuvn0ZW5vpqcy3FiuCRx7XfZnhG1hEpSLrs42iU367A/360fx360f';
                      } else {
                        target.src = item.image || 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV19m5h5S0m_7zO6-fzj9V7MR3n-rC89mm0VXs_EVvamj0cYHEIFM9YlvU81TtlOi9hMS4vZvKznZquSY8pSGK6B_V8Wk/360fx360f';
                      }
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
              <span className="text-xs text-gray-400">پیش‌نمایش زنده کارت</span>
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

            {/* 2. Skin Pattern / Short Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">
                طرح اسکین (Skin Pattern)
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="مثال: Doppler (Phase 2) یا Printstream"
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

            {/* 4. Skin Quality / Wear Condition */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">
                کیفیت ظاهری اسکین (Wear Condition)
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
                مقدار فلوت دقیق (Float Value 0.0000 to 1.0000)
              </label>
              <input
                type="number"
                step="0.000001"
                min="0"
                max="1"
                value={floatValue}
                onChange={(e) => setFloatValue(e.target.value)}
                placeholder="0.01524"
                required
                className="w-full h-11 px-3 rounded-xl bg-[#262629] border border-white/10 text-white text-xs font-mono focus:border-[#20df7c] focus:outline-none"
              />
            </div>

            {/* 6. Rarity */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-300">
                کمیابی آیتم (Rarity Tier)
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
                قیمت محصول به تومان
              </label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  value={parseInt(priceToman || '0').toLocaleString('en-US')}
                  onChange={(e) => handleTomanChange(e.target.value)}
                  placeholder="4,500,000"
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
                درصد تخفیف ویژه (اختیاری)
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
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  %
                </div>
              </div>
            </div>

          </div>

          {/* StatTrak & Souvenir Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 p-3.5 rounded-xl bg-[#1d1d1f] border border-white/5">
            <span className="text-xs font-bold text-gray-400">ویژگی‌های خاص سلاح:</span>
            
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

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#262629] hover:bg-[#323236] text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              id="save-edit-product-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-black" />
              <span>ذخیره تغییرات محصول</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
