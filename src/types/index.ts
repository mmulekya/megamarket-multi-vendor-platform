export type UserRole = 'customer' | 'vendor' | 'admin';

export type VendorStatus = 'pending' | 'approved' | 'suspended';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  vendorId?: string; // Links to Vendor profile if role === 'vendor'
  createdAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description: string;
  logo: string;
  bannerImage?: string;
  phone: string;
  city: string;
  status: VendorStatus;
  createdAt: string;
  rating: number;
  totalSales: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  itemCount?: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  categoryId: string;
  categoryName: string;
  title: string;
  slug: string;
  description: string;
  price: number; // in KES
  originalPrice?: number;
  stock: number;
  isActive: boolean;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  imageMetadata?: {
    originalSizeBytes: number;
    compressedSizeBytes: number;
    dimensions: string;
  };
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number; // Snapshot of price when added
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  vendorId: string;
  vendorName: string;
  price: number; // Frozen price at checkout
  quantity: number;
  status: OrderStatus; // Vendor-level status
}

export type PaymentMethod = 'mpesa' | 'card' | 'cod';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed' | 'failed';
  mpesaReceipt?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface MpesaTransactionState {
  isSimulating: boolean;
  phone: string;
  amount: number;
  step: 'prompt' | 'pin_entry' | 'verifying' | 'success' | 'failed';
  receiptNumber?: string;
  errorMessage?: string;
}
