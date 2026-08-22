import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductGrid } from '../components/products/ProductGrid';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Pill,
  Sparkles,
  Check,
  ChevronDown
} from 'lucide-react';

export const CataloguePage: React.FC = () => {
  const { products, categories, filters, setFilters, resetFilters } = useShop();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique brands
  const brandsList = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  // Current category object & subcategories
  const selectedCategoryObj = categories.find((c) => c.name === filters.category);
  const subcategoriesList = selectedCategoryObj ? selectedCategoryObj.subcategories : [];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query filter (Name, Brand, Category, Subcategory, Description)
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchSubcategory = p.subcategory.toLowerCase().includes(q);
          const matchSku = p.sku && p.sku.toLowerCase().includes(q);

          if (!matchName && !matchBrand && !matchCategory && !matchSubcategory && !matchSku) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== 'all' && p.category !== filters.category) {
          return false;
        }

        // Subcategory filter
        if (filters.subcategory !== 'all' && p.subcategory !== filters.subcategory) {
          return false;
        }

        // Brand filter
        if (filters.brand !== 'all' && p.brand !== filters.brand) {
          return false;
        }

        // In-stock only
        if (filters.inStockOnly && p.stock <= 0) {
          return false;
        }

        // Prescription only
        if (filters.prescriptionOnly !== null) {
          if (filters.prescriptionOnly && !p.isPrescriptionRequired) return false;
          if (!filters.prescriptionOnly && p.isPrescriptionRequired) return false;
        }

        // Featured only
        if (filters.featuredOnly && !p.isFeatured) {
          return false;
        }

        // Price range
        if (p.price < filters.minPrice || p.price > filters.maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (filters.sortBy === 'newest')
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Default: featured first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [products, filters]);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Page Title & Search Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading">
                Maaji Raj Medical & Cosmetics Catalog
              </span>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-0.5">
                {filters.category === 'all' ? 'All Products' : filters.category}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredProducts.length} verified products available for local 15km delivery.
              </p>
            </div>

            {/* Instant Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                placeholder="Search products (e.g., Ceflox, Dolo, Cetaphil)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Pill Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-100">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, category: 'all', subcategory: 'all' }))
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filters.category === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    category: c.name,
                    subcategory: 'all'
                  }))
                }
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filters.category === c.name
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Layout: Left Sidebar Filters + Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden flex items-center justify-between gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 bg-white border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters & Sort</span>
            </button>
            <button
              onClick={resetFilters}
              className="bg-white border border-slate-200 rounded-2xl p-2.5 text-slate-500 hover:text-slate-800 shadow-2xs"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-heading font-bold text-sm text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Filters</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Subcategory Filter if category selected */}
            {subcategoriesList.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Subcategories
                </label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, subcategory: 'all' }))}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      filters.subcategory === 'all'
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All {filters.category}
                  </button>
                  {subcategoriesList.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setFilters((prev) => ({ ...prev, subcategory: sub }))}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        filters.subcategory === sub
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Brand / Manufacturer
              </label>
              <select
                value={filters.brand}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, brand: e.target.value }))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Brands ({brandsList.length})</option>
                {brandsList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>Max Price</span>
                <span className="text-emerald-700 font-heading font-extrabold">
                  ₹{filters.maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
                }
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>₹0</span>
                <span>₹1500</span>
                <span>₹3000+</span>
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800">In-Stock Items Only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featuredOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, featuredOnly: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800">Featured Products Only</span>
              </label>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-9 space-y-4">
            {/* Sort & Count Header */}
            <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div>
                <span>Showing </span>
                <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong>
                <span> products</span>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500 hidden sm:inline">Sort By:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))
                  }
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="featured">Featured / Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <ProductGrid products={filteredProducts} onResetFilters={resetFilters} />
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col justify-between p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-heading font-bold text-base text-slate-900">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>Filter Products</span>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Options */}
              <div className="flex-1 overflow-y-auto space-y-5 text-xs">
                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block uppercase">Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, brand: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium"
                  >
                    <option value="all">All Brands</option>
                    {brandsList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 uppercase">
                    <span>Max Price</span>
                    <span className="text-emerald-700 font-heading font-extrabold">
                      ₹{filters.maxPrice}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-700"
                  />
                </div>

                {/* In Stock Toggle */}
                <label className="flex items-center gap-2 font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>In-Stock Only</span>
                </label>
              </div>

              {/* Apply / Reset CTA */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    resetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 text-xs"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl font-heading font-bold text-xs shadow-sm"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
