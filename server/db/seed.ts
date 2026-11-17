import bcrypt from 'bcryptjs';
import { dbHelpers, initDatabaseSchema } from './database.ts';

/**
 * Seed Database with Initial Accounts
 * 
 * Account Credentials (for testing and course demonstration):
 * -------------------------------------------------------------
 * 1. Root Administrator:
 *    - Email: Value from process.env.ADMIN_EMAIL (default: admin@megamarket.co.ke)
 *    - Password: Value from process.env.ADMIN_PASSWORD (default: AdminPassword2026!)
 *    - Role: admin
 *    - Re-applied on every start if the password differs
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
 * Security Guarantee: Never print passwords, hashes, or Turso auth tokens in logs.
 */
export async function seedDatabase(): Promise<void> {
  // 0. Create all tables first (CREATE TABLE IF NOT EXISTS, safe to run on every start)
  await initDatabaseSchema();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@megamarket.co.ke').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword2026!';

  // 1. Seed or Sync Administrator
  const adminById = await dbHelpers.findUserById('usr_admin_root');
  const adminByEmail = await dbHelpers.findUserByEmail(adminEmail);
  const targetAdmin = adminById || adminByEmail;

  if (!targetAdmin) {
    const adminHash = await bcrypt.hash(adminPassword, 10);
    await dbHelpers.insertUser({
      id: 'usr_admin_root',
      name: 'Platform Administrator',
      email: adminEmail,
      password_hash: adminHash,
      role: 'admin',
      email_verified: 1,
      created_at: new Date().toISOString(),
    });
    console.log(`[Seed] Root Administrator created with configured email.`);
  } else {
    // Re-apply admin password on every start if the password differs
    const passwordMatches = await bcrypt.compare(adminPassword, targetAdmin.password_hash);
    if (!passwordMatches) {
      const newHash = await bcrypt.hash(adminPassword, 10);
      await dbHelpers.updateUserPassword(targetAdmin.id, newHash);
      console.log(`[Seed] Administrator credentials synchronized with environment configuration.`);
    }

    // If admin ID exists but email changed in environment, update email safely
    if (targetAdmin.email.toLowerCase() !== adminEmail) {
      await dbHelpers.updateUserEmail(targetAdmin.id, adminEmail);
      console.log(`[Seed] Administrator email synchronized with environment.`);
    }

    if (Number(targetAdmin.email_verified) !== 1) {
      await dbHelpers.markUserEmailVerified(targetAdmin.id);
    }
  }

  // 2. Seed Demo Vendor if not exists
  const vendorEmail = 'vendor@megamarket.co.ke';
  const existingVendorUser =
    (await dbHelpers.findUserByEmail(vendorEmail)) || (await dbHelpers.findUserById('usr_vendor_demo'));

  if (!existingVendorUser) {
    const vendorHash = await bcrypt.hash('VendorPassword2026!', 10);
    const vendorUserId = 'usr_vendor_demo';

    await dbHelpers.insertUser({
      id: vendorUserId,
      name: 'Juma Omondi',
      email: vendorEmail,
      password_hash: vendorHash,
      role: 'vendor',
      email_verified: 1,
      created_at: new Date().toISOString(),
    });

    const existingVendorStore = await dbHelpers.findVendorById('vnd_demo_tech');
    if (!existingVendorStore) {
      await dbHelpers.insertVendor({
        id: 'vnd_demo_tech',
        user_id: vendorUserId,
        shop_name: 'Nairobi Tech & Gadgets',
        description: 'Authentic consumer electronics, smartphone accessories, audio gears, and tech gadgets across East Africa.',
        logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
        status: 'pending', // Vendors start in pending status awaiting admin approval
        created_at: new Date().toISOString(),
      });
    }
    console.log(`[Seed] Demo Vendor verified.`);
  } else if (Number(existingVendorUser.email_verified) !== 1) {
    await dbHelpers.markUserEmailVerified(existingVendorUser.id);
  }

  // 3. Seed Demo Customer if not exists
  const customerEmail = 'customer@megamarket.co.ke';
  const existingCustomer =
    (await dbHelpers.findUserByEmail(customerEmail)) || (await dbHelpers.findUserById('usr_customer_demo'));

  if (!existingCustomer) {
    const customerHash = await bcrypt.hash('CustomerPassword2026!', 10);
    await dbHelpers.insertUser({
      id: 'usr_customer_demo',
      name: 'Wanjiku Kamau',
      email: customerEmail,
      password_hash: customerHash,
      role: 'customer',
      email_verified: 1,
      created_at: new Date().toISOString(),
    });
    console.log(`[Seed] Demo Customer verified.`);
  } else if (Number(existingCustomer.email_verified) !== 1) {
    await dbHelpers.markUserEmailVerified(existingCustomer.id);
  }
}
