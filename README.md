# MegaMarket Multi-Vendor E-Commerce Platform

A production-grade multi-vendor e-commerce web application featuring server-side role protection, tenant isolation, and full-stack session authentication. Built with React 19, TypeScript, Tailwind CSS, Express, and Node.js built-in SQLite (`node:sqlite`).

---

## 🚀 What the App Is

**MegaMarket** is an East African online marketplace inspired by platforms like Jumia and Kilimall. It features three distinct roles:
1. **Shoppers / Customers**: Browse verified products, calculate quotes, and check out with M-Pesa or Cash on Delivery.
2. **Vendors / Merchants**: Register their shop, manage shop profiles, and submit products for publication. Products from pending or suspended vendors are automatically blocked from public listings.
3. **Administrators**: Review newly registered merchant shops (Approve, Suspend, Reinstate), manage platform users, inspect security controls, and oversee platform performance.

### 🛡️ 6-Point Security Architecture
1. **Server-Authoritative Price Calculation**: Quotes and line totals are computed and verified strictly on the server (`POST /api/orders/calculate-quote`). Client price tampering is automatically detected and rejected.
2. **Server Role Protection**: User roles are never trusted from request payloads. Elevation to `admin` is prevented at registration (`assignedRole = role === 'vendor' ? 'vendor' : 'customer'`). Protected endpoints use server middleware (`requireAuth`, `requireRole('admin')`, `requireRole('vendor')`).
3. **Tenant & Catalog Row-Level Isolation**: Pending or suspended vendors cannot publish products (`requireApprovedVendor` middleware). Vendor product mutations filter strictly by the logged-in vendor's session ID (`req.user.vendorId`).
4. **Rate Limiting**: Anti-brute-force rate limiting on `/api/auth/login` (5 attempts per 15 minutes per IP) and anti-spam protection on `/api/contact/send-email` (3 attempts per 2 minutes per IP) returning `HTTP 429`.
5. **IDOR Prevention**: All vendor and admin actions enforce server-side identity verification via `httpOnly`, `sameSite=lax` signed JWT cookies (`mm_session`).
6. **Secret Key Hygiene**: `GEMINI_API_KEY`, `SESSION_SECRET`, and password hashes reside exclusively on the server and are never bundled to the client.

---

## 🛠️ Setup Steps

### 1. Prerequisites
- **Node.js**: v22.0.0 or later (uses native `node:sqlite`).
- **npm**: v10+

### 2. Installation
```bash
# Clone the repository and enter directory
cd megamarket

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Configure your variables as described in the next section.

### 4. Running the Development Server
```bash
npm run dev
```
The server will initialize the SQLite database (`server/db/megamarket.sqlite`), run the seeder, and serve the application on [http://localhost:3000](http://localhost:3000).

### 5. Production Build & Start
```bash
npm run build
npm start
```

---

## 🔑 Required `.env` Variables

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `3000` | Port for Express dev and production server. |
| `SESSION_SECRET` | **Required** | `megamarket_default_dev_session_secret_2026` | Secret key used to sign session JWTs stored in `httpOnly` cookies. |
| `ADMIN_EMAIL` | **Required** | `admin@megamarket.co.ke` | Primary administrator email configured for the seeded root account. |
| `ADMIN_PASSWORD` | **Required** | `AdminPassword2026!` | Primary administrator password (minimum 8 characters). |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key used by the backend AI product description assistant. |
| `APP_URL` | Optional | `http://localhost:3000` | Base host URL for deployment environments. |

---

## 🌱 Database Seeding

The application automatically seeds the database on startup via `seedDatabase()` in `server/db/seed.ts`.

To re-seed or reset accounts:
1. Stop the server (`Ctrl+C`).
2. Delete the SQLite database file:
   ```bash
   rm server/db/megamarket.sqlite
   ```
3. Restart the server (`npm run dev`), which recreates the database tables and populates the test accounts.

---

## 👥 Test Accounts

All passwords are encrypted with bcrypt (10 salt rounds).

### 1. Root Administrator
- **Email**: `admin@megamarket.co.ke` (or your custom `ADMIN_EMAIL` in `.env`)
- **Password**: `AdminPassword2026!` (or your custom `ADMIN_PASSWORD` in `.env`)
- **Role**: `admin`
- **Capabilities**: Approve/suspend/delete vendors, delete platform users, run live security audit simulations, oversee marketplace metrics.

### 2. Demo Vendor Merchant
- **Email**: `vendor@megamarket.co.ke`
- **Password**: `VendorPassword2026!`
- **Role**: `vendor`
- **Associated Store**: *Nairobi Tech & Gadgets* (`status: pending`)
- **Capabilities**: Access vendor dashboard, view assigned orders, update shop profile. Cannot publish products until approved by the administrator.

### 3. Demo Customer Shopper
- **Email**: `customer@megamarket.co.ke`
- **Password**: `CustomerPassword2026!`
- **Role**: `customer`
- **Name**: *Wanjiku Kamau*
- **Capabilities**: Browse approved catalog products, add to cart, calculate server-verified quotes, complete orders.
