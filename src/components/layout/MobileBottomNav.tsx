import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useCart } from '../../context/CartContext';
import { Home, Grid, Search, ShoppingBag, MapPin } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setFilters } = useShop();
  const { itemCount, setIsCartOpen } = useCart();

  const handleSearchClick = () => {
    setActiveTab('catalogue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoriesClick = () => {
    setActiveTab('catalogue');
    setFilters((prev) => ({ ...prev, category: 'all', subcategory: 'all' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 py-1.5 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'home' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </button>

        {/* Categories */}
        <button
          onClick={handleCategoriesClick}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'catalogue' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-semibold mt-0.5">Categories</span>
        </button>

        {/* Search */}
        <button
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <div className="w-9 h-9 -mt-3 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 active:scale-95 transition-transform">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Search</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Cart</span>
        </button>

        {/* Contact & Location */}
        <button
          onClick={() => {
            setActiveTab('contact');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'contact' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className={`w-5 h-5 ${activeTab === 'contact' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-semibold mt-0.5">Location</span>
        </button>
      </div>
    </div>
  );
};
