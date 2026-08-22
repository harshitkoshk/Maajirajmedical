import { Product, Category, Order, ShopSettings } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { INITIAL_CATEGORIES } from '../data/categories';

const PRODUCTS_KEY = 'mrmc_products_v1';
const CATEGORIES_KEY = 'mrmc_categories_v1';
const ORDERS_KEY = 'mrmc_orders_v1';
const SETTINGS_KEY = 'mrmc_settings_v1';
const ADMIN_AUTH_KEY = 'mrmc_admin_auth_v1';

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Maaji Raj Medical and Cosmetics',
  ownerName: 'Tushar Sharma',
  phone: '7737116439',
  whatsappNumber: '917737116439',
  address: 'ADD. 81, S-2, 100 FEET ROAD NEAR KALAJI BHAVJI, SECTOR-14, GOVARDHAN VILAS, UDAIPUR',
  originLat: 24.5428,
  originLng: 73.6912,
  deliveryRadiusKm: 15,
  openingHours: 'Mon – Sat: 8:00 AM – 10:30 PM | Sun: 9:00 AM – 9:00 PM',
  emergencyNotice: 'For urgent medicine availability and emergency assistance, call 7737116439 immediately.',
  adminPin: '1234',
  googleMapsUrl: 'https://maps.google.com/?q=81+S-2+100+Feet+Road+Sector+14+Govardhan+Vilas+Udaipur'
};

// Event bus for live synchronization across components and tabs
const notifyChange = (event: string) => {
  window.dispatchEvent(new CustomEvent('mrmc_storage_updated', { detail: { event } }));
};

// PRODUCTS
export const getProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get products:', err);
    return INITIAL_PRODUCTS;
  }
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  const now = new Date().toISOString();

  if (index >= 0) {
    products[index] = { ...product, updatedAt: now };
  } else {
    products.unshift({ ...product, createdAt: now, updatedAt: now });
  }

  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  notifyChange('products');
};

export const updateProductStock = (productId: string, newStock: number): void => {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.stock = Math.max(0, newStock);
    product.isAvailable = product.stock > 0;
    product.updatedAt = new Date().toISOString();
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    notifyChange('products');
  }
};

export const updateProductPrice = (productId: string, newPrice: number): void => {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.price = Math.max(0, newPrice);
    product.updatedAt = new Date().toISOString();
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    notifyChange('products');
  }
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts().filter((p) => p.id !== productId);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  notifyChange('products');
};

export const bulkImportProducts = (
  newProducts: Product[],
  mode: 'add' | 'upsert' | 'replace'
): { imported: number; updated: number; skipped: number } => {
  let products = getProducts();
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  if (mode === 'replace') {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
    notifyChange('products');
    return { imported: newProducts.length, updated: 0, skipped: 0 };
  }

  newProducts.forEach((newP) => {
    // Match by SKU or exact item name
    const existingIndex = products.findIndex(
      (p) =>
        (newP.sku && p.sku.toLowerCase() === newP.sku.toLowerCase()) ||
        p.name.toLowerCase().trim() === newP.name.toLowerCase().trim()
    );

    if (existingIndex >= 0) {
      if (mode === 'upsert') {
        products[existingIndex] = {
          ...products[existingIndex],
          price: newP.price || products[existingIndex].price,
          stock: newP.stock !== undefined ? newP.stock : products[existingIndex].stock,
          batchNumber: newP.batchNumber || products[existingIndex].batchNumber,
          category: newP.category || products[existingIndex].category,
          subcategory: newP.subcategory || products[existingIndex].subcategory,
          updatedAt: new Date().toISOString()
        };
        updated++;
      } else {
        skipped++;
      }
    } else {
      products.unshift({
        ...newP,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      imported++;
    }
  });

  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  notifyChange('products');
  return { imported, updated, skipped };
};

// CATEGORIES
export const getCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_CATEGORIES;
  }
};

export const saveCategory = (category: Category): void => {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  notifyChange('categories');
};

// ORDERS
export const getOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  // Deduct stock for ordered items
  const products = getProducts();
  order.items.forEach((item) => {
    const p = products.find((prod) => prod.id === item.productId);
    if (p) {
      p.stock = Math.max(0, p.stock - item.quantity);
      p.isAvailable = p.stock > 0;
    }
  });
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

  notifyChange('orders');
  notifyChange('products');
};

export const updateOrderStatus = (orderId: string, status: Order['status']): void => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    notifyChange('orders');
  }
};

// SETTINGS
export const getSettings = (): ShopSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: ShopSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  notifyChange('settings');
};

// ADMIN AUTH
export const getAdminAuth = (): boolean => {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
};

export const setAdminAuth = (authenticated: boolean): void => {
  if (authenticated) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
  notifyChange('auth');
};

// HAVERSINE DISTANCE FORMULA
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

// RESET TO INITIAL SEED DATA
export const resetToSeedData = (): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  notifyChange('products');
  notifyChange('categories');
  notifyChange('settings');
};
