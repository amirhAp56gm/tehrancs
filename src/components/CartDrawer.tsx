import React from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { formatPrice, toPersianDigits, getWearColor } from '../utils/formatters';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  currency: Currency;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  currency,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const subtotalUSD = cartItems.reduce((acc, curr) => acc + curr.item.priceUSD, 0);
  const platformFeeUSD = subtotalUSD * 0.02; // 2% fee
  const totalUSD = subtotalUSD + platformFeeUSD;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-right">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel - slides from the right in RTL */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#1d1d1f] border-l border-white/10 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161617]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#20df7c]" />
              <h2 className="text-base font-bold text-white">
                سبد خرید ({toPersianDigits(cartItems.length)})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  id="clear-cart-btn"
                  onClick={onClearCart}
                  className="text-xs text-[#8F9A93] hover:text-rose-400 transition-colors px-2 py-1 rounded bg-[#262629] border border-white/5"
                >
                  خالی کردن سبد
                </button>
              )}
              <button
                id="close-cart-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8F9A93] hover:text-white hover:bg-[#262629] transition-colors"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1d1d1f]">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#262629] flex items-center justify-center text-[#8F9A93] border border-white/5">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-white">سبد خرید شما خالی است</h3>
                <p className="text-xs text-[#8F9A93] max-w-xs leading-relaxed">
                  اسکین‌های مورد نظر خود را از بازار انتخاب کرده و با زدن دکمه «افزودن به سبد» به این بخش اضافه نمایید.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#20df7c] text-[#0A0D0B] font-bold text-xs hover:bg-[#1bc66e] transition-colors"
                >
                  بازگشت به صفحه اصلی
                </button>
              </div>
            ) : (
              cartItems.map(({ item }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 bg-[#262629] border border-white/10 rounded-xl hover:border-[#20df7c]/30 transition-colors"
                >
                  {/* Thumb image */}
                  <div className="w-16 h-16 bg-[#1d1d1f] rounded-lg p-1 flex items-center justify-center shrink-0 border border-white/5">
                    <img
                      src={getOptimizedImageUrl(item.image)}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate font-sans" title={item.name}>
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8F9A93] mt-0.5">
                      <span>{item.condition}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-[#20df7c]">
                        {item.floatValue.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-1">
                      {formatPrice(item.priceUSD, currency)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-[#8F9A93] hover:text-rose-400 hover:bg-[#1d1d1f] rounded-lg transition-colors"
                    title="حذف از سبد"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-[#161617] border-t border-white/10 space-y-3">
              {/* Summary calculations */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#8F9A93]">
                  <span>جمع قیمت آیتم‌ها:</span>
                  <span className="font-mono text-white">{formatPrice(subtotalUSD, currency)}</span>
                </div>
                <div className="flex justify-between text-[#8F9A93]">
                  <span>کارمزد معامله امن پلتفرم (۲٪):</span>
                  <span className="font-mono text-[#20df7c]">{formatPrice(platformFeeUSD, currency)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>مبلغ کل پرداختی:</span>
                  <span className="font-mono text-lg text-[#20df7c]">{formatPrice(totalUSD, currency)}</span>
                </div>
              </div>

              {/* Secure Trade Notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#262629] text-[11px] text-gray-300 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#20df7c] shrink-0" />
                <span>تحویل اسکین‌ها بلافاصله از طریق ترید آفر رسمی استیم انجام می‌شود.</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="py-2.5 rounded-xl bg-[#262629] hover:bg-[#323236] text-xs font-bold text-[#F2F5F3] border border-white/10 transition-colors"
                >
                  ادامه خرید
                </button>
                <button
                  id="checkout-proceed-btn"
                  onClick={onProceedCheckout}
                  className="py-2.5 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] text-xs font-bold text-[#0A0D0B] shadow-md shadow-[#20df7c]/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>ادامه پرداخت</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
