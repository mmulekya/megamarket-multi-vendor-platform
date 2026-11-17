import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Package,
  LogOut,
  Store,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
  onOpenPortal?: (view: 'vendor' | 'admin') => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenPortal,
}) => {
  const { currentUser, isLoggedIn, promptLogout } = useStore();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isLoggedIn || !currentUser) return null;

  const roleBadgeLabel =
    currentUser.role === 'admin'
      ? 'Admin'
      : currentUser.role === 'vendor'
      ? 'Vendor'
      : 'Customer';

  const roleBadgeClasses =
    currentUser.role === 'admin'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : currentUser.role === 'vendor'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-slate-900">
                My Account Profile
              </h2>
              <span className="text-xs text-slate-500">
                Manage your MegaMarket session & account details
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F68B1E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="min-w-0">
              <p className="text-base font-extrabold text-slate-900 truncate">
                {currentUser.fullName}
              </p>
              <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider shrink-0 ${roleBadgeClasses}`}
            >
              {roleBadgeLabel}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </span>
                <span className="font-semibold text-slate-800 truncate block">
                  {currentUser.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Phone Number
                </span>
                <span className="font-semibold text-slate-800">
                  {currentUser.phoneNumber || '+254 700 000 000'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Account Role
                </span>
                <span className="font-semibold text-slate-800">{roleBadgeLabel}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              >
                <Package className="w-4 h-4 text-slate-600" />
                <span>My Orders</span>
              </button>

              {currentUser.role === 'vendor' && onOpenPortal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPortal('vendor');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Vendor Room</span>
                </button>
              )}

              {currentUser.role === 'admin' && onOpenPortal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPortal('admin');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={promptLogout}
              aria-label="Log out of your account"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
