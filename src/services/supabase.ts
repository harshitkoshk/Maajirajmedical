import { createClient } from '@supabase/supabase-js';
import { Product, Order, ShopSettings, Category } from '../types';

// Read environment variables or fallback
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
  '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== 'undefined' && (window as any).__SUPABASE_KEY__) ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      realtime: { params: { eventsPerSecond: 10 } }
    })
  : null;

// ==========================================
// SUPABASE CLOUD API METHODS
// ==========================================

// 1. PRODUCTS
export const fetchProductsSupabase = async (): Promise<Product[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      sku: row.sku || '',
      name: row.name,
      brand: row.brand || '',
      category: row.category,
      subcategory: row.subcategory || '',
      description: row.description || '',
      price: Number(row.price),
      mrp: row.mrp ? Number(row.mrp) : undefined,
      stock: Number(row.stock),
      isAvailable: Boolean(row.is_available),
      isPrescriptionRequired: Boolean(row.is_prescription_required),
      isFeatured: Boolean(row.is_featured),
      discountPercent: row.discount_percent ? Number(row.discount_percent) : 0,
      image: row.image || '',
      batchNumber: row.batch_number || '',
      dosageForm: row.dosage_form || '',
      packSize: row.pack_size || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (err) {
    console.warn('Supabase fetch products notice:', err);
    return null;
  }
};

export const upsertProductSupabase = async (product: Product): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const row = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      is_available: product.isAvailable,
      is_prescription_required: product.isPrescriptionRequired,
      is_featured: product.isFeatured,
      discount_percent: product.discountPercent,
      image: product.image,
      batch_number: product.batchNumber,
      dosage_form: product.dosageForm,
      pack_size: product.packSize,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('products').upsert(row);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase upsert product error:', err);
    return false;
  }
};

export const deleteProductSupabase = async (productId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase delete product error:', err);
    return false;
  }
};

// 2. ORDERS
export const fetchOrdersSupabase = async (): Promise<Order[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      customerName: row.customer_name,
      phone: row.phone,
      address: row.address,
      landmark: row.landmark || '',
      userLat: row.user_lat ? Number(row.user_lat) : undefined,
      userLng: row.user_lng ? Number(row.user_lng) : undefined,
      distanceKm: row.distance_km ? Number(row.distance_km) : undefined,
      isWithinRadius: Boolean(row.is_within_radius),
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
      totalAmount: Number(row.total_amount),
      status: row.status,
      notes: row.notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (err) {
    console.error('Supabase fetch orders error:', err);
    return null;
  }
};

export const insertOrderSupabase = async (order: Order): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const row = {
      id: order.id,
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      landmark: order.landmark,
      user_lat: order.userLat,
      user_lng: order.userLng,
      distance_km: order.distanceKm,
      is_within_radius: order.isWithinRadius,
      items: order.items,
      total_amount: order.totalAmount,
      status: order.status,
      notes: order.notes,
      created_at: order.createdAt
    };

    const { error } = await supabase.from('orders').insert(row);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase insert order error:', err);
    return false;
  }
};

export const updateOrderStatusSupabase = async (orderId: string, status: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase update order status error:', err);
    return false;
  }
};

// 3. SETTINGS
export const fetchSettingsSupabase = async (): Promise<ShopSettings | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('*')
      .eq('id', 'primary')
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      shopName: data.shop_name,
      ownerName: data.owner_name,
      phone: data.phone,
      whatsappNumber: data.whatsapp_number,
      address: data.address,
      originLat: Number(data.origin_lat),
      originLng: Number(data.origin_lng),
      deliveryRadiusKm: Number(data.delivery_radius_km),
      openingHours: data.opening_hours,
      emergencyNotice: data.emergency_notice || '',
      adminPin: data.admin_pin,
      googleMapsUrl: data.google_maps_url || ''
    };
  } catch (err) {
    console.warn('Supabase fetch settings notice:', err);
    return null;
  }
};

export const saveSettingsSupabase = async (settings: ShopSettings): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const row = {
      id: 'primary',
      shop_name: settings.shopName,
      owner_name: settings.ownerName,
      phone: settings.phone,
      whatsapp_number: settings.whatsappNumber,
      address: settings.address,
      origin_lat: settings.originLat,
      origin_lng: settings.originLng,
      delivery_radius_km: settings.deliveryRadiusKm,
      opening_hours: settings.openingHours,
      emergency_notice: settings.emergencyNotice,
      admin_pin: settings.adminPin,
      google_maps_url: settings.googleMapsUrl,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('shop_settings').upsert(row);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase save settings error:', err);
    return false;
  }
};
