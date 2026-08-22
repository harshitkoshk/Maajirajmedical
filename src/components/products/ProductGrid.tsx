import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onOpenDetail?: (product: Product) => void;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onOpenDetail,
  onResetFilters
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="font-heading font-bold text-slate-800 text-lg mb-1">
          No matching products found
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Try adjusting your search query, selecting another category, or resetting all filters.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  );
};
