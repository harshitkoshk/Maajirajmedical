import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useShop } from '../../context/ShopContext';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ShieldAlert,
  Check,
  MessageCircle,
  Phone,
  Truck,
  Sparkles,
  Info
} from 'lucide-react';
import { getExpiryInfo } from '../../utils/expiry';

export const ProductDetailModal: React.FC = () => {
  const { selectedProductForDetail, setSelectedProductForDetail, addToCart, setIsCartOpen } = useCart();
  const { settings } = useShop();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!selectedProductForDetail) return null;

  const product = selectedProductForDetail;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;
  const maxAllowed = Math.max(1, product.stock);

  const handleIncrement = () => {
    if (qty < product.stock) {
      setQty((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (qty > 1) {
      setQty((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const success = addToCart(product, qty);
    if (success) {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setSelectedProductForDetail(null);
        setIsCartOpen(true);
      }, 700);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Maaji Raj Medical, I am interested in: ${product.name} (${product.brand}) - Price: ₹${product.price}. Is it available for delivery in Udaipur?`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductForDetail(null)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image & Badges */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="w-full flex justify-between items-start">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="my-auto py-4 aspect-square max-h-60 w-full flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain rounded-xl drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div className="w-full flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Truck className="w-3.5 h-3.5" />
              Delivery within 15 km
            </span>
            <span>SKU: {product.sku || 'MRMC-GEN'}</span>
          </div>
        </div>

        {/* Right Column: Details & Ordering */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
              <span>{product.brand}</span>
              <span>•</span>
              <span className="text-slate-500 font-normal">{product.subcategory}</span>
            </div>

            <h2 className="font-heading font-extrabold text-xl text-slate-900 leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-900 font-heading">
                ₹{product.price.toFixed(2)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{product.mrp.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-slate-500">Inclusive of all taxes</span>
            </div>

            {/* Pack Size, Dosage & Expiry Info */}
            {(product.packSize || product.dosageForm || product.expiryDate) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {(product.packSize || product.dosageForm) && (
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs text-slate-700">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {product.packSize && `Pack: ${product.packSize}`}
                      {product.packSize && product.dosageForm && ' | '}
                      {product.dosageForm && `Form: ${product.dosageForm}`}
                    </span>
                  </div>
                )}
                {product.expiryDate && (() => {
                  const expInfo = getExpiryInfo(product.expiryDate);
                  return (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md text-xs text-emerald-900 font-medium">
                      <span>Exp: {expInfo.formattedDate}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Prescription Warning Box */}
            {product.isPrescriptionRequired ? (
              <div className="mt-3 bg-amber-50 border border-amber-300/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Prescription Verification Required
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  "Prescription/verification may be required. Final availability and sale are subject to pharmacist/owner confirmation."
                </p>
              </div>
            ) : (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Over-the-counter wellness & personal care genuine item.</span>
              </div>
            )}

            {/* Description */}
            <div className="mt-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Description
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto">
                {product.description || 'Quality health & wellness product verified by Maaji Raj Medical & Cosmetics.'}
              </p>
            </div>
          </div>

          {/* Stock & Actions */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Quantity</span>
                <span className="text-[11px] text-slate-500">
                  {isOutOfStock
                    ? 'Currently Out of Stock'
                    : `Stock Available: ${product.stock} units`}
                </span>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                <button
                  onClick={handleDecrement}
                  disabled={qty <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center font-heading font-bold text-sm text-slate-900">
                  {qty}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={qty >= maxAllowed || isOutOfStock}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 px-4 rounded-xl font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/10'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add {qty} to Cart (₹{(product.price * qty).toFixed(2)})</span>
                </>
              )}
            </button>

            {/* Inquire on WhatsApp */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ask on WhatsApp</span>
              </a>

              <a
                href={`tel:${settings.phone}`}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-700" />
                <span>Call Shop</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
