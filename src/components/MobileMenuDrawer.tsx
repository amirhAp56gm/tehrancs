import React from 'react';
import { X, ShieldCheck, User, LogOut } from 'lucide-react';
import { Currency, UserAccount, ActiveView } from '../types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  currency?: Currency;
  user: UserAccount | null;
  onSteamLogin: () => void;
  onLogout: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  currency = 'IRR',
  user,
  onSteamLogin,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-right lg:hidden">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#1d1d1f] border-l border-white/10 shadow-2xl p-4 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <img src="https://i.postimg.cc/jd0sH0kD/logo.png" alt="تهران cs" referrerPolicy="no-referrer" className="w-7 h-7 object-contain" />
              <span className="font-black text-lg text-white">تهران cs</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#8F9A93] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Section */}
          {user ? (
            <div className="p-3 bg-[#161617] rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-md" />
                  <div>
                    <div className="text-xs font-bold text-white">{user.username}</div>
                    <div className="text-[10px] text-[#20df7c]">
                      {user.role === 'admin' ? 'مدیر ارشد پلتفرم' : 'کاربر فعال'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { onLogout(); onClose(); }}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                  title="خروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setActiveView('auth'); onClose(); }}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black font-black text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <User className="w-4 h-4 text-black" />
              <span>ورود به حساب کاربری</span>
            </button>
          )}

          {/* Nav items */}
          <nav className="space-y-1 text-sm font-semibold">
            {user?.role === 'admin' && (
              <button
                onClick={() => { setActiveView('admin'); onClose(); }}
                className={`w-full text-right px-3 py-2 rounded-xl transition-colors font-bold ${
                  activeView === 'admin' ? 'bg-white text-black' : 'bg-amber-400/10 text-amber-400'
                }`}
              >
                پنل مدیریت کل (Admin)
              </button>
            )}

            <button
              onClick={() => { setActiveView('market'); onClose(); }}
              className={`w-full text-right px-3 py-2 rounded-xl transition-colors ${
                activeView === 'market' ? 'bg-[#20df7c]/15 text-[#20df7c]' : 'text-[#F2F5F3] hover:bg-[#161617]'
              }`}
            >
              بازار اسکین‌ها
            </button>
            <button
              onClick={() => { setActiveView('sell'); onClose(); }}
              className={`w-full text-right px-3 py-2 rounded-xl transition-colors ${
                activeView === 'sell' ? 'bg-[#20df7c]/15 text-[#20df7c]' : 'text-[#F2F5F3] hover:bg-[#161617]'
              }`}
            >
              فروش اسکین (اینونتوری)
            </button>
            {user && (
              <button
                onClick={() => { setActiveView('wallet'); onClose(); }}
                className={`w-full text-right px-3 py-2 rounded-xl transition-colors ${
                  activeView === 'wallet' ? 'bg-[#20df7c]/15 text-[#20df7c]' : 'text-[#F2F5F3] hover:bg-[#161617]'
                }`}
              >
                کیف پول و تسویه
              </button>
            )}
          </nav>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-[#8F9A93] space-y-2 border-t border-white/10 pt-3">
          <div className="flex items-center gap-1.5 text-[#20df7c]">
            <ShieldCheck className="w-4 h-4" />
            <span>پلتفرم امن P2P تهران cs</span>
          </div>
          <a
            href="https://t.me/tehrancs_support"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[#8F9A93] hover:text-[#229ED9] transition-colors"
          >
            پشتیبانی
          </a>
        </div>
      </div>
    </div>
  );
};
