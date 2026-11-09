import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Grid } from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  setActiveView: (view: 'store' | 'vendor' | 'admin') => void;
}

/**
 * CategoryBar Component
 * Horizontally scrollable sub-header row for categories.
 * Features:
 * - Hidden scrollbar (.no-scrollbar)
 * - Right edge fade indicator
 * - 8px spacing, clean clickable pills with active orange state
 */
export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  setSelectedCategory,
  setActiveView,
}) => {
  const { categories } = useStore();

  return (
    <div className="relative bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Horizontal scroll container with hidden scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar text-xs">
          {/* "All Categories" button */}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveView('store');
            }}
            className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-all flex items-center gap-1.5 ${
              selectedCategory === null
                ? 'bg-[#F68B1E] text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>All</span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setActiveView('store');
                }}
                className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-all ${
                  isSelected
                    ? 'bg-[#F68B1E] text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Edge Fade Mask */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
};
