import { Router, Request, Response } from 'express';
import { db, dbHelpers } from '../db/index.ts';
import { requireAuth, requireRole, requireApprovedVendor } from '../middleware/auth.ts';

export const vendorRouter = Router();

// Protect all vendor routes with requireAuth and requireRole('vendor')
vendorRouter.use(requireAuth, requireRole('vendor', 'admin'));

/**
 * GET /api/vendor/profile
 * Get logged-in vendor profile. Filtered strictly by session vendorId, never from request body.
 */
vendorRouter.get('/profile', (req: Request, res: Response) => {
  try {
    const vendorId = req.user?.vendorId;
    if (!vendorId) {
      return res.status(404).json({ error: 'No vendor profile found for this user.' });
    }

    const vendor = dbHelpers.findVendorById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found.' });
    }

    return res.json({ vendor });
  } catch (error: any) {
    console.error('Error fetching vendor profile:', error);
    return res.status(500).json({ error: 'Failed to retrieve vendor profile.' });
  }
});

/**
 * PATCH /api/vendor/profile
 * Update logged-in vendor profile. Strictly scoped to req.user.vendorId from session.
 */
vendorRouter.patch('/profile', (req: Request, res: Response) => {
  try {
    const vendorId = req.user?.vendorId;
    if (!vendorId) {
      return res.status(404).json({ error: 'No vendor profile associated with current session.' });
    }

    const { shopName, description, logo } = req.body;

    const vendor = dbHelpers.findVendorById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor store not found.' });
    }

    const newShopName = (shopName || vendor.shop_name).trim();
    const newDescription = description !== undefined ? description.trim() : vendor.description;
    const newLogo = logo || vendor.logo;

    db.prepare('UPDATE vendors SET shop_name = ?, description = ?, logo = ? WHERE id = ?').run(
      newShopName,
      newDescription,
      newLogo,
      vendorId
    );

    return res.json({
      success: true,
      message: 'Vendor profile updated successfully.',
      vendor: {
        ...vendor,
        shop_name: newShopName,
        description: newDescription,
        logo: newLogo,
      },
    });
  } catch (error: any) {
    console.error('Error updating vendor profile:', error);
    return res.status(500).json({ error: 'Failed to update vendor profile.' });
  }
});

/**
 * POST /api/vendor/products/publish
 * Validate product publication: A pending or suspended vendor CANNOT publish products.
 * Protected by requireApprovedVendor middleware.
 */
vendorRouter.post('/products/publish', requireApprovedVendor, (req: Request, res: Response) => {
  const vendorId = req.user?.vendorId;
  const { title, price, stock, categoryId, description, image } = req.body;

  if (!title || price === undefined) {
    return res.status(400).json({ error: 'Product title and price are required.' });
  }

  // The vendor ID is ALWAYS authoritative from the session, never from req.body
  return res.json({
    success: true,
    message: 'Product authorized and published by approved vendor.',
    product: {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      vendorId, // Enforced from server session
      title,
      price: Number(price),
      stock: Number(stock) || 0,
      categoryId,
      description,
      image,
      createdAt: new Date().toISOString(),
    },
  });
});
