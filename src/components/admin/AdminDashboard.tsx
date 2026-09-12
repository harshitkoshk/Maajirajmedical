import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product, Order, ShopSettings } from '../../types';
import { AdminProductModal } from './AdminProductModal';
import { BulkImportModal } from './BulkImportModal';
import { AdminBillingTab } from './AdminBillingTab';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Receipt,
  Settings,
  Plus,
  FileSpreadsheet,
  Search,
  Edit,
  Trash2,
  Phone,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Save,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Database,
  Cloud,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  ShieldAlert,
  Bell,
  AlertCircle
} from 'lucide-react';
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  setCustomSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
  upsertProductSupabase
} from '../../services/supabase';
import { getExpiryInfo, ExpiryStatus } from '../../utils/expiry';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    orders,
    bills,
    settings,
    setIsAdmin,
    setActiveTab,
    deleteProductById,
    setStock,
    setPrice,
    updateStatus,
    deleteOrderById,
    updateShopSettings,
    resetAllData
  } = useShop();

  const [currentAdminTab, setCurrentAdminTab] = useState<
    'overview' | 'products' | 'inventory' | 'orders' | 'billing' | 'settings'
  >('overview');

  // Online order being converted to bill
  const [orderToBill, setOrderToBill] = useState<Order | null>(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Search & Filter state in admin
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expiring_soon' | 'expired' | 'valid'>('all');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low' | 'out' | 'expiring_soon' | 'expired'>('all');

  // Inline stock edits state
  const [stockEdits, setStockEdits] = useState<{ [id: string]: number }>({});
  const [stockSavedId, setStockSavedId] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ShopSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Cloud Database state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(getSupabaseUrl);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(getSupabaseAnonKey);
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncAllMsg, setSyncAllMsg] = useState<string | null>(null);

  // Analytics
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.stock >= 10).length;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 10);
  const outOfStockProducts = products.filter((p) => p.stock <= 0 || !p.isAvailable);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'New' || o.status === 'Contact Customer');
  const totalOrderRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Expiry Analytics
  const expiredProducts = products.filter((p) => getExpiryInfo(p.expiryDate).isExpired);
  const expiringSoonProducts = products.filter((p) => getExpiryInfo(p.expiryDate).isExpiringSoon);
  const totalExpiryAlerts = expiredProducts.length + expiringSoonProducts.length;

  // Handlers
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the store catalog?`)) {
      deleteProductById(id);
    }
  };

  const handleInlineStockSave = (productId: string) => {
    const newStock = stockEdits[productId];
    if (newStock !== undefined && newStock >= 0) {
      setStock(productId, newStock);
      setStockSavedId(productId);
      setTimeout(() => setStockSavedId(null), 1500);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleTestAndSaveDb = async () => {
    setTestingDb(true);
    setDbTestResult(null);
    setCustomSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    const result = await testSupabaseConnection();
    setDbTestResult(result);
    setTestingDb(false);
  };

  const handlePushLocalCatalogToCloud = async () => {
    if (!isSupabaseConfigured()) {
      alert('Please configure your Supabase URL & Key first and test connection!');
      return;
    }
    setSyncingAll(true);
    setSyncAllMsg('Syncing all store products to Supabase cloud...');
    try {
      let count = 0;
      for (const p of products) {
        await upsertProductSupabase(p);
        count++;
      }
      setSyncAllMsg(`Successfully synced ${count} products to your Supabase cloud database!`);
    } catch (err: any) {
      setSyncAllMsg(`Error syncing: ${err.message}`);
    }
    setSyncingAll(false);
    setTimeout(() => setSyncAllMsg(null), 5000);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      productSearch === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(productSearch.toLowerCase()));

    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

    const expInfo = getExpiryInfo(p.expiryDate);
    const matchesExpiry =
      expiryFilter === 'all' ||
      (expiryFilter === 'expired' && expInfo.isExpired) ||
      (expiryFilter === 'expiring_soon' && expInfo.isExpiringSoon) ||
      (expiryFilter === 'valid' && expInfo.status === 'valid');

    return matchesSearch && matchesCat && matchesExpiry;
  });

  // Filtered Inventory
  const filteredInventory = products.filter((p) => {
    const matchesSearch =
      productSearch === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(productSearch.toLowerCase()));

    if (!matchesSearch) return false;
    const expInfo = getExpiryInfo(p.expiryDate);
    if (inventoryFilter === 'low') return p.stock > 0 && p.stock < 10;
    if (inventoryFilter === 'out') return p.stock <= 0 || !p.isAvailable;
    if (inventoryFilter === 'expiring_soon') return expInfo.isExpiringSoon;
    if (inventoryFilter === 'expired') return expInfo.isExpired;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 pt-4 sm:pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Admin Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-xl sm:text-2xl text-white">
                  Owner Management Dashboard
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.shopName} • Sector-14, Udaipur • Contact: <strong>{settings.phone}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (window.history.pushState) window.history.pushState({}, '', '/');
                setActiveTab('home');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <span>View Customer Store</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <button
              onClick={() => {
                setIsAdmin(false);
                if (window.history.pushState) window.history.pushState({}, '', '/');
                setActiveTab('home');
              }}
              className="bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Store Overview', icon: LayoutDashboard, badge: totalExpiryAlerts > 0 ? totalExpiryAlerts : undefined },
            { id: 'products', label: `Products Catalog (${totalProducts})`, icon: Package },
            { id: 'inventory', label: 'Quick Inventory & Expiry', icon: Boxes, badge: totalExpiryAlerts > 0 ? totalExpiryAlerts : undefined },
            { id: 'orders', label: `Customer Orders (${totalOrders})`, icon: ShoppingBag, badge: pendingOrders.length },
            { id: 'billing', label: `Billing / Cash Memo (${bills.length})`, icon: Receipt },
            { id: 'settings', label: 'Store Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentAdminTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {currentAdminTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* PROACTIVE EXPIRY NOTIFICATION ALERTS CENTER */}
            {totalExpiryAlerts > 0 && (
              <div className="space-y-3">
                {/* 1. Expired Items Critical Alert */}
                {expiredProducts.length > 0 && (
                  <div className="bg-rose-50 border-2 border-rose-400/80 rounded-3xl p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-heading font-black text-rose-950 text-sm sm:text-base flex items-center gap-2">
                            <span>CRITICAL: {expiredProducts.length} Product{expiredProducts.length > 1 ? 's' : ''} Expired</span>
                            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Action Required
                            </span>
                          </h3>
                          <p className="text-xs text-rose-800">
                            These items have passed their expiry date. Remove from active store shelves immediately.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setCurrentAdminTab('inventory');
                            setInventoryFilter('expired');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Manage Expired ({expiredProducts.length})</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expired Items Quick Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {expiredProducts.slice(0, 6).map((p) => {
                        const info = getExpiryInfo(p.expiryDate);
                        return (
                          <div
                            key={p.id}
                            className="bg-white/90 p-2.5 rounded-xl border border-rose-200 flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-slate-900 block truncate">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Batch: {p.batchNumber || 'N/A'} • Stock: {p.stock}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-rose-200 block">
                                Expired
                              </span>
                              <span className="text-[9px] text-rose-700 font-medium">
                                {info.formattedDate}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Expiring Soon Warning Alert */}
                {expiringSoonProducts.length > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-400/80 rounded-3xl p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-heading font-black text-amber-950 text-sm sm:text-base flex items-center gap-2">
                            <span>NOTICE: {expiringSoonProducts.length} Product{expiringSoonProducts.length > 1 ? 's' : ''} Expiring Soon</span>
                            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Within 60 Days
                            </span>
                          </h3>
                          <p className="text-xs text-amber-900">
                            These items will expire shortly. Prioritize first-in-first-out sales or arrange vendor return.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setCurrentAdminTab('inventory');
                            setInventoryFilter('expiring_soon');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Review Expiring Soon ({expiringSoonProducts.length})</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expiring Soon Quick Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {expiringSoonProducts.slice(0, 6).map((p) => {
                        const info = getExpiryInfo(p.expiryDate);
                        return (
                          <div
                            key={p.id}
                            className="bg-white/90 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-slate-900 block truncate">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Batch: {p.batchNumber || 'N/A'} • Stock: {p.stock}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-amber-300 block">
                                {info.daysRemaining}d Left
                              </span>
                              <span className="text-[9px] text-amber-800 font-medium">
                                {info.formattedDate}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs mb-2">
                  <span>Total Products</span>
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-heading font-black text-2xl text-slate-900">{totalProducts}</div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                  {inStockProducts} healthy stock
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs mb-2">
                  <span>Low Stock (&lt;10)</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="font-heading font-black text-2xl text-amber-600">
                  {lowStockProducts.length}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Re-order needed
                </span>
              </div>

              {/* Expiring Soon Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs mb-2">
                  <span>Expiring Soon</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="font-heading font-black text-2xl text-amber-600">
                  {expiringSoonProducts.length}
                </div>
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                  Within next 60 days
                </span>
              </div>

              {/* Expired Items Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs mb-2">
                  <span>Expired Items</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="font-heading font-black text-2xl text-rose-600">
                  {expiredProducts.length}
                </div>
                <span className="text-[10px] text-rose-700 font-semibold mt-1 block">
                  Requires removal
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs mb-2">
                  <span>Pending Orders</span>
                  <ShoppingBag className="w-4 h-4 text-rose-500" />
                </div>
                <div className="font-heading font-black text-2xl text-rose-600">
                  {pendingOrders.length}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Awaiting confirmation
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                <div className="flex justify-between items-center text-slate-500 text-xs mb-2">
                  <span>Order Value</span>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-heading font-black text-2xl text-slate-900">
                  ₹{totalOrderRevenue.toFixed(0)}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                  {totalOrders} lifetime orders
                </span>
              </div>
            </div>

            {/* Quick Actions & Watchlists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setCurrentAdminTab('billing')}
                      className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs block">Create A5 Bill / Cash Memo</span>
                        <span className="text-[10px] text-emerald-700">Auto-fills batch & expiry</span>
                      </div>
                    </button>

                    <button
                      onClick={handleOpenAddProduct}
                      className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs block">Add New Product</span>
                        <span className="text-[10px] text-slate-500">With expiry date & batch</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setIsBulkImportOpen(true)}
                      className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 text-left transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-bold text-xs block">Bulk Excel Import</span>
                        <span className="text-[10px] text-slate-500">Upload stock & expiry sheet</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Store Service Radius:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {settings.deliveryRadiusKm} km from Sector-14
                  </span>
                </div>
              </div>

              {/* Expiry Alerts Watchlist */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Expiry Watchlist</span>
                  </h3>
                  <button
                    onClick={() => {
                      setCurrentAdminTab('inventory');
                      setInventoryFilter(expiredProducts.length > 0 ? 'expired' : 'expiring_soon');
                    }}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {expiredProducts.length === 0 && expiringSoonProducts.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-slate-600 font-medium">All products have healthy shelf-life.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No expired or near-expiry items found.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {/* First show expired items */}
                    {expiredProducts.map((p) => {
                      const info = getExpiryInfo(p.expiryDate);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-900 truncate block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-rose-700">
                              Batch: {p.batchNumber || 'N/A'} • Expired on {info.formattedDate}
                            </span>
                          </div>
                          <span className="bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                            Expired
                          </span>
                        </div>
                      );
                    })}

                    {/* Then show expiring soon items */}
                    {expiringSoonProducts.map((p) => {
                      const info = getExpiryInfo(p.expiryDate);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-slate-900 truncate block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-amber-800">
                              Batch: {p.batchNumber || 'N/A'} • Exp: {info.formattedDate}
                            </span>
                          </div>
                          <span className="bg-amber-200 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                            {info.daysRemaining}d left
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Low Stock Watchlist */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Low Stock Watchlist</span>
                  </h3>
                  <button
                    onClick={() => {
                      setCurrentAdminTab('inventory');
                      setInventoryFilter('low');
                    }}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    View All & Update →
                  </button>
                </div>

                {lowStockProducts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    All stocked products are currently in sufficient quantities.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {lowStockProducts.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs"
                      >
                        <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                          {p.name}
                        </span>
                        <span className="bg-amber-200 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                          {p.stock} Left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {currentAdminTab === 'products' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-5 animate-in fade-in duration-200">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading font-black text-xl text-slate-900">
                  Product Catalog
                </h2>
                <p className="text-xs text-slate-500">
                  Manage medical and cosmetics products, pricing and availability.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkImportOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-300"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                  <span>Bulk Import Excel</span>
                </button>

                <button
                  onClick={handleOpenAddProduct}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-heading font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name, brand, batch, or SKU..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Categories ({totalProducts})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value as any)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    expiryFilter === 'expired'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : expiryFilter === 'expiring_soon'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="all">All Expiry Statuses</option>
                  <option value="expiring_soon">⚠️ Expiring Soon ({expiringSoonProducts.length})</option>
                  <option value="expired">🚨 Expired ({expiredProducts.length})</option>
                  <option value="valid">✓ Valid Shelf Life</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 font-semibold">
                    <tr>
                      <th className="p-3">Product & Batch</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Expiry Date</th>
                      <th className="p-3">Price (₹)</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Flags</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          No products matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const expInfo = getExpiryInfo(prod.expiryDate);

                        return (
                          <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                            {/* Image & Title */}
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-heading font-bold text-slate-900 block truncate max-w-xs">
                                    {prod.name}
                                  </span>
                                  <span className="text-[10px] text-emerald-800 font-semibold">
                                    {prod.brand} • SKU: {prod.sku || 'N/A'}
                                  </span>
                                  {prod.batchNumber && (
                                    <span className="text-[10px] text-slate-500 block">
                                      Batch: {prod.batchNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-3 text-slate-600">
                              <span className="font-medium text-slate-800 block">{prod.category}</span>
                              <span className="text-[10px] text-slate-400">{prod.subcategory}</span>
                            </td>

                            {/* Expiry Date Status Badge */}
                            <td className="p-3">
                              {prod.expiryDate ? (
                                <div className="space-y-0.5">
                                  {expInfo.isExpired ? (
                                    <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-rose-300">
                                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                                      Expired ({expInfo.formattedDate})
                                    </span>
                                  ) : expInfo.isExpiringSoon ? (
                                    <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-300 animate-pulse">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      {expInfo.daysRemaining}d left ({expInfo.formattedDate})
                                    </span>
                                  ) : (
                                    <span className="bg-slate-100 text-slate-700 font-medium text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-slate-200">
                                      <Calendar className="w-3 h-3 text-slate-500" />
                                      {expInfo.formattedDate}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Not set</span>
                              )}
                            </td>

                            {/* Price */}
                            <td className="p-3 font-heading font-bold text-slate-900">
                              ₹{prod.price.toFixed(2)}
                              {prod.mrp && prod.mrp > prod.price && (
                                <span className="block text-[10px] text-slate-400 line-through">
                                  ₹{prod.mrp.toFixed(2)}
                                </span>
                              )}
                            </td>

                            {/* Stock Status */}
                            <td className="p-3">
                              {prod.stock <= 0 ? (
                                <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                  Out of Stock
                                </span>
                              ) : prod.stock < 10 ? (
                                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                  Low ({prod.stock})
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                  In Stock ({prod.stock})
                                </span>
                              )}
                            </td>

                            {/* Flags */}
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                {prod.isPrescriptionRequired && (
                                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    Rx
                                  </span>
                                )}
                                {prod.isFeatured && (
                                  <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUICK INVENTORY UPDATER */}
        {currentAdminTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading font-black text-xl text-slate-900">
                  Quick Stock & Inventory Updater
                </h2>
                <p className="text-xs text-slate-500">
                  Instantly edit stock quantities without modifying source code. Monitor expiry dates live.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-wrap">
                <button
                  onClick={() => setInventoryFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inventoryFilter === 'all' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setInventoryFilter('low')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inventoryFilter === 'low' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-700'
                  }`}
                >
                  Low Stock ({lowStockProducts.length})
                </button>
                <button
                  onClick={() => setInventoryFilter('out')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inventoryFilter === 'out' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700'
                  }`}
                >
                  Out of Stock ({outOfStockProducts.length})
                </button>
                <button
                  onClick={() => setInventoryFilter('expiring_soon')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inventoryFilter === 'expiring_soon' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-800'
                  }`}
                >
                  Expiring Soon ({expiringSoonProducts.length})
                </button>
                <button
                  onClick={() => setInventoryFilter('expired')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inventoryFilter === 'expired' ? 'bg-rose-700 text-white shadow-2xs' : 'text-rose-800'
                  }`}
                >
                  Expired ({expiredProducts.length})
                </button>
              </div>
            </div>

            {/* Live Inventory Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 font-semibold">
                  <tr>
                    <th className="p-3">Product Name & Batch</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Price (₹)</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick Stock Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No products found in this inventory filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((prod) => {
                      const currentVal =
                        stockEdits[prod.id] !== undefined ? stockEdits[prod.id] : prod.stock;
                      const isSaved = stockSavedId === prod.id;
                      const expInfo = getExpiryInfo(prod.expiryDate);

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50">
                          <td className="p-3 font-heading font-bold text-slate-900 truncate max-w-[220px]">
                            {prod.name}
                            <span className="block font-normal text-[10px] text-slate-500">
                              {prod.brand} • Batch: {prod.batchNumber || 'N/A'}
                            </span>
                          </td>

                          <td className="p-3 text-slate-600">{prod.category}</td>

                          {/* Expiry Date */}
                          <td className="p-3">
                            {prod.expiryDate ? (
                              <div className="space-y-0.5">
                                {expInfo.isExpired ? (
                                  <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-rose-300">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    Expired ({expInfo.formattedDate})
                                  </span>
                                ) : expInfo.isExpiringSoon ? (
                                  <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-300 animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    {expInfo.daysRemaining}d left
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-700 font-medium text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    {expInfo.formattedDate}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Not set</span>
                            )}
                          </td>

                          <td className="p-3 font-heading font-bold text-slate-900">
                            ₹{prod.price.toFixed(2)}
                          </td>

                          <td className="p-3 font-heading font-extrabold text-sm text-slate-900">
                            {prod.stock}
                          </td>

                          <td className="p-3">
                            {prod.stock <= 0 ? (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Out of Stock
                              </span>
                            ) : prod.stock < 10 ? (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Low Stock
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                In Stock
                              </span>
                            )}
                          </td>

                          {/* Inline updater input & save */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="Edit Full Details & Expiry"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={currentVal}
                                onChange={(e) =>
                                  setStockEdits({
                                    ...stockEdits,
                                    [prod.id]: Math.max(0, parseInt(e.target.value) || 0)
                                  })
                                }
                                className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 text-center focus:bg-white focus:ring-2 focus:ring-emerald-500"
                              />
                              <button
                                onClick={() => handleInlineStockSave(prod.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isSaved
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-900 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {isSaved ? 'Updated ✓' : 'Update'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS MANAGEMENT */}
        {currentAdminTab === 'orders' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="font-heading font-black text-xl text-slate-900">
                Customer Order Requests ({orders.length})
              </h2>
              <p className="text-xs text-slate-500">
                Review incoming requests, verify distance, and manage fulfillment workflow.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 stroke-1" />
                <p className="text-sm font-semibold text-slate-700">No customer orders submitted yet.</p>
                <p className="text-xs text-slate-500">
                  New orders will automatically appear here with customer phone, address & items.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3"
                  >
                    {/* Header: ID, Date, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-sm text-slate-900">
                          #{ord.id}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(ord.createdAt).toLocaleString()}
                        </span>
                        {ord.distanceKm && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                            {ord.distanceKm} km from shop
                          </span>
                        )}
                      </div>

                      {/* Status Dropdown & Delete Action */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Status:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => updateStatus(ord.id, e.target.value as any)}
                          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="New">New Request</option>
                          <option value="Contact Customer">Contact Customer</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready for Pickup / Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete order request #${ord.id} for ${ord.customerName}?`)) {
                              deleteOrderById(ord.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors cursor-pointer border border-rose-200"
                          title="Delete Order Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 text-sm">{ord.customerName}</div>
                        <div className="flex items-center gap-3">
                          <a
                            href={`tel:${ord.phone}`}
                            className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{ord.phone}</span>
                          </a>

                          <a
                            href={`https://wa.me/91${ord.phone}?text=${encodeURIComponent(`Hello ${ord.customerName}, regarding your order #${ord.id} at Maaji Raj Medical...`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                        <p className="text-slate-600 pt-1">
                          <span className="font-medium text-slate-700">Address: </span>
                          {ord.address}
                          {ord.landmark && ` (Near: ${ord.landmark})`}
                        </p>
                        {ord.notes && (
                          <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
                            <strong>Notes / Rx:</strong> {ord.notes}
                          </p>
                        )}
                      </div>

                      {/* Items & Total */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="font-bold text-slate-700 flex justify-between">
                          <span>Items Ordered ({ord.items.length})</span>
                          <span className="font-heading font-extrabold text-sm text-slate-900">
                            Total: ₹{ord.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px] text-slate-600 max-h-28 overflow-y-auto">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {it.productName} × {it.quantity}
                                {it.isPrescriptionRequired && (
                                   <span className="text-amber-600 font-bold ml-1">(Rx)</span>
                                )}
                              </span>
                              <span className="font-semibold">
                                ₹{(it.price * it.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Order Card Action Bar: Create Bill from Order */}
                    <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Order #{ord.id} • Status: <strong className="text-slate-800">{ord.status}</strong>
                      </span>

                      <button
                        onClick={() => {
                          setOrderToBill(ord);
                          setCurrentAdminTab('billing');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Transfer customer & medicines to A5 Cash Memo"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Create Bill from Order</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: BILLING & CASH MEMO */}
        {currentAdminTab === 'billing' && (
          <AdminBillingTab
            initialOrder={orderToBill}
            onClearInitialOrder={() => setOrderToBill(null)}
          />
        )}

        {/* TAB 6: SHOP SETTINGS */}
        {currentAdminTab === 'settings' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-6 animate-in fade-in duration-200 max-w-3xl">
            <div>
              <h2 className="font-heading font-black text-xl text-slate-900">
                Store Settings & Delivery Parameters
              </h2>
              <p className="text-xs text-slate-500">
                Update store address, contact numbers, delivery radius, and admin PIN.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.shopName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, shopName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proprietor / Pharmacist Name
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.ownerName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, ownerName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Number (with country code 91)
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsappNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Store Address in Udaipur
                </label>
                <textarea
                  rows={2}
                  required
                  value={settingsForm.address}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, address: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={settingsForm.deliveryRadiusKm}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        deliveryRadiusKm: Number(e.target.value) || 15
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shop Origin Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settingsForm.originLat}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        originLat: Number(e.target.value) || 24.5428
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shop Origin Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settingsForm.originLng}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        originLng: Number(e.target.value) || 73.6912
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Opening Hours
                  </label>
                  <input
                    type="text"
                    value={settingsForm.openingHours}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, openingHours: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Security PIN
                  </label>
                  <input
                    type="text"
                    value={settingsForm.adminPin}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, adminPin: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Cloud Database (Supabase) Card */}
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-heading font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Cloud Database (Supabase) Live Sync
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isSupabaseConfigured()
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
                    {isSupabaseConfigured() ? 'Connected to Cloud DB' : 'Local Storage Mode'}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://your-project.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Supabase Anon Public Key
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                    />
                  </div>

                  {dbTestResult && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        dbTestResult.success
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}
                    >
                      {dbTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{dbTestResult.message}</span>
                    </div>
                  )}

                  {syncAllMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{syncAllMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleTestAndSaveDb}
                      disabled={testingDb}
                      className="bg-slate-900 hover:bg-slate-800 text-emerald-400 font-heading font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      {testingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>{testingDb ? 'Testing Connection...' : 'Test & Connect Cloud DB'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePushLocalCatalogToCloud}
                      disabled={syncingAll || !isSupabaseConfigured()}
                      className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-heading font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      {syncingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                      <span>Push All Products to Supabase</span>
                    </button>
                  </div>
                </div>
              </div>

              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Settings updated successfully!</span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset store back to initial 100+ seed products and original settings?')) {
                      resetAllData();
                      alert('Database reset to initial dataset.');
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Initial Stock Data</span>
                </button>

                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modals */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        productToEdit={productToEdit}
        onClose={() => setIsProductModalOpen(false)}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />
    </div>
  );
};
