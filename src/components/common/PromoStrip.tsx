import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Truck, Phone, ChevronDown } from 'lucide-react';

/**
 * PromoStrip Component
 * A thin real-world announcement strip above the main navigation header.
 * Displays legitimate store policies and a working currency switcher.
 */
export const PromoStrip: React.FC = () => {
  const { currency, setCurrency } = useStore();

  return (
    <div className="bg-[#27272A] text-slate-200 text-xs py-1.5 px-4 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
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

        {/* Right: Working Currency Switcher & Customer Helpline */}
        <div className="flex items-center gap-4 shrink-0 text-[11px]">
          <div className="hidden sm:flex items-center gap-1 text-neutral-300">
            <Phone className="w-3 h-3 text-amber-400" />
            <span>Helpline: 0700 123 456</span>
          </div>

          <div className="flex items-center gap-1 text-neutral-300 pl-3 border-l border-neutral-700">
            <span className="text-neutral-400">Currency:</span>
            <div className="relative inline-block">
              <select
                aria-label="Select currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'KES' | 'USD')}
                className="bg-transparent text-white font-bold cursor-pointer outline-none hover:text-[#F68B1E] transition-colors pr-3"
              >
                <option value="KES" className="bg-[#27272A] text-white">KES</option>
                <option value="USD" className="bg-[#27272A] text-white">USD</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
