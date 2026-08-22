import React from 'react';
import { useShop } from '../../context/ShopContext';
import {
  Pill,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Scissors,
  Palette,
  Baby,
  Smile,
  ArrowRight
} from 'lucide-react';

const categoryIcons: { [slug: string]: React.ElementType } = {
  medicines: Pill,
  'medical-supplies': ShieldAlert,
  'skin-care': Sparkles,
  'body-care': HeartPulse,
  'hair-care': Scissors,
  cosmetics: Palette,
  'baby-care': Baby,
  'personal-care': Smile
};

export const QuickCategoryGrid: React.FC = () => {
  const { categories, products, navigateWithCategory } = useShop();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading">
              Explore Our Department Aisles
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-1">
              Popular Product Categories
            </h2>
          </div>
          <button
            onClick={() => navigateWithCategory('all')}
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Pill;
            const count = products.filter((p) => p.category === cat.name).length;
            const isCosmetic = cat.type === 'cosmetic';

            return (
              <div
                key={cat.id}
                onClick={() => navigateWithCategory(cat.name)}
                className={`group relative rounded-3xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[160px] ${
                  isCosmetic
                    ? 'bg-rose-50/50 hover:bg-rose-50 border-rose-200/70 hover:border-rose-400 hover:shadow-lg'
                    : 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-200/70 hover:border-emerald-500 hover:shadow-lg'
                }`}
              >
                {/* Background Banner Image faint watermark */}
                <div
                  className="absolute right-0 bottom-0 w-24 h-24 bg-cover bg-center opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all rounded-br-3xl pointer-events-none"
                  style={{ backgroundImage: `url(${cat.bannerImage})` }}
                />

                <div className="flex items-start justify-between relative z-10">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform ${
                      isCosmetic
                        ? 'bg-rose-600 text-white shadow-rose-900/10'
                        : 'bg-emerald-700 text-white shadow-emerald-900/10'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {count} items
                  </span>
                </div>

                <div className="relative z-10 mt-4">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {cat.subcategories.slice(0, 2).join(', ')}...
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
