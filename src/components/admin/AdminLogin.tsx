import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Lock, KeyRound, ArrowRight, Home, ShieldAlert } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { settings, setIsAdmin, setActiveTab } = useShop();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === settings.adminPin) {
      setIsAdmin(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleReturnHome = () => {
    if (window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
    setActiveTab('home');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-black text-2xl text-slate-900">
            Store Management Portal
          </h2>
          <p className="text-xs text-slate-500">
            Authorized personnel only. Please verify your credentials to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Store Master Security PIN / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setError(false);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full bg-slate-50 border rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/50'
                    : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Access Denied. Invalid Authorization Code.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-emerald-800 text-white font-heading font-bold text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Authenticate & Enter</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <button
            onClick={handleReturnHome}
            className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Customer Store</span>
          </button>
        </div>
      </div>
    </div>
  );
};
