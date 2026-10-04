import React, { useState } from 'react';
import { X, Info, Zap } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#121814] border-b border-[#b7f1d1]/10 px-4 py-1.5 text-xs text-[#8F9A93] flex items-center justify-between transition-all">
      <div className="max-w-[1920px] mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#20df7c]/20 text-[#20df7c] text-[10px]">
            <Zap className="w-2.5 h-2.5" />
          </span>
          <p className="text-[10px] sm:text-xs text-[#F2F5F3]/90 font-medium leading-tight sm:leading-normal">
            <strong className="text-[#20df7c] font-bold">اطلاعیه بازار:</strong>{' '}
            قیمت‌ها به صورت لحظه‌ای با نوسانات بازار جهانی استیم هماهنگ می‌شوند. تسویه فروش اسکین‌ها با کارمزد ویژه ۲٪ انجام می‌گیرد.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden md:inline text-[11px] text-[#b7f1d1]/60">
            ضمانت ۱۰۰٪ امن معاملات با API بات اختصاصی
          </span>
          <button 
            id="dismiss-announcement-btn"
            onClick={() => setIsVisible(false)}
            className="p-1 rounded text-[#8F9A93] hover:text-white hover:bg-[#17241C] transition-colors"
            aria-label="بستن اعلان"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
