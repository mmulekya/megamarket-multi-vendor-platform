import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Flame,
  Star,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  ShieldCheck,
  Store,
  Tag,
  Zap,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface StorefrontProps {
  onSelectProduct: (product: Product) => void;
  selectedCategory: string | null;
  setSelectedCategory: (slug: string | null) => void;
  searchQuery: string;
}

export const Storefront: React.FC<StorefrontProps> = ({
  onSelectProduct,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
}) => {
  const { publicProducts, categories, vendors, addToCart, formatPrice } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 150000 });
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string | null>(null);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Active category object
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.slug === selectedCategory);
  }, [categories, selectedCategory]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return publicProducts
      .filter((product) => {
        // Category filter
        if (selectedCategory && product.categoryId !== activeCategory?.id) {
          // Check if category slug matches
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && product.categoryId !== cat.id) return false;
        }

        // Vendor filter
        if (selectedVendorFilter && product.vendorId !== selectedVendorFilter) {
          return false;
        }

        // Search query filter (title, description, category, vendor)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = product.title.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchCat = product.categoryName.toLowerCase().includes(q);
          const matchVendor = product.vendorName.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchVendor) return false;
        }

        // Price filter
        if (product.price < priceRange.min || product.price > priceRange.max) {
          return false;
        }

        // In-stock filter
        if (onlyInStock && product.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // default 'featured'
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    publicProducts,
    selectedCategory,
    activeCategory,
    selectedVendorFilter,
    searchQuery,
    priceRange,
    onlyInStock,
    sortBy,
    categories,
  ]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const approvedVendors = vendors.filter((v) => v.status === 'approved');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Banner Section */}
      {!selectedCategory && !searchQuery && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                East Africa Mega Marketplace
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Shop Direct from Verified <span className="text-orange-500">Kenyan Merchants</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Electronics, handcrafted fashion, and Rift Valley fresh produce delivered with
                instant Safaricom M-Pesa Daraja payment.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={() => setSelectedCategory('phones-tablets')}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Explore Tech Deals
                </button>
                <button
                  onClick={() => setSelectedCategory('african-fashion')}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm backdrop-blur transition-all"
                >
                  African Artisans & Wear
                </button>
              </div>
            </div>

            {/* Flash Sale Box Widget */}
            <div className="w-full md:w-80 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Clock className="w-4 h-4 text-amber-300 animate-spin" />
                  Flash Deals
                </span>
                <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded-full font-bold">
                  Ends Today
                </span>
              </div>
              <div className="flex items-center gap-3 bg-black/30 p-2.5 rounded-xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200&auto=format&fit=crop&q=80"
                  alt="Maasai Hoodie"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Maasai Shuka Hoodie</div>
                  <div className="text-[11px] text-slate-300">AfriCraft Handmades</div>
                  <div className="text-amber-400 font-extrabold text-sm">{formatPrice(3800)}</div>
                  <div className="text-[10px] text-slate-400 line-through">{formatPrice(4500)}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 text-center">
                🛡️ Verified East African Merchants & Doorstep Delivery.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Horizontal Banner */}
      {!selectedCategory && !searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-600" />
              Explore by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className="group p-3 bg-white hover:bg-orange-50 rounded-2xl border border-slate-200 hover:border-orange-300 transition-all text-center flex flex-col items-center gap-2 shadow-xs"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 p-0.5 group-hover:scale-110 transition-transform">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-orange-700 leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400">{cat.itemCount || 10}+ items</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Controls Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Title & Count */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {selectedCategory
                ? activeCategory?.name || 'Category'
                : searchQuery
                ? `Results for "${searchQuery}"`
                : 'All Marketplace Products'}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {filteredProducts.length} items available
            </span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-orange-600 hover:underline font-semibold ml-2"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Filter Modifiers */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Vendor Filter */}
            <select
              value={selectedVendorFilter || ''}
              onChange={(e) => setSelectedVendorFilter(e.target.value || null)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-orange-500"
            >
              <option value="">All Approved Vendors</option>
              {approvedVendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.storeName}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:border-orange-500 font-medium"
              >
                <option value="featured">Featured First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* In Stock toggle */}
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Price Slider Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Price Filter:</span>
            <span className="font-semibold text-slate-800">
              {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPriceRange({ min: 0, max: 2000 })}
              className={`px-2 py-1 rounded text-[11px] ${
                priceRange.max === 2000
                  ? 'bg-orange-100 text-orange-700 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Under {formatPrice(2000)}
            </button>
            <button
              onClick={() => setPriceRange({ min: 2000, max: 10000 })}
              className={`px-2 py-1 rounded text-[11px] ${
                priceRange.min === 2000 && priceRange.max === 10000
                  ? 'bg-orange-100 text-orange-700 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {formatPrice(2000)} - {formatPrice(10000)}
            </button>
            <button
              onClick={() => setPriceRange({ min: 10000, max: 150000 })}
              className={`px-2 py-1 rounded text-[11px] ${
                priceRange.min === 10000
                  ? 'bg-orange-100 text-orange-700 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Over {formatPrice(10000)}
            </button>
            <button
              onClick={() => setPriceRange({ min: 0, max: 150000 })}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {publicProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">
              Welcome to MegaMarket Multi-Vendor Store
            </h3>
            <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              All demo shops have been erased to provide a clean space for real vendors. Are you a business owner, artisan, or retail supplier? Set up your store in the Vendor Hub to start listing real merchandise.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-xs font-semibold border border-purple-200">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Store approvals & user administration overseen by the administrator</span>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search terms, clearing category filters, or expanding the price
            range.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedVendorFilter(null);
              setPriceRange({ min: 0, max: 150000 });
              setOnlyInStock(false);
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const hasDiscount =
              product.originalPrice && product.originalPrice > product.price;
            const discountPct = hasDiscount
              ? Math.round(
                  ((product.originalPrice! - product.price) / product.originalPrice!) * 100
                )
              : 0;

            const isLowStock = product.stock > 0 && product.stock <= 5;
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Image & Badges Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <span className="absolute top-2.5 left-2.5 bg-orange-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md shadow-xs">
                      -{discountPct}%
                    </span>
                  )}

                  {/* Out of stock overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Category & Vendor Tag */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">{product.categoryName}</span>
                      <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Store className="w-2.5 h-2.5" />
                        {product.vendorName}
                      </span>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                      {product.title}
                    </h3>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="ml-1 font-bold text-slate-800">{product.rating}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">({product.reviewCount})</span>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.originalPrice!)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status text */}
                    {isLowStock && (
                      <span className="text-[10px] font-bold text-orange-600 block mt-0.5">
                        ⚠️ Only {product.stock} items left in stock!
                      </span>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={isOutOfStock}
                      className={`w-full mt-2.5 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                        addedAnimationId === product.id
                          ? 'bg-emerald-600 text-white'
                          : isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      {addedAnimationId === product.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approved Vendors Spotlight Showcase */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verified Multi-Tenant Merchants
            </h2>
            <p className="text-slate-400 text-xs">
              Every vendor runs an isolated shop with dedicated inventory, order routing, and
              verified business records.
            </p>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700 self-start sm:self-auto">
            {approvedVendors.length} Verified Stores
          </span>
        </div>

        {approvedVendors.length === 0 ? (
          <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700 text-center space-y-2">
            <p className="text-sm text-slate-200 font-semibold">
              Open for Real Merchants & Vendors
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All demo vendors have been cleared. As real merchants register and receive approval from the administrator, their verified shops will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {approvedVendors.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVendorFilter(selectedVendorFilter === v.id ? null : v.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedVendorFilter === v.id
                    ? 'bg-slate-800 border-orange-500 shadow-md'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={v.logo}
                    alt={v.storeName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                      {v.storeName}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    </div>
                    <div className="text-xs text-slate-400 truncate">{v.city}</div>
                    <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{v.rating} rating</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">{v.totalSales} sales</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {v.description}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-orange-400 font-medium">
                    {selectedVendorFilter === v.id ? 'Showing Store Products' : 'Filter by this vendor'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
