import React from 'react';
import { Truck, Phone } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';

/**
 * PromoStrip Component
 * A thin real-world announcement strip above the main navigation header.
 * Displays legitimate store policies and the CurrencySelector dropdown.
 */
export const PromoStrip: React.FC = () => {
  return (
    <div className="bg-[#27272A] text-slate-200 text-xs py-1 px-4 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Authentic Store Commitments */}
        <div className="flex items-center gap-3 overflow-hidden text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5 font-medium text-amber-400">
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>Free delivery in Nairobi on orders over KES 5,000</span>
          </span>
          <span className="hidden md:inline text-neutral-600">|</span>
          <span className="hidden md:inline text-neutral-300">
            Same-day dispatch for orders placed before 2:00 PM
          </span>
        </div>

        {/* Right: Working Currency Selector & Customer Helpline */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-[11px]">
          <div className="hidden sm:flex items-center gap-1 text-neutral-300">
            <Phone className="w-3 h-3 text-amber-400" />
            <span>Helpline: 0700 123 456</span>
          </div>

          <div className="flex items-center gap-1 text-neutral-300 pl-3 border-l border-neutral-700">
            <span className="text-neutral-400 hidden xs:inline">Currency:</span>
            <CurrencySelector />
          </div>
        </div>
      </div>
    </div>
  );
};
