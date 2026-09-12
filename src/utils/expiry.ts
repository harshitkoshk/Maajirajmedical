import { ExpiryStatus } from '../types';
export type { ExpiryStatus };

export interface ExpiryInfo {
  status: ExpiryStatus;
  daysRemaining: number | null;
  formattedDate: string;
  rawDate: string;
  label: string;
  shortLabel: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isUrgent: boolean; // expired or <= 30 days
  badgeClass: string;
  textClass: string;
}

/**
 * Parses various expiry date string formats into a valid Date object.
 * Supports: YYYY-MM-DD, YYYY-MM, MM/YYYY, MM/YY, DD/MM/YYYY, DD-MM-YYYY, ISO strings.
 */
export const parseExpiryDate = (dateStr?: string | null): Date | null => {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return null;
  }

  const clean = dateStr.trim();

  // 1. Check YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [year, month, day] = clean.split('-').map(Number);
    const d = new Date(year, month - 1, day, 23, 59, 59);
    return isNaN(d.getTime()) ? null : d;
  }

  // 2. Check YYYY-MM
  if (/^\d{4}-\d{2}$/.test(clean)) {
    const [year, month] = clean.split('-').map(Number);
    // End of the month
    const d = new Date(year, month, 0, 23, 59, 59);
    return isNaN(d.getTime()) ? null : d;
  }

  // 3. Check MM/YYYY or MM/YY
  if (/^(\d{1,2})[\/\-](\d{2,4})$/.test(clean)) {
    const match = clean.match(/^(\d{1,2})[\/\-](\d{2,4})$/);
    if (match) {
      const month = Number(match[1]);
      let year = Number(match[2]);
      if (year < 100) {
        year += 2000;
      }
      // End of the month
      const d = new Date(year, month, 0, 23, 59, 59);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  // 4. Check DD/MM/YYYY or DD-MM-YYYY
  if (/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.test(clean)) {
    const match = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);
      const d = new Date(year, month - 1, day, 23, 59, 59);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  // Fallback to standard Date parse
  const fallback = new Date(clean);
  return isNaN(fallback.getTime()) ? null : fallback;
};

/**
 * Calculates detailed expiry information and status for a given product expiry date.
 * Warning threshold defaults to 60 days.
 */
export const getExpiryInfo = (
  dateStr?: string | null,
  warningDays: number = 60
): ExpiryInfo => {
  if (!dateStr || !dateStr.trim()) {
    return {
      status: 'none',
      daysRemaining: null,
      formattedDate: 'Not Specified',
      rawDate: '',
      label: 'No Expiry Set',
      shortLabel: 'No Expiry',
      isExpired: false,
      isExpiringSoon: false,
      isUrgent: false,
      badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
      textClass: 'text-slate-500'
    };
  }

  const expDate = parseExpiryDate(dateStr);
  if (!expDate) {
    return {
      status: 'none',
      daysRemaining: null,
      formattedDate: dateStr,
      rawDate: dateStr,
      label: `Exp: ${dateStr}`,
      shortLabel: dateStr,
      isExpired: false,
      isExpiringSoon: false,
      isUrgent: false,
      badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
      textClass: 'text-slate-500'
    };
  }

  const now = new Date();
  // Normalize now to start of today for accurate whole-day calculation
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = expDate.getTime() - startOfToday.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Format date nicely e.g. "15 Oct 2026" or "Oct 2026"
  const formattedDate = expDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = !isExpired && daysRemaining <= warningDays;
  const isUrgent = isExpired || (isExpiringSoon && daysRemaining <= 30);

  let status: ExpiryStatus = 'valid';
  let label = `Expires: ${formattedDate}`;
  let shortLabel = `Exp: ${formattedDate}`;
  let badgeClass = 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
  let textClass = 'text-emerald-700';

  if (isExpired) {
    status = 'expired';
    const daysAgo = Math.abs(daysRemaining);
    label = daysAgo === 0 ? `Expired Today (${formattedDate})` : `Item Expired (${daysAgo}d ago • ${formattedDate})`;
    shortLabel = `Item Expired (${formattedDate})`;
    badgeClass = 'bg-rose-100 text-rose-800 border border-rose-300 font-bold';
    textClass = 'text-rose-700 font-bold';
  } else if (isExpiringSoon) {
    status = 'expiring_soon';
    label = `Expiring Soon (${daysRemaining}d left • ${formattedDate})`;
    shortLabel = `Expiring Soon (${daysRemaining}d)`;
    badgeClass =
      daysRemaining <= 30
        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse'
        : 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold';
    textClass = 'text-amber-800 font-bold';
  }

  return {
    status,
    daysRemaining,
    formattedDate,
    rawDate: dateStr,
    label,
    shortLabel,
    isExpired,
    isExpiringSoon,
    isUrgent,
    badgeClass,
    textClass
  };
};

/**
 * Returns a date string formatted as YYYY-MM-DD for HTML input[type="date"]
 */
export const formatDateToInput = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Generates an expiry date string (YYYY-MM-DD) N months from now.
 */
export const getPresetExpiryDate = (monthsAhead: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return formatDateToInput(d);
};
