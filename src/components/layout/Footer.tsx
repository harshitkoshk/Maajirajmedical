import React from 'react';
import { useShop } from '../../context/ShopContext';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Heart,
  ExternalLink,
  Pill,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, categories, navigateWithCategory, setActiveTab } = useShop();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-10 border-b border-slate-800/80">
          {/* Col 1: Shop Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white leading-tight">
                  {settings.shopName}
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  Pharmacy & Beauty Store
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Your dependable neighborhood medical and cosmetic store in Udaipur. Offering 100% genuine pharmaceuticals, daily healthcare supplies, dermacosmetics, and personal care with local delivery.
            </p>

            <div className="pt-1 flex flex-col space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Proprietor:</span>
                <span className="text-white font-semibold">{settings.ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Service Radius:</span>
                <span className="text-emerald-400 font-semibold">Within {settings.deliveryRadiusKm} km of Sector-14</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm text-white tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Product Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigateWithCategory(cat.name)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-500/50"></span>
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Navigation & Hours */}
          <div className="space-y-4">
            <div>
              <h4 className="font-heading font-semibold text-sm text-white tracking-wider uppercase mb-3">
                Store Hours
              </h4>
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Open 7 Days a Week</span>
                </div>
                <p className="text-slate-300">{settings.openingHours}</p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Urgent order queries answered by phone.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-sm text-white tracking-wider uppercase mb-2">
                Quick Links
              </h4>
              <ul className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('home')} className="hover:text-white">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('catalogue')} className="hover:text-white">
                    Catalogue
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('contact')} className="hover:text-white">
                    Location & Map
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('contact')} className="hover:text-white">
                    Helpline & Call
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Contact & Directions */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm text-white tracking-wider uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Visit & Contact Us
            </h4>

            <div className="text-xs text-slate-400 space-y-2">
              <p className="leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {settings.address}
              </p>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {settings.phone}</span>
              </a>

              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Maaji Raj Medical, I would like to inquire about products.')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold py-2 px-3 rounded-xl text-xs transition-colors border border-emerald-900/40"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Shop</span>
              </a>

              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-[11px] pt-1"
              >
                <span>Open Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Medical Regulatory Disclaimer */}
        <div className="py-6 border-b border-slate-800/80">
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">
                Statutory Medical & Pharmacy Compliance Disclaimer:
              </span>
              Product availability, pricing, and suitability may vary. Prescription medicines require physical verification and pharmacist/owner confirmation before fulfillment. This platform serves as a catalogue and local order-request system. All final dispensations are authorized in-person at our registered store in Udaipur.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {settings.shopName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Sector-14, Govardhan Vilas, Udaipur, Rajasthan</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              Pharmacist In-Charge: <strong>{settings.ownerName}</strong>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
