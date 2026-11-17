import React, { useState, useEffect, useCallback } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Storefront } from './components/customer/Storefront';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderHistoryModal } from './components/customer/OrderHistoryModal';
import { ProfileModal } from './components/customer/ProfileModal';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { AccessDenied } from './components/common/AccessDenied';
import { Product } from './types';
import { InfoPage } from './components/common/InfoPage';
import { INFO_PAGES } from './data/infoPages';
import { CheckCircle2, LogOut, AlertTriangle, X } from 'lucide-react';

function normalizeSlug(raw: string): string {
  const clean = raw.replace(/^#\/?/, '').trim();
  if (INFO_PAGES[clean]) return clean;
  // Aliases without prefixes
  if (clean === 'how-to-shop') return 'help/how-to-shop';
  if (clean === 'delivery') return 'help/delivery';
  if (clean === 'payments') return 'help/payments';
  if (clean === 'returns') return 'help/returns';
  if (clean === 'report') return 'help/report';
  if (clean === 'guidelines') return 'sell/guidelines';
  if (clean === 'fulfilment' || clean === 'fulfillment') return 'sell/fulfilment';
  return clean;
}

function MainMarketplaceApp() {
  const {
    currentUser,
    isLoggedIn,
    logout,
    isConfirmLogoutOpen,
    setIsConfirmLogoutOpen,
    toastMessage,
    dismissToast,
    registerOnLogout,
  } = useStore();

  const [activeView, setActiveView] = useState<'store' | 'vendor' | 'admin' | 'info'>('store');
  const [currentInfoSlug, setCurrentInfoSlug] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<'customer' | 'vendor'>('customer');

  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role: 'customer' | 'vendor' = 'customer') => {
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    setIsAuthOpen(true);
  };

  const navigateToView = useCallback(
    (view: 'store' | 'vendor' | 'admin' | 'info') => {
      if (view === 'vendor' || view === 'admin') {
        if (isLoggedIn && currentUser?.role === view) {
          window.history.pushState({ view }, '', `#/${view}`);
        }
        setActiveView(view);
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      if (view === 'info') {
        setActiveView('info');
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      if (window.location.hash) {
        window.history.pushState({ view: 'store' }, '', window.location.pathname + window.location.search);
      }
      setActiveView('store');
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [isLoggedIn, currentUser]
  );

  // Close all modals/dropdowns, navigate to store home, replace dashboard history & scroll top on logout
  useEffect(() => {
    return registerOnLogout(() => {
      setDetailProduct(null);
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
      setIsOrderHistoryOpen(false);
      setIsProfileOpen(false);
      setIsAuthOpen(false);
      setActiveView('store');
      window.history.replaceState(
        { view: 'store' },
        '',
        window.location.pathname + window.location.search
      );
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [registerOnLogout]);

  // Close Confirm Logout modal on Escape key
  useEffect(() => {
    if (!isConfirmLogoutOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsConfirmLogoutOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfirmLogoutOpen, setIsConfirmLogoutOpen]);

  // Simple hash & popstate router that prevents Back button from showing a dashboard after logout
  useEffect(() => {
    const syncFromLocation = () => {
      const hash = window.location.hash;
      const stateView = (window.history.state as { view?: string } | null)?.view;

      if (hash === '#/vendor' || hash === '#vendor' || stateView === 'vendor') {
        if (!isLoggedIn || currentUser?.role !== 'vendor') {
          window.history.replaceState(
            { view: 'store' },
            '',
            window.location.pathname + window.location.search
          );
          setActiveView('store');
          return;
        }
        setActiveView('vendor');
        return;
      }

      if (hash === '#/admin' || hash === '#admin' || stateView === 'admin') {
        if (!isLoggedIn || currentUser?.role !== 'admin') {
          window.history.replaceState(
            { view: 'store' },
            '',
            window.location.pathname + window.location.search
          );
          setActiveView('store');
          return;
        }
        setActiveView('admin');
        return;
      }

      if (hash.startsWith('#/')) {
        const slug = normalizeSlug(hash);
        if (slug) {
          setCurrentInfoSlug(slug);
          setActiveView('info');
          return;
        }
      }

      if (!hash || hash === '#' || hash === '#/') {
        if (activeView !== 'store') {
          setActiveView('store');
        }
      }
    };

    syncFromLocation();

    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, [activeView, isLoggedIn, currentUser]);

  const handleBackToShop = () => {
    navigateToView('store');
  };

  // Require login to checkout: Guests must sign in before order completion
  const handleProceedToCheckout = () => {
    if (!isLoggedIn || !currentUser) {
      handleOpenAuth('login', 'customer');
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-[#313133] selection:bg-[#F68B1E] selection:text-white">
      {/* Responsive Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={navigateToView}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => {
          if (!isLoggedIn) {
            handleOpenAuth('login', 'customer');
          } else {
            setIsOrderHistoryOpen(true);
          }
        }}
        onOpenProfile={() => {
          if (!isLoggedIn) {
            handleOpenAuth('login', 'customer');
          } else {
            setIsProfileOpen(true);
          }
        }}
        onOpenAuth={() => handleOpenAuth('login', 'customer')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {activeView === 'store' && (
          <Storefront
            onSelectProduct={(product) => setDetailProduct(product)}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
          />
        )}

        {/* Vendor Room: Protected by AccessDenied for guests and non-vendors */}
        {activeView === 'vendor' && (
          isLoggedIn && currentUser?.role === 'vendor' ? (
            <VendorDashboard onBackToStore={() => navigateToView('store')} />
          ) : (
            <AccessDenied
              viewType="vendor"
              onBackToStore={() => navigateToView('store')}
              onOpenAuth={() => handleOpenAuth('login', 'vendor')}
              isLoggedIn={isLoggedIn}
            />
          )
        )}

        {/* Admin Panel: Protected by AccessDenied for guests and non-admins */}
        {activeView === 'admin' && (
          isLoggedIn && currentUser?.role === 'admin' ? (
            <AdminDashboard onBackToStore={() => navigateToView('store')} />
          ) : (
            <AccessDenied
              viewType="admin"
              onBackToStore={() => navigateToView('store')}
              onOpenAuth={() => handleOpenAuth('login', 'customer')}
              isLoggedIn={isLoggedIn}
            />
          )
        )}

        {/* Documentation / Info Pages */}
        {activeView === 'info' && (
          <InfoPage
            pageData={INFO_PAGES[currentInfoSlug] || null}
            requestedSlug={currentInfoSlug}
            onBackToShop={handleBackToShop}
            onOpenRegisterVendor={() => handleOpenAuth('register', 'vendor')}
            onOpenVendorRoom={() => navigateToView('vendor')}
          />
        )}
      </main>

      {/* Marketplace Footer */}
      <Footer
        onOpenVendorHub={() => navigateToView('vendor')}
        setActiveView={navigateToView}
        onOpenAuth={handleOpenAuth}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => {}}
      />

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenOrders={() => {
          setIsProfileOpen(false);
          setIsOrderHistoryOpen(true);
        }}
        onOpenPortal={(view) => navigateToView(view)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        initialRole={authInitialRole}
      />

      {/* Confirm Logout Dialog (shown when cart has items) */}
      {isConfirmLogoutOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-logout-title"
        >
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 id="confirm-logout-title" className="text-base font-bold text-slate-900">
                  Log out? Your cart will be cleared.
                </h2>
                <p className="text-xs text-slate-500">
                  Signing out will remove the items currently in your shopping cart.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmLogoutOpen(false)}
                aria-label="Cancel log out"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => logout()}
                aria-label="Confirm log out"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainMarketplaceApp />
    </StoreProvider>
  );
}
