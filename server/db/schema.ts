/**
 * Database Schema Definition for MegaMarket SQLite Database
 * 
 * Tables:
 * - users: id, name, email UNIQUE, password_hash, role, created_at
 * - vendors: id, user_id, shop_name, description, logo, status, created_at
 * 
 * Security: Passwords are NEVER stored in plain-text (strictly hashed with bcrypt).
 */

export const SCHEMA_SQL = `
-- Enforce foreign keys
PRAGMA foreign_keys = ON;

-- Users table: stores authentication credentials with hashed passwords
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('customer', 'vendor', 'admin')),
  created_at TEXT NOT NULL
);

-- Vendors table: stores merchant business profiles linked to users
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'suspended')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices for rapid lookup & unique integrity
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
`;

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'customer' | 'vendor' | 'admin';
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
