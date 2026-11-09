import { Router, Request, Response } from 'express';
import { dbHelpers } from '../db/index.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

export const adminRouter = Router();

// Protect ALL admin routes with requireAuth and requireRole('admin')
adminRouter.use(requireAuth, requireRole('admin'));

/**
 * GET /api/admin/vendors
 * List all vendors along with their owner details
 */
adminRouter.get('/vendors', (_req: Request, res: Response) => {
  try {
    const vendors = dbHelpers.getAllVendors();
    return res.json({ vendors });
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({ error: 'Failed to retrieve vendors.' });
  }
});

/**
 * PATCH /api/admin/vendors/:id/status
 * Approve, suspend or set pending status on a vendor store
 */
adminRouter.patch('/vendors/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or suspended.' });
    }

    const vendor = dbHelpers.findVendorById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor store not found.' });
    }

    dbHelpers.updateVendorStatus(id, status);

    return res.json({
      success: true,
      message: `Vendor store "${vendor.shop_name}" status updated to ${status.toUpperCase()}.`,
      vendorId: id,
      status,
    });
  } catch (error: any) {
    console.error('Error updating vendor status:', error);
    return res.status(500).json({ error: 'Failed to update vendor status.' });
  }
});

/**
 * DELETE /api/admin/vendors/:id
 * Remove a vendor store permanently
 */
adminRouter.delete('/vendors/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendor = dbHelpers.findVendorById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor store not found.' });
    }

    dbHelpers.deleteVendor(id);

    return res.json({
      success: true,
      message: `Vendor store "${vendor.shop_name}" removed permanently.`,
      vendorId: id,
    });
  } catch (error: any) {
    console.error('Error deleting vendor:', error);
    return res.status(500).json({ error: 'Failed to delete vendor.' });
  }
});

/**
 * GET /api/admin/users
 * List all registered users (excluding password hashes)
 */
adminRouter.get('/users', (_req: Request, res: Response) => {
  try {
    const users = dbHelpers.getAllUsers();
    return res.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Remove a user record
 */
adminRouter.delete('/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Self-deletion check: admin cannot delete their own active session
    if (req.user && req.user.id === id) {
      return res.status(400).json({ error: 'Security Constraint: You cannot delete your own administrator account.' });
    }

    const targetUser = dbHelpers.findUserById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (targetUser.role === 'admin') {
      return res.status(403).json({ error: 'Security Constraint: Administrator accounts cannot be deleted.' });
    }

    dbHelpers.deleteUser(id);

    return res.json({
      success: true,
      message: `User "${targetUser.name}" (${targetUser.role}) has been permanently deleted.`,
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});
