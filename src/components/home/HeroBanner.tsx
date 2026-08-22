import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useCart } from '../../context/CartContext';
import {
  Pill,
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Truck,
  HeartPulse
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { settings, setActiveTab, navigateWithCategory } = useShop();
  const { setIsOrderModalOpen } = useCart();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white pt-8 pb-14 sm:pt-12 sm:pb-20">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Trust Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authentic Pharmacy & Beauty Boutique in Udaipur</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <span className="text-xs sm:text-sm uppercase tracking-widest text-emerald-400 font-bold font-heading block">
                Maaji Raj Medical and Cosmetics
              </span>
              <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-5xl tracking-tight text-white leading-tight">
                Your Trusted Medical & <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-rose-300 bg-clip-text text-transparent">
                  Cosmetics Store
                </span> in Udaipur
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Medicines, healthcare essentials, personal care and cosmetics — conveniently available near you in Sector-14, Govardhan Vilas with quick 15 km local order delivery.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {/* Primary Shop Button */}
              <button
                onClick={() => {
                  setActiveTab('catalogue');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Shop Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Call Now Button */}
              <a
                href={`tel:${settings.phone}`}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-heading font-semibold text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Now: <strong>{settings.phone}</strong></span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Maaji Raj Medical, I would like to order medicines/products.')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-heading font-semibold text-xs sm:text-sm px-4 py-3.5 rounded-2xl transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Quick Feature Strip */}
            <div className="pt-4 grid grid-cols-3 gap-2 border-t border-slate-800 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] leading-tight">100% Genuine Brands</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Truck className="w-3.5 h-3.5 text-rose-300" />
                </div>
                <span className="text-[11px] leading-tight">15 km Local Radius</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span className="text-[11px] leading-tight">8:00 AM – 10:30 PM</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Dual-Pill Card (Medical + Cosmetics) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="text-xs font-bold text-slate-200">
                    Store Open Now in Udaipur
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Sector-14, Govardhan Vilas
                </span>
              </div>

              {/* Dual Category Showcase Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Medical Card */}
                <div
                  onClick={() => navigateWithCategory('Medicines')}
                  className="bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/40 rounded-2xl p-4 text-left cursor-pointer group transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Pill className="w-5 h-5 -rotate-45" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white">
                    Medicines & Care
                  </h4>
                  <p className="text-[11px] text-emerald-300/80 mt-1">
                    Antibiotics, fever relief, multivitamins & surgical kits.
                  </p>
                  <span className="text-[11px] font-bold text-emerald-400 mt-2 block">
                    Browse Medicines →
                  </span>
                </div>

                {/* Cosmetics Card */}
                <div
                  onClick={() => navigateWithCategory('Cosmetics')}
                  className="bg-rose-950/40 hover:bg-rose-900/40 border border-rose-700/30 rounded-2xl p-4 text-left cursor-pointer group transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white">
                    Cosmetics & Beauty
                  </h4>
                  <p className="text-[11px] text-rose-200/80 mt-1">
                    Skincare, serums, lip shades & personal care essentials.
                  </p>
                  <span className="text-[11px] font-bold text-rose-300 mt-2 block">
                    Explore Beauty →
                  </span>
                </div>
              </div>

              {/* Owner Info & Location Strip */}
              <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold">
                    TS
                  </div>
                  <div>
                    <span className="text-white font-bold block">{settings.ownerName}</span>
                    <span className="text-slate-400 text-[10px]">Owner & Pharmacist</span>
                  </div>
                </div>

                <a
                  href={`tel:${settings.phone}`}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                >
                  {settings.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
