import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { VendorStatus } from '../../types';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Store,
  Layers,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  Search,
  Filter,
  Terminal,
} from 'lucide-react';
import { SecurityAuditTerminal } from './SecurityAuditTerminal';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    isCurrentUserRootAdmin,
    backendSecurityProfile,
    vendors,
    adminSetVendorStatus,
    deleteVendor,
    deleteUser,
    categories,
    addCategory,
    deleteCategory,
    products,
    orders,
    users,
    formatPrice,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'security' | 'vendors' | 'categories' | 'orders' | 'users'>('security');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');

  // User directory search & filter state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'customer' | 'vendor' | 'admin'>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Platform Metrics
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const platformCommission = totalGMV * 0.1; // 10% marketplace fee
  const vendorPayouts = totalGMV * 0.9;

  const pendingVendors = vendors.filter((v) => v.status === 'pending');
  const approvedVendors = vendors.filter((v) => v.status === 'approved');
  const suspendedVendors = vendors.filter((v) => v.status === 'suspended');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory({
      name: newCategoryName,
      slug: newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: 'Tag',
      image:
        newCategoryImage ||
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
      itemCount: 0,
    });

    setNewCategoryName('');
    setNewCategoryImage('');
    showFeedback('Category created successfully!', 'success');
  };

  // Handle vendor status moderation
  const handleVendorStatus = (vendorId: string, status: VendorStatus, storeName: string) => {
    if (!isCurrentUserRootAdmin) {
      showFeedback('Access Denied: Only the administrator has root authorization to accept or alter vendor status.', 'error');
      return;
    }
    const res = adminSetVendorStatus(vendorId, status);
    if (res.success) {
      showFeedback(`Store "${storeName}" has been ${status === 'approved' ? 'ACCEPTED & APPROVED' : status.toUpperCase()}. Products catalog is updated!`, 'success');
    } else {
      showFeedback(res.message, 'error');
    }
  };

  // Handle vendor store deletion
  const handleDeleteVendor = (vendorId: string, storeName: string) => {
    if (!isCurrentUserRootAdmin) {
      showFeedback('Access Denied: Only the administrator has root authorization to delete vendor stores.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to PERMANENTLY delete store "${storeName}" and delist all associated products?`)) {
      const res = deleteVendor(vendorId);
      if (res.success) {
        showFeedback(res.message, 'success');
      } else {
        showFeedback(res.message, 'error');
      }
    }
  };

  // Handle user deletion (Customer or Vendor)
  const handleDeleteUser = (userId: string, userName: string, role: string) => {
    if (!isCurrentUserRootAdmin) {
      showFeedback('Access Denied: Only the administrator has root authorization to delete users.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}" (${role})? All associated store profiles and shopping records will be removed.`)) {
      const res = deleteUser(userId);
      if (res.success) {
        showFeedback(res.message, 'success');
      } else {
        showFeedback(res.message, 'error');
      }
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phoneNumber.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Sovereign Backend & Root Administrator Authority */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-lg border border-purple-800/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/90 text-purple-200 text-xs font-bold uppercase tracking-wider border border-purple-700">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              Primary Administrator: Root Authority
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-[11px] font-semibold border border-emerald-800">
              <Unlock className="w-3 h-3 text-emerald-400" />
              Low Security Unlinked Backend
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Platform Moderation & Governance</h1>
          <p className="text-purple-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Sovereign local backend operating independently without external cloud lockouts. Exclusive root authority is assigned to{' '}
            <strong className="text-white underline decoration-purple-400">the administrator</strong> to accept/approve vendor merchants and delete any customer or vendor account.
          </p>
        </div>

        {/* Security State & Authority Status Card */}
        <div className="bg-purple-950/90 p-4 rounded-2xl border border-purple-700/80 text-xs space-y-2 w-full lg:w-80 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold uppercase tracking-wider text-[11px]">Backend Topology</span>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">UNLINKED / LOCAL</span>
          </div>
          <p className="text-purple-100 text-[11px] leading-relaxed">
            Standalone sovereign mode enabled. Third-party cloud identity lockouts are bypassed.
          </p>
          <div className="pt-2 border-t border-purple-800/60 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Your Authority:</span>
            {isCurrentUserRootAdmin ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Root Granted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                <Lock className="w-3 h-3 text-amber-400" />
                Restricted (Non-Root)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Financial & Governance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Gross Merchandise Value (GMV)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{formatPrice(totalGMV)}</div>
          <span className="text-[10px] text-slate-400">Total volume processed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Platform Take (10%)</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-purple-700">
            {formatPrice(platformCommission)}
          </div>
          <span className="text-[10px] text-slate-400">Net platform revenue</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Vendor Payouts (90%)</span>
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-blue-700">{formatPrice(vendorPayouts)}</div>
          <span className="text-[10px] text-slate-400">Disbursed to merchant M-Pesa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Merchants Pipeline</span>
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{vendors.length} Stores</div>
          <div className="flex gap-2 text-[10px] font-semibold pt-0.5">
            <span className="text-emerald-700">{approvedVendors.length} active</span>
            <span className="text-amber-700">{pendingVendors.length} pending</span>
            <span className="text-rose-700">{suspendedVendors.length} suspended</span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-b-2 border-emerald-600 text-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span className="font-bold">6-Point Security Audit & Hardening</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-emerald-300">
            Screenshot Spec
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vendors'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vendor Moderation ({vendors.length})</span>
          {pendingVendors.length > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingVendors.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Merchant Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Category Taxonomies ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>All Platform Orders ({orders.length})</span>
        </button>
      </div>

      {/* TAB 0: 6-Point Security Architecture Audit Terminal (Screenshot Spec) */}
      {activeTab === 'security' && <SecurityAuditTerminal />}

      {/* TAB 1: Vendor Governance Table */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Merchant Directory & Governance</h3>
              <p className="text-xs text-slate-500">
                Grant or revoke vendor selling privileges. Only the administrator is authorized to approve or delete vendor stores.
              </p>
            </div>
          </div>

          {vendors.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Store className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">No Registered Vendors Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All demo vendors have been erased. When real merchants sign in or register in the Vendor Room, their shops will appear here for the administrator's review and approval.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Merchant / Store</th>
                    <th className="py-3 px-3">Owner Contact</th>
                    <th className="py-3 px-3">Region</th>
                    <th className="py-3 px-3">Catalog Size</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vendors.map((vendor) => {
                    const vendorProductCount = products.filter((p) => p.vendorId === vendor.id).length;

                    return (
                      <tr key={vendor.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={vendor.logo}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {vendor.storeName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {vendor.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 block">{vendor.phone}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            User ID: {vendor.userId}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">{vendor.city}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {vendorProductCount} products
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              vendor.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : vendor.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {vendor.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                            {vendor.status === 'pending' && <Clock className="w-3 h-3" />}
                            {vendor.status === 'suspended' && <XCircle className="w-3 h-3" />}
                            {vendor.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          {vendor.status !== 'approved' && (
                            <button
                              onClick={() => handleVendorStatus(vendor.id, 'approved', vendor.storeName)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-xs"
                              title="Accept and approve store for public catalog"
                            >
                              Accept & Approve
                            </button>
                          )}

                          {vendor.status !== 'suspended' && (
                            <button
                              onClick={() => handleVendorStatus(vendor.id, 'suspended', vendor.storeName)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                              title="Suspend store"
                            >
                              Suspend
                            </button>
                          )}

                          {vendor.status === 'suspended' && (
                            <button
                              onClick={() => handleVendorStatus(vendor.id, 'approved', vendor.storeName)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                              title="Reinstate store"
                            >
                              Reinstate
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteVendor(vendor.id, vendor.storeName)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                            title="Permanently delete store and its products"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Users & Merchant Directory with Exclusive Deletion Authority */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">User Identity & Merchant Accounts</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Exclusive Deletion Authority: The Administrator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered customer and merchant records. Only the administrator can accept vendor applications or delete accounts.
              </p>
            </div>

            {/* Role Filter & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search user, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-purple-500 outline-none w-48 sm:w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
                {(['all', 'customer', 'vendor', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                      userRoleFilter === r
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">User Identity</th>
                  <th className="py-3 px-3">Email (Primary Auth Key)</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Store Association</th>
                  <th className="py-3 px-3 text-right">Root Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => {
                  const vendorProfile = u.vendorId
                    ? vendors.find((v) => v.id === u.vendorId)
                    : null;
                  const isProtectedAdmin = u.role === 'admin' || u.id === 'usr_admin_root';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'vendor'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">{u.email}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{u.phoneNumber}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'vendor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {vendorProfile ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-700 font-semibold">{vendorProfile.storeName}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                vendorProfile.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : vendorProfile.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {vendorProfile.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {/* Direct Vendor Accept button if pending */}
                        {vendorProfile && vendorProfile.status === 'pending' && (
                          <button
                            onClick={() => handleVendorStatus(vendorProfile.id, 'approved', vendorProfile.storeName)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-xs"
                            title="Accept this pending merchant"
                          >
                            Accept Vendor
                          </button>
                        )}

                        {/* Delete User button (Exclusive right of the administrator; protected for root admin) */}
                        {isProtectedAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                            <Shield className="w-3 h-3 text-purple-600" />
                            Root Admin (Protected)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName, u.role)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                            title="Permanently delete this user"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete User</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Category Taxonomy Management */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Add Category Form */}
          <form
            onSubmit={handleAddCategory}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 h-fit"
          >
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add New Category</h3>
              <p className="text-xs text-slate-500">
                Create new taxonomy departments for merchant goods.
              </p>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar & Renewable Power"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Banner Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newCategoryImage}
                  onChange={(e) => setNewCategoryImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-purple-500 outline-none font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </div>
          </form>

          {/* Right: Existing Categories List */}
          <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Active Taxonomies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;

                return (
                  <div
                    key={cat.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={cat.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 text-xs block truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Slug: {cat.slug}
                        </span>
                        <span className="text-[10px] text-purple-700 font-semibold">
                          {count} products linked
                        </span>
                      </div>
                    </div>
                    {categories.length > 2 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete category "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                            showFeedback(`Category "${cat.name}" deleted.`, 'success');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Global System Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Platform-Wide Orders Audit</h3>
            <p className="text-xs text-slate-500">
              Admin visibility into all customer transactions and vendor commission splits.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Vendors Involved</th>
                  <th className="py-3 px-3">M-Pesa Reference</th>
                  <th className="py-3 px-3">Total (KES)</th>
                  <th className="py-3 px-3">Commission (10%)</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((o) => {
                  const uniqueVendors = Array.from(new Set(o.items.map((i) => i.vendorName)));

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 block">{o.customerName}</span>
                        <span className="text-[10px] text-slate-400">{o.city}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {uniqueVendors.map((v, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-emerald-800">
                        {o.mpesaReceipt || 'Cash on Delivery'}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatPrice(o.totalAmount)}
                      </td>
                      <td className="py-3 px-3 font-bold text-purple-700">
                        {formatPrice(o.totalAmount * 0.1)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            o.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : o.status === 'Processing'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
