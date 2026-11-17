import React, { useState } from 'react';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Store,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FooterProps {
  onOpenVendorHub?: () => void;
  setActiveView?: (view: 'store' | 'vendor' | 'admin' | 'info') => void;
  onOpenAuth?: (mode?: 'login' | 'register', role?: 'customer' | 'vendor') => void;
}

/**
 * Footer Component
 * Professional, friendly marketplace footer in the style of Jumia/Kilimall:
 * - Top customer trust pillars
 * - Four structured content sections: About, Help Center, Sell on MegaMarket, Payment & Contact
 * - Collapsible accordion sections on mobile (screens < 768px) for compact footprint
 * - Role-aware VENDOR ROOM button
 * - Every link connects to a functional hash route or protocol link (tel:, mailto:)
 */
export const Footer: React.FC<FooterProps> = ({
  onOpenVendorHub,
  setActiveView,
  onOpenAuth,
}) => {
  const { currentUser, currentVendor, isLoggedIn } = useStore();

  // Mobile accordion state for collapsible footer sections
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    about: false,
    help: false,
    sell: false,
    payment: false,
  });

  // Modal alert for pending / suspended vendor status
  const [vendorNotice, setVendorNotice] = useState<{ title: string; message: string; type: 'warning' | 'info' } | null>(null);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * Role-aware click handler for VENDOR ROOM button:
   * - Approved vendor: open the Vendor Room.
   * - Pending or suspended vendor: show a clear message about shop status.
   * - Guest: open the Login screen.
   * - Customer: open the Merchant Guidelines (#/sell/guidelines).
   * - Admin: open the Admin Panel.
   */
  const handleVendorRoomClick = () => {
    if (!isLoggedIn || !currentUser) {
      if (onOpenAuth) {
        onOpenAuth('login');
      }
      return;
    }

    if (currentUser.role === 'admin') {
      if (setActiveView) {
        setActiveView('admin');
      } else if (onOpenVendorHub) {
        onOpenVendorHub();
      }
      return;
    }

    if (currentUser.role === 'customer') {
      window.location.hash = '#/sell/guidelines';
      if (setActiveView) setActiveView('info');
      return;
    }

    if (currentUser.role === 'vendor') {
      const vendorStatus = currentVendor?.status || 'pending';
      if (vendorStatus === 'approved') {
        if (setActiveView) {
          setActiveView('vendor');
        } else if (onOpenVendorHub) {
          onOpenVendorHub();
        }
      } else if (vendorStatus === 'pending') {
        setVendorNotice({
          title: 'Shop Pending Administrator Review',
          message:
            'Your shop application has been submitted and is currently under review by the platform administrator. You will be able to access the Vendor Room and publish catalog items once your store is approved.',
          type: 'info',
        });
      } else if (vendorStatus === 'suspended') {
        setVendorNotice({
          title: 'Store Account Suspended',
          message:
            'Your vendor account has been temporarily suspended by the platform administrator. Please contact our support team at support@megamarket.co.ke to resolve outstanding compliance checks.',
          type: 'warning',
        });
      }
    }
  };

  return (
    <footer className="bg-[#27272A] text-slate-300 mt-12 border-t border-neutral-800 text-xs relative">
      {/* Vendor Status Notice Dialog */}
      {vendorNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    vendorNotice.type === 'warning'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{vendorNotice.title}</h3>
              </div>
              <button
                onClick={() => setVendorNotice(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{vendorNotice.message}</p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setVendorNotice(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Value Proposition Trust Bar */}
      <div className="border-b border-neutral-800 py-6 px-4 bg-[#202023]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-[#F68B1E] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Countrywide Delivery</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Fast logistics across all 47 counties</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">100% Genuine Products</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Vetted merchants & quality guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Safe & Flexible Payment</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">M-Pesa, Cards or Cash on Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Easy 7-Day Returns</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Hassle-free refunds & exchange</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Columns (Desktop Grid / Mobile Collapsible Accordion) */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
          {/* Column 1: About MegaMarket */}
          <div className="border-b md:border-b-0 border-neutral-800 pb-3 md:pb-0">
            <button
              onClick={() => toggleSection('about')}
              className="w-full flex items-center justify-between text-left md:cursor-default py-1 md:py-0"
              aria-expanded={openSections.about}
            >
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                About MegaMarket
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 md:hidden transition-transform ${
                  openSections.about ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 space-y-2 md:block ${openSections.about ? 'block' : 'hidden'}`}>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                MegaMarket is Kenya’s friendly online marketplace connecting verified vendors with customers countrywide for electronics, fashion and daily essentials.
              </p>
              <ul className="space-y-1.5 text-[11px] text-neutral-400">
                <li><a href="#/about" className="hover:text-white transition-colors cursor-pointer">About Us</a></li>
                <li><a href="#/terms" className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</a></li>
                <li><a href="#/privacy" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a href="#/careers" className="hover:text-white transition-colors cursor-pointer">Careers & News</a></li>
              </ul>
            </div>
          </div>

          {/* Column 2: Help Centre */}
          <div className="border-b md:border-b-0 border-neutral-800 pb-3 md:pb-0">
            <button
              onClick={() => toggleSection('help')}
              className="w-full flex items-center justify-between text-left md:cursor-default py-1 md:py-0"
              aria-expanded={openSections.help}
            >
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                Help Centre
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 md:hidden transition-transform ${
                  openSections.help ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 space-y-1.5 md:block ${openSections.help ? 'block' : 'hidden'} text-[11px] text-neutral-400`}>
              <div><a href="#/help/how-to-shop" className="hover:text-white transition-colors cursor-pointer block py-0.5">How to Shop on MegaMarket</a></div>
              <div><a href="#/help/delivery" className="hover:text-white transition-colors cursor-pointer block py-0.5">Delivery Options & Timelines</a></div>
              <div><a href="#/help/payments" className="hover:text-white transition-colors cursor-pointer block py-0.5">Payment & Lipa Na M-Pesa Guide</a></div>
              <div><a href="#/help/returns" className="hover:text-white transition-colors cursor-pointer block py-0.5">Returns & Refund Policy</a></div>
              <div><a href="#/help/report" className="hover:text-white transition-colors cursor-pointer block py-0.5">Report an Issue / Counterfeit</a></div>
            </div>
          </div>

          {/* Column 3: Sell on MegaMarket */}
          <div className="border-b md:border-b-0 border-neutral-800 pb-3 md:pb-0">
            <button
              onClick={() => toggleSection('sell')}
              className="w-full flex items-center justify-between text-left md:cursor-default py-1 md:py-0"
              aria-expanded={openSections.sell}
            >
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                Sell on MegaMarket
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 md:hidden transition-transform ${
                  openSections.sell ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 space-y-2 md:block ${openSections.sell ? 'block' : 'hidden'}`}>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Reach thousands of shoppers across Kenya. Open your store today with zero upfront listing fees.
              </p>
              <button
                onClick={handleVendorRoomClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F68B1E] hover:bg-[#E07A15] text-white font-bold rounded-lg text-[11px] transition-colors min-h-[38px] cursor-pointer"
                title="Open the Vendor Room"
              >
                <Store className="w-3.5 h-3.5" />
                <span>VENDOR ROOM</span>
              </button>
              <ul className="space-y-1 text-[11px] text-neutral-400 pt-1">
                <li><a href="#/sell/guidelines" className="hover:text-white transition-colors cursor-pointer block py-0.5">Merchant Guidelines</a></li>
                <li><a href="#/sell/fulfilment" className="hover:text-white transition-colors cursor-pointer block py-0.5">Seller Fulfilment Policies</a></li>
              </ul>
            </div>
          </div>

          {/* Column 4: Payment Methods & Contact */}
          <div className="pb-3 md:pb-0">
            <button
              onClick={() => toggleSection('payment')}
              className="w-full flex items-center justify-between text-left md:cursor-default py-1 md:py-0"
              aria-expanded={openSections.payment}
            >
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">
                Payments & Contact
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 md:hidden transition-transform ${
                  openSections.payment ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div className={`mt-2.5 space-y-3 md:block ${openSections.payment ? 'block' : 'hidden'}`}>
              {/* Payment Methods Badges */}
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">Payment Options:</span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-1 rounded bg-[#16A34A]/20 text-emerald-300 font-bold border border-emerald-800">
                    M-Pesa STK
                  </span>
                  <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-200 font-medium border border-neutral-700">
                    Visa
                  </span>
                  <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-200 font-medium border border-neutral-700">
                    Mastercard
                  </span>
                  <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-200 font-medium border border-neutral-700">
                    Cash on Delivery
                  </span>
                </div>
              </div>

              {/* Contact Info with tel: and mailto: and link to contact page */}
              <div className="space-y-1 text-[11px] text-neutral-400 pt-1">
                <div>
                  <a
                    href="tel:+254700123456"
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>+254 700 123 456 (08:00 - 19:00)</span>
                  </a>
                </div>
                <div>
                  <a
                    href="mailto:support@megamarket.co.ke"
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>support@megamarket.co.ke</span>
                  </a>
                </div>
                <div>
                  <a
                    href="#/contact"
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>MegaMarket Hub, Kimathi Street, Nairobi</span>
                  </a>
                </div>
                <div className="pt-1">
                  <a
                    href="#/contact"
                    className="text-[#F68B1E] hover:underline font-semibold block text-[11px]"
                  >
                    Visit Contact Desk & Form →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar: Copyright, Coursework Note & Clean Brand Links */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-400 text-[11px]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-black text-white">Mega<span className="text-[#F68B1E]">Market</span></span>
              <span>·</span>
              <span>© 2026 MegaMarket East Africa Ltd.</span>
            </div>
            <span className="hidden sm:inline">·</span>
            <span className="text-neutral-500">Demo project for coursework. Policies and figures are examples.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-neutral-400">
            <a
              href="https://www.exchangerate-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-200 cursor-pointer transition-colors underline decoration-neutral-600 underline-offset-2"
            >
              Rates By Exchange Rate API
            </a>
            <span className="hidden sm:inline">·</span>
            <a href="#/security" className="hover:text-white cursor-pointer transition-colors">Security</a>
            <a href="#/privacy" className="hover:text-white cursor-pointer transition-colors">Privacy</a>
            <a href="#/terms" className="hover:text-white cursor-pointer transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
