
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
}

// Added Category interface
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  sizes: string[];
  stock: number;
  imageUrls: string[];
  tags?: string[];
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
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Card' | 'COD';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  createdAt: any;
  shippingAddress: string;
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
}
