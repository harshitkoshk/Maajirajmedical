import React from 'react';
import { useCart } from '../../context/CartContext';
import { useShop } from '../../context/ShopContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Truck,
  PhoneCall
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    itemCount,
    setIsOrderModalOpen
  } = useCart();

  const { settings, setActiveTab } = useShop();

  if (!isCartOpen) return null;

  const hasPrescriptionItems = cart.some((item) => item.product.isPrescriptionRequired);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="font-heading font-bold text-base">Your Cart</h2>
                <p className="text-[11px] text-slate-400">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in order request
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <ShoppingBag className="w-9 h-9 stroke-1" />
                </div>
                <h3 className="font-heading font-bold text-slate-800 text-base mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Explore medicines, personal care, and beauty products in our Udaipur store.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveTab('catalogue');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <>
                {/* Rx Warning Notice if cart contains prescription medicines */}
                {hasPrescriptionItems && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Contains Prescription Medicine(s)</span>
                      <span className="text-[11px] text-amber-800">
                        Pharmacist will verify prescription before order fulfillment.
                      </span>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2.5">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3 relative group"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg bg-white p-1 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase truncate">
                            {product.brand}
                          </span>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="font-heading font-semibold text-xs text-slate-900 truncate">
                          {product.name}
                        </h4>

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-heading font-extrabold text-sm text-slate-900">
                            ₹{(product.price * quantity).toFixed(2)}
                          </span>

                          {/* Quantity selector */}
                          <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-2xs">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-800">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              disabled={quantity >= product.stock}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer / Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-200/90 space-y-3">
              {/* Delivery info */}
              <div className="bg-emerald-50/90 rounded-xl p-2.5 border border-emerald-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Delivery Service in Udaipur</span>
                </div>
                <span className="font-bold text-emerald-900">Within {settings.deliveryRadiusKm} km</span>
              </div>

              {/* Subtotal */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Cart Items Total ({itemCount})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Local Delivery</span>
                  <span className="text-emerald-700 font-semibold">Free / Local Rates</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-100 font-heading">
                  <span>Estimated Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Proceed to Order Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <p className="text-[11px] text-slate-400">
                  No immediate online payment required. Pay upon delivery/pickup.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
