import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useShop } from '../../context/ShopContext';
import { Order, OrderItem } from '../../types';
import { calculateDistance } from '../../services/storage';
import confetti from 'canvas-confetti';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
  Loader2,
  Navigation,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';

export const OrderModal: React.FC = () => {
  const { isOrderModalOpen, setIsOrderModalOpen, cart, subtotal, clearCart } = useCart();
  const { settings, createOrder } = useShop();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');

  // Location State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualUdaipurConfirmed, setManualUdaipurConfirmed] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOrderModalOpen) return null;

  // Haversine Distance Calculation Trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });

        // Calculate distance from shop origin
        const dist = calculateDistance(
          settings.originLat,
          settings.originLng,
          lat,
          lng
        );
        setDistanceKm(dist);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. You can check the manual Udaipur confirmation below.');
        } else {
          setLocationError('Unable to retrieve your location. Please check GPS settings or use manual confirmation.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Determine if location qualifies
  const isWithinDistance = distanceKm !== null && distanceKm <= settings.deliveryRadiusKm;
  const isEligibleLocation = isWithinDistance || manualUdaipurConfirmed;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Please enter your full name');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!address.trim()) {
      alert('Please provide your local delivery address in Udaipur');
      return;
    }

    if (!isEligibleLocation) {
      alert(`We currently only deliver within ${settings.deliveryRadiusKm} km of our Sector-14 shop in Udaipur.`);
      return;
    }

    setIsSubmitting(true);

    // Build Order Items
    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      brand: item.product.brand,
      price: item.product.price,
      quantity: item.quantity,
      isPrescriptionRequired: item.product.isPrescriptionRequired,
      image: item.product.image
    }));

    // Generate Order ID e.g. MRMC-7842
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MRMC-${randomCode}`;

    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      phone: cleanPhone,
      address: address.trim(),
      landmark: landmark.trim(),
      userLat: userLocation?.lat,
      userLng: userLocation?.lng,
      distanceKm: distanceKm ?? undefined,
      isWithinRadius: true,
      items: orderItems,
      totalAmount: subtotal,
      status: 'New',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    // Save order & reduce stock in storage
    createOrder(newOrder);

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    setCompletedOrder(newOrder);
    clearCart();
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsOrderModalOpen(false);
    setCompletedOrder(null);
  };

  // Generate pre-filled WhatsApp message for confirmation
  const generateWhatsAppConfirmationUrl = (order: Order) => {
    const itemsList = order.items
      .map((item, idx) => `${idx + 1}. ${item.productName} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const message = `*NEW ORDER CONFIRMATION REQUEST*\n` +
      `*Order ID:* ${order.id}\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Phone:* ${order.phone}\n` +
      `*Address:* ${order.address}${order.landmark ? ` (Near: ${order.landmark})` : ''}\n` +
      `*Distance:* ${order.distanceKm ? `${order.distanceKm} km` : 'Local Udaipur'}\n\n` +
      `*Items Ordered:*\n${itemsList}\n\n` +
      `*Total Amount:* ₹${order.totalAmount.toFixed(2)}\n\n` +
      `*Notes:* ${order.notes || 'None'}\n\n` +
      `Hello Maaji Raj Medical & Cosmetics, I would like to confirm my order #${order.id}.`;

    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base">
                {completedOrder ? 'Order Request Received' : 'Submit Local Order Request'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Maaji Raj Medical and Cosmetics • Sector-14, Udaipur
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {completedOrder ? (
            /* STEP 2: CONFIRMATION SUCCESS SCREEN */
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Order ID: #{completedOrder.id}
                </span>
                <h3 className="font-heading font-black text-xl text-slate-900 mt-2">
                  Your order request has been received!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Thank you, <strong>{completedOrder.customerName}</strong>. To verify availability and expedite delivery, please confirm directly with the shop owner.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between font-semibold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Summary ({completedOrder.items.length} items)</span>
                  <span className="font-heading font-bold text-sm text-slate-900">
                    Total: ₹{completedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1 text-slate-600 max-h-28 overflow-y-auto text-[11px]">
                  {completedOrder.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[220px]">
                        {it.productName} (x{it.quantity})
                      </span>
                      <span className="font-medium">₹{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">Delivery Address: </span>
                  {completedOrder.address}
                </div>
              </div>

              {/* ACTION BUTTONS (As required by prompt #15) */}
              <div className="space-y-2.5 pt-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                  <span className="font-bold block mb-1">
                    Please call or WhatsApp the shop to confirm availability:
                  </span>
                  <span className="text-emerald-800 text-xs">
                    Shop Contact: <strong>7737116439</strong> (Tushar Sharma)
                  </span>
                </div>

                {/* Call Owner Button */}
                <a
                  href={`tel:${settings.phone}`}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Phone className="w-5 h-5 text-white" />
                  <span>Call Owner to Confirm Order (7737116439)</span>
                </a>

                {/* Confirm via WhatsApp Button */}
                <a
                  href={generateWhatsAppConfirmationUrl(completedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-bold text-sm py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirm via WhatsApp (Pre-filled Summary)</span>
                </a>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Done / Return to Shop
                </button>
              </div>
            </div>
          ) : (
            /* STEP 1: ORDER REQUEST FORM WITH 15KM RADIUS CHECK */
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* 15 KM Radius Geolocation Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-heading font-bold text-xs text-slate-900">
                      15 km Delivery Radius Check
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Origin: Sector-14 Udaipur
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs disabled:opacity-60"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Use My Location (GPS)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Location result feedback */}
                {distanceKm !== null && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                      isWithinDistance
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}
                  >
                    {isWithinDistance ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">
                        Calculated Distance: {distanceKm} km from Shop
                      </div>
                      <div className="text-[11px] mt-0.5">
                        {isWithinDistance ? (
                          <span className="text-emerald-700 font-medium">
                            ✅ Within our 15 km delivery area in Udaipur. Order delivery allowed!
                          </span>
                        ) : (
                          <span className="text-rose-700 font-semibold">
                            "Sorry, this location is outside our 15 km delivery area."
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {locationError && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    {locationError}
                  </p>
                )}

                {/* Fallback checkbox if GPS disabled or unavailable */}
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manualUdaipur"
                    checked={manualUdaipurConfirmed}
                    onChange={(e) => setManualUdaipurConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="manualUdaipur" className="text-xs text-slate-700 cursor-pointer">
                    I confirm my address is within <strong>15 km of Sector-14, Govardhan Vilas, Udaipur</strong>.
                  </label>
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    We will call this number to confirm medicines and delivery.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Address in Udaipur <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat No, Colony/Street name, Udaipur"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Kalaji Bhavji, Opposite Park"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prescription or Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Doctor's note available, please deliver by 5 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Order Amount Bar */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Order Request</span>
                  <span className="font-heading font-black text-base text-emerald-400">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                  Pay on Delivery
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !isEligibleLocation}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-sm py-3.5 px-4 rounded-xl shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Request...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit Order Request (15 km Radius)</span>
                  </>
                )}
              </button>

              {!isEligibleLocation && (
                <p className="text-center text-[11px] text-rose-600 font-medium">
                  Please verify location or check the 15 km Udaipur confirmation box to submit.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
