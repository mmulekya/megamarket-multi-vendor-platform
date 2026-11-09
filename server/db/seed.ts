import bcrypt from 'bcryptjs';
import { db, dbHelpers } from './database.ts';

/**
 * Seed Database with Initial Accounts
 * 
 * Account Credentials (for testing and course demonstration):
 * -------------------------------------------------------------
 * 1. Root Administrator:
 *    - Email: Value from process.env.ADMIN_EMAIL (default: admin@megamarket.co.ke)
 *    - Password: Value from process.env.ADMIN_PASSWORD (default: AdminPassword2026!)
 *    - Role: admin
 * 
 * 2. Demo Vendor Merchant:
 *    - Email: vendor@megamarket.co.ke
 *    - Password: VendorPassword2026!
 *    - Role: vendor (Shop: "Nairobi Tech & Gadgets", Status: "pending")
 * 
 * 3. Demo Customer Shopper:
 *    - Email: customer@megamarket.co.ke
 *    - Password: CustomerPassword2026!
 *    - Role: customer
 * -------------------------------------------------------------
 * Security Guarantee: All passwords are encrypted with bcrypt (10 salt rounds).
 */
export async function seedDatabase(): Promise<void> {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@megamarket.co.ke').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword2026!';

  // 1. Seed or Sync Administrator
  const adminById = dbHelpers.findUserById('usr_admin_root');
  const adminByEmail = dbHelpers.findUserByEmail(adminEmail);

  if (!adminById && !adminByEmail) {
    const adminHash = await bcrypt.hash(adminPassword, 10);
    dbHelpers.insertUser({
      id: 'usr_admin_root',
      name: 'Platform Administrator',
      email: adminEmail,
      password_hash: adminHash,
      role: 'admin',
      created_at: new Date().toISOString(),
    });
    console.log(`[Seed] Root Administrator created: ${adminEmail}`);
  } else if (adminById && adminById.email.toLowerCase() !== adminEmail) {
    // If admin ID exists but email changed in environment/metadata, update email safely
    try {
      db.prepare('UPDATE users SET email = ? WHERE id = ?').run(adminEmail, 'usr_admin_root');
      console.log(`[Seed] Root Administrator email synced to: ${adminEmail}`);
    } catch {
      // If another row already holds that email, leave existing row
    }
  }

  // 2. Seed Demo Vendor if not exists
  const vendorEmail = 'vendor@megamarket.co.ke';
  const existingVendorUser = dbHelpers.findUserByEmail(vendorEmail) || dbHelpers.findUserById('usr_vendor_demo');
  if (!existingVendorUser) {
    const vendorHash = await bcrypt.hash('VendorPassword2026!', 10);
    const vendorUserId = 'usr_vendor_demo';

    dbHelpers.insertUser({
      id: vendorUserId,
      name: 'Juma Omondi',
      email: vendorEmail,
      password_hash: vendorHash,
      role: 'vendor',
      created_at: new Date().toISOString(),
    });

    const existingVendorStore = dbHelpers.findVendorById('vnd_demo_tech');
    if (!existingVendorStore) {
      dbHelpers.insertVendor({
        id: 'vnd_demo_tech',
        user_id: vendorUserId,
        shop_name: 'Nairobi Tech & Gadgets',
        description: 'Authentic consumer electronics, smartphone accessories, audio gears, and tech gadgets across East Africa.',
        logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
        status: 'pending', // Vendors start in pending status awaiting admin approval
        created_at: new Date().toISOString(),
      });
    }
    console.log(`[Seed] Demo Vendor created: ${vendorEmail}`);
  }

  // 3. Seed Demo Customer if not exists
  const customerEmail = 'customer@megamarket.co.ke';
  const existingCustomer = dbHelpers.findUserByEmail(customerEmail) || dbHelpers.findUserById('usr_customer_demo');
  if (!existingCustomer) {
    const customerHash = await bcrypt.hash('CustomerPassword2026!', 10);
    dbHelpers.insertUser({
      id: 'usr_customer_demo',
      name: 'Wanjiku Kamau',
      email: customerEmail,
      password_hash: customerHash,
      role: 'customer',
      created_at: new Date().toISOString(),
    });
    console.log(`[Seed] Demo Customer created: ${customerEmail}`);
  }
}
