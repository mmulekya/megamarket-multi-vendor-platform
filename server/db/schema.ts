/**
 * Database Schema Definition for MegaMarket Turso SQLite Database
 * 
 * Tables:
 * - users: id, name, email UNIQUE, password_hash, role, created_at
 * - vendors: id, user_id, shop_name, description, logo, status, created_at
 * - reports: id, reference_number, report_type, target_id, description, contact_email, status, created_at
 * 
 * Security: Passwords are NEVER stored in plain-text (strictly hashed with bcrypt).
 */

export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'vendor', 'admin')),
    email_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'suspended')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    report_type TEXT NOT NULL CHECK(report_type IN ('counterfeit', 'wrong_item', 'vendor_behaviour', 'copyright_complaint', 'other')),
    target_id TEXT,
    description TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'resolved', 'dismissed')),
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS email_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK(purpose IN ('verify', 'login')),
    code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    used_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reports_ref ON reports(reference_number)`,
  `CREATE INDEX IF NOT EXISTS idx_email_codes_user_purpose ON email_codes(user_id, purpose)`
];

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'customer' | 'vendor' | 'admin';
  email_verified: number;
  created_at: string;
}

export interface DbEmailCode {
  id: string;
  user_id: string;
  purpose: 'verify' | 'login';
  code_hash: string;
  expires_at: string;
  attempts: number;
  used_at: string | null;
  created_at: string;
}

export interface DbVendor {
  id: string;
  user_id: string;
  shop_name: string;
  description: string | null;
  logo: string | null;
  status: 'pending' | 'approved' | 'suspended';
  created_at: string;
}

export interface DbReport {
  id: string;
  reference_number: string;
  report_type: 'counterfeit' | 'wrong_item' | 'vendor_behaviour' | 'copyright_complaint' | 'other';
  target_id: string | null;
  description: string;
  contact_email: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
}
