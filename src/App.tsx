import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Storefront } from './components/customer/Storefront';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderHistoryModal } from './components/customer/OrderHistoryModal';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { AccessDenied } from './components/common/AccessDenied';
import { Product } from './types';

function MainMarketplaceApp() {
  const { currentUser, isLoggedIn } = useStore();

  const [activeView, setActiveView] = useState<'store' | 'vendor' | 'admin'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Require login to checkout: Guests must sign in before order completion
  const handleProceedToCheckout = () => {
    if (!isLoggedIn || !currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] text-[#313133] selection:bg-[#F68B1E] selection:text-white">
      {/* Responsive Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => {
          if (!isLoggedIn) {
            setIsAuthOpen(true);
          } else {
            setIsOrderHistoryOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
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
            <VendorDashboard />
          ) : (
            <AccessDenied
              viewType="vendor"
              onBackToStore={() => setActiveView('store')}
              onOpenAuth={() => setIsAuthOpen(true)}
              isLoggedIn={isLoggedIn}
            />
          )
        )}

        {/* Admin Panel: Protected by AccessDenied for guests and non-admins */}
        {activeView === 'admin' && (
          isLoggedIn && currentUser?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <AccessDenied
              viewType="admin"
              onBackToStore={() => setActiveView('store')}
              onOpenAuth={() => setIsAuthOpen(true)}
              isLoggedIn={isLoggedIn}
            />
          )
        )}
      </main>

      {/* Marketplace Footer */}
      <Footer onOpenVendorHub={() => setActiveView('vendor')} />

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

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
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
