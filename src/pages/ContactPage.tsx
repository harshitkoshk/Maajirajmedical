import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Send,
  Navigation,
  ExternalLink,
  ShieldCheck,
  User,
  HeartPulse,
  CheckCircle2
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings } = useShop();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;

    // Open WhatsApp with inquiry
    const text = encodeURIComponent(
      `Hello Tushar Sharma (Maaji Raj Medical & Cosmetics),\nName: ${inquiryName}\nPhone: ${inquiryPhone}\nMessage: ${inquiryMessage}`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-heading">
            Visit Us or Order Online
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900">
            Contact & Store Location
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Serving Govardhan Vilas, Sector-14, and all of Udaipur with authentic healthcare & cosmetic supplies.
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Business Cards & Quick Actions */}
          <div className="lg:col-span-5 space-y-5">
            {/* Primary Details Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-lg">
                  MR
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg text-slate-900 leading-tight">
                    {settings.shopName}
                  </h2>
                  <p className="text-xs text-emerald-700 font-semibold">
                    Proprietor: {settings.ownerName}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Address */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Physical Store Address</span>
                    <p className="text-slate-600 leading-relaxed">
                      {settings.address}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Phone Call Support</span>
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-emerald-700 font-bold text-sm hover:underline"
                    >
                      {settings.phone}
                    </a>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Direct owner assistance & medicine queries
                    </span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Opening Schedule</span>
                    <p className="text-slate-700 font-medium">
                      {settings.openingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`tel:${settings.phone}`}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>

                <a
                  href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Maaji Raj Medical, I would like to inquire about products.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-emerald-400 font-heading font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-heading font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-300"
              >
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Get Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* Service Area Notice */}
            <div className="bg-emerald-950 text-emerald-200 rounded-3xl p-5 border border-emerald-800/40 text-xs space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>15 km Local Delivery Zone</span>
              </div>
              <p className="text-emerald-300/80 leading-relaxed text-[11px]">
                Deliveries are dispatched directly from ADD. 81, Sector-14, Govardhan Vilas. Distance is calculated based on exact GPS coordinates for all customer orders in Udaipur.
              </p>
            </div>
          </div>

          {/* Right Column: Google Maps & Message Inquiry Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Map Visual Box */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Store Location Map (Sector-14, Udaipur)
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Origin: {settings.originLat}° N, {settings.originLng}° E
                </span>
              </div>

              {/* Map Embed or Directions Container */}
              <div className="w-full aspect-video sm:aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                <iframe
                  title="Maaji Raj Medical Store Location"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  allowFullScreen
                  className="border-0"
                  src={`https://maps.google.com/maps?q=${settings.originLat && settings.originLng ? `${settings.originLat},${settings.originLng}` : encodeURIComponent(settings.address || 'Sector 14 Govardhan Vilas Udaipur')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                />
                
                {/* Floating Map Overlay Button */}
                <a
                  href={settings.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 backdrop-blur-xs transition-transform group-hover:scale-105"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                </a>
              </div>
            </div>

            {/* Direct Inquiry Form */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Send a Direct Message / Prescription Inquiry
                </h3>
                <p className="text-xs text-slate-500">
                  Need a specific medicine or cosmetics brand? Fill out the form and connect directly with our owner on WhatsApp.
                </p>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Amit Jain"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medicine / Product Inquiry Details
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="List required medicines, cosmetics items, or delivery questions..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {formSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Inquiry opened in WhatsApp. Owner will assist you shortly!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry to Owner on WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
