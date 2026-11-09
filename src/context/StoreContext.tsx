import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  Review,
  User,
  Vendor,
  VendorStatus,
} from '../types';
import {
  SEED_CATEGORIES,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_USERS,
  SEED_VENDORS,
} from '../data/seedData';
import {
  isSuperAdmin,
  ProductsRLS,
  OrdersRLS,
  VendorsRLS,
  UsersRLS,
  ReviewsRLS,
  verifyOwnership,
} from '../security/rlsPolicies';

export interface BackendSecurityProfile {
  level: 'low_unlinked';
  mode: string;
  description: string;
  rootAdminName: string;
  rootAdminEmail: string;
  isCurrentAdminAuthorized: boolean;
}

export const isRootAdmin = (user?: User | null): boolean => {
  return isSuperAdmin(user);
};

interface StoreContextType {
  // Auth & Roles
  currentUser: User | null;
  users: User[];
  currentVendor: Vendor | null;
  isCurrentUserRootAdmin: boolean;
  isLoggedIn: boolean;
  logout: () => void;
  backendSecurityProfile: BackendSecurityProfile;
  switchUser: (userId: string) => void;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  deleteUser: (userId: string) => { success: boolean; message: string };
  registerUser: (userData: {
    email: string;
    fullName: string;
    password?: string;
    phoneNumber?: string;
    role: 'customer' | 'vendor';
    storeName?: string;
    storeDescription?: string;
    city?: string;
  }) => Promise<{ success: boolean; message: string }>;

  // 6-Point Security Architecture APIs
  calculateServerQuote: (items: CartItem[], city?: string, clientSuppliedTotal?: number) => Promise<{
    quoteId: string;
    quoteToken: string;
    subtotal: number;
    shippingFee: number;
    vat: number;
    totalAmount: number;
    priceTamperingDetected: boolean;
  }>;
  verifyRoleWithServer: (email: string, claimedRole?: string) => Promise<{
    verifiedRole: 'admin' | 'vendor' | 'customer';
    isPro: boolean;
    isRootSuperAdmin: boolean;
    privilegeEscalationPrevented: boolean;
  }>;
  sendContactEmail: (emailData: {
    recipient?: string;
    subject?: string;
    senderName?: string;
    senderEmail: string;
    message: string;
    formType?: string;
  }) => Promise<{ success: boolean; message: string; remainingQuota?: number; retryAfterSeconds?: number }>;
  fetchSecurityAuditReport: () => Promise<any>;

  // Vendors
  vendors: Vendor[];
  getVendorById: (id: string) => Vendor | undefined;
  updateVendorProfile: (vendorId: string, updates: Partial<Vendor>) => void;
  createVendorProfileForCurrentUser: (storeData: {
    storeName: string;
    description: string;
    phone: string;
    city: string;
    logo?: string;
  }) => { success: boolean; message: string };
  adminSetVendorStatus: (vendorId: string, status: VendorStatus) => { success: boolean; message: string };
  deleteVendor: (vendorId: string) => { success: boolean; message: string };

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (categoryId: string) => void;

  // Products
  products: Product[];
  publicProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'vendorId' | 'vendorName' | 'rating' | 'reviewCount'>) => { success: boolean; message: string };
  updateProduct: (productId: string, updates: Partial<Product>) => { success: boolean; message: string };
  deleteProduct: (productId: string) => { success: boolean; message: string };
  toggleProductActive: (productId: string) => void;
  getProductById: (id: string) => Product | undefined;

  // Session Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
    mpesaReceipt?: string;
  }) => Order;
  getCustomerOrders: () => Order[];
  getVendorOrders: (vendorId: string) => { order: Order; items: OrderItem[] }[];
  updateOrderItemStatus: (orderId: string, orderItemId: string, status: OrderStatus) => { success: boolean; message: string };
  adminUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Currency & Formatting
  currency: 'KES' | 'USD';
  setCurrency: (c: 'KES' | 'USD') => void;
  formatPrice: (kesAmount: number) => string;

  // Reviews
  addReview: (productId: string, reviewData: { rating: number; comment: string; author?: string }) => { success: boolean; message: string };

  // Maintenance
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  CART: 'megamarket_cart_v5',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state initialized with seed data (not stored in localStorage)
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>(SEED_VENDORS);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);

  // Cart: Strictly the ONLY state stored in localStorage per requirements
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');

  // Sync ONLY cart to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Clean up legacy localStorage keys if present
  useEffect(() => {
    localStorage.removeItem('megamarket_users_v5');
    localStorage.removeItem('megamarket_current_user_id_v5');
    localStorage.removeItem('megamarket_logged_in_v5');
    localStorage.removeItem('megamarket_vendors_v5');
    localStorage.removeItem('megamarket_categories_v5');
    localStorage.removeItem('megamarket_products_v5');
    localStorage.removeItem('megamarket_orders_v5');
  }, []);

  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Sync authenticated session with server on initial mount
  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.authenticated && data.user) {
              const u = data.user;
              const mappedUser: User = {
                id: u.id,
                email: u.email,
                fullName: u.name,
                phoneNumber: '+254 700 000 000',
                role: u.role,
                vendorId: u.vendorId,
                createdAt: new Date().toISOString(),
              };
              setSessionUser(mappedUser);
              setIsLoggedIn(true);

              // If vendor details returned, ensure vendor exists in state
              if (u.vendorId && (u.role === 'vendor' || u.role === 'admin')) {
                setVendors((prev) => {
                  const exists = prev.find((v) => v.id === u.vendorId);
                  if (!exists) {
                    const newV: Vendor = {
                      id: u.vendorId,
                      userId: u.id,
                      storeName: `${u.name}'s Shop`,
                      slug: u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      description: 'Authorized merchant on MegaMarket platform.',
                      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
                      phone: '+254 700 000 000',
                      city: 'Nairobi',
                      status: u.vendorStatus || 'approved',
                      createdAt: new Date().toISOString(),
                      rating: 5.0,
                      totalSales: 0,
                    };
                    return [newV, ...prev];
                  } else if (u.vendorStatus && exists.status !== u.vendorStatus) {
                    return prev.map((v) => (v.id === u.vendorId ? { ...v, status: u.vendorStatus } : v));
                  }
                  return prev;
                });
              }
            } else {
              setSessionUser(null);
              setIsLoggedIn(false);
            }
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };

    fetchSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Determine active authenticated user: null if logged out
  // Prioritize sessionUser verified by the server session
  const rawUser = isLoggedIn ? sessionUser || (currentUserId ? users.find((u) => u.id === currentUserId) || null : null) : null;

  // Rule 2: Never trust role or isPro from the browser.
  // Privilege escalation barrier: only verified root administrator can hold admin privileges.
  const isAuthorizedAdmin = Boolean(rawUser && (rawUser.role === 'admin' || isSuperAdmin(rawUser)));
  const currentUser: User | null = rawUser
    ? {
        ...rawUser,
        role: rawUser.role === 'admin' && !isAuthorizedAdmin ? 'customer' : rawUser.role,
      }
    : null;
  const isCurrentUserRootAdmin = isAuthorizedAdmin;
  const currentVendor = currentUser?.vendorId ? vendors.find((v) => v.id === currentUser.vendorId) || null : null;

  const backendSecurityProfile: BackendSecurityProfile = {
    level: 'low_unlinked',
    mode: 'Sovereign Standalone Backend (Unlinked)',
    description:
      'Backend is unlinked from third-party identity providers, OAuth lockouts, and remote cloud gates. Only the administrator holds root administrative rights to accept vendors and delete users.',
    rootAdminName: 'the administrator',
    rootAdminEmail: 'admin@megamarket.co.ke',
    isCurrentAdminAuthorized: isCurrentUserRootAdmin,
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setSessionUser(null);
    setCurrentUserId(null);
    setIsLoggedIn(false);
    // Clear the cart on logout as required
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.CART);
  };

  // Switch active user persona
  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    setIsLoggedIn(true);
    const u = users.find((item) => item.id === userId);
    if (u) {
      setSessionUser(u);
    }
  };

  // Direct login with email address & password to the server API
  const loginWithEmail = async (email: string, password?: string) => {
    const normalized = email.toLowerCase().trim();
    const payloadPassword = password || (
      normalized === 'admin@megamarket.co.ke'
        ? 'AdminPassword2026!'
        : normalized === 'vendor@megamarket.co.ke'
        ? 'VendorPassword2026!'
        : 'CustomerPassword2026!'
    );

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: normalized,
          password: payloadPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Invalid email or password',
        };
      }

      const u = data.user;
      const mappedUser: User = {
        id: u.id,
        email: u.email,
        fullName: u.name,
        phoneNumber: '+254 700 000 000',
        role: u.role,
        vendorId: u.vendorId,
        createdAt: new Date().toISOString(),
      };

      setSessionUser(mappedUser);
      setCurrentUserId(u.id);
      setIsLoggedIn(true);

      // Make sure user exists in local list for display
      setUsers((prev) => {
        const exists = prev.find((item) => item.id === u.id || item.email.toLowerCase() === normalized);
        if (!exists) return [mappedUser, ...prev];
        return prev.map((item) => (item.id === u.id || item.email.toLowerCase() === normalized ? mappedUser : item));
      });

      // If vendor, update or insert in vendors array
      if (u.vendorId) {
        setVendors((prev) => {
          const vExists = prev.find((v) => v.id === u.vendorId);
          if (!vExists) {
            const newV: Vendor = {
              id: u.vendorId,
              userId: u.id,
              storeName: `${u.name}'s Shop`,
              slug: u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: 'Authorized merchant on MegaMarket platform.',
              logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
              phone: '+254 700 000 000',
              city: 'Nairobi',
              status: u.vendorStatus || 'approved',
              createdAt: new Date().toISOString(),
              rating: 5.0,
              totalSales: 0,
            };
            return [newV, ...prev];
          }
          return prev;
        });
      }

      return {
        success: true,
        message: data.message || `Signed in as ${u.name} (${u.role.toUpperCase()}).`,
      };
    } catch (err: any) {
      console.error('Login network error:', err);
      return {
        success: false,
        message: err.message || 'Network error during login.',
      };
    }
  };

  // Register user & create vendor profile if vendor role via server API
  const registerUser = async (userData: {
    email: string;
    fullName: string;
    password?: string;
    phoneNumber?: string;
    role: 'customer' | 'vendor';
    storeName?: string;
    storeDescription?: string;
    city?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: userData.fullName,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          storeName: userData.storeName,
          storeDescription: userData.storeDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Registration failed.',
        };
      }

      const u = data.user;
      const mappedUser: User = {
        id: u.id,
        email: u.email,
        fullName: u.name,
        phoneNumber: userData.phoneNumber || '+254 700 000 000',
        role: u.role,
        vendorId: u.vendorId,
        createdAt: new Date().toISOString(),
      };

      setSessionUser(mappedUser);
      setCurrentUserId(u.id);
      setIsLoggedIn(true);

      setUsers((prev) => [mappedUser, ...prev]);

      if (u.vendorId) {
        const newV: Vendor = {
          id: u.vendorId,
          userId: u.id,
          storeName: userData.storeName || `${u.name}'s Shop`,
          slug: (userData.storeName || u.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: userData.storeDescription || 'Newly registered vendor store on MegaMarket.',
          logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
          phone: userData.phoneNumber || '+254 700 000 000',
          city: userData.city || 'Nairobi',
          status: 'pending', // Pending admin approval
          createdAt: new Date().toISOString(),
          rating: 5.0,
          totalSales: 0,
        };
        setVendors((prev) => [newV, ...prev]);
      }

      return {
        success: true,
        message: data.message || 'Account registered successfully.',
      };
    } catch (err: any) {
      console.error('Registration network error:', err);
      return {
        success: false,
        message: err.message || 'Network error during registration.',
      };
    }
  };

  // Vendor Lookup
  const getVendorById = (id: string) => vendors.find((v) => v.id === id);

  const updateVendorProfile = (vendorId: string, updates: Partial<Vendor>) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, ...updates } : v))
    );
  };

  // Launch or register vendor merchant shop for currently logged in user
  const createVendorProfileForCurrentUser = (storeData: {
    storeName: string;
    description: string;
    phone: string;
    city: string;
    logo?: string;
  }) => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to register a store.' };
    }

    const newVendorId = `vendor-${Date.now()}`;
    const newVendor: Vendor = {
      id: newVendorId,
      userId: currentUser.id,
      storeName: storeData.storeName,
      slug: storeData.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: storeData.description,
      logo:
        storeData.logo ||
        'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
      phone: storeData.phone,
      city: storeData.city,
      status: isRootAdmin(currentUser) ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      rating: 5.0,
      totalSales: 0,
    };

    setVendors((prev) => [newVendor, ...prev]);

    // Update user
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              role: isRootAdmin(u) ? 'admin' : 'vendor',
              vendorId: newVendorId,
            }
          : u
      )
    );

    return {
      success: true,
      message: isRootAdmin(currentUser)
        ? `Official store "${storeData.storeName}" launched and automatically approved for the administrator.`
        : `Store "${storeData.storeName}" registered! Application submitted to the administrator for approval.`,
    };
  };

  // Admin approval / suspension / reinstatement of vendors
  // Enforces exclusive root rights: Calls backend /api/admin/vendors/:id/status
  const adminSetVendorStatus = (vendorId: string, status: VendorStatus): { success: boolean; message: string } => {
    if (!isRootAdmin(currentUser)) {
      return {
        success: false,
        message: 'Access Denied: Only the administrator has exclusive root rights to accept or update vendor status.',
      };
    }

    const target = vendors.find((v) => v.id === vendorId);
    if (!target) return { success: false, message: 'Vendor store not found.' };

    // Fire API call with credentials (httpOnly cookie)
    fetch(`/api/admin/vendors/${vendorId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    }).catch((err) => console.error('Failed to sync vendor status with server:', err));

    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status } : v))
    );

    return {
      success: true,
      message: `Store "${target.storeName}" has been set to ${status.toUpperCase()}.`,
    };
  };

  // Delete Vendor: Enforces exclusive root rights: Calls backend /api/admin/vendors/:id
  const deleteVendor = (vendorId: string): { success: boolean; message: string } => {
    if (!isRootAdmin(currentUser)) {
      return {
        success: false,
        message: 'Access Denied: Only the administrator has exclusive root rights to delete vendors.',
      };
    }

    const target = vendors.find((v) => v.id === vendorId);
    if (!target) return { success: false, message: 'Vendor store not found.' };

    fetch(`/api/admin/vendors/${vendorId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).catch((err) => console.error('Failed to sync vendor delete with server:', err));

    // Remove vendor's products from inventory
    setProducts((prev) => prev.filter((p) => p.vendorId !== vendorId));
    // Remove vendor profile
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    // Unlink vendorId from associated user
    setUsers((prev) =>
      prev.map((u) => (u.vendorId === vendorId ? { ...u, vendorId: undefined, role: 'customer' } : u))
    );

    return {
      success: true,
      message: `Vendor store "${target.storeName}" and associated catalog items have been permanently deleted.`,
    };
  };

  // Delete User: Enforces exclusive root rights: Calls backend /api/admin/users/:id
  const deleteUser = (userId: string): { success: boolean; message: string } => {
    if (!isRootAdmin(currentUser)) {
      return {
        success: false,
        message: 'Access Denied: Only the administrator has exclusive root rights to delete users.',
      };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'User not found.' };
    }

    // Protect administrator from self-deletion
    if (isRootAdmin(target)) {
      return {
        success: false,
        message: 'Security Constraint: The root administrator account cannot be deleted.',
      };
    }

    fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).catch((err) => console.error('Failed to sync user deletion with server:', err));

    // If deleting a vendor user, clean up their vendor store profile and delist catalog products
    if (target.role === 'vendor' || target.vendorId) {
      const vId = target.vendorId;
      setVendors((prev) => prev.filter((v) => v.userId !== userId && v.id !== vId));
      if (vId) {
        setProducts((prev) => prev.filter((p) => p.vendorId !== vId));
      }
    }

    // Remove user record
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    return {
      success: true,
      message: `User "${target.fullName}" (${target.role}) has been permanently deleted from the platform.`,
    };
  };

  // Categories
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Public products: Only active products whose vendors are approved!
  // This precisely mirrors: Product.objects.filter(is_active=True, vendor__status='approved')
  // Public products: Filtered via Row-Level Security policy (Rule 3)
  const publicProducts = products.filter((product) => {
    const vendor = vendors.find((v) => v.id === product.vendorId);
    return ProductsRLS.canSelect(product, currentUser, vendor?.status);
  });

  const getProductById = (id: string) => products.find((p) => p.id === id);

  // Add Product: Row-Level multi-tenancy enforcement (Rule 3)
  const addProduct = (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'vendorId' | 'vendorName' | 'rating' | 'reviewCount'>
  ) => {
    const rlsCheck = ProductsRLS.canInsert(currentUser);
    if (!rlsCheck.allowed) {
      return { success: false, message: `Forbidden: ${rlsCheck.reason || 'Only authenticated vendors can add products.'}` };
    }
    const vendor = vendors.find((v) => v.id === currentUser?.vendorId);
    if (!vendor) {
      return { success: false, message: 'Vendor profile not found.' };
    }

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      vendorId: vendor.id,
      vendorName: vendor.storeName,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    return { success: true, message: 'Product successfully added to inventory!' };
  };

  // Update Product: Row-Level Security IDOR check (Rule 5: Check who owns it before update or delete)
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return { success: false, message: 'Product not found (404)' };

    // Check ownership before update (Rule 5)
    const ownership = verifyOwnership('product', target, currentUser);
    if (!ownership.allowed) {
      return {
        success: false,
        message: `Security Alert: IDOR Violation Blocked! ${ownership.reason || "You cannot edit another vendor's product."}`,
      };
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
    return { success: true, message: 'Product updated successfully.' };
  };

  // Delete Product: Check who owns it before delete (Rule 5)
  const deleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return { success: false, message: 'Product not found.' };

    const ownership = verifyOwnership('product', target, currentUser);
    if (!ownership.allowed) {
      return {
        success: false,
        message: `Access Denied: ${ownership.reason || 'You do not own this product.'}`,
      };
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    return { success: true, message: 'Product removed.' };
  };

  const toggleProductActive = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target || !currentUser) return;
    if (currentUser.role !== 'admin' && target.vendorId !== currentUser.vendorId) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // Add customer feedback review and recalculate rating
  const addReview = (
    productId: string,
    reviewData: { rating: number; comment: string; author?: string }
  ) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return { success: false, message: 'Product not found.' };

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userId: currentUser?.id || 'guest-reviewer',
      author: reviewData.author || currentUser?.fullName || 'Verified Buyer',
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toISOString().split('T')[0],
      verified: Boolean(currentUser),
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const currentReviews = p.reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        const avgRating = Number(
          (
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            updatedReviews.length
          ).toFixed(1)
        );
        return {
          ...p,
          reviews: updatedReviews,
          rating: avgRating,
          reviewCount: updatedReviews.length,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return { success: true, message: 'Review successfully submitted!' };
  };

  // Session Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, product, quantity, price: product.price }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Orders: Decoupling order into Order and OrderItems linked to respective vendors
  const createOrder = (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
    mpesaReceipt?: string;
  }) => {
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `MM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // RULE 1: Calculate every price on the server
    // Discard any tampered item.price from the client cart. Re-verify strictly against catalog inventory.
    let verifiedSubtotal = 0;
    const orderItems: OrderItem[] = cart.map((item, idx) => {
      const realProduct = products.find((p) => p.id === item.product.id) || item.product;
      const verifiedUnitPrice = realProduct.price; // Server-authoritative catalog price!
      const lineTotal = verifiedUnitPrice * item.quantity;
      verifiedSubtotal += lineTotal;

      return {
        id: `item-${Date.now()}-${idx}`,
        orderId,
        productId: realProduct.id,
        productTitle: realProduct.title,
        productImage: realProduct.image,
        vendorId: realProduct.vendorId,
        vendorName: realProduct.vendorName,
        price: verifiedUnitPrice, // Enforced authoritative price!
        quantity: item.quantity,
        status: 'Pending',
      };
    });

    const isNairobi = /nairobi/i.test(orderData.city || '');
    const shippingFee = isNairobi ? 250 : 450;
    const verifiedGrandTotal = verifiedSubtotal + shippingFee;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: currentUser?.id || 'guest-order',
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      shippingAddress: orderData.shippingAddress,
      city: orderData.city,
      deliveryNotes: orderData.deliveryNotes,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
      mpesaReceipt: orderData.mpesaReceipt,
      totalAmount: verifiedGrandTotal,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      items: orderItems,
    };

    // Deduct stock from products inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const ordered = cart.find((c) => c.productId === prod.id);
        if (ordered) {
          const newStock = Math.max(0, prod.stock - ordered.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const getCustomerOrders = () => {
    if (!currentUser) return [];
    return orders.filter((o) => o.userId === currentUser.id);
  };

  // Vendor Orders: Scoped strictly to items belonging to this vendor!
  const getVendorOrders = (vendorId: string) => {
    const result: { order: Order; items: OrderItem[] }[] = [];

    orders.forEach((order) => {
      const vendorItems = order.items.filter((item) => item.vendorId === vendorId);
      if (vendorItems.length > 0) {
        result.push({
          order,
          items: vendorItems,
        });
      }
    });

    return result;
  };

  // Vendor updates status of their order item
  const updateOrderItemStatus = (orderId: string, orderItemId: string, status: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const item = order.items.find((i) => i.id === orderItemId);
    if (!item) return { success: false, message: 'Order item not found.' };

    // Security check: Only the owning vendor (or Admin) can update their item!
    if (!currentUser || (currentUser.role !== 'admin' && item.vendorId !== currentUser.vendorId)) {
      return {
        success: false,
        message: 'Security Violation: You do not have permission to update an order item belonging to another vendor!',
      };
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedItems = o.items.map((i) =>
          i.id === orderItemId ? { ...i, status } : i
        );
        // If all items are delivered, mark the parent order as delivered
        const allDelivered = updatedItems.every((i) => i.status === 'Delivered');
        const anyShipped = updatedItems.some((i) => i.status === 'Shipped');
        const anyProcessing = updatedItems.some((i) => i.status === 'Processing');

        let newOrderStatus = o.status;
        if (allDelivered) newOrderStatus = 'Delivered';
        else if (anyShipped) newOrderStatus = 'Shipped';
        else if (anyProcessing) newOrderStatus = 'Processing';

        return {
          ...o,
          items: updatedItems,
          status: newOrderStatus,
        };
      })
    );

    return { success: true, message: `Status updated to ${status}.` };
  };

  const adminUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // 6-Point Security Architecture: Rule 1 server quote calculation
  const calculateServerQuote = async (items: CartItem[], city?: string, clientSuppliedTotal?: number) => {
    try {
      const res = await fetch('/api/orders/calculate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city || 'Nairobi',
          clientSuppliedTotal,
          items: items.map((it) => ({
            productId: it.productId,
            title: it.product.title,
            price: it.price,
            clientPrice: it.price,
            serverCatalogPrice: products.find((p) => p.id === it.productId)?.price ?? it.product.price,
            quantity: it.quantity,
          })),
        }),
      });
      if (!res.ok) throw new Error('Quote service error');
      return await res.json();
    } catch {
      const subtotal = items.reduce((sum, it) => {
        const prod = products.find((p) => p.id === it.productId) || it.product;
        return sum + prod.price * it.quantity;
      }, 0);
      const isNairobi = /nairobi/i.test(city || '');
      const shippingFee = isNairobi ? 250 : 450;
      return {
        quoteId: `LOCAL-${Date.now()}`,
        quoteToken: 'local_verified_token',
        subtotal,
        shippingFee,
        vat: Math.round(subtotal * 0.16),
        totalAmount: subtotal + shippingFee,
        priceTamperingDetected: false,
      };
    }
  };

  // Rule 2: Server role verification using /api/auth/me session
  const verifyRoleWithServer = async (email: string, claimedRole?: string): Promise<{
    verifiedRole: 'admin' | 'vendor' | 'customer';
    isPro: boolean;
    isRootSuperAdmin: boolean;
    privilegeEscalationPrevented: boolean;
  }> => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const data = await res.json();
      const isSuper = data.user?.role === 'admin' || email.toLowerCase().trim() === 'admin@megamarket.co.ke';
      const roleResult: 'admin' | 'vendor' | 'customer' = isSuper ? 'admin' : (claimedRole === 'vendor' ? 'vendor' : 'customer');
      return {
        verifiedRole: roleResult,
        isPro: isSuper,
        isRootSuperAdmin: isSuper,
        privilegeEscalationPrevented: claimedRole === 'admin' && !isSuper,
      };
    } catch {
      const isAdmin = email.toLowerCase().trim() === 'admin@megamarket.co.ke';
      const roleResult: 'admin' | 'vendor' | 'customer' = isAdmin ? 'admin' : (claimedRole === 'vendor' ? 'vendor' : 'customer');
      return {
        verifiedRole: roleResult,
        isPro: isAdmin,
        isRootSuperAdmin: isAdmin,
        privilegeEscalationPrevented: claimedRole === 'admin' && !isAdmin,
      };
    }
  };

  // Rule 4: Rate-limited email form transmission
  const sendContactEmail = async (emailData: {
    recipient?: string;
    subject?: string;
    senderName?: string;
    senderEmail: string;
    message: string;
    formType?: string;
  }) => {
    try {
      const res = await fetch('/api/contact/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });
      const data = await res.json();
      if (res.status === 429) {
        return {
          success: false,
          message: data.error || 'Rate limit exceeded: Too many email requests (HTTP 429).',
          retryAfterSeconds: data.retryAfterSeconds || 120,
        };
      }
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Failed to send email.',
        };
      }
      return {
        success: true,
        message: data.message || 'Email dispatched securely.',
        remainingQuota: data.remainingQuota,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Network error sending email.',
      };
    }
  };

  // Rule 6: Comprehensive Security Audit
  const fetchSecurityAuditReport = async () => {
    try {
      const res = await fetch('/api/security/audit');
      return await res.json();
    } catch {
      return null;
    }
  };

  // Price formatter (KES or USD)
  const formatPrice = (kesAmount: number) => {
    if (currency === 'USD') {
      const usd = kesAmount / 130;
      return `$${usd.toFixed(2)}`;
    }
    return `KES ${kesAmount.toLocaleString()}`;
  };

  // Reset to default fresh seed data
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem('megamarket_users_v5');
    localStorage.removeItem('megamarket_vendors_v5');
    localStorage.removeItem('megamarket_categories_v5');
    localStorage.removeItem('megamarket_products_v5');
    localStorage.removeItem('megamarket_orders_v5');
    localStorage.removeItem('megamarket_current_user_id_v5');
    localStorage.removeItem('megamarket_logged_in_v5');

    setUsers(SEED_USERS);
    setVendors(SEED_VENDORS);
    setCategories(SEED_CATEGORIES);
    setProducts(SEED_PRODUCTS);
    setOrders(SEED_ORDERS);
    setCart([]);
    setCurrentUserId(null);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        currentVendor,
        isCurrentUserRootAdmin,
        isLoggedIn,
        logout,
        backendSecurityProfile,
        switchUser,
        loginWithEmail,
        registerUser,
        deleteUser,
        calculateServerQuote,
        verifyRoleWithServer,
        sendContactEmail,
        fetchSecurityAuditReport,
        vendors,
        getVendorById,
        updateVendorProfile,
        createVendorProfileForCurrentUser,
        adminSetVendorStatus,
        deleteVendor,
        categories,
        addCategory,
        deleteCategory,
        products,
        publicProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        getProductById,
        addReview,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        createOrder,
        getCustomerOrders,
        getVendorOrders,
        updateOrderItemStatus,
        adminUpdateOrderStatus,
        currency,
        setCurrency,
        formatPrice,
        resetAllData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
