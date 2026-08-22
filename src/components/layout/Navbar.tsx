import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useCart } from '../../context/CartContext';
import {
  Phone,
  MessageCircle,
  ShoppingBag,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Menu,
  X,
  Lock,
  LogOut,
  Pill,
  Sparkles,
  Home,
  Layers,
  HeartHandshake
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    settings,
    isAdmin,
    setIsAdmin,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    navigateWithCategory,
    categories
  } = useShop();

  const { itemCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setFilters((prev) => ({
        ...prev,
        searchQuery: searchInput.trim(),
        category: 'all',
        subcategory: 'all'
      }));
      setActiveTab('catalogue');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'catalogue', label: 'All Products', icon: Layers },
    { id: 'medicines', label: 'Medicines', icon: Pill, isCategory: 'Medicines' },
    { id: 'cosmetics', label: 'Cosmetics & Beauty', icon: Sparkles, isCategory: 'Cosmetics' },
    { id: 'contact', label: 'Contact & Location', icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Genuine Pharmacy & Cosmetics
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Sector-14, Govardhan Vilas, Udaipur
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              8:00 AM – 10:30 PM
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Call: <strong>{settings.phone}</strong></span>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Maaji Raj Medical, I have an inquiry about medicines/products.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors text-emerald-400"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            {isAdmin && (
              <>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    if (window.history.pushState) window.history.pushState({}, '', '/');
                    setActiveTab('home');
                  }}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Exit Admin
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-8">
          {/* Brand Logo & Name */}
          <div
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <div className="relative flex items-center justify-center">
                <Pill className="w-5 h-5 text-white transform -rotate-45" />
                <Sparkles className="w-3.5 h-3.5 text-rose-300 absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg md:text-xl text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                  Maaji Raj
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                  Udaipur
                </span>
              </div>
              <p className="text-[11px] md:text-xs font-medium text-slate-500 tracking-wide mt-0.5">
                Medical & Cosmetics Store
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg items-center relative"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search medicines (e.g., Ceflox, Dolo), cosmetics, skincare..."
              className="w-full bg-slate-100/90 text-slate-900 text-sm pl-10 pr-24 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Direct Call Button (Mobile & Desktop) */}
            <a
              href={`tel:${settings.phone}`}
              className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-200/80 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{settings.phone}</span>
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 md:px-4 md:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-sm transition-all active:scale-95"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span className="hidden md:inline text-xs font-bold tracking-wide">Cart</span>
              {itemCount > 0 && (
                <span className="bg-rose-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 md:hidden relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search medicines (e.g. Ceflox), cosmetics..."
            className="w-full bg-slate-100 text-slate-900 text-sm pl-9 pr-20 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-md"
          >
            Search
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-sm">
          <div className="flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                (link.id === 'home' && activeTab === 'home') ||
                (link.id === 'catalogue' && activeTab === 'catalogue' && filters.category === 'all') ||
                (link.id === 'medicines' && activeTab === 'catalogue' && filters.category === 'Medicines') ||
                (link.id === 'cosmetics' && activeTab === 'catalogue' && filters.category === 'Cosmetics') ||
                (link.id === 'contact' && activeTab === 'contact');

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.isCategory) {
                      navigateWithCategory(link.isCategory);
                    } else {
                      setActiveTab(link.id);
                      if (link.id === 'catalogue') {
                        setFilters((prev) => ({ ...prev, category: 'all', subcategory: 'all' }));
                      }
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Owner:</span>
            <span className="font-semibold text-slate-800">{settings.ownerName}</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium text-[11px] border border-emerald-200">
              Max 15 km Delivery Radius
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.isCategory) {
                      navigateWithCategory(link.isCategory);
                    } else {
                      setActiveTab(link.id);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span>{link.label}</span>
                  </div>
                  <span className="text-xs text-slate-400">→</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Browse by Category
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    navigateWithCategory(c.name);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-xs text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 p-2 rounded-lg transition-colors border border-slate-100"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
            <a
              href={`tel:${settings.phone}`}
              className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-center shadow-sm"
            >
              Call: {settings.phone}
            </a>
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Maaji Raj Medical, I have an inquiry about medicines.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-slate-900 text-emerald-400 font-semibold py-2.5 rounded-xl text-center"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
