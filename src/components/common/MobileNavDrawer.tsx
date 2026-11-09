import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  ShoppingBag,
  Package,
  Store,
  Shield,
  User,
  LogIn,
  LogOut,
  ChevronRight,
  Phone,
  HelpCircle,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  setActiveView: (view: 'store' | 'vendor' | 'admin') => void;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
}

/**
 * MobileNavDrawer Component
 * Slide-out navigation drawer for mobile screens (≤768px).
 * Displays category navigation, customer account links, and vendor/admin portals.
 */
export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  setActiveView,
  onOpenAuth,
  onOpenOrders,
}) => {
  const { categories, currentUser, isLoggedIn, logout } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="p-4 bg-[#F68B1E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-[#F68B1E] flex items-center justify-center font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">MegaMarket</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status Card */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          {isLoggedIn ? (
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-medium">Signed in as</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {currentUser?.fullName || 'User'}
              </p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                {currentUser?.role || 'Customer'}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                Welcome to MegaMarket! Sign in for full experience.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="flex-1 bg-[#F68B1E] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 min-h-[40px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>SIGN IN</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="flex-1 border border-slate-300 bg-white text-slate-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center min-h-[40px]"
                >
                  REGISTER
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {/* Quick Account Links */}
          <div className="py-2">
            <button
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span>My Orders</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Role Links */}
            {isLoggedIn && currentUser?.role === 'vendor' && (
              <button
                onClick={() => {
                  onClose();
                  setActiveView('vendor');
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Vendor Dashboard</span>
                </span>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </button>
            )}

            {isLoggedIn && currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  onClose();
                  setActiveView('admin');
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-purple-700 hover:bg-purple-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">Admin Panel</span>
                </span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>
            )}
          </div>

          {/* Categories Section */}
          <div className="py-3">
            <div className="px-4 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Browse Categories
            </div>

            <button
              onClick={() => {
                setSelectedCategory(null);
                setActiveView('store');
                onClose();
              }}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between ${
                selectedCategory === null
                  ? 'bg-orange-50 text-[#F68B1E] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>All Products & Categories</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setActiveView('store');
                  onClose();
                }}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between ${
                  selectedCategory === cat.slug
                    ? 'bg-orange-50 text-[#F68B1E] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>

          {/* Help & Contact */}
          <div className="py-3 px-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Customer Care: 0700 123 456</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help Center & FAQs</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        {isLoggedIn && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full py-2 px-3 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors min-h-[40px]"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>LOG OUT</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
