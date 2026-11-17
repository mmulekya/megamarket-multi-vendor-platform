import { createClient } from '@libsql/client/web';
import type { Client } from '@libsql/client/web';
import dotenv from 'dotenv';
import { SCHEMA_STATEMENTS } from './schema.ts';
import type { DbUser, DbVendor, DbReport, DbEmailCode } from './schema.ts';

dotenv.config();

/**
 * Initialize connection to hosted Turso database.
 * Requirement 1: Import createClient from '@libsql/client/web' (HTTP only).
 * Requirement 4: If Turso variables are missing, fail with a clear error message that names the missing variable, not a crash with a stack trace.
 */
function initializeTursoClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('Configuration Error: Missing required environment variable: TURSO_DATABASE_URL.');
    console.error('Please configure TURSO_DATABASE_URL in your environment or secrets.');
    process.exit(1);
  }

  if (!authToken) {
    console.error('Configuration Error: Missing required environment variable: TURSO_AUTH_TOKEN.');
    console.error('Please configure TURSO_AUTH_TOKEN in your environment or secrets.');
    process.exit(1);
  }

  return createClient({ url, authToken });
}

export const db: Client = initializeTursoClient();

/**
 * Run database schema migrations with CREATE TABLE IF NOT EXISTS on startup.
 */
export async function initDatabaseSchema(): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement);
  }

  // Safely add users.email_verified if migrating an existing users table and mark existing users verified
  const userCols = await db.execute('PRAGMA table_info(users)');
  const hasEmailVerified = userCols.rows.some((row) => String(row.name) === 'email_verified');
  if (!hasEmailVerified) {
    await db.execute('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0');
    await db.execute('UPDATE users SET email_verified = 1');
  }

  // Ensure existing Turso reports tables allow 'copyright_complaint' in report_type CHECK constraint
  const tableInfo = await db.execute({
    sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'reports'",
    args: [],
  });
  const createSql = String(tableInfo.rows[0]?.sql || '');
  if (createSql && !createSql.includes('copyright_complaint')) {
    await db.batch(
      [
        `CREATE TABLE IF NOT EXISTS reports_migrated (
          id TEXT PRIMARY KEY,
          reference_number TEXT UNIQUE NOT NULL,
          report_type TEXT NOT NULL CHECK(report_type IN ('counterfeit', 'wrong_item', 'vendor_behaviour', 'copyright_complaint', 'other')),
          target_id TEXT,
          description TEXT NOT NULL,
          contact_email TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'resolved', 'dismissed')),
          created_at TEXT NOT NULL
        )`,
        `INSERT INTO reports_migrated (id, reference_number, report_type, target_id, description, contact_email, status, created_at)
         SELECT id, reference_number, report_type, target_id, description, contact_email, status, created_at FROM reports`,
        `DROP TABLE reports`,
        `ALTER TABLE reports_migrated RENAME TO reports`,
        `CREATE INDEX IF NOT EXISTS idx_reports_ref ON reports(reference_number)`,
      ],
      'write'
    );
  }
}

/**
 * Async Database Helper Functions (Parameterized queries only)
 */
export const dbHelpers = {
  // Find user by normalized email
  async findUserByEmail(email: string): Promise<DbUser | null> {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      args: [email.trim()],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as DbUser;
  },

  // Find user by unique ID
  async findUserById(id: string): Promise<DbUser | null> {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as DbUser;
  },

  // Insert a new user
  async insertUser(user: DbUser): Promise<void> {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO users (id, name, email, password_hash, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [
        user.id,
        user.name,
        user.email.toLowerCase().trim(),
        user.password_hash,
        user.role,
        user.email_verified ?? 0,
        user.created_at,
      ],
    });
  },

  // Mark a user's email address as verified
  async markUserEmailVerified(userId: string): Promise<void> {
    await db.execute({
      sql: 'UPDATE users SET email_verified = 1 WHERE id = ?',
      args: [userId],
    });
  },

  // Update user password hash
  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
      args: [passwordHash, userId],
    });
  },

  // Update user email
  async updateUserEmail(userId: string, email: string): Promise<void> {
    await db.execute({
      sql: 'UPDATE users SET email = ? WHERE id = ?',
      args: [email.toLowerCase().trim(), userId],
    });
  },

  // Register user and optional vendor profile atomically in a transaction batch
  async registerUserAndVendor(user: DbUser, vendor?: DbVendor): Promise<void> {
    if (vendor) {
      await db.batch([
        {
          sql: 'INSERT INTO users (id, name, email, password_hash, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [
            user.id,
            user.name,
            user.email.toLowerCase().trim(),
            user.password_hash,
            user.role,
            user.email_verified ?? 0,
            user.created_at,
          ],
        },
        {
          sql: 'INSERT INTO vendors (id, user_id, shop_name, description, logo, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [
            vendor.id,
            vendor.user_id,
            vendor.shop_name,
            vendor.description || null,
            vendor.logo || null,
            vendor.status,
            vendor.created_at,
          ],
        },
      ], 'write');
    } else {
      await this.insertUser(user);
    }
  },

  // Find vendor by associated user_id
  async findVendorByUserId(userId: string): Promise<DbVendor | null> {
    const result = await db.execute({
      sql: 'SELECT * FROM vendors WHERE user_id = ?',
      args: [userId],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as DbVendor;
  },

  // Find vendor by ID
  async findVendorById(id: string): Promise<DbVendor | null> {
    const result = await db.execute({
      sql: 'SELECT * FROM vendors WHERE id = ?',
      args: [id],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as DbVendor;
  },

  // Insert a new vendor
  async insertVendor(vendor: DbVendor): Promise<void> {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO vendors (id, user_id, shop_name, description, logo, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [
        vendor.id,
        vendor.user_id,
        vendor.shop_name,
        vendor.description || null,
        vendor.logo || null,
        vendor.status,
        vendor.created_at,
      ],
    });
  },

  // Update vendor status
  async updateVendorStatus(vendorId: string, status: 'pending' | 'approved' | 'suspended'): Promise<void> {
    await db.execute({
      sql: 'UPDATE vendors SET status = ? WHERE id = ?',
      args: [status, vendorId],
    });
  },

  // Update vendor shop profile details
  async updateVendorProfile(
    vendorId: string,
    shopName: string,
    description: string | null,
    logo: string | null
  ): Promise<void> {
    await db.execute({
      sql: 'UPDATE vendors SET shop_name = ?, description = ?, logo = ? WHERE id = ?',
      args: [shopName, description, logo, vendorId],
    });
  },

  // Delete vendor
  async deleteVendor(vendorId: string): Promise<void> {
    await db.execute({
      sql: 'DELETE FROM vendors WHERE id = ?',
      args: [vendorId],
    });
  },

  // Get all users (excluding password hashes)
  async getAllUsers(): Promise<Omit<DbUser, 'password_hash'>[]> {
    const result = await db.execute(
      'SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows as unknown as Omit<DbUser, 'password_hash'>[];
  },

  // Delete user and associated vendor profile atomically using batch
  async deleteUser(userId: string): Promise<void> {
    await db.batch([
      { sql: 'DELETE FROM vendors WHERE user_id = ?', args: [userId] },
      { sql: 'DELETE FROM users WHERE id = ?', args: [userId] },
    ], 'write');
  },

  // Get all vendors with user details
  async getAllVendors(): Promise<(DbVendor & { owner_name?: string; owner_email?: string })[]> {
    const result = await db.execute(`
      SELECT v.*, u.name as owner_name, u.email as owner_email
      FROM vendors v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `);
    return result.rows as unknown as (DbVendor & { owner_name?: string; owner_email?: string })[];
  },

  // Insert a customer report
  async insertReport(report: DbReport): Promise<void> {
    await db.execute({
      sql: `INSERT INTO reports (id, reference_number, report_type, target_id, description, contact_email, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        report.id,
        report.reference_number,
        report.report_type,
        report.target_id || null,
        report.description,
        report.contact_email,
        report.status || 'open',
        report.created_at,
      ],
    });
  },

  // Get all submitted reports (Admin only)
  async getAllReports(): Promise<DbReport[]> {
    const result = await db.execute('SELECT * FROM reports ORDER BY created_at DESC');
    return result.rows as unknown as DbReport[];
  },

  // Update report status
  async updateReportStatus(
    reportId: string,
    status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  ): Promise<void> {
    await db.execute({
      sql: 'UPDATE reports SET status = ? WHERE id = ?',
      args: [status, reportId],
    });
  },

  // Create a new email verification code and invalidate older unused codes for the same user and purpose
  async createEmailCode(record: DbEmailCode): Promise<void> {
    await db.batch(
      [
        {
          sql: 'UPDATE email_codes SET used_at = ? WHERE user_id = ? AND purpose = ? AND used_at IS NULL',
          args: [record.created_at, record.user_id, record.purpose],
        },
        {
          sql: `INSERT INTO email_codes (id, user_id, purpose, code_hash, expires_at, attempts, used_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            record.id,
            record.user_id,
            record.purpose,
            record.code_hash,
            record.expires_at,
            record.attempts,
            record.used_at,
            record.created_at,
          ],
        },
      ],
      'write'
    );
  },

  // Find latest active (unused) email code for a user & purpose
  async findLatestActiveEmailCode(
    userId: string,
    purpose: 'verify' | 'login'
  ): Promise<DbEmailCode | null> {
    const result = await db.execute({
      sql: 'SELECT * FROM email_codes WHERE user_id = ? AND purpose = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1',
      args: [userId, purpose],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as DbEmailCode;
  },

  // Find most recent email code for a user & purpose (used for resend cooldown check)
  async findLatestEmailCodeByUser(
    userId: string,
    purpose: 'verify' | 'login'
  ): Promise<DbEmailCode | null> {
    const result = await db.execute({
      sql: 'SELECT * FROM email_codes WHERE user_id = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1',
      args: [userId, purpose],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as DbEmailCode;
  },

  // Increment failed attempts, and invalidate code when max attempts reached
  async incrementEmailCodeAttempt(
    codeId: string,
    newAttempts: number,
    invalidateAt?: string
  ): Promise<void> {
    if (invalidateAt) {
      await db.execute({
        sql: 'UPDATE email_codes SET attempts = ?, used_at = ? WHERE id = ?',
        args: [newAttempts, invalidateAt, codeId],
      });
    } else {
      await db.execute({
        sql: 'UPDATE email_codes SET attempts = ? WHERE id = ?',
        args: [newAttempts, codeId],
      });
    }
  },

  // Mark an email code as used (e.g. expired)
  async invalidateEmailCode(codeId: string, usedAt: string): Promise<void> {
    await db.execute({
      sql: 'UPDATE email_codes SET used_at = ? WHERE id = ?',
      args: [usedAt, codeId],
    });
  },

  // Atomically mark code used and mark user email as verified
  async markEmailCodeUsedAndVerifyUser(
    codeId: string,
    userId: string,
    usedAt: string
  ): Promise<void> {
    await db.batch(
      [
        {
          sql: 'UPDATE email_codes SET used_at = ? WHERE id = ?',
          args: [usedAt, codeId],
        },
        {
          sql: 'UPDATE users SET email_verified = 1 WHERE id = ?',
          args: [userId],
        },
      ],
      'write'
    );
  },
};
