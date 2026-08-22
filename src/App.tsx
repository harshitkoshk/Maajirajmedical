import React, { useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloatingButton } from './components/layout/WhatsAppFloatingButton';
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { CartDrawer } from './components/cart/CartDrawer';
import { OrderModal } from './components/checkout/OrderModal';
import { ProductDetailModal } from './components/products/ProductDetailModal';

const AppContent: React.FC = () => {
  const { activeTab, isAdmin } = useShop();

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'catalogue' && <CataloguePage />}
        {activeTab === 'contact' && <ContactPage />}
        {activeTab === 'admin' && (isAdmin ? <AdminDashboard /> : <AdminLogin />)}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav />

      {/* Floating WhatsApp Action Widget */}
      <WhatsAppFloatingButton />

      {/* Modals and Drawers */}
      <CartDrawer />
      <OrderModal />
      <ProductDetailModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ShopProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ShopProvider>
  );
};

export default App;
