import { createClient } from '@supabase/supabase-js';
import { Product, Order, ShopSettings, Category } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// SUPABASE API METHODS

// Products
export const fetchProductsSupabase = async (): Promise<Product[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

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
    console.error('Supabase fetch products error:', err);
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

// Orders
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
