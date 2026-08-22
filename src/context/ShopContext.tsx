import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Order, ShopSettings, FilterState } from '../types';
import {
  getProducts,
  saveProduct,
  updateProductStock,
  updateProductPrice,
  deleteProduct,
  bulkImportProducts,
  getCategories,
  getOrders,
  saveOrder,
  updateOrderStatus,
  getSettings,
  saveSettings,
  getAdminAuth,
  setAdminAuth,
  resetToSeedData
} from '../services/storage';

export const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: '',
  category: 'all',
  subcategory: 'all',
  brand: 'all',
  inStockOnly: false,
  prescriptionOnly: null,
  featuredOnly: false,
  minPrice: 0,
  maxPrice: 3000,
  sortBy: 'featured'
};

const getTabFromUrl = (): string => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.includes('/admin') || hash.includes('admin')) {
    return 'admin';
  }
  if (path.includes('/catalogue') || hash.includes('catalogue')) {
    return 'catalogue';
  }
  if (path.includes('/contact') || hash.includes('contact')) {
    return 'contact';
  }
  return 'home';
};

interface ShopContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: ShopSettings;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string, syncUrl?: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  // Product actions
  addProduct: (product: Product) => void;
  editProduct: (product: Product) => void;
  deleteProductById: (id: string) => void;
  setStock: (id: string, stock: number) => void;
  setPrice: (id: string, price: number) => void;
  importBulk: (
    items: Product[],
    mode: 'add' | 'upsert' | 'replace'
  ) => { imported: number; updated: number; skipped: number };
  // Order actions
  createOrder: (order: Order) => void;
  updateStatus: (orderId: string, status: Order['status']) => void;
  // Settings actions
  updateShopSettings: (settings: ShopSettings) => void;
  resetAllData: () => void;
  // Navigation helpers
  navigateWithCategory: (catName: string, subcatName?: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [categories, setCategories] = useState<Category[]>(getCategories);
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [settings, setSettings] = useState<ShopSettings>(getSettings);
  const [isAdmin, setIsAdminState] = useState<boolean>(getAdminAuth);
  const [activeTab, setActiveTabState] = useState<string>(getTabFromUrl);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Sync tab with browser URL history
  const setActiveTab = (tab: string, syncUrl = true) => {
    setActiveTabState(tab);
    if (syncUrl && window.history.pushState) {
      if (tab === 'admin') {
        window.history.pushState({}, '', '/admin');
      } else if (tab === 'home') {
        window.history.pushState({}, '', '/');
      } else {
        window.history.pushState({}, '', `/${tab}`);
      }
    }
  };

  // Sync state when storage changes across tabs or admin actions
  const reloadData = () => {
    setProducts(getProducts());
    setCategories(getCategories());
    setOrders(getOrders());
    setSettings(getSettings());
    setIsAdminState(getAdminAuth());
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const currentTab = getTabFromUrl();
      setActiveTabState(currentTab);
    };

    const handleStorageUpdate = () => {
      reloadData();
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('mrmc_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('mrmc_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const setIsAdmin = (val: boolean) => {
    setAdminAuth(val);
    setIsAdminState(val);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  const navigateWithCategory = (catName: string, subcatName = 'all') => {
    setFilters((prev) => ({
      ...prev,
      category: catName,
      subcategory: subcatName,
      searchQuery: ''
    }));
    setActiveTab('catalogue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addProduct = (product: Product) => {
    saveProduct(product);
    reloadData();
  };

  const editProduct = (product: Product) => {
    saveProduct(product);
    reloadData();
  };

  const deleteProductById = (id: string) => {
    deleteProduct(id);
    reloadData();
  };

  const setStock = (id: string, stock: number) => {
    updateProductStock(id, stock);
    reloadData();
  };

  const setPrice = (id: string, price: number) => {
    updateProductPrice(id, price);
    reloadData();
  };

  const importBulk = (items: Product[], mode: 'add' | 'upsert' | 'replace') => {
    const res = bulkImportProducts(items, mode);
    reloadData();
    return res;
  };

  const createOrder = (order: Order) => {
    saveOrder(order);
    reloadData();
  };

  const updateStatus = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    reloadData();
  };

  const updateShopSettings = (newSettings: ShopSettings) => {
    saveSettings(newSettings);
    reloadData();
  };

  const resetAllData = () => {
    resetToSeedData();
    reloadData();
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        orders,
        settings,
        isAdmin,
        setIsAdmin,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        resetFilters,
        addProduct,
        editProduct,
        deleteProductById,
        setStock,
        setPrice,
        importBulk,
        createOrder,
        updateStatus,
        updateShopSettings,
        resetAllData,
        navigateWithCategory
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
