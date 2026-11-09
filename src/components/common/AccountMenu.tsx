import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  User as UserIcon,
  ChevronDown,
  ShoppingBag,
  LogOut,
  Store,
  Shield,
  LogIn,
  UserPlus,
  Package,
} from 'lucide-react';

interface AccountMenuProps {
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  setActiveView: (view: 'store' | 'vendor' | 'admin') => void;
}

/**
 * AccountMenu Component
 * Clean, Jumia/Kilimall-style Account button and dropdown.
 * - Logged out: Displays Account icon with "Sign In" and "Register" actions.
 * - Logged in: Displays user's name with dropdown containing My Orders, Profile,
 *   Role-restricted Dashboard links (Vendor/Admin only), and Logout.
 */
export const AccountMenu: React.FC<AccountMenuProps> = ({
  onOpenAuth,
  onOpenOrders,
  setActiveView,
}) => {
  const { currentUser, isLoggedIn, logout } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Account';

  return (
    <div className="relative" ref={menuRef}>
      {/* Account trigger button (min 44px tap target) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:text-[#F68B1E] hover:bg-slate-50 transition-colors min-h-[44px]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User Account Menu"
      >
        <UserIcon className="w-5 h-5 text-slate-700 shrink-0" />
        <div className="hidden lg:flex flex-col text-left leading-tight">
          <span className="text-[11px] text-slate-500">
            {isLoggedIn ? 'Hello,' : 'Welcome'}
          </span>
          <span className="text-sm font-semibold text-slate-900 truncate max-w-[110px]">
            {isLoggedIn ? firstName : 'Sign In'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden lg:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Account Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {!isLoggedIn ? (
            // LOGGED OUT STATE
            <div className="p-3 border-b border-slate-100 space-y-2">
              <p className="text-xs text-slate-600 mb-2">
                Sign in to track orders, manage your account and checkout faster.
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuth();
                }}
                className="w-full min-h-[44px] bg-[#F68B1E] hover:bg-[#E07A15] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>SIGN IN</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuth();
                }}
                className="w-full min-h-[44px] border border-[#F68B1E] text-[#F68B1E] hover:bg-orange-50 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>CREATE ACCOUNT</span>
              </button>
            </div>
          ) : (
            // LOGGED IN STATE
            <>
              {/* User Identity Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {currentUser?.fullName || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email || ''}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {currentUser?.role || 'Guest'}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenOrders();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-[#F68B1E] flex items-center gap-2.5 transition-colors"
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>My Orders</span>
                </button>

                {/* Role-Restricted Link: Vendor Room */}
                {currentUser?.role === 'vendor' && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setActiveView('vendor');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Store className="w-4 h-4 text-blue-600" />
                    <span>Vendor Dashboard</span>
                  </button>
                )}

                {/* Role-Restricted Link: Admin Panel */}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setActiveView('admin');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </div>

              {/* Logout Action */}
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
