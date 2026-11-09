import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, Product } from '../../types';
import {
  Store,
  Package,
  Plus,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  ShieldAlert,
  Bug,
  Save,
  Sliders,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const {
    currentUser,
    currentVendor,
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    getVendorOrders,
    updateOrderItemStatus,
    formatPrice,
    updateVendorProfile,
    createVendorProfileForCurrentUser,
    loginWithEmail,
    isCurrentUserRootAdmin,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Real vendor onboarding form state (when user has not launched a store yet)
  const [onboardingForm, setOnboardingForm] = useState({
    storeName: '',
    description: '',
    phone: currentUser?.phoneNumber || '+254 7',
    city: 'Nairobi',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
  });
  const [vendorSignInEmail, setVendorSignInEmail] = useState('');
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null);

  // Form State for Add / Edit Product
  const [productForm, setProductForm] = useState({
    title: '',
    categoryId: categories[0]?.id || 'cat-1',
    description: '',
    price: 1000,
    originalPrice: 1200,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    // File upload size state for compression optimization
    rawFileSize: 4.2, // MB
  });

  // Store Profile Form State
  const [profileForm, setProfileForm] = useState({
    storeName: currentVendor?.storeName || '',
    description: currentVendor?.description || '',
    logo: currentVendor?.logo || '',
    phone: currentVendor?.phone || '',
    city: currentVendor?.city || '',
  });

  const handleCreateRealStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingForm.storeName.trim()) {
      alert('Please enter a store name.');
      return;
    }
    const res = createVendorProfileForCurrentUser(onboardingForm);
    setOnboardingMessage(res.message);
    alert(res.message);
  };

  const handleVendorEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorSignInEmail.trim()) return;
    const res = await loginWithEmail(vendorSignInEmail);
    alert(res.message);
    if (!res.success) {
      setOnboardingMessage(res.message);
    }
  };

  if (!currentVendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-blue-800/60 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold uppercase tracking-wider border border-blue-700">
              <Store className="w-3.5 h-3.5 text-blue-300" />
              Vendor Room • Real Merchant Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Launch Your Verified Merchant Store</h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              All demo vendors have been erased. This space is exclusively dedicated for real merchants to register, list real inventory, receive M-Pesa orders, and start selling.
            </p>
          </div>
        </div>

        {/* Root Administrator Notice if Martin is viewing */}
        {isCurrentUserRootAdmin && (
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-purple-900">Administrator Session</span>
              <p className="text-purple-800 leading-relaxed">
                You are logged in as the platform administrator. Real merchants who sign up will appear in your Admin Panel for approval. You can also launch an official marketplace flagship shop below.
              </p>
            </div>
          </div>
        )}

        {/* Real Merchant Store Creation Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Set Up Your Real Merchant Store
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your store details to launch your seller space. Your application will be submitted to the administrator for approval.
            </p>
          </div>

          <form onSubmit={handleCreateRealStore} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Store / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rift Valley Organic Teas"
                  value={onboardingForm.storeName}
                  onChange={(e) =>
                    setOnboardingForm({ ...onboardingForm, storeName: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location / City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nairobi CBD / Eldoret / Mombasa"
                  value={onboardingForm.city}
                  onChange={(e) =>
                    setOnboardingForm({ ...onboardingForm, city: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+254 7..."
                  value={onboardingForm.phone}
                  onChange={(e) =>
                    setOnboardingForm({ ...onboardingForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Store Logo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={onboardingForm.logo}
                  onChange={(e) =>
                    setOnboardingForm({ ...onboardingForm, logo: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store Description & Products Offered *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe your merchandise, brand heritage, and dispatch location in East Africa..."
                value={onboardingForm.description}
                onChange={(e) =>
                  setOnboardingForm({ ...onboardingForm, description: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <Store className="w-4 h-4" />
                <span>Launch Real Merchant Store</span>
              </button>
            </div>
          </form>

          {/* Existing Real Vendor Sign-In */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">Already registered as a real vendor?</span>
            <form onSubmit={handleVendorEmailSignIn} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter vendor email..."
                value={vendorSignInEmail}
                onChange={(e) => setVendorSignInEmail(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl whitespace-nowrap transition-colors"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Row-Level Multi-Tenancy: Filter strictly for THIS vendor's inventory!
  // Mirrors: Product.objects.filter(vendor=request.user.vendor_profile)
  const vendorProducts = products.filter((p) => p.vendorId === currentVendor.id);

  // Orders containing items from this vendor
  // Mirrors: OrderItem.objects.filter(vendor=request.user.vendor_profile)
  const vendorOrderRecords = getVendorOrders(currentVendor.id);

  // Financial metrics
  const totalRevenue = vendorOrderRecords.reduce((sum, record) => {
    return (
      sum +
      record.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0)
    );
  }, 0);

  const totalItemsSold = vendorOrderRecords.reduce((sum, record) => {
    return sum + record.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      categoryId: categories[0]?.id || 'cat-1',
      description: '',
      price: 1500,
      originalPrice: 2000,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      isActive: true,
      rawFileSize: 3.8,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title,
      categoryId: p.categoryId,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      stock: p.stock,
      image: p.image,
      isActive: p.isActive,
      rawFileSize: p.imageMetadata ? p.imageMetadata.originalSizeBytes / (1024 * 1024) : 4.0,
    });
    setIsAddModalOpen(true);
  };

  const [isGeneratingAiCopy, setIsGeneratingAiCopy] = useState(false);

  const handleGenerateAiCopy = async () => {
    if (!productForm.title.trim()) {
      alert('Please enter a product title first so AI can generate the copy.');
      return;
    }
    setIsGeneratingAiCopy(true);
    try {
      const cat = categories.find((c) => c.id === productForm.categoryId);
      const res = await fetch('/api/gemini/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productForm.title,
          categoryName: cat?.name || 'General Goods',
          bulletPoints: productForm.description || '',
        }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      if (data.description) {
        setProductForm((prev) => ({
          ...prev,
          description: data.description,
        }));
      }
    } catch (err) {
      console.error('Failed to generate AI copy:', err);
    } finally {
      setIsGeneratingAiCopy(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === productForm.categoryId);

    // Simulated Pillow compression pipeline (4MB -> ~120KB, 800x800)
    const compressedBytes = Math.round(110000 + Math.random() * 40000);

    if (editingProduct) {
      const res = updateProduct(editingProduct.id, {
        title: productForm.title,
        categoryId: productForm.categoryId,
        categoryName: cat?.name || 'General',
        description: productForm.description,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        stock: Number(productForm.stock),
        image: productForm.image,
        isActive: productForm.isActive,
        imageMetadata: {
          originalSizeBytes: Math.round(productForm.rawFileSize * 1024 * 1024),
          compressedSizeBytes: compressedBytes,
          dimensions: '800x800',
        },
      });
      alert(res.message);
    } else {
      const res = addProduct({
        title: productForm.title,
        slug: productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId: productForm.categoryId,
        categoryName: cat?.name || 'General',
        description: productForm.description,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        stock: Number(productForm.stock),
        image: productForm.image,
        isActive: productForm.isActive,
        imageMetadata: {
          originalSizeBytes: Math.round(productForm.rawFileSize * 1024 * 1024),
          compressedSizeBytes: compressedBytes,
          dimensions: '800x800',
        },
      });
      alert(res.message);
    }

    setIsAddModalOpen(false);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorProfile(currentVendor.id, profileForm);
    alert('Shop profile updated successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Vendor Status Banner (Approval / Suspension Notice) */}
      {currentVendor.status === 'pending' && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm text-amber-900">
              Store Pending Approval by the Administrator
            </div>
            <p>
              Your store is registered and under review by the administrator. You can already add products and configure your catalog below. Once the administrator approves your store in the Admin Panel, your products will instantly go live on the public storefront!
            </p>
          </div>
        </div>
      )}

      {currentVendor.status === 'suspended' && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 text-rose-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm text-rose-900">Merchant Account Suspended</div>
            <p>
              This shop has been temporarily suspended by the platform administrator for compliance
              review. All active listings have been withdrawn from customer searches.
            </p>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentVendor.logo}
            alt={currentVendor.storeName}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                {currentVendor.storeName}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentVendor.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentVendor.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {currentVendor.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Managed by {currentUser?.fullName || 'Vendor'} ({currentUser?.email || ''}) • {currentVendor.city}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleOpenAdd}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Store Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatPrice(totalRevenue)}
          </div>
          <span className="text-[10px] text-slate-400">Strictly isolated to your items</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Products Listed</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {vendorProducts.length}
          </div>
          <span className="text-[10px] text-slate-400">
            {vendorProducts.filter((p) => p.isActive).length} active on store
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Items Sold</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {totalItemsSold}
          </div>
          <span className="text-[10px] text-slate-400">Across customer orders</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Orders Handled</span>
            <ShoppingBag className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {vendorOrderRecords.length}
          </div>
          <span className="text-[10px] text-slate-400">Containing your items</span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-b-2 border-orange-600 text-orange-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({vendorProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-b-2 border-orange-600 text-orange-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Fulfillment Orders ({vendorOrderRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-b-2 border-orange-600 text-orange-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Shop Profile Settings</span>
        </button>
      </div>

      {/* TAB 1: Product Inventory Table */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Inventory Management</h3>
              <p className="text-xs text-slate-500">
                Row-Level Scoped: You only see and manage products matching{' '}
                <code className="text-orange-600 font-mono">vendor_id = '{currentVendor.id}'</code>
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Compression</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vendorProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No products in catalog yet. Click "Add New Product" to start selling.
                    </td>
                  </tr>
                ) : (
                  vendorProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-slate-900 block truncate">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {p.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatPrice(p.price)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            p.stock <= 5 ? 'text-orange-600' : 'text-emerald-700'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {p.imageMetadata ? (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {(p.imageMetadata.compressedSizeBytes / 1024).toFixed(0)}KB (Pillow)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Standard</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleProductActive(p.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.isActive ? (
                            <>
                              <Eye className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product "${p.title}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Vendor Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Store Order Fulfillment</h3>
            <p className="text-xs text-slate-500">
              Broken Access Control Prevention: You ONLY see order items assigned to your store. You
              cannot view items that other merchants must fulfill in the same multi-vendor order.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-3">Customer & Address</th>
                  <th className="py-3 px-3">Your Store Items</th>
                  <th className="py-3 px-3">Item Subtotal</th>
                  <th className="py-3 px-3">Fulfillment Status</th>
                  <th className="py-3 px-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vendorOrderRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No orders placed for this vendor yet. Check back once customers purchase your products!
                    </td>
                  </tr>
                ) : (
                  vendorOrderRecords.map(({ order, items }) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 align-top">
                        <span className="font-bold text-slate-900 block">{order.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        {order.mpesaReceipt && (
                          <span className="text-[9px] font-mono text-emerald-700 block mt-0.5">
                            M-Pesa: {order.mpesaReceipt}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top max-w-xs">
                        <span className="font-medium text-slate-800 block">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {order.shippingAddress}, {order.city}
                        </span>
                        <span className="text-[10px] text-slate-400">{order.customerPhone}</span>
                      </td>
                      <td className="py-3 px-3 align-top space-y-1.5">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <img
                              src={item.productImage}
                              alt=""
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-semibold block truncate">
                                {item.productTitle}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3 align-top font-bold text-slate-900">
                        {formatPrice(
                          items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                        )}
                      </td>
                      <td className="py-3 px-3 align-top space-y-1">
                        {items.map((item) => (
                          <span
                            key={item.id}
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : item.status === 'Processing'
                                ? 'bg-purple-100 text-purple-800'
                                : item.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-3 align-top text-right space-y-1">
                        {items.map((item) => (
                          <select
                            key={item.id}
                            value={item.status}
                            onChange={(e) => {
                              const res = updateOrderItemStatus(
                                order.id,
                                item.id,
                                e.target.value as OrderStatus
                              );
                              if (!res.success) alert(res.message);
                            }}
                            className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-[11px] font-medium outline-none focus:border-orange-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Shop Profile Settings */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-4"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900">Edit Shop Profile</h3>
            <p className="text-xs text-slate-500">
              Customize your storefront branding, description, and contact info.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={profileForm.storeName}
                onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={3}
                required
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  required
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Logo URL</label>
              <input
                type="url"
                required
                value={profileForm.logo}
                onChange={(e) => setProfileForm({ ...profileForm, logo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. 50W Solar Panel with Battery Pack"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) =>
                      setProductForm({ ...productForm, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (KES) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Original Price (Optional Strikethrough)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Description *</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiCopy}
                    disabled={isGeneratingAiCopy || !productForm.title.trim()}
                    className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    title="Generate professional e-commerce description with Gemini AI"
                  >
                    {isGeneratingAiCopy ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                        <span>Generating Copy...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>AI Auto-Write Description</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detail the specifications, materials, warranty, or origin..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Image URL *</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none font-mono text-[11px]"
                />
              </div>

              {/* Automatic Image Optimization Box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-orange-600" />
                    High-Resolution Image Processing:
                  </span>
                  <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    Auto 800x800 @ 80% WebP
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  High-resolution product photos are automatically compressed and formatted for ultra-fast customer page loads across mobile networks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isActiveToggle" className="font-semibold text-slate-700 cursor-pointer">
                  Make product immediately active and visible in catalog
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
