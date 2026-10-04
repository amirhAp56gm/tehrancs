import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  History,
  ShieldCheck, 
  CreditCard, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  Zap, 
  Tag, 
  RotateCcw, 
  Trash2,
  User,
  Mail,
  Phone,
  Link2,
  Shield
} from 'lucide-react';
import { UserAccount, Currency, UserSaleListing } from '../types';
import { formatPrice, toPersianDigits, USD_TO_TOMAN_RATE } from '../utils/formatters';

interface WalletDashboardProps {
  user: UserAccount | null;
  currency: Currency;
  onOpenDeposit: () => void;
  onRequestWithdraw: (amountUSD: number, sheba: string, accountName: string) => void;
  onCancelSale?: (saleId: string) => void;
  onClearTransactions?: () => void;
  onUpdateUserProfile?: (data: Partial<UserAccount>) => void;
  onConnectSteam?: () => void;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  user,
  currency,
  onOpenDeposit,
  onRequestWithdraw,
  onCancelSale,
  onClearTransactions,
  onUpdateUserProfile,
  onConnectSteam,
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'pending_sales'>('transactions');
  
  // Profile editing state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState('');
  const [withdrawAmountToman, setWithdrawAmountToman] = useState('');
  const [shebaNumber, setShebaNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#17241C] border border-[#b7f1d1]/15 rounded-2xl text-center space-y-4 text-right">
        <Wallet className="w-12 h-12 text-[#20df7c] mx-auto" />
        <h2 className="text-lg font-bold text-white text-center">لطفاً برای دسترسی به کیف پول وارد شوید</h2>
        <p className="text-xs text-[#8F9A93] text-center leading-relaxed">
          برای مشاهده موجودی، تسویه حساب، واریز و برداشت ابتدا باید از طریق اکانت استیم یا شماره موبایل وارد سیستم شوید.
        </p>
      </div>
    );
  }

  const handleSaveEmail = () => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile({ email: emailInput.trim() });
    }
    setIsEditingEmail(false);
  };

  const handleSavePhone = () => {
    if (onUpdateUserProfile && phoneInput.trim()) {
      onUpdateUserProfile({ phone: phoneInput.trim(), phoneVerified: true });
    }
    setIsEditingPhone(false);
  };

  const handleOpenWithdrawModal = () => {
    setWithdrawError(null);
    setWithdrawAmountUSD(user.withdrawableBalanceUSD.toString());
    setWithdrawAmountToman(Math.round(user.withdrawableBalanceUSD * USD_TO_TOMAN_RATE).toString());
    setIsWithdrawModalOpen(true);
  };

  const handleTomanWithdrawChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setWithdrawAmountToman(clean);
    const numToman = Number(clean) || 0;
    const usd = (numToman / USD_TO_TOMAN_RATE).toFixed(2);
    setWithdrawAmountUSD(usd);
  };

  const handleUSDWithdrawChange = (val: string) => {
    setWithdrawAmountUSD(val);
    const numUSD = parseFloat(val) || 0;
    const toman = Math.round(numUSD * USD_TO_TOMAN_RATE);
    setWithdrawAmountToman(toman.toString());
  };

  const handleSubmitWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);

    const amount = parseFloat(withdrawAmountUSD);
    if (!amount || amount <= 0) {
      setWithdrawError('لطفاً مبلغ معتبری جهت تسویه حساب وارد نمایید.');
      return;
    }

    if (amount > user.withdrawableBalanceUSD) {
      setWithdrawError('مبلغ درخواستی بیشتر از موجودی قابل برداشت شما است.');
      return;
    }

    if (!shebaNumber.trim() || shebaNumber.trim().length < 10) {
      setWithdrawError('لطفاً شماره شبا (با IR) یا شماره کارت ۱۶ رقمی معتبر را وارد کنید.');
      return;
    }

    if (!accountName.trim()) {
      setWithdrawError('لطفاً نام و نام خانوادگی صاحب حساب بانکی را وارد نمایید.');
      return;
    }

    onRequestWithdraw(amount, shebaNumber.trim(), accountName.trim());
    setIsWithdrawModalOpen(false);
  };

  const parsedWithdrawUSD = parseFloat(withdrawAmountUSD) || 0;
  const withdrawFeeUSD = Number((parsedWithdrawUSD * 0.02).toFixed(2)); // 2% withdrawal fee
  const netWithdrawPayoutUSD = Number((parsedWithdrawUSD * 0.98).toFixed(2));

  const userSales: UserSaleListing[] = user.sales || [];
  const pendingSales = userSales.filter(s => s.status === 'pending_payout' || s.status === 'pending_buyer');

  return (
    <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-6 space-y-6 text-right">
      
      {/* 1. Unified User Profile & Account Info Card */}
      <div className="bg-[#17241C] border border-[#b7f1d1]/20 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#b7f1d1]/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-14 h-14 rounded-2xl border-2 border-[#20df7c]/40 object-cover bg-[#121814]"
              />
              {user.role === 'admin' && (
                <span className="absolute -bottom-1 -right-1 bg-[#20df7c] text-[#0A0D0B] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                  ADMIN
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {user.username}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#20df7c]/15 text-[#20df7c] border border-[#20df7c]/30">
                  لول {toPersianDigits(user.level || 1)}
                </span>
              </div>
              <p className="text-xs text-[#8F9A93] flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#20df7c]" />
                <span>پروفایل یکپارچه و تایید شده مارکت‌پلیس CS2</span>
              </p>
            </div>
          </div>

          {/* Steam Connection Status Badge / Button */}
          <div>
            {user.steamId ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#212b36] border border-white/10 text-xs text-white">
                <svg className="w-4 h-4 text-[#20df7c]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-10 9.77c0 .61.06 1.21.17 1.8l5.22 2.14a3.17 3.17 0 0 1 1.77-.54c.2 0 .4.02.59.06l2.84-4.11a3.56 3.56 0 1 1 5.03 4.29l-4.11 2.84c.04.19.06.39.06.59a3.57 3.57 0 0 1-5.83 2.74L2.83 17.5A10 10 0 1 0 12 2zm-3.8 15.63a1.78 1.78 0 1 0-1.78-1.78c0 .98.8 1.78 1.78 1.78zm7.14-5.36a1.79 1.79 0 1 0 0-3.57 1.79 1.79 0 0 0 0 3.57z" />
                </svg>
                <div className="text-right">
                  <span className="text-[10px] text-[#8F9A93] block">اکانت استیم متصل است</span>
                  <span className="font-mono text-[11px] font-bold text-white">{user.steamId}</span>
                </div>
              </div>
            ) : onConnectSteam ? (
              <button
                onClick={onConnectSteam}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#212b36] hover:bg-[#2b3846] text-white border border-[#20df7c]/30 text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#20df7c]/10"
              >
                <Link2 className="w-4 h-4 text-[#20df7c]" />
                <span>اتصال اکانت استیم به این پروفایل</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Profile Attributes Grid: Phone, Steam ID/Username (Immutable), Email, Trade Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          
          {/* 1. Phone Number */}
          <div className="p-3.5 rounded-xl bg-[#121814] border border-[#b7f1d1]/10 space-y-1.5">
            <div className="flex items-center justify-between text-[#8F9A93]">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Phone className="w-3.5 h-3.5 text-[#20df7c]" />
                <span>شماره موبایل:</span>
              </span>
              <span className="text-[10px] text-[#20df7c] bg-[#20df7c]/10 px-1.5 py-0.5 rounded font-bold">
                ✓ تایید شده
              </span>
            </div>
            {isEditingPhone ? (
              <div className="flex items-center gap-1.5 pt-1">
                <input 
                  type="text"
                  dir="ltr"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-[#17241C] border border-[#20df7c] rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
                />
                <button 
                  onClick={handleSavePhone}
                  className="px-2 py-1 rounded bg-[#20df7c] text-[#0A0D0B] font-bold text-[11px] cursor-pointer"
                >
                  ثبت
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-0.5">
                <span className="font-mono text-sm font-bold text-white dir-ltr">
                  {user.phone || 'ثبت نشده'}
                </span>
                <button 
                  onClick={() => {
                    setPhoneInput(user.phone || '');
                    setIsEditingPhone(true);
                  }}
                  className="text-[10px] text-[#8F9A93] hover:text-[#20df7c] transition-colors cursor-pointer"
                >
                  ویرایش
                </button>
              </div>
            )}
          </div>

          {/* 2. Username / Steam ID (Immutable from site) */}
          <div className="p-3.5 rounded-xl bg-[#121814] border border-[#b7f1d1]/10 space-y-1.5">
            <div className="flex items-center justify-between text-[#8F9A93]">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <User className="w-3.5 h-3.5 text-[#20df7c]" />
                <span>نام کاربری / Steam ID:</span>
              </span>
              <span className="text-[10px] text-[#8F9A93] bg-white/5 px-1.5 py-0.5 rounded font-mono">
                غیرقابل تغییر
              </span>
            </div>
            <div className="pt-0.5">
              <span className="font-mono text-xs font-bold text-white block truncate">
                {user.steamId ? `Steam ID: ${user.steamId}` : user.username}
              </span>
              <span className="text-[10px] text-[#8F9A93] block truncate">
                {user.username} (سینک شده با استیم)
              </span>
            </div>
          </div>

          {/* 3. Email */}
          <div className="p-3.5 rounded-xl bg-[#121814] border border-[#b7f1d1]/10 space-y-1.5">
            <div className="flex items-center justify-between text-[#8F9A93]">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Mail className="w-3.5 h-3.5 text-[#20df7c]" />
                <span>ایمیل کاربری:</span>
              </span>
              <button 
                onClick={() => {
                  setEmailInput(user.email || '');
                  setIsEditingEmail(!isEditingEmail);
                }}
                className="text-[10px] text-[#8F9A93] hover:text-[#20df7c] transition-colors cursor-pointer"
              >
                {isEditingEmail ? 'انصراف' : (user.email ? 'ویرایش' : 'ثبت ایمیل')}
              </button>
            </div>
            {isEditingEmail ? (
              <div className="flex items-center gap-1.5 pt-1">
                <input 
                  type="email"
                  dir="ltr"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-[#17241C] border border-[#20df7c] rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
                />
                <button 
                  onClick={handleSaveEmail}
                  className="px-2 py-1 rounded bg-[#20df7c] text-[#0A0D0B] font-bold text-[11px] cursor-pointer"
                >
                  ثبت
                </button>
              </div>
            ) : (
              <div className="pt-0.5">
                <span className="font-mono text-xs font-bold text-white block truncate dir-ltr text-right">
                  {user.email || 'ایمیل ثبت نشده است'}
                </span>
              </div>
            )}
          </div>

          {/* 4. Steam Trade Eligibility Status */}
          <div className="p-3.5 rounded-xl bg-[#121814] border border-[#b7f1d1]/10 space-y-1.5">
            <div className="flex items-center justify-between text-[#8F9A93]">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Shield className="w-3.5 h-3.5 text-[#20df7c]" />
                <span>وضعیت ترید و مارکت:</span>
              </span>
              <span className="text-[10px] text-[#20df7c] bg-[#20df7c]/10 px-1.5 py-0.5 rounded font-bold">
                فعال ✓
              </span>
            </div>
            <div className="pt-0.5">
              <span className="text-[11px] text-[#20df7c] font-medium block">
                ترید و فروش اسکین‌ها مجاز است
              </span>
              <span className="text-[10px] text-[#8F9A93] block">
                بدون محدودیت Trade Ban یا VAC
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Welcome & Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Withdrawable Balance Card */}
        <div className="bg-gradient-to-br from-[#17241C] to-[#121814] border border-[#20df7c]/30 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-lg shadow-[#20df7c]/5">
          <div className="flex items-center justify-between text-xs text-[#8F9A93]">
            <span className="font-bold text-white">موجودی قابل برداشت (تسویه فوری):</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#20df7c] animate-pulse" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {formatPrice(user.withdrawableBalanceUSD, currency)}
          </div>

          <p className="text-[11px] text-[#8F9A93] leading-relaxed">
            مبالغ حاصل از فروش پس از پایان دوره قفل ۷ روزه استیم، مستقیماً به این بخش منتقل می‌شوند و آماده برداشت به کارت بانکی می‌باشند.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleOpenWithdrawModal}
              disabled={user.withdrawableBalanceUSD <= 0}
              className="flex-1 py-2.5 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0D0B] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#20df7c]/15"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>درخواست برداشت به حساب بانکی</span>
            </button>
            <button
              onClick={onOpenDeposit}
              className="flex-1 py-2.5 rounded-xl bg-[#121814] hover:bg-[#1a2d20] text-white border border-[#b7f1d1]/15 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 text-[#20df7c]" />
              <span>شارژ کیف پول</span>
            </button>
          </div>
        </div>

        {/* Pending Balance Card (Steam 7-day Trade Hold) */}
        <div className="bg-[#17241C] border border-[#b7f1d1]/15 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8F9A93]">
            <span className="font-bold text-amber-300">موجودی در حال انتظار (قفل ۷ روزه ترید استیم):</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {formatPrice(user.pendingBalanceUSD, currency)}
          </div>

          <div className="text-[11px] text-[#8F9A93] leading-relaxed">
            مطابق قوانین استیم، به علت دوره انتظار معامله (Trade Hold)، وجه حاصل از فروش پس از <strong className="text-white">۷ روز</strong> به موجودی قابل برداشت واریز خواهد شد.
          </div>

          {/* 7-day Countdown Progress */}
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full bg-[#121814] rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 w-1/4 rounded-full" />
            </div>
            <div className="flex justify-between text-[11px] text-[#8F9A93]">
              <span>آزادسازی خودکار موجودی:</span>
              <span className="text-white font-medium">{toPersianDigits(user.pendingDaysRemaining || 7)} روز دیگر</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs: Transactions History vs Pending Sales */}
      <div className="bg-[#17241C] border border-[#b7f1d1]/15 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#b7f1d1]/10 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`text-xs sm:text-sm font-bold pb-1 transition-colors relative cursor-pointer ${
                activeTab === 'transactions' ? 'text-[#20df7c]' : 'text-[#8F9A93] hover:text-white'
              }`}
            >
              تاریخچه تراکنش‌های مالی
              {activeTab === 'transactions' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#20df7c] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('pending_sales')}
              className={`text-xs sm:text-sm font-bold pb-1 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pending_sales' ? 'text-[#20df7c]' : 'text-[#8F9A93] hover:text-white'
              }`}
            >
              فروش‌های در انتظار تسویه ({toPersianDigits(pendingSales.length)})
              {activeTab === 'pending_sales' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#20df7c] rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'transactions' && onClearTransactions && user.transactions && user.transactions.length > 0 && (
            <button
              onClick={onClearTransactions}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 cursor-pointer"
              title="پاکسازی تمام سوابق تراکنش‌ها"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاکسازی تاریخچه</span>
            </button>
          )}
        </div>

        {/* TAB 1: Transactions Table */}
        {activeTab === 'transactions' && (
          <div>
            {(!user.transactions || user.transactions.length === 0) ? (
              <div className="text-center py-12 px-4 space-y-3">
                <History className="w-10 h-10 text-[#8F9A93]/40 mx-auto" />
                <p className="text-sm font-bold text-white">هنوز هیچ تراکنشی ثبت نشده است.</p>
                <p className="text-xs text-[#8F9A93] max-w-sm mx-auto">
                  سوابق واریز، برداشت، فروش اسکین و تسویه حساب‌های بانکی شما در این جدول ثبت خواهد شد.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-[#b7f1d1]/10 text-[#8F9A93]">
                      <th className="py-2.5 px-3">نوع تراکنش</th>
                      <th className="py-2.5 px-3">آیتم یا شرح</th>
                      <th className="py-2.5 px-3">مبلغ</th>
                      <th className="py-2.5 px-3">تاریخ و ساعت</th>
                      <th className="py-2.5 px-3">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#b7f1d1]/5">
                    {user.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#121814] transition-colors">
                        <td className="py-3 px-3 text-[#20df7c] font-bold">{tx.type}</td>
                        <td className="py-3 px-3 font-sans text-white font-semibold">{tx.description}</td>
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {tx.isPositive ? '+' : '-'}{formatPrice(tx.amountUSD, currency)}
                        </td>
                        <td className="py-3 px-3 text-[#8F9A93]">{tx.date}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] inline-flex items-center gap-1 ${
                            tx.status === 'completed'
                              ? 'bg-[#20df7c]/15 text-[#20df7c] border border-[#20df7c]/20'
                              : tx.status === 'pending'
                              ? 'bg-amber-400/15 text-amber-400 border border-amber-400/20'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold'
                          }`}>
                            {tx.status === 'completed' ? 'تکمیل شده' : tx.status === 'pending' ? 'در حال پردازش' : 'لغو شده'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Pending Sales with Cancellation Button */}
        {activeTab === 'pending_sales' && (
          <div>
            {pendingSales.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <Clock className="w-10 h-10 text-[#8F9A93]/40 mx-auto" />
                <p className="text-sm font-bold text-white">هیچ فروش در حال انتظاری وجود ندارد.</p>
                <p className="text-xs text-[#8F9A93] max-w-sm mx-auto">
                  هنگامی که اسکین خود را به صورت فوری یا با قیمت دلخواه به فروش برسانید، وضعیت ۷ روزه تسویه آن در اینجا نمایش داده می‌شود.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-[#b7f1d1]/10 text-[#8F9A93]">
                      <th className="py-2.5 px-3">اسکین</th>
                      <th className="py-2.5 px-3">روش فروش</th>
                      <th className="py-2.5 px-3">مبلغ نهایی معامله</th>
                      <th className="py-2.5 px-3">وضعیت تسویه</th>
                      <th className="py-2.5 px-3 text-center">اقدام (امکان لغو)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#b7f1d1]/5">
                    {pendingSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-[#121814] transition-colors">
                        <td className="py-3 px-3 font-bold text-white font-sans">{sale.item.name}</td>
                        <td className="py-3 px-3">
                          {sale.saleType === 'instant' ? (
                            <span className="text-[#20df7c] font-bold">فروش فوری (۲٪ کارمزد)</span>
                          ) : (
                            <span className="text-cyan-400 font-bold">فروش عادی (۱۰٪ کارمزد)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#20df7c]">
                          {formatPrice(sale.netPayoutUSD, currency)}
                        </td>
                        <td className="py-3 px-3 text-amber-400">
                          {sale.status === 'pending_buyer' ? 'در انتظار خریدار / ادمین' : 'قفل ۷ روزه ترید استیم'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {onCancelSale && (
                            <button
                              onClick={() => onCancelSale(sale.id)}
                              className="px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                              title="در صورت پشیمانی از فروش، آیتم بازگردانده می‌شود"
                            >
                              لغو فروش (انصراف)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* WITHDRAWAL MODAL WITH 2% BANK TRANSFER FEE */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17241C] border border-[#b7f1d1]/20 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200 text-right">
            
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute left-4 top-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-[#b7f1d1]/10">
              <CreditCard className="w-5 h-5 text-[#20df7c]" />
              <h3 className="text-base font-bold text-white">تسویه حساب و برداشت به حساب بانکی</h3>
            </div>

            {withdrawError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitWithdraw} className="space-y-4">
              
              {/* Amount in Toman */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <label className="font-bold">مبلغ برداشتی (تومان):</label>
                  <span className="text-[#8F9A93] font-mono">
                    حداکثر: {formatPrice(user.withdrawableBalanceUSD, currency)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmountToman}
                    onChange={(e) => handleTomanWithdrawChange(e.target.value)}
                    placeholder="مثال: ۳,۰۰۰,۰۰۰"
                    className="w-full h-11 px-3.5 pl-16 rounded-xl bg-[#121814] border border-[#b7f1d1]/20 text-white font-mono text-sm focus:outline-none focus:border-[#20df7c]"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8F9A93]">
                    تومان
                  </span>
                </div>
              </div>

              {/* Bank Sheba / Card */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  شماره شبا بانکی یا شماره کارت ۱۶ رقمی:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={shebaNumber}
                  onChange={(e) => setShebaNumber(e.target.value)}
                  placeholder="IR120120000000000000000000 یا شماره کارت"
                  className="w-full h-11 px-3 rounded-xl bg-[#121814] border border-[#b7f1d1]/20 text-white font-mono text-xs focus:outline-none focus:border-[#20df7c]"
                />
              </div>

              {/* Account Holder Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  نام و نام خانوادگی صاحب حساب بانکی:
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="مثال: علی محمدی"
                  className="w-full h-11 px-3 rounded-xl bg-[#121814] border border-[#b7f1d1]/20 text-white text-xs focus:outline-none focus:border-[#20df7c]"
                />
              </div>

              {/* Transparent Fee Breakdown (2% site withdrawal fee) */}
              <div className="p-3.5 rounded-xl bg-[#121814] border border-[#20df7c]/20 space-y-2 text-xs">
                <div className="flex justify-between text-[#8F9A93]">
                  <span>مبلغ درخواستی برداشت:</span>
                  <span className="font-mono text-white font-bold">{formatPrice(parsedWithdrawUSD, currency)}</span>
                </div>
                <div className="flex justify-between text-[#8F9A93]">
                  <span>کارمزد انتقال و تسویه سایت (۲٪):</span>
                  <span className="font-mono text-amber-400">-{formatPrice(withdrawFeeUSD, currency)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-white">مبلغ خالص واریزی به حساب بانکی:</span>
                  <span className="font-mono text-[#20df7c]">
                    {formatPrice(netWithdrawPayoutUSD, currency)}
                  </span>
                </div>
                <div className="text-[10px] text-[#8F9A93] pt-1">
                  * واریز وجه از طریق پایا و ساتنا ظرف کمتر از ۲۴ ساعت کاری به حساب بانکی شما انجام می‌پذیرد.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#20df7c] hover:bg-[#1bc66e] text-black font-black text-xs transition-colors cursor-pointer shadow-md shadow-[#20df7c]/20"
              >
                تأیید و ثبت درخواست تسویه حساب
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
