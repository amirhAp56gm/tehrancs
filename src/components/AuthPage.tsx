import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Package,
  Layers,
  Lock,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { UserAccount } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: UserAccount) => void;
  onCancel: () => void;
  onSteamLogin?: () => void;
}

const SteamLogo = ({ className = 'w-6 h-6 text-white' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-10 9.77c0 .61.06 1.21.17 1.8l5.22 2.14a3.17 3.17 0 0 1 1.77-.54c.2 0 .4.02.59.06l2.84-4.11a3.56 3.56 0 1 1 5.03 4.29l-4.11 2.84c.04.19.06.39.06.59a3.57 3.57 0 0 1-5.83 2.74L2.83 17.5A10 10 0 1 0 12 2zm-3.8 15.63a1.78 1.78 0 1 0-1.78-1.78c0 .98.8 1.78 1.78 1.78zm7.14-5.36a1.79 1.79 0 1 0 0-3.57 1.79 1.79 0 0 0 0 3.57z" />
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({
  onCancel,
  onSteamLogin,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Direct Steam Login - Unified Profile Flow via Official Steam OpenID 2.0
  const handleSteamLogin = () => {
    setIsLoading(true);
    if (onSteamLogin) {
      onSteamLogin();
      return;
    }

    const width = 800;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/api/auth/steam',
      'steam_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      window.location.href = '/api/auth/steam';
    }
  };

  return (
    <div className="min-h-screen bg-[#0E120F] flex flex-col items-center justify-center px-4 py-12 text-right font-sans select-none">
      {/* Return to Marketplace Button */}
      <button
        id="auth-back-btn"
        onClick={onCancel}
        className="mb-6 flex items-center gap-2 text-xs font-semibold text-[#8F9A93] hover:text-white transition-colors bg-[#17241C] px-4 py-2 rounded-full border border-[#b7f1d1]/10 cursor-pointer"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به بازار اسکین</span>
      </button>

      {/* Main Steam Login Card */}
      <div className="w-full max-w-lg bg-[#141C16] border border-[#b7f1d1]/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
        {/* Top Glowing Ambient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#20df7c] to-transparent opacity-80" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#20df7c]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Steam Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1b2838] to-[#171a21] border border-[#66c0f4]/40 flex items-center justify-center shadow-lg shadow-[#66c0f4]/15">
              <SteamLogo className="w-9 h-9 sm:w-11 sm:h-11 text-[#66c0f4]" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#20df7c] text-black flex items-center justify-center text-xs font-black ring-2 ring-[#141C16]">
              ✓
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ورود با حساب کاربری استیم
            </h1>
            <p className="text-xs sm:text-sm text-[#8F9A93] leading-relaxed max-w-sm mx-auto">
              جهت جلوگیری از هرگونه عدم تطابق اکانت، ورود به سایت منحصراً از طریق درگاه رسمی استیم (Steam OpenID) انجام می‌شود.
            </p>
          </div>
        </div>

        {/* Highlighted Benefits Grid */}
        <div className="space-y-2.5 bg-[#0E120F]/70 border border-white/5 rounded-2xl p-4 text-xs text-right">
          <div className="flex items-start gap-2.5 text-gray-200">
            <div className="w-5 h-5 rounded-lg bg-[#20df7c]/15 text-[#20df7c] flex items-center justify-center shrink-0 mt-0.5">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-white block font-bold">همگام‌سازی لحظه‌ای اینونتوری CS2:</strong>
              <p className="text-[11px] text-[#8F9A93] leading-relaxed">
                اسکین‌ها، کیس‌ها، چاقوها، دستکش‌ها و استیکرهای کانتر استرایک ۲ به صورت مستقیم بارگذاری می‌شوند.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-gray-200">
            <div className="w-5 h-5 rounded-lg bg-[#66c0f4]/15 text-[#66c0f4] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-white block font-bold">احراز هویت بدون رمز عبور و امن:</strong>
              <p className="text-[11px] text-[#8F9A93] leading-relaxed">
                ورود از طریق سرورهای رسمی Valve انجام شده و اطلاعات حساب شما نزد استیم محفوظ است.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-gray-200">
            <div className="w-5 h-5 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-white block font-bold">مدیریت شماره تلفن و ایمیل در پنل کاربری:</strong>
              <p className="text-[11px] text-[#8F9A93] leading-relaxed">
                پس از ورود، در بخش پروفایل کیف پول می‌توانید شماره موبایل و ایمیل خود را برای دریافت پیامک و اعلان‌ها ثبت نمایید.
              </p>
            </div>
          </div>
        </div>

        {/* Steam Login Primary Action */}
        <div className="space-y-3 pt-1">
          <button
            id="steam-auth-btn"
            type="button"
            onClick={handleSteamLogin}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#2a475e] hover:from-[#1b2838] hover:to-[#385f7e] text-white border border-[#66c0f4]/40 font-black text-sm sm:text-base transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-black/60 hover:shadow-[#66c0f4]/20 active:scale-98 disabled:opacity-50"
          >
            <SteamLogo className="w-6 h-6 text-[#66c0f4] shrink-0" />
            <span>ورود از طریق حساب رسمی استیم (Steam)</span>
          </button>

          <p className="text-[11px] text-center text-[#8F9A93]">
            با کلیک روی دکمه بالا، پنجره رسمی درگاه احراز هویت Steam Community باز می‌شود.
          </p>
        </div>

        {/* Security and Trust Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8F9A93]">
          <div className="flex items-center gap-1.5 text-[#20df7c]">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-semibold">اتصال امن SSL ۲۵۶ بیتی</span>
          </div>
          <span className="font-mono text-[10px] text-gray-400">CS2 AppID: 730</span>
        </div>
      </div>
    </div>
  );
};
