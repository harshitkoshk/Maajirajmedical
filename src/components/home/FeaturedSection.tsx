import React from 'react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../products/ProductCard';
import { ArrowRight, Sparkles, Pill, HeartHandshake } from 'lucide-react';

export const FeaturedSection: React.FC = () => {
  const { products, navigateWithCategory } = useShop();

  // Segment products
  const featuredMedicines = products
    .filter((p) => p.category === 'Medicines' || p.category === 'Medical Supplies')
    .slice(0, 4);

  const featuredCosmetics = products
    .filter(
      (p) =>
        p.category === 'Skin Care / Face' ||
        p.category === 'Cosmetics' ||
        p.category === 'Hair Care'
    )
    .slice(0, 4);

  const newArrivals = products.slice(0, 4);

  return (
    <div className="space-y-16 py-8 bg-slate-50">
      {/* SECTION 1: HEALTHCARE ESSENTIALS & MEDICINES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 font-heading">
              <Pill className="w-3.5 h-3.5" />
              Doctor & Pharmacist Recommended
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-0.5">
              Essential Medicines & Supplies
            </h2>
          </div>
          <button
            onClick={() => navigateWithCategory('Medicines')}
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
          >
            <span>View All Medicines</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {featuredMedicines.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* SECTION 2: BEAUTY & SKINCARE SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              Dermacosmetics & Glowing Skin
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-0.5">
              Skin Care & Beauty Boutique
            </h2>
          </div>
          <button
            onClick={() => navigateWithCategory('Skin Care / Face')}
            className="text-xs sm:text-sm font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 group"
          >
            <span>View Cosmetics</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {featuredCosmetics.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* SECTION 3: TRUST & PHARMACY ASSURANCE BADGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900">
                100% Genuine Medicines
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Directly sourced from trusted licensed pharmaceutical distributors and manufacturers across India.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900">
                Curated Beauty & Skincare
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Authentic dermatologist formulated skincare brands, baby essentials, and daily personal hygiene.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900">
                Owner Direct Call & Support
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Personalized advice by store owner Tushar Sharma. Just call <strong>7737116439</strong> anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
