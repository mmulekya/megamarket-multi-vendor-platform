import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbHelpers } from '../db/index.ts';
import { requireAuth, requireRole, requireApprovedVendor } from '../middleware/auth.ts';

export const vendorRouter = Router();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Protect all vendor routes with requireAuth and requireRole('vendor', 'admin')
vendorRouter.use(requireAuth, requireRole('vendor', 'admin'));

/**
 * GET /api/vendor/profile
 * Get logged-in vendor profile. Scoped strictly to req.user.vendorId from verified session.
 */
vendorRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    const sessionVendorId = req.user?.vendorId;
    if (!sessionVendorId) {
      return res.status(404).json({ error: 'Vendor profile not found.' });
    }

    const vendor = await dbHelpers.findVendorById(sessionVendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found.' });
    }

    return res.json({ vendor });
  } catch (error: any) {
    console.error('Error fetching vendor profile:', error?.message || 'DB error');
    return res.status(500).json({ error: 'Failed to retrieve vendor profile.' });
  }
});

/**
 * PATCH /api/vendor/profile
 * Update logged-in vendor profile. Scoped strictly to req.user.vendorId from session.
 */
vendorRouter.patch('/profile', async (req: Request, res: Response) => {
  try {
    const sessionVendorId = req.user?.vendorId;
    if (!sessionVendorId) {
      return res.status(404).json({ error: 'Vendor store not found.' });
    }

    const vendor = await dbHelpers.findVendorById(sessionVendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor store not found.' });
    }

    const { shopName, description, logo } = req.body;

    const newShopName = typeof shopName === 'string' && shopName.trim()
      ? escapeHtml(shopName.trim().slice(0, 100))
      : vendor.shop_name;

    const newDescription = typeof description === 'string'
      ? escapeHtml(description.trim().slice(0, 500))
      : vendor.description;

    const newLogo = typeof logo === 'string' && logo.startsWith('http')
      ? logo.trim().slice(0, 255)
      : vendor.logo;

    await dbHelpers.updateVendorProfile(
      sessionVendorId,
      newShopName,
      newDescription,
      newLogo
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
    console.error('Error updating vendor profile:', error?.message || 'DB error');
    return res.status(500).json({ error: 'Failed to update vendor profile.' });
  }
});

/**
 * GET /api/vendor/:id
 * Lookup vendor by ID: Return 404 if the logged-in vendor tries to access another vendor's record
 */
vendorRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sessionVendorId = req.user?.vendorId;

    // Non-admin vendors cannot inspect other vendors' private records; return 404
    if (req.user?.role !== 'admin' && sessionVendorId !== id) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    const vendor = await dbHelpers.findVendorById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    return res.json({ vendor });
  } catch (error: any) {
    console.error('Error finding vendor by ID:', error?.message || 'DB error');
    return res.status(500).json({ error: 'Failed to retrieve vendor.' });
  }
});

/**
 * POST /api/vendor/products/publish
 * Validate product publication: A pending or suspended vendor CANNOT publish products.
 * Product's vendorId is strictly assigned from req.user.vendorId.
 */
vendorRouter.post('/products/publish', requireApprovedVendor, (req: Request, res: Response) => {
  const sessionVendorId = req.user?.vendorId;
  const { title, price, stock, categoryId, description, image } = req.body;

  if (!title || price === undefined) {
    return res.status(400).json({ error: 'Product title and price are required.' });
  }

  const cleanTitle = escapeHtml(String(title).trim().slice(0, 150));
  const cleanDesc = typeof description === 'string' ? escapeHtml(description.trim().slice(0, 1000)) : '';

  return res.json({
    success: true,
    message: 'Product authorized and published by approved vendor.',
    product: {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      vendorId: sessionVendorId, // Enforced from server session, never request body
      title: cleanTitle,
      price: Math.max(0, Number(price) || 0),
      stock: Math.max(0, parseInt(stock, 10) || 0),
      categoryId: categoryId ? String(categoryId).slice(0, 50) : 'electronics',
      description: cleanDesc,
      image: typeof image === 'string' && image.startsWith('http') ? image.slice(0, 255) : '',
      createdAt: new Date().toISOString(),
    },
  });
});
