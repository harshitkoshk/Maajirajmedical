import React from 'react';
import { useShop } from '../../context/ShopContext';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings } = useShop();

  return (
    <a
      href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Hello Maaji Raj Medical & Cosmetics, I would like to inquire about medicines/products.')}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-20 md:bottom-8 right-4 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-lg shadow-emerald-900/30 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pr-1">
        WhatsApp Order
      </span>
    </a>
  );
};
