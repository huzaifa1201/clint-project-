
export type UserRole = 'USER' | 'ADMIN';

export interface Address {
  id: string;
  label: string; // e.g., 'Home', 'Office'
  fullAddress: string;
  isDefault: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  addresses?: Address[];
  wishlist?: string[]; // Array of product IDs
  createdAt?: any;
  isBlocked?: boolean;
}

// Added Category interface
export interface Category {
  id: string;
  name: string;
  price?: number; // Optional as it might not be relevant for a pure category object depending on usage
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number; // Optional discounted price
  category: string;
  description: string;
  sizes: string[];
  stock: number;
  imageUrls: string[];
  tags?: string[];
  isPublished?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  currency?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Card' | 'COD' | 'Local'; // Added Local payment
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  createdAt: any;
  shippingAddress: string;
  phoneNumber?: string;
  transactionId?: string; // For local payment methods
  localPaymentMethod?: string; // Name of local payment (e.g., EasyPaisa)
}

export interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
}

export interface SupportPageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt?: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
}

export interface SiteSettings {
  id?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  promotionalAds?: {
    id: string;
    imageUrl: string;
    linkUrl: string;
    active: boolean;
  }[];
  paymentConfig?: {
    stripePublishableKey: string;
    stripeSecretKey: string;
    enableStripe: boolean;
    enableCOD: boolean;
  };
  currency?: 'USD' | 'PKR' | 'INR' | 'EUR';
  deliveryCharges?: number;
  localPaymentMethods?: LocalPaymentMethod[]; // Array of local payment methods
}

export interface LocalPaymentMethod {
  id: string;
  name: string; // e.g., "EasyPaisa", "JazzCash"
  accountName: string; // Account holder name
  accountNumber: string; // Account/Phone number
  instructions?: string; // Optional payment instructions
  active: boolean;
}
