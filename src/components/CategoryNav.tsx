import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

interface CategoryItem {
  id: string;
  label: string;
  subcategories: string[];
}

const CATEGORIES: CategoryItem[] = [
  { 
    id: 'all', 
    label: 'همه دسته‌ها', 
    subcategories: ['همه اسکین‌ها', 'محبوب‌ترین‌ها', 'حراجی‌ها'] 
  },
  { 
    id: 'knife', 
    label: 'چاقوها', 
    subcategories: ['Butterfly Knife', 'Karambit', 'M9 Bayonet', 'Skeleton Knife', 'Talon Knife', 'Flip Knife'] 
  },
  { 
    id: 'glove', 
    label: 'دستکش‌ها', 
    subcategories: ['Sport Gloves', 'Specialist Gloves', 'Moto Gloves', 'Driver Gloves', 'Hand Wraps'] 
  },
  { 
    id: 'rifle', 
    label: 'تفنگ‌ها', 
    subcategories: ['AK-47', 'M4A4', 'M4A1-S', 'Galil AR', 'FAMAS', 'AUG', 'SG 553'] 
  },
  { 
    id: 'sniper', 
    label: 'تک‌تیرانداز', 
    subcategories: ['AWP', 'SSG 08', 'SCAR-20', 'G3SG1'] 
  },
  { 
    id: 'pistol', 
    label: 'تپانچه‌ها', 
    subcategories: ['Desert Eagle', 'USP-S', 'Glock-18', 'P250', 'Five-SeveN', 'CZ75-Auto'] 
  },
  { 
    id: 'smg', 
    label: 'SMG', 
    subcategories: ['MP9', 'MAC-10', 'MP7', 'P90', 'PP-Bizon', 'UMP-45'] 
  },
  { 
    id: 'shotgun', 
    label: 'شاتگان و سنگین', 
    subcategories: ['Nova', 'XM1014', 'MAG-7', 'Negev', 'M249'] 
  },
  { 
    id: 'container', 
    label: 'کانتینر و کیس‌ها', 
    subcategories: ['کیس سلاح', 'کپسول استیکر', 'بسته‌های سوغاتی'] 
  },
  { 
    id: 'sticker', 
    label: 'استیکرها', 
    subcategories: ['Katowice 2014', 'Cologne', 'Major Gold', 'Holo / Foil'] 
  },
  { 
    id: 'agent', 
    label: 'ایجنت‌ها', 
    subcategories: ['مسترمایِند', 'کامندِر', 'CT Agents', 'T Agents'] 
  },
  { 
    id: 'collectibles', 
    label: 'کلکسیون‌ها', 
    subcategories: ['پچ‌ها', 'موزیک کیت', 'پین‌های اختصاصی'] 
  }
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="w-full bg-[#17241C] border-b border-[#b7f1d1]/10 px-3 lg:px-6 py-2 overflow-x-auto no-scrollbar relative z-30">
      <div className="max-w-[1920px] mx-auto flex items-center gap-1.5 whitespace-nowrap">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const isDropdownOpen = activeDropdown === cat.id;

          return (
            <div 
              key={cat.id} 
              className="relative"
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                id={`cat-nav-${cat.id}`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setActiveDropdown(isDropdownOpen ? null : cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none ${
                  isActive
                    ? 'bg-[#20df7c]/15 text-[#20df7c] border border-[#20df7c]/30 shadow-xs shadow-[#20df7c]/20'
                    : 'text-[#8F9A93] hover:text-[#F2F5F3] hover:bg-[#121814] border border-transparent'
                }`}
              >
                <span>{cat.label}</span>
                {cat.subcategories.length > 0 && (
                  <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Subcategories Dropdown */}
              {isDropdownOpen && cat.subcategories.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#121814] border border-[#b7f1d1]/15 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] text-[#8F9A93] font-bold border-b border-[#b7f1d1]/10 mb-1">
                    مدل‌های {cat.label}
                  </div>
                  {cat.subcategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-right px-3 py-1.5 text-xs text-[#F2F5F3] hover:bg-[#17241C] hover:text-[#20df7c] transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
