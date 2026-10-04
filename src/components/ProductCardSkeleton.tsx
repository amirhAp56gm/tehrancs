import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#121814] border border-[#b7f1d1]/10 rounded-xl overflow-hidden animate-pulse flex flex-col justify-between shadow-sm">
      {/* Top Accent Line */}
      <div className="h-0.5 w-full bg-[#1e2e23]" />

      {/* Top Header Placeholder */}
      <div className="p-2.5 pb-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3.5 bg-[#1e2e23] rounded-md w-3/4" />
          <div className="h-3.5 w-5 bg-[#17241C] rounded-md" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-2.5 bg-[#17241C] rounded w-1/3" />
          <div className="h-2.5 bg-[#17241C] rounded w-1/4" />
        </div>
      </div>

      {/* Center Image Placeholder */}
      <div className="px-3 py-6 flex items-center justify-center min-h-[110px] sm:min-h-[125px]">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#17241C]/80 ring-4 ring-[#1e2e23]/30" />
      </div>

      {/* Bottom Info Area Placeholder */}
      <div className="p-2.5 pt-2 bg-[#0E120F]/60 border-t border-[#b7f1d1]/5 space-y-2">
        {/* Price Placeholder */}
        <div className="h-4 bg-[#1e2e23] rounded-md w-1/2" />

        {/* Float Bar Placeholder */}
        <div className="space-y-1">
          <div className="h-1 w-full bg-[#1e2e23] rounded-full" />
          <div className="flex justify-between">
            <div className="h-2 bg-[#17241C] rounded w-1/3" />
            <div className="h-2 bg-[#17241C] rounded w-1/6" />
          </div>
        </div>

        {/* Button Placeholder */}
        <div className="pt-1">
          <div className="h-8 bg-[#17241C] rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
};
