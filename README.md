# MegaMarket Multi-Vendor E-Commerce Platform

A production-grade multi-vendor e-commerce web application featuring server-side role protection, tenant isolation, full-stack session authentication, and persistent cloud storage backed by **Turso (hosted libSQL / SQLite)**. Built with React 19, TypeScript, Tailwind CSS, Express, and `@libsql/client/web`.

> **Important**: Application data (users, vendors, customer reports) lives entirely in your hosted **Turso database**. Because data is stored in Turso's cloud infrastructure, all records survive redeploys, server restarts, container rebuilding, and zip file exports without data loss. Local `.sqlite` files are not used.

---

## 🗄️ Turso Database Setup

To provision your hosted database:

### 1. Install the Turso CLI
```bash
# macOS / Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
irm https://get.tur.so/install.ps1 | iex
```

### 2. Log in or Create an Account
```bash
turso auth login
# Or sign up if you don't have an account:
turso auth signup
```

### 3. Create a New Database
```bash
turso db create megamarket
```

### 4. Retrieve the Database URL
```bash
turso db show megamarket --url
# Outputs: libsql://megamarket-<your-org>.turso.io
```

### 5. Generate an Authentication Token
```bash
turso db tokens create megamarket
# Generates a long-lived JWT token for your application
```

---

## 🔐 Secrets to Set

Configure the following environment variables (in your hosting provider's Secrets panel or in `.env`):

| Secret / Variable | Required | Description | Example Value |
| :--- | :---: | :--- | :--- |
| `TURSO_DATABASE_URL` | **Yes** | Hosted Turso connection URL starting with `libsql://` | `libsql://megamarket-myorg.turso.io` |
| `TURSO_AUTH_TOKEN` | **Yes** | Turso authentication token generated with `turso db tokens create` | `eyJhbGciOiJFZERTQ...` |
| `SESSION_SECRET` | **Yes** | Cryptographic secret key used to sign HTTP-only session cookies (`mm_session`) | `your_strong_random_session_secret_2026` |
| `ADMIN_EMAIL` | **Yes** | Seed administrator email address | `your-admin@email.com` |
| `ADMIN_PASSWORD` | **Yes** | Seed administrator password (minimum 8 characters) | choose your own, minimum 8 characters |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for server-side AI features | `AIzaSy...` |

---

## 👥 Seeded Test Accounts

The server seeds the hosted Turso database on startup. All passwords are encrypted with bcrypt (10 salt rounds):

### 1. Root Administrator
- **Email**: `your-admin@email.com` (configured in `ADMIN_EMAIL`)
- **Password**: Configured via `ADMIN_PASSWORD` (choose your own, minimum 8 characters)
- **Role**: `admin`
- **Capabilities**: Approve, suspend, and delete vendor shops; manage user accounts; review customer counterfeit & fraud reports; inspect security audits.

### 2. Demo Vendor Merchant
- **Email**: `vendor@megamarket.co.ke`
- **Password**: `VendorPassword2026!`
- **Role**: `vendor`
- **Shop**: *Nairobi Tech & Gadgets* (`status: pending` initially)
- **Capabilities**: Access Vendor Room, manage store profile, view orders. Publishing products is restricted until administrator approval.

### 3. Demo Customer Shopper
- **Email**: `customer@megamarket.co.ke`
- **Password**: `CustomerPassword2026!`
- **Role**: `customer`
- **Name**: *Wanjiku Kamau*
- **Capabilities**: Browse catalog, calculate server-verified quotes, submit counterfeit/fraud reports, checkout with Lipa Na M-Pesa or Cash on Delivery.

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your Turso credentials:
```bash
cp .env.example .env
```

### 3. Development Server
```bash
npm run dev
```
Starts Express with Vite middleware on [http://localhost:3000](http://localhost:3000).

### 4. Type Checking & Production Build
```bash
npm run lint
npm run build
```

### 5. Production Start
```bash
NODE_ENV=production node server.ts
```

---

## 🛡️ Security

MegaMarket implements defense-in-depth protections strictly enforced in the codebase:

1. **Security Headers (Helmet)**:
   - **Content-Security-Policy**: Restricts script execution to `'self'`, styles to `'self' 'unsafe-inline'`, images to `'self'`, `data:`, and `https://images.unsplash.com`, fonts to `'self' data:`, connections to `'self'`, and sets `frame-ancestors 'none'`.
   - **X-Content-Type-Options**: Set to `nosniff` to prevent MIME-type sniffing.
   - **Referrer-Policy**: Set to `strict-origin-when-cross-origin`.
   - **Strict-Transport-Security (HSTS)**: 1-year HSTS (`max-age=31536000; includeSubDomains; preload`) enforced in production.
   - **X-Powered-By**: Disabled on the Express application.

2. **File & Source Code Exposure Defense**:
   - In production, only the compiled `dist/` directory is served with static assets.
   - Explicit `build.sourcemap = false` in `vite.config.ts` prevents source map generation.
   - Server-level route filtering returns a real HTTP 404 for any path starting with a dot (e.g., `/.env`, `/.git`), beginning with `/server`, `/src`, `/node_modules`, or ending in `.env`, `.map`, `.ts`, or `.sqlite`.

3. **Session & Cookie Security**:
   - Authentication relies strictly on signed, `httpOnly`, `sameSite: 'lax'`, `secure` cookies (`mm_session`).
   - Session tokens are **never returned in the JSON response body** of `/api/auth/register` or `/api/auth/login`.
   - Cookie expiration matches the session token (7 days), and cookies are fully invalidated on logout.
   - In production, the server **refuses to start** if `SESSION_SECRET` is missing or shorter than 32 characters (no default fallback).
   - `trust proxy` is set to `1` for accurate client IP resolution behind Cloud Run.

4. **CSRF & Origin Verification**:
   - All state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) verify that the incoming `Origin` or `Referer` header strictly matches the application's host (`req.get('host')`).
   - Cross-origin requests and requests with spoofed/missing origins are rejected with `HTTP 403 Forbidden`. Open CORS is disabled.

5. **Multi-Tier Rate Limiting**:
   - Rate limiters track real client IPs:
     - `POST /api/auth/login`: 5 attempts per 15 minutes per IP (returns HTTP 429).
     - `POST /api/auth/register`: 5 attempts per hour per IP.
     - `POST /api/contact/send-email`: 5 attempts per hour per IP.
     - `POST /api/reports`: 5 attempts per hour per IP.
     - All `/api/*` endpoints: General limiter of 300 requests per 15 minutes per IP.

6. **Input Sanitization & Injection Prevention**:
   - JSON request body payload size is capped at `100kb` (`express.json({ limit: '100kb' })`).
   - String inputs (names, descriptions, inquiry messages, report details) are trimmed, length-bounded, and HTML-escaped.
   - React components never use `dangerouslySetInnerHTML`.
   - All database queries use parameterized SQL (`db.execute({ sql, args })`) with the `@libsql/client/web` driver.

7. **Server-Authoritative Pricing & Stock**:
   - Cart line totals, 16% VAT, delivery fees, and order totals are recalculated strictly on the server (`POST /api/orders/calculate-quote`) using authoritative catalog records.
   - Client-supplied prices and totals are ignored and rejected.

8. **Role-Based Access Control (RBAC) & Tenant Isolation**:
   - Protected routes (`/api/admin/*`, `/api/security/audit`, `/api/system/audit`) require verified session tokens with `admin` role.
   - Audit endpoints strip administrative emails and only display live enforced security statuses.
   - Vendor routes derive ownership strictly from `req.user.vendorId` in the session; attempts to access another vendor's profile return HTTP 404.

9. **Error Handling & Operational Privacy**:
   - Global error handler returns generic error messages without exposing stack traces.
   - Passwords, hashes, JWT tokens, session cookies, and secrets are never printed in console logs.

