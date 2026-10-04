import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Wallet, 
  CreditCard, 
  Coins, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight,
  AlertCircle,
  Clock
} from 'lucide-react';
import { CartItem, Currency, UserAccount } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: Currency;
  user: UserAccount | null;
  onSuccessOrder: (paymentMethodLabel: string, totalUSD: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  user,
  onSuccessOrder,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tradeUrl, setTradeUrl] = useState('https://steamcommunity.com/tradeoffer/new/?partner=1045239&token=K98xZa1P');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'shetab' | 'crypto'>('shetab');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const subtotalUSD = cartItems.reduce((acc, curr) => acc + curr.item.priceUSD, 0);
  const platformFeeUSD = subtotalUSD * 0.02;
  const totalUSD = subtotalUSD + platformFeeUSD;

  const handlePayOrder = () => {
    const paymentLabel = 
      paymentMethod === 'shetab' ? 'درگاه مستقیم شتاب' :
      paymentMethod === 'crypto' ? 'ارز دیجیتال (تتر USDT)' :
      'کیف پول تهران cs';

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      onSuccessOrder(paymentLabel, totalUSD);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-right">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-xl bg-[#1d1d1f] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#20df7c]/20 text-[#20df7c] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تسویه حساب و خرید امن اسکین</h3>
                <span className="text-[11px] text-[#8F9A93]">
                  تضمین و پشتیبانی ۱۰۰٪ توسط تهران cs
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8F9A93] hover:text-white hover:bg-[#262629]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between text-xs px-2">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#20df7c] font-bold' : 'text-[#8F9A93]'}`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#262629] border border-current text-[11px]">
                ۱
              </span>
              <span>لینک ترید استیم</span>
            </div>
            <div className="h-0.5 w-12 bg-white/10" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#20df7c] font-bold' : 'text-[#8F9A93]'}`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#262629] border border-current text-[11px]">
                ۲
              </span>
              <span>روش پرداخت</span>
            </div>
            <div className="h-0.5 w-12 bg-white/10" />
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-[#20df7c] font-bold' : 'text-[#8F9A93]'}`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#262629] border border-current text-[11px]">
                ۳
              </span>
              <span>تأیید و ارسال ترید</span>
            </div>
          </div>

          {/* STEP 1: Trade URL & Order Review */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  آدرس Trade URL حساب کاربری استیم شما:
                </label>
                <input
                  type="text"
                  value={tradeUrl}
                  onChange={(e) => setTradeUrl(e.target.value)}
                  dir="ltr"
                  className="w-full bg-[#262629] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#20df7c] focus:outline-none"
                />
                <p className="text-[10px] text-[#8F9A93]">
                  اسکین‌ها از طریق این لینک به اکانت استیم شما ترید می‌شوند. مطمئن شوید Inventory شما در استیم عمومی (Public) باشد.
                </p>
              </div>

              {/* Items Summary preview */}
              <div className="bg-[#262629] rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 border border-white/10">
                <div className="text-[11px] text-[#8F9A93] font-bold mb-1">
                  آیتم‌های منتخب برای خرید ({toPersianDigits(cartItems.length)} اسکین):
                </div>
                {cartItems.map(({ item }) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-none">
                    <div className="flex items-center gap-2">
                      <img src={getOptimizedImageUrl(item.image)} alt={item.name} referrerPolicy="no-referrer" className="w-8 h-8 object-contain" />
                      <span className="text-white font-sans text-xs truncate max-w-[220px]">{item.name}</span>
                    </div>
                    <span className="font-mono text-[#20df7c] font-bold">
                      {formatPrice(item.priceUSD, currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="p-3 bg-[#262629] border border-white/10 rounded-xl flex items-center justify-between text-sm font-bold text-white">
                <span>مبلغ نهایی قابل پرداخت:</span>
                <span className="font-mono text-base text-[#20df7c]">{formatPrice(totalUSD, currency)}</span>
              </div>

              <button
                id="step-1-next-btn"
                onClick={() => setStep(2)}
                disabled={!tradeUrl.includes('partner=')}
                className="w-full py-3 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] disabled:opacity-50 text-[#0A0D0B] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>تأیید و رفتن به انتخاب روش پرداخت</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-white mb-2">روش پرداخت را انتخاب نمایید:</div>
              
              <div className="space-y-2">
                {/* Wallet Balance */}
                <label 
                  onClick={() => setPaymentMethod('wallet')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-[#20df7c]/10 border-[#20df7c]'
                      : 'bg-[#262629] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-[#20df7c]" />
                    <div>
                      <div className="text-xs font-bold text-white">موجودی کیف پول تهران cs</div>
                      <div className="text-[11px] text-[#8F9A93]">
                        موجودی فعال شما: {formatPrice(user?.withdrawableBalanceUSD || 0, currency)}
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="accent-[#20df7c]"
                  />
                </label>

                {/* Shetab / Banking gateway */}
                <label 
                  onClick={() => setPaymentMethod('shetab')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'shetab'
                      ? 'bg-[#20df7c]/10 border-[#20df7c]'
                      : 'bg-[#262629] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-sky-400" />
                    <div>
                      <div className="text-xs font-bold text-white">درگاه مستقیم شاپرک / کارت‌های شتاب</div>
                      <div className="text-[11px] text-[#8F9A93]">پرداخت ریالی آنی با تمام کارت‌های عضو شتاب بانکی</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'shetab'}
                    onChange={() => setPaymentMethod('shetab')}
                    className="accent-[#20df7c]"
                  />
                </label>

                {/* Crypto USDT */}
                <label 
                  onClick={() => setPaymentMethod('crypto')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'crypto'
                      ? 'bg-[#20df7c]/10 border-[#20df7c]'
                      : 'bg-[#262629] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">رمز ارز تتر (USDT - TRC20 / TON)</div>
                      <div className="text-[11px] text-[#8F9A93]">پرداخت بین‌المللی بدون احراز هویت با شبکه سریع</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'crypto'}
                    onChange={() => setPaymentMethod('crypto')}
                    className="accent-[#20df7c]"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="py-3 rounded-xl bg-[#262629] hover:bg-[#323236] text-xs font-bold text-[#F2F5F3] border border-white/10 transition-colors"
                >
                  مرحله قبل
                </button>
                <button
                  id="pay-order-btn"
                  onClick={handlePayOrder}
                  disabled={isProcessing}
                  className="py-3 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] text-[#0A0D0B] font-extrabold text-xs shadow-md shadow-[#20df7c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>در حال ثبت در شبکه استیم...</span>
                    </>
                  ) : (
                    <span>پرداخت {formatPrice(totalUSD, currency)}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Completed & Live Steam Trade Confirmation */}
          {step === 3 && (
            <div className="space-y-4 text-center py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#20df7c]/20 text-[#20df7c] flex items-center justify-center mx-auto ring-4 ring-[#20df7c]/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">سفارش شما با موفقیت ثبت گردید!</h4>
                <p className="text-xs text-[#8F9A93] max-w-sm mx-auto mt-1 leading-relaxed">
                  ترید آفر استیم توسط بات پلتفرم تهران cs به آدرس ترید شما ارسال شد. لطفاً اپلیکیشن Steam Mobile Authenticator خود را باز کرده و آن را تأیید فرمایید.
                </p>
              </div>

              <div className="bg-[#262629] p-4 rounded-xl border border-white/10 text-right space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8F9A93]">شماره پیگیری سفارش:</span>
                  <span className="font-mono text-white">#IRCS2-948194</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F9A93]">وضعیت Trade Offer:</span>
                  <span className="text-[#20df7c] font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#20df7c] animate-ping" />
                    منتظر تأیید شما در استیم (تا ۵ دقیقه)
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#20df7c] text-[#0A0D0B] font-bold text-xs hover:bg-[#1bc66e] transition-colors cursor-pointer"
              >
                بستن و بازگشت به صفحه اصلی
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
