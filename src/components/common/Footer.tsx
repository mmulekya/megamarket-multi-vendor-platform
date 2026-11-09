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
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';

interface FooterProps {
  onOpenVendorHub: () => void;
}

/**
 * Footer Component (Phase 1 Clean-Up)
 * Professional, friendly marketplace footer in the style of Jumia/Kilimall.
 * Features:
 * - Top customer trust pillars
 * - Four structured content sections: About, Help Center, Sell on MegaMarket, Payment & Socials
 * - Collapsible accordion sections on mobile (screens < 768px) for compact footprint
 * - Authentic M-Pesa, Card, and Cash on Delivery payment tags
 */
export const Footer: React.FC<FooterProps> = ({ onOpenVendorHub }) => {
  // Mobile accordion state for collapsible footer sections
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    about: false,
    help: false,
    sell: false,
    payment: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <footer className="bg-[#27272A] text-slate-300 mt-12 border-t border-neutral-800 text-xs">
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
                <li><span className="hover:text-white transition-colors cursor-pointer">About Us</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Careers & News</span></li>
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
              <div><span className="hover:text-white transition-colors cursor-pointer">How to Shop on MegaMarket</span></div>
              <div><span className="hover:text-white transition-colors cursor-pointer">Delivery Options & Timelines</span></div>
              <div><span className="hover:text-white transition-colors cursor-pointer">Payment & Lipa Na M-Pesa Guide</span></div>
              <div><span className="hover:text-white transition-colors cursor-pointer">Returns & Refund Policy</span></div>
              <div><span className="hover:text-white transition-colors cursor-pointer">Report an Issue / Counterfeit</span></div>
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
                onClick={onOpenVendorHub}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F68B1E] hover:bg-[#E07A15] text-white font-bold rounded-lg text-[11px] transition-colors min-h-[38px]"
              >
                <Store className="w-3.5 h-3.5" />
                <span>VENDOR ROOM</span>
              </button>
              <ul className="space-y-1 text-[11px] text-neutral-400 pt-1">
                <li><span className="hover:text-white transition-colors cursor-pointer">Merchant Guidelines</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Seller Fulfillment Policies</span></li>
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

              {/* Contact Info */}
              <div className="space-y-1 text-[11px] text-neutral-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>+254 700 123 456 (08:00 - 20:00)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>support@megamarket.co.ke</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Kilimani, Nairobi, Kenya</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar: Copyright & Clean Brand Note */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">Mega<span className="text-[#F68B1E]">Market</span></span>
            <span>·</span>
            <span>© 2026 MegaMarket East Africa Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="hover:text-white cursor-pointer transition-colors">Security</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
