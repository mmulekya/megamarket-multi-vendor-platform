import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SCHEMA_SQL, DbUser, DbVendor } from './schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the db directory exists
const dbDir = path.resolve(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Path to SQLite database file
const dbPath = path.resolve(dbDir, 'megamarket.sqlite');

// Initialize synchronous SQLite database connection
export const db = new DatabaseSync(dbPath);

// Apply schema migrations
db.exec(SCHEMA_SQL);

/**
 * Database Helper Functions
 */
export const dbHelpers = {
  // Find user by normalized email
  findUserByEmail(email: string): DbUser | null {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    const result = stmt.get(email.trim());
    return (result as DbUser) || null;
  },

  // Find user by unique ID
  findUserById(id: string): DbUser | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const result = stmt.get(id);
    return (result as DbUser) || null;
  },

  // Insert a new user (uses INSERT OR IGNORE to prevent crash on duplicate)
  insertUser(user: DbUser): void {
    const stmt = db.prepare(
      'INSERT OR IGNORE INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(user.id, user.name, user.email.toLowerCase().trim(), user.password_hash, user.role, user.created_at);
  },

  // Find vendor by associated user_id
  findVendorByUserId(userId: string): DbVendor | null {
    const stmt = db.prepare('SELECT * FROM vendors WHERE user_id = ?');
    const result = stmt.get(userId);
    return (result as DbVendor) || null;
  },

  // Find vendor by ID
  findVendorById(id: string): DbVendor | null {
    const stmt = db.prepare('SELECT * FROM vendors WHERE id = ?');
    const result = stmt.get(id);
    return (result as DbVendor) || null;
  },

  // Insert a new vendor (uses INSERT OR IGNORE to prevent crash on duplicate)
  insertVendor(vendor: DbVendor): void {
    const stmt = db.prepare(
      'INSERT OR IGNORE INTO vendors (id, user_id, shop_name, description, logo, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(
      vendor.id,
      vendor.user_id,
      vendor.shop_name,
      vendor.description,
      vendor.logo,
      vendor.status,
      vendor.created_at
    );
  },

  // Update vendor status
  updateVendorStatus(vendorId: string, status: 'pending' | 'approved' | 'suspended'): void {
    const stmt = db.prepare('UPDATE vendors SET status = ? WHERE id = ?');
    stmt.run(status, vendorId);
  },

  // Delete vendor
  deleteVendor(vendorId: string): void {
    const stmt = db.prepare('DELETE FROM vendors WHERE id = ?');
    stmt.run(vendorId);
  },

  // Get all users (excluding password hashes)
  getAllUsers(): Omit<DbUser, 'password_hash'>[] {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return stmt.all() as Omit<DbUser, 'password_hash'>[];
  },

  // Delete user by ID
  deleteUser(userId: string): void {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(userId);
  },

  // Get all vendors with user details
  getAllVendors(): (DbVendor & { owner_name?: string; owner_email?: string })[] {
    const stmt = db.prepare(`
      SELECT v.*, u.name as owner_name, u.email as owner_email
      FROM vendors v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `);
    return stmt.all() as (DbVendor & { owner_name?: string; owner_email?: string })[];
  },
};
