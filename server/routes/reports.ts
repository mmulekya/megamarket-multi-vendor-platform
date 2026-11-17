import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbHelpers } from '../db/index.ts';
import { reportsRateLimiter } from '../middleware/rateLimiter.ts';

export const reportsRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = ['counterfeit', 'wrong_item', 'vendor_behaviour', 'copyright_complaint', 'other'] as const;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * POST /api/reports
 * Customer Issue / Counterfeit Report Submission
 * Hardened with 5/hour rate limiting, strict parameter validation, HTML escaping, and parameterized SQL.
 */
reportsRouter.post('/', reportsRateLimiter, async (req: Request, res: Response) => {
  try {
    const { reportType, targetId, description, contactEmail } = req.body;

    // 1. Validate Report Type
    if (!reportType || !VALID_TYPES.includes(reportType)) {
      return res.status(400).json({
        error: 'Invalid report type. Must be counterfeit, wrong_item, vendor_behaviour, copyright_complaint, or other.',
      });
    }

    // 2. Validate Contact Email
    const normalizedEmail = (typeof contactEmail === 'string' ? contactEmail : '').toLowerCase().trim().slice(0, 100);
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        error: 'A valid contact email address is required so our support team can update you.',
      });
    }

    // 3. Validate Description Length (20 to 3000 characters)
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required.' });
    }
    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 20 || trimmedDescription.length > 3000) {
      return res.status(400).json({
        error: 'Description must be between 20 and 3000 characters long.',
      });
    }

    // 4. Sanitize inputs (HTML escaping)
    const cleanDescription = escapeHtml(trimmedDescription);
    const cleanTargetId = typeof targetId === 'string' ? escapeHtml(targetId.trim().slice(0, 100)) : null;

    // 5. Generate Reference Number & Unique ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `REP-2026-${randomSuffix}`;
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    // 6. Save to Turso database (parameterized SQL)
    await dbHelpers.insertReport({
      id: reportId,
      reference_number: referenceNumber,
      report_type: reportType,
      target_id: cleanTargetId || null,
      description: cleanDescription,
      contact_email: normalizedEmail,
      status: 'open',
      created_at: now,
    });

    return res.status(201).json({
      success: true,
      message: 'Your report has been successfully recorded and assigned to our investigation desk.',
      referenceNumber,
      reportId,
    });
  } catch (error: any) {
    console.error('Error recording report:', error?.message || 'Database error');
    return res.status(500).json({ error: 'Failed to record report. Please try again later.' });
  }
});
