import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { SUPPORTED_CURRENCIES, CURRENCY_MAP } from '../../data/currencies';
import { ChevronDown, Search, Check, Clock, AlertCircle, X } from 'lucide-react';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, ratesData } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open & handle Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter currencies: Only show a currency if the rates response contains it (or fallback)
  const availableCurrencies = useMemo(() => {
    return SUPPORTED_CURRENCIES.filter((c) => {
      // If ratesData is loaded, verify currency is present in rates
      if (ratesData?.rates) {
        return Boolean(ratesData.rates[c.code]);
      }
      // If ratesData hasn't loaded yet, show all supported
      return true;
    });
  }, [ratesData]);

  // Filter by search query
  const filteredCurrencies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return availableCurrencies;
    return availableCurrencies.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query)
    );
  }, [availableCurrencies, searchQuery]);

  const africanCurrencies = useMemo(
    () => filteredCurrencies.filter((c) => c.region === 'Africa'),
    [filteredCurrencies]
  );

  const worldCurrencies = useMemo(
    () => filteredCurrencies.filter((c) => c.region === 'World'),
    [filteredCurrencies]
  );

  const currentCurrency = CURRENCY_MAP[currency] || {
    code: currency,
    name: currency,
    symbol: currency,
    flag: '🌍',
  };

  // Format update time
  const formattedUpdateTime = useMemo(() => {
    if (!ratesData?.time_last_update_utc) return null;
    try {
      const date = new Date(ratesData.time_last_update_utc);
      if (isNaN(date.getTime())) return ratesData.time_last_update_utc;
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ratesData.time_last_update_utc;
    }
  }, [ratesData]);

  const isEstimated = Boolean(ratesData?.stale || ratesData?.fallback);

  const selectCurrency = (code: string) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button (meets 44px tap target requirements) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Select currency, currently ${currentCurrency.code} (${currentCurrency.name})`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-lg text-white hover:text-[#F68B1E] hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer select-none text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F68B1E]"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {currentCurrency.flag}
        </span>
        <span className="font-bold tracking-wide">{currentCurrency.code}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Currency selection"
          className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-1.5 w-auto sm:w-80 max-h-[85vh] sm:max-h-[480px] bg-[#1E1E22] text-slate-100 rounded-2xl shadow-2xl border border-neutral-700/80 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header & Search */}
          <div className="p-3 border-b border-neutral-800 bg-[#25252A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Choose Display Currency
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors sm:hidden"
                aria-label="Close currency menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input (accessible & 44px touch target) */}
            <div className="relative">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search currency or country..."
                className="w-full bg-[#18181B] text-slate-100 placeholder-neutral-500 text-xs pl-9 pr-8 py-2.5 min-h-[40px] rounded-xl border border-neutral-700 focus:outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Currency List (Grouped by Africa and Popular Worldwide) */}
          <div
            role="listbox"
            tabIndex={0}
            className="overflow-y-auto flex-1 divide-y divide-neutral-800/60 p-1.5 scrollbar-thin scrollbar-thumb-neutral-700"
          >
            {filteredCurrencies.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                No currency matches &quot;{searchQuery}&quot;
              </div>
            ) : (
              <>
                {/* African Currencies Group */}
                {africanCurrencies.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Africa</span>
                      <span className="text-[10px] text-neutral-500 font-normal">
                        {africanCurrencies.length} currencies
                      </span>
                    </div>
                    {africanCurrencies.map((c) => {
                      const isSelected = currency === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => selectCurrency(c.code)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-left text-xs transition-colors cursor-pointer group ${
                            isSelected
                              ? 'bg-[#F68B1E]/15 text-[#F68B1E] font-bold'
                              : 'text-neutral-200 hover:bg-neutral-800/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg shrink-0" aria-hidden="true">
                              {c.flag}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-100">{c.code}</span>
                                <span className="text-neutral-400 text-[11px]">· {c.symbol}</span>
                              </div>
                              <div className="text-[11px] text-neutral-400 truncate">
                                {c.name}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#F68B1E] shrink-0 ml-2" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Popular Worldwide Group */}
                {worldCurrencies.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Popular Worldwide</span>
                      <span className="text-[10px] text-neutral-500 font-normal">
                        {worldCurrencies.length} currencies
                      </span>
                    </div>
                    {worldCurrencies.map((c) => {
                      const isSelected = currency === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => selectCurrency(c.code)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-left text-xs transition-colors cursor-pointer group ${
                            isSelected
                              ? 'bg-[#F68B1E]/15 text-[#F68B1E] font-bold'
                              : 'text-neutral-200 hover:bg-neutral-800/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg shrink-0" aria-hidden="true">
                              {c.flag}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-100">{c.code}</span>
                                <span className="text-neutral-400 text-[11px]">· {c.symbol}</span>
                              </div>
                              <div className="text-[11px] text-neutral-400 truncate">
                                {c.name}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#F68B1E] shrink-0 ml-2" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Metadata & Rates Status */}
          <div className="p-2.5 px-3 bg-[#18181B] border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-1">
              {formattedUpdateTime ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" aria-hidden="true" />
                  <span>Rates updated: {formattedUpdateTime}</span>
                </span>
              ) : (
                <span>Live rates</span>
              )}

              {isEstimated && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" />
                  <span>Estimated rates</span>
                </span>
              )}
            </div>

            <div className="text-[10px] text-neutral-500 pt-0.5">
              <span>Checkout is processed in KES. </span>
              <a
                href="https://www.exchangerate-api.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F68B1E] hover:underline"
              >
                Rates By Exchange Rate API
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
