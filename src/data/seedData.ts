import { Category, Order, Product, User, Vendor } from '../types';

export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Phones & Tablets',
    slug: 'phones-tablets',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'cat-2',
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'cat-3',
    name: 'African Fashion & Wear',
    slug: 'african-fashion',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'cat-4',
    name: 'Supermarket & Groceries',
    slug: 'groceries',
    icon: 'Apple',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'cat-5',
    name: 'Home & Living',
    slug: 'home-living',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80',
    itemCount: 0
  },
  {
    id: 'cat-6',
    name: 'Beauty & Skincare',
    slug: 'beauty-skincare',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    itemCount: 0
  }
];

// Pristine state: All demo vendors erased. Space reserved strictly for real merchants who sign in or register.
export const SEED_VENDORS: Vendor[] = [];

// System Users: Primary administrator account and a demo customer account.
export const SEED_USERS: User[] = [
  {
    id: 'usr_admin_root',
    email: 'admin@megamarket.co.ke',
    fullName: 'Platform Administrator',
    phoneNumber: '+254 700 000 000',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr_customer_demo',
    email: 'customer@megamarket.co.ke',
    fullName: 'Wanjiku Kamau',
    phoneNumber: '+254 711 234 567',
    role: 'customer',
    createdAt: '2026-01-10T12:00:00Z',
  },
];

// Clean catalog: Ready to be populated by real approved vendors.
export const SEED_PRODUCTS: Product[] = [];

// Platform orders: Real customer orders placed with real vendors.
export const SEED_ORDERS: Order[] = [];
