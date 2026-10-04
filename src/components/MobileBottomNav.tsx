import React from 'react';
import { ShoppingCart, Compass, PlusSquare, Wallet } from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';
import { ActiveView } from '../types';

interface MobileBottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cartCount: number;
  openCart: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  cartCount,
  openCart,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1d1d1f]/95 backdrop-blur-md border-t border-white/10 px-2 sm:px-4 py-2 flex items-center justify-around lg:hidden">
      {/* Market */}
      <button
        id="mobile-nav-market"
        onClick={() => setActiveView('market')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeView === 'market' ? 'text-[#20df7c]' : 'text-[#8F9A93]'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-bold">بازار</span>
      </button>

      {/* Sell */}
      <button
        id="mobile-nav-sell"
        onClick={() => setActiveView('sell')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeView === 'sell' ? 'text-[#20df7c]' : 'text-[#8F9A93]'
        }`}
      >
        <PlusSquare className="w-5 h-5" />
        <span className="text-[10px] font-bold">فروش اسکین</span>
      </button>

      {/* Cart with badge */}
      <button
        id="mobile-nav-cart"
        onClick={openCart}
        className="relative flex flex-col items-center gap-1 text-[#8F9A93] hover:text-[#20df7c] transition-colors"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -left-2 w-4 h-4 bg-[#20df7c] text-[#0A0D0B] text-[10px] font-black rounded-full flex items-center justify-center">
              {toPersianDigits(cartCount)}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">سبد خرید</span>
      </button>

      {/* Wallet */}
      <button
        id="mobile-nav-wallet"
        onClick={() => setActiveView('wallet')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeView === 'wallet' ? 'text-[#20df7c]' : 'text-[#8F9A93]'
        }`}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-[10px] font-bold">کیف پول</span>
      </button>
    </div>
  );
};
