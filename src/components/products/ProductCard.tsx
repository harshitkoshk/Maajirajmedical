import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Check, ShieldAlert, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart, setSelectedProductForDetail } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;

    const success = addToCart(product, 1);
    if (success) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1200);
    }
  };

  const handleClick = () => {
    if (onOpenDetail) {
      onOpenDetail(product);
    } else {
      setSelectedProductForDetail(product);
    }
  };

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          {product.isPrescriptionRequired && (
            <span className="bg-amber-500/95 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <ShieldAlert className="w-3 h-3" />
              Rx Required
            </span>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div>
          {isOutOfStock ? (
            <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-100 text-amber-800 border border-amber-300/80 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Only {product.stock} left
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center rounded-xl group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // fallback image if Unsplash fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
          }}
        />
        
        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Subcategory */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-emerald-800 truncate max-w-[120px]">
              {product.brand}
            </span>
            <span className="text-slate-400 truncate max-w-[100px]">
              {product.subcategory}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* Pack Size / Dosage */}
          {(product.packSize || product.dosageForm) && (
            <p className="text-[11px] text-slate-500 mt-1">
              {product.packSize || product.dosageForm}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 font-heading">
                ₹{product.price.toFixed(2)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{product.mrp.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500">M.R.P incl. taxes</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-emerald-700 text-white'
            }`}
            title={isOutOfStock ? 'Currently out of stock' : 'Add to shopping cart'}
            aria-label="Add to cart"
          >
            {addedAnimation ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
