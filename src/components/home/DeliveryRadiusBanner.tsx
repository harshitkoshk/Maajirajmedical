import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useCart } from '../../context/CartContext';
import { MapPin, Truck, Phone, Navigation, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const DeliveryRadiusBanner: React.FC = () => {
  const { settings, setActiveTab } = useShop();

  return (
    <section className="py-6 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-800/40 relative overflow-hidden shadow-xl">
          {/* Subtle radar circle indicator */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-80 h-80 rounded-full border border-emerald-500/20 pointer-events-none"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-56 h-56 rounded-full border border-emerald-500/30 pointer-events-none"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-32 h-32 rounded-full border border-emerald-500/40 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Geographic 15 km Radius Service Area</span>
              </div>

              <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
                Fast Local Order Delivery Across Udaipur
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                We fulfill medicine and cosmetic order requests up to a <strong>{settings.deliveryRadiusKm} km radius</strong> from our store in Sector-14, Govardhan Vilas. All prescription drugs are verified by our licensed pharmacist prior to dispatch.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200 pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sector-14 & Govardhan Vilas
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Hiran Magri & Savina
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Udaipur City Center
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <a
                href={`tel:${settings.phone}`}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs py-3 px-4 rounded-xl text-center shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Store: {settings.phone}</span>
              </a>

              <button
                onClick={() => setActiveTab('contact')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>View Store Map & Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
