import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Smartphone,
  Laptop,
  Shirt,
  Apple,
  Home,
  Sparkles,
  ChevronRight,
  Grid,
} from 'lucide-react';

interface CategorySidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  className?: string;
}

// Icon mapper for categories
const getCategoryIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'smartphone':
      return <Smartphone className="w-4 h-4" />;
    case 'laptop':
      return <Laptop className="w-4 h-4" />;
    case 'shirt':
      return <Shirt className="w-4 h-4" />;
    case 'apple':
      return <Apple className="w-4 h-4" />;
    case 'home':
      return <Home className="w-4 h-4" />;
    case 'sparkles':
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Grid className="w-4 h-4" />;
  }
};

/**
 * CategorySidebar Component
 * Desktop sidebar menu on the left of the home page (Jumia/Kilimall pattern).
 * Displays a clean vertical menu of categories alongside the hero banner.
 */
export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  className = '',
}) => {
  const { categories } = useStore();

  return (
    <aside
      className={`bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden ${className}`}
      aria-label="Category Navigation"
    >
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-[#F68B1E]" />
          <span>Categories</span>
        </span>
      </div>

      <nav className="divide-y divide-slate-100 py-1 text-sm">
        {/* All Categories Option */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
            selectedCategory === null
              ? 'bg-orange-50 text-[#F68B1E] font-bold border-l-2 border-[#F68B1E]'
              : 'text-slate-700 hover:bg-slate-50 hover:text-[#F68B1E]'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <span className="text-slate-400">
              <Grid className="w-4 h-4" />
            </span>
            <span className="text-xs font-medium">All Categories</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Dynamic Category Items */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
                isSelected
                  ? 'bg-orange-50 text-[#F68B1E] font-bold border-l-2 border-[#F68B1E]'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-[#F68B1E]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <span className={isSelected ? 'text-[#F68B1E]' : 'text-slate-400'}>
                  {getCategoryIcon(cat.icon)}
                </span>
                <span className="text-xs font-medium truncate">{cat.name}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
