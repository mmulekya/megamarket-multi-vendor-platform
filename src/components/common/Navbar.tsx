import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Menu,
  Clock,
  Store,
  Shield,
  X,
} from 'lucide-react';
import { PromoStrip } from './PromoStrip';
import { AccountMenu } from './AccountMenu';
import { CategoryBar } from './CategoryBar';
import { MobileNavDrawer } from './MobileNavDrawer';

interface NavbarProps {
  activeView: 'store' | 'vendor' | 'admin';
  setActiveView: (view: 'store' | 'vendor' | 'admin') => void;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenAuth: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

/**
 * Navbar Component (Phase 1 Clean-Up)
 * Professional Jumia/Kilimall style marketplace header.
 * - Real promo strip at top
 * - Prominent, centered search bar
 * - Clearly labelled action icons: Account, Orders, Cart
 * - Role-restricted navigation (Vendor/Admin links shown ONLY to authorized users)
 * - Mobile hamburger drawer and horizontal category bar
 */
export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenCart,
  onOpenOrders,
  onOpenAuth,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { currentUser, isLoggedIn, cartCount, cartTotal, formatPrice, publicProducts } = useStore();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Instant autocomplete suggestions
  const searchSuggestions = searchQuery.trim()
    ? publicProducts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView('store');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* 1. Real-World Promo Strip */}
      <PromoStrip />

      {/* 2. Main Navigation Bar */}
      <div className="border-b border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            {/* Mobile Hamburger & Logo Lockup */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                aria-label="Open categories menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo (Jumia/Kilimall style crisp wordmark) */}
              <button
                onClick={() => {
                  setActiveView('store');
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 group text-left min-h-[44px]"
                aria-label="MegaMarket Home"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F68B1E] flex items-center justify-center text-white font-extrabold shadow-xs group-hover:bg-[#E07A15] transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                    Mega<span className="text-[#F68B1E]">Market</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
                    East Africa
                  </span>
                </div>
              </button>
            </div>

            {/* 3. Large Search Bar (The Core Focus of the Header) */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-2xl relative hidden md:block"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search products, brands and categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full pl-11 pr-24 py-2.5 bg-slate-50 hover:bg-white focus:bg-white text-sm rounded-lg border border-slate-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all outline-none min-h-[44px]"
                  aria-label="Search products"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-24 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-1 px-5 py-2 bg-[#F68B1E] hover:bg-[#E07A15] text-white rounded-md text-xs font-bold transition-colors min-h-[36px]"
                >
                  SEARCH
                </button>
              </div>

              {/* Instant Search Suggestions Dropdown */}
              {isSearchFocused && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    Suggested Products
                  </div>
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => {
                        setSearchQuery(item.title);
                        setActiveView('store');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-orange-50/60 flex items-center justify-between gap-3 text-xs transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={item.image}
                          alt=""
                          className="w-7 h-7 rounded object-cover shrink-0"
                        />
                        <span className="font-medium text-slate-800 truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="font-bold text-[#F68B1E] shrink-0">
                        {formatPrice(item.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* 4. Right Navigation Actions (Labelled Icons) */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Role-Restricted Portals: Shown ONLY to users with that role */}
              {isLoggedIn && currentUser?.role === 'vendor' && (
                <button
                  onClick={() => setActiveView('vendor')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[44px] ${
                    activeView === 'vendor'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                  }`}
                  aria-label="Vendor Room"
                >
                  <Store className="w-4 h-4" />
                  <span>Vendor Room</span>
                </button>
              )}

              {isLoggedIn && currentUser?.role === 'admin' && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[44px] ${
                    activeView === 'admin'
                      ? 'bg-purple-700 text-white'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                  aria-label="Admin Panel"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}

              {/* Account Dropdown Menu */}
              <AccountMenu
                onOpenAuth={onOpenAuth}
                onOpenOrders={onOpenOrders}
                setActiveView={setActiveView}
              />

              {/* Orders Link */}
              <button
                onClick={onOpenOrders}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-slate-700 hover:text-[#F68B1E] hover:bg-slate-50 transition-colors min-h-[44px]"
                aria-label="View Order History"
              >
                <Clock className="w-5 h-5 text-slate-700 shrink-0" />
                <span className="hidden lg:inline text-sm font-semibold text-slate-900">
                  Orders
                </span>
              </button>

              {/* Cart Button (with orange badge and item count) */}
              <button
                onClick={onOpenCart}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:text-[#F68B1E] hover:bg-orange-50/50 transition-colors relative min-h-[44px]"
                aria-label={`Shopping Cart, ${cartCount} items`}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-slate-900" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#F68B1E] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight">
                  <span className="text-[11px] text-slate-500">Cart</span>
                  <span className="text-xs font-bold text-[#F68B1E]">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (Displayed below header on mobile) */}
          <div className="mt-2.5 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products, brands and categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 bg-slate-100 text-sm rounded-lg border border-slate-200 focus:bg-white focus:border-[#F68B1E] outline-none min-h-[44px]"
                aria-label="Search products"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3.5 bg-[#F68B1E] text-white rounded-md text-xs font-bold"
              >
                SEARCH
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 5. Sub-Header Horizontally Scrollable Category Bar (Mobile & Tablet) */}
      <div className="lg:hidden">
        <CategoryBar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setActiveView={setActiveView}
        />
      </div>

      {/* 6. Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setActiveView={setActiveView}
        onOpenAuth={onOpenAuth}
        onOpenOrders={onOpenOrders}
      />
    </header>
  );
};
