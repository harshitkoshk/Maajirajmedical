export type CategoryType = 'medical' | 'cosmetic' | 'general';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  iconName: string;
  description: string;
  subcategories: string[];
  bannerImage: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  mrp?: number;
  stock: number;
  isAvailable: boolean;
  isPrescriptionRequired: boolean;
  isFeatured: boolean;
  discountPercent?: number;
  image: string;
  batchNumber?: string; // Stored securely for admin use only
  dosageForm?: string;
  packSize?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'New'
  | 'Contact Customer'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  price: number;
  quantity: number;
  isPrescriptionRequired: boolean;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  landmark: string;
  userLat?: number;
  userLng?: number;
  distanceKm?: number;
  isWithinRadius: boolean;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  originLat: number;
  originLng: number;
  deliveryRadiusKm: number;
  openingHours: string;
  emergencyNotice: string;
  adminPin: string;
  googleMapsUrl: string;
}

export type FilterState = {
  searchQuery: string;
  category: string;
  subcategory: string;
  brand: string;
  inStockOnly: boolean;
  prescriptionOnly: boolean | null;
  featuredOnly: boolean;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';
};
