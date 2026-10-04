import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Globe, 
  Coins, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut, 
  Package, 
  ShieldCheck, 
  Wallet, 
  History, 
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Currency, UserAccount, ActiveView } from '../types';
import { formatPrice } from '../utils/formatters';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cartCount: number;
  openCart: () => void;
  currency?: Currency;
  user: UserAccount | null;
  setUser: (u: UserAccount | null) => void;
  openMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  cartCount,
  openCart,
  currency = 'IRR',
  user,
  setUser,
  openMobileMenu,
  searchQuery,
  setSearchQuery,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const handleSteamLogin = () => {
    // Simulated Steam login
    setUser({
      steamId: '76561198012345678',
      username: 'Amir_CS2',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      level: 1,
      withdrawableBalanceUSD: 0,
      pendingBalanceUSD: 0,
      pendingDaysRemaining: 0,
      activeListingsCount: 0,
      totalSalesUSD: 0,
      transactions: []
    });
  };

  const handleLogout = () => {
    setUser(null);
    setUserDropdownOpen(false);
    if (activeView === 'admin') {
      setActiveView('market');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#17241C]/95 backdrop-blur-md border-b border-[#b7f1d1]/10 px-3 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 lg:gap-6">
        
        {/* RIGHT SIDE: Brand Logo & Main Navigation (Mirrored for RTL) */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Mobile Hamburger Menu Toggle */}
          <button 
            id="mobile-menu-toggle-btn"
            onClick={openMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-[#121814] text-[#b7f1d1] hover:text-[#20df7c] border border-[#b7f1d1]/10"
            aria-label="منوی اصلی"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Tehran CS Logo */}
          <button 
            id="brand-logo-btn"
            onClick={() => setActiveView('market')} 
            className="flex items-center gap-2.5 text-right group focus:outline-none cursor-pointer"
          >
            <div className="relative w-10 h-10 shrink-0">
              <img src="https://i.postimg.cc/jd0sH0kD/logo.png" alt="تهران cs" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex flex-col">
              <span className="font-black text-lg lg:text-xl tracking-tight text-white group-hover:text-[#20df7c] transition-colors">
                تهران cs
              </span>
            </div>
          </button>

          {/* Desktop Main Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              id="nav-market-btn"
              onClick={() => setActiveView('market')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all relative ${
                activeView === 'market'
                  ? 'text-[#20df7c] bg-[#20df7c]/10'
                  : 'text-[#F2F5F3] hover:text-[#20df7c] hover:bg-[#121814]'
              }`}
            >
              بازار
              {activeView === 'market' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#20df7c] rounded-full" />
              )}
            </button>

            <button
              id="nav-sell-btn"
              onClick={() => setActiveView('sell')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all relative ${
                activeView === 'sell'
                  ? 'text-[#20df7c] bg-[#20df7c]/10'
                  : 'text-[#F2F5F3] hover:text-[#20df7c] hover:bg-[#121814]'
              }`}
            >
              فروش اسکین
              {activeView === 'sell' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#20df7c] rounded-full" />
              )}
            </button>

            {user && (
              <button
                id="nav-wallet-btn"
                onClick={() => setActiveView('wallet')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all relative ${
                  activeView === 'wallet'
                    ? 'text-[#20df7c] bg-[#20df7c]/10'
                    : 'text-[#F2F5F3] hover:text-[#20df7c] hover:bg-[#121814]'
                }`}
              >
                کیف پول
                {activeView === 'wallet' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#20df7c] rounded-full" />
                )}
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                id="nav-admin-btn"
                onClick={() => setActiveView('admin')}
                className={`px-3 py-1.5 rounded-lg text-sm font-black transition-all relative ${
                  activeView === 'admin'
                    ? 'text-black bg-white shadow-md'
                    : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                }`}
              >
                پنل مدیریت
                {activeView === 'admin' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-black rounded-full" />
                )}
              </button>
            )}

            {/* More Dropdown */}
            <div className="relative">
              <button
                id="more-nav-dropdown-btn"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-[#8F9A93] hover:text-white hover:bg-[#121814] transition-colors"
              >
                <span>بیشتر</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-1.5 w-48 bg-[#121814] border border-[#b7f1d1]/15 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setMoreDropdownOpen(false)}
                >
                  <a href="#fee-calc" onClick={(e) => { e.preventDefault(); setActiveView('sell'); setMoreDropdownOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-xs text-[#F2F5F3] hover:bg-[#17241C] hover:text-[#20df7c]">
                    <Coins className="w-4 h-4 text-[#20df7c]" />
                    <span>محاسبه‌گر کارمزد معامله</span>
                  </a>
                  <div className="border-t border-[#b7f1d1]/10 my-1" />
                  <a 
                    href="https://t.me/tehrancs_support" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-3 py-1.5 text-[11px] text-[#8F9A93] hover:text-[#229ED9] transition-colors"
                  >
                    پشتیبانی
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* LEFT SIDE: Cart, Steam Login / Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Cart Trigger (Hidden in mobile header, accessible via Mobile Bottom Nav) */}
          <button
            id="cart-drawer-trigger-btn"
            onClick={openCart}
            className="hidden sm:flex relative p-2 rounded-lg bg-[#121814] hover:bg-[#1e3325] border border-[#b7f1d1]/10 text-[#F2F5F3] hover:text-[#20df7c] transition-colors items-center justify-center"
            aria-label="سبد خرید"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 min-w-5 h-5 px-1 bg-[#20df7c] text-[#0A0D0B] text-[11px] font-black rounded-full flex items-center justify-center ring-2 ring-[#17241C] animate-in zoom-in-50 duration-150">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Logged In / Steam Login Button */}
          {user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-lg bg-[#121814] hover:bg-[#1e3325] border border-[#b7f1d1]/15 transition-all"
              >
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-7 h-7 rounded-md object-cover ring-1 ring-[#20df7c]/40" 
                />
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white leading-tight">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-[#20df7c] font-mono leading-tight">
                    {formatPrice(user.withdrawableBalanceUSD, currency)}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#8F9A93]" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 w-56 bg-[#121814] border border-[#b7f1d1]/15 rounded-xl shadow-2xl p-2 z-50 text-right animate-in fade-in duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 bg-[#17241C] rounded-lg mb-2">
                    <div className="text-xs text-[#8F9A93]">موجودی در دسترس</div>
                    <div className="text-sm font-bold text-[#20df7c]">
                      {formatPrice(user.withdrawableBalanceUSD, currency)}
                    </div>
                    <div className="text-[11px] text-[#8F9A93] mt-0.5 flex items-center justify-between">
                      <span>در انتظار برداشت:</span>
                      <span className="text-amber-400 font-mono">{formatPrice(user.pendingBalanceUSD, currency)}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => { setActiveView('admin'); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-colors mb-1 shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>ورود به پنل مدیریت</span>
                      </button>
                    )}

                    <button 
                      onClick={() => { setActiveView('wallet'); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#F2F5F3] hover:bg-[#17241C] hover:text-[#20df7c] transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-[#20df7c]" />
                      <span>کیف پول و واریز / برداشت</span>
                    </button>

                    <button 
                      onClick={() => { setActiveView('sell'); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#F2F5F3] hover:bg-[#17241C] hover:text-[#20df7c] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#20df7c]" />
                      <span>آیتم‌های من و Inventory استیم</span>
                    </button>

                    <button 
                      onClick={() => { setActiveView('wallet'); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#F2F5F3] hover:bg-[#17241C] hover:text-[#20df7c] transition-colors"
                    >
                      <History className="w-4 h-4 text-[#20df7c]" />
                      <span>تاریخچه تراکنش‌ها</span>
                    </button>

                    <div className="border-t border-[#b7f1d1]/10 my-1" />

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>خروج از حساب کاربری</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => setActiveView('auth')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#171a21] to-[#212b36] hover:from-[#1b2838] hover:to-[#2b3846] text-white border border-[#66c0f4]/30 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#66c0f4] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-10 9.77c0 .61.06 1.21.17 1.8l5.22 2.14a3.17 3.17 0 0 1 1.77-.54c.2 0 .4.02.59.06l2.84-4.11a3.56 3.56 0 1 1 5.03 4.29l-4.11 2.84c.04.19.06.39.06.59a3.57 3.57 0 0 1-5.83 2.74L2.83 17.5A10 10 0 1 0 12 2zm-3.8 15.63a1.78 1.78 0 1 0-1.78-1.78c0 .98.8 1.78 1.78 1.78zm7.14-5.36a1.79 1.79 0 1 0 0-3.57 1.79 1.79 0 0 0 0 3.57z" />
              </svg>
              <span>ورود با استیم</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
