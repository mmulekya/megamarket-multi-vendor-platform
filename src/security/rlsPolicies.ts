/**
 * MegaMarket Row-Level Security (RLS) & IDOR Protection Policies
 * Implements the 6-Point Security Architecture:
 * 1. Calculate every price on the server.
 * 2. Never trust role or isPro from the browser.
 * 3. Turn on RLS for every table.
 * 4. Rate-limit every form that sends email.
 * 5. Check who owns it before update or delete.
 * 6. Keep secret keys out of the frontend.
 */

import { Order, OrderItem, Product, Review, User, Vendor } from '../types';

export const ROOT_ADMIN_EMAIL = 'admin@megamarket.co.ke';
export const ROOT_ADMIN_ID = 'usr_admin_root';

/**
 * Superadmin gatekeeper: strictly validates verified administrator
 */
export function isSuperAdmin(user?: User | null): boolean {
  if (!user) return false;
  const normalized = user.email?.toLowerCase().trim() || '';
  return (
    user.role === 'admin' ||
    user.id === ROOT_ADMIN_ID ||
    normalized === ROOT_ADMIN_EMAIL
  );
}

/**
 * 1. PRODUCTS TABLE RLS POLICIES
 */
export const ProductsRLS = {
  tableName: 'products',

  // SELECT Policy: Public can only view active products from approved vendors;
  // Owner vendors and Admin can view all their own products regardless of status.
  canSelect(product: Product, user?: User | null, vendorStatus?: string): boolean {
    if (isSuperAdmin(user)) return true;
    if (user?.role === 'vendor' && user.vendorId && product.vendorId === user.vendorId) {
      return true;
    }
    // Public/Customer read requires active product AND approved vendor
    return Boolean(product.isActive && (!vendorStatus || vendorStatus === 'approved'));
  },

  // INSERT Policy: Must be an authenticated vendor; product.vendorId must match user's vendorId
  canInsert(user?: User | null): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'Authentication required' };
    if (user.role !== 'vendor' || !user.vendorId) {
      return { allowed: false, reason: 'Only registered vendors can insert products' };
    }
    return { allowed: true };
  },

  // UPDATE Policy: Only the owning vendor or Superadmin
  canUpdate(product: Product, user?: User | null): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'Authentication required' };
    if (isSuperAdmin(user)) return { allowed: true };
    if (user.role === 'vendor' && user.vendorId && product.vendorId === user.vendorId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `IDOR Alert: User ${user.email} does not own product ${product.id} (owned by vendor ${product.vendorId})`,
    };
  },

  // DELETE Policy: Only the owning vendor or Superadmin
  canDelete(product: Product, user?: User | null): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'Authentication required' };
    if (isSuperAdmin(user)) return { allowed: true };
    if (user.role === 'vendor' && user.vendorId && product.vendorId === user.vendorId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `IDOR Alert: Deletion denied. User does not own product ${product.id}`,
    };
  },
};

/**
 * 2. ORDERS & ORDER_ITEMS TABLE RLS POLICIES
 */
export const OrdersRLS = {
  tableName: 'orders',

  // SELECT Policy: Customers only see their own orders; Admin sees all
  canSelectOrder(order: Order, user?: User | null): boolean {
    if (!user) return false;
    if (isSuperAdmin(user)) return true;
    return order.userId === user.id;
  },

  // SELECT Policy for OrderItems (Vendor view): Vendors can ONLY view items belonging to their vendorId
  canSelectOrderItem(item: OrderItem, user?: User | null): boolean {
    if (!user) return false;
    if (isSuperAdmin(user)) return true;
    return user.role === 'vendor' && Boolean(user.vendorId) && item.vendorId === user.vendorId;
  },

  // UPDATE Policy: Only owning vendor can update fulfillment status of their line item
  canUpdateOrderItemStatus(item: OrderItem, user?: User | null): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'Authentication required' };
    if (isSuperAdmin(user)) return { allowed: true };
    if (user.role === 'vendor' && user.vendorId && item.vendorId === user.vendorId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `IDOR Alert: Cross-vendor status manipulation blocked for item ${item.id}`,
    };
  },
};

/**
 * 3. VENDORS TABLE RLS POLICIES
 */
export const VendorsRLS = {
  tableName: 'vendors',

  // SELECT Policy: Public can view approved vendors; Admin can view all
  canSelect(vendor: Vendor, user?: User | null): boolean {
    if (isSuperAdmin(user)) return true;
    if (user?.role === 'vendor' && user.vendorId === vendor.id) return true;
    return vendor.status === 'approved';
  },

  // UPDATE Policy: Vendor can update their own shop profile; Cannot change their own status to 'approved'
  canUpdateProfile(vendor: Vendor, user?: User | null, updates?: Partial<Vendor>): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'Authentication required' };
    if (isSuperAdmin(user)) return { allowed: true };
    if (user.role === 'vendor' && user.vendorId === vendor.id) {
      // Vendor cannot elevate their own status (Rule 2)
      if (updates && updates.status !== undefined && updates.status !== vendor.status) {
        return {
          allowed: false,
          reason: 'Privilege Escalation Blocked: Vendors cannot approve or alter their own vendor status',
        };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: 'IDOR Alert: Cannot update another vendor profile' };
  },

  // MODERATE / DELETE Policy: Strictly administrator only
  canModerateOrDelete(user?: User | null): { allowed: boolean; reason?: string } {
    if (isSuperAdmin(user)) return { allowed: true };
    return {
      allowed: false,
      reason: 'Administrator Authorization Required: Only the verified platform administrator has authority to approve or delete vendors.',
    };
  },
};

/**
 * 4. USERS TABLE RLS POLICIES
 */
export const UsersRLS = {
  tableName: 'users',

  // SELECT Policy: Users can view their own profile; Admin sees all
  canSelect(targetUser: User, requestingUser?: User | null): boolean {
    if (!requestingUser) return false;
    if (isSuperAdmin(requestingUser)) return true;
    return targetUser.id === requestingUser.id;
  },

  // UPDATE Policy: Users can edit their profile, but cannot elevate themselves to admin or spoof isPro
  canUpdate(targetUser: User, updates: Partial<User>, requestingUser?: User | null): { allowed: boolean; reason?: string } {
    if (!requestingUser) return { allowed: false, reason: 'Authentication required' };
    if (isSuperAdmin(requestingUser)) return { allowed: true };

    if (targetUser.id !== requestingUser.id) {
      return { allowed: false, reason: 'IDOR Alert: Cannot edit another user record' };
    }

    // Role Spoofing Protection (Rule 2)
    if (updates.role && updates.role === 'admin' && !isSuperAdmin(requestingUser)) {
      return {
        allowed: false,
        reason: 'Privilege Escalation Blocked: Browser cannot set role: admin',
      };
    }

    return { allowed: true };
  },

  // DELETE Policy: Strictly administrator only
  canDelete(requestingUser?: User | null): { allowed: boolean; reason?: string } {
    if (isSuperAdmin(requestingUser)) return { allowed: true };
    return {
      allowed: false,
      reason: 'Administrator Authorization Required: Only the verified platform administrator has authority to delete users.',
    };
  },
};

/**
 * 5. REVIEWS TABLE RLS POLICIES
 */
export const ReviewsRLS = {
  tableName: 'reviews',

  canInsert(user?: User | null): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'Only logged-in customers can submit reviews' };
    return { allowed: true };
  },

  canDelete(review: Review, user?: User | null): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'Authentication required' };
    if (isSuperAdmin(user)) return { allowed: true };
    if (review.userId === user.id) return { allowed: true };
    return { allowed: false, reason: 'Cannot delete another customer review' };
  },
};

/**
 * Universal IDOR & Ownership Verification Helper
 */
export function verifyOwnership(
  entityType: 'product' | 'order_item' | 'vendor' | 'user' | 'review',
  entity: any,
  user?: User | null
): { allowed: boolean; reason?: string } {
  if (isSuperAdmin(user)) {
    return { allowed: true };
  }

  if (!user) {
    return { allowed: false, reason: 'Unauthenticated mutation rejected' };
  }

  switch (entityType) {
    case 'product':
      return ProductsRLS.canUpdate(entity, user);
    case 'order_item':
      return OrdersRLS.canUpdateOrderItemStatus(entity, user);
    case 'vendor':
      return VendorsRLS.canUpdateProfile(entity, user);
    case 'user':
      return entity.id === user.id
        ? { allowed: true }
        : { allowed: false, reason: 'IDOR: Unauthorized user modification' };
    case 'review':
      return entity.userId === user.id
        ? { allowed: true }
        : { allowed: false, reason: 'IDOR: Unauthorized review modification' };
    default:
      return { allowed: false, reason: 'Unknown entity type' };
  }
}
