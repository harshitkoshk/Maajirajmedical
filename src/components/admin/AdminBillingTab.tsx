import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Bill, BillItem, Order, PaymentMode } from '../../types';
import { A5BillPrint, numberToWordsINR } from './A5BillPrint';
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
  Edit2,
  ShoppingBag,
  Sparkles,
  Clock,
  Calendar
} from 'lucide-react';
import { getExpiryInfo } from '../../utils/expiry';

interface AdminBillingTabProps {
  initialOrder?: Order | null;
  onClearInitialOrder?: () => void;
}

export const AdminBillingTab: React.FC<AdminBillingTabProps> = ({
  initialOrder,
  onClearInitialOrder
}) => {
  const {
    products,
    bills,
    createBill,
    deleteBillById,
    nextBillNumber,
    updateNextBillNumber
  } = useShop();

  const [viewMode, setViewMode] = useState<'create' | 'history'>('create');
  const [billSearch, setBillSearch] = useState('');
  const [activeBillToPrint, setActiveBillToPrint] = useState<Bill | null>(null);

  // Bill Meta Form State
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('Udaipur');
  const [doctorName, setDoctorName] = useState('Self / Registered Medical Practitioner');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromOrderId, setFromOrderId] = useState<string | null>(null);

  // Bill Items State
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  // Item Input State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customItemName, setCustomItemName] = useState('');
  const [itemBatch, setItemBatch] = useState('');
  const [itemExp, setItemExp] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemRate, setItemRate] = useState<number>(0);
  const [itemDiscount, setItemDiscount] = useState<number>(0);

  // Product Search in Item Selector
  const [productPickerSearch, setProductPickerSearch] = useState('');

  // Config starting bill number modal state
  const [isBillNumModalOpen, setIsBillNumModalOpen] = useState(false);
  const [customNextNumInput, setCustomNextNumInput] = useState<number>(nextBillNumber);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Pre-fill from online website order if passed
  useEffect(() => {
    if (initialOrder) {
      setCustomerName(initialOrder.customerName || '');
      setMobileNumber(initialOrder.phone || '');
      const fullAddress =
        initialOrder.address + (initialOrder.landmark ? ` (Near: ${initialOrder.landmark})` : '');
      setAddress(fullAddress || 'Udaipur');
      setDoctorName('Self / Registered Medical Practitioner');
      setNotes(
        initialOrder.notes
          ? `Website Order #${initialOrder.id} • ${initialOrder.notes}`
          : `Website Order #${initialOrder.id}`
      );
      setFromOrderId(initialOrder.id);

      const mappedItems: BillItem[] = initialOrder.items.map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        return {
          productId: it.productId,
          name: it.productName,
          batch: prod?.batchNumber || '',
          expDate: prod?.expiryDate || '',
          qty: it.quantity,
          mrp: it.price,
          discountPercent: 0,
          amount: Number((it.price * it.quantity).toFixed(2))
        };
      });

      setBillItems(mappedItems);
      setViewMode('create');
    }
  }, [initialOrder, products]);

  // Filtered products for dropdown search
  const filteredProducts = products.filter((p) => {
    if (!productPickerSearch) return true;
    const query = productPickerSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(query))
    );
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Handle Product Selection
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    if (!prodId) {
      setCustomItemName('');
      setItemRate(0);
      setItemBatch('');
      setItemExp('');
      return;
    }
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setCustomItemName(prod.name);
      setItemRate(prod.price);
      setItemBatch(prod.batchNumber || '');
      setItemExp(prod.expiryDate || '');
      setItemDiscount(prod.discountPercent || 0);
    }
  };

  // Add Item to Bill
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const name = (customItemName || (selectedProduct ? selectedProduct.name : '')).trim();
    if (!name) {
      alert('Please select a product or enter an item name.');
      return;
    }
    if (itemQty <= 0) {
      alert('Quantity must be at least 1.');
      return;
    }
    if (itemRate < 0) {
      alert('Rate cannot be negative.');
      return;
    }

    const discountMultiplier = Math.max(0, 1 - (itemDiscount || 0) / 100);
    const lineAmount = Number((itemQty * itemRate * discountMultiplier).toFixed(2));

    const newItem: BillItem = {
      productId: selectedProductId || undefined,
      name,
      batch: itemBatch || (selectedProduct?.batchNumber || undefined),
      expDate: itemExp || undefined,
      qty: itemQty,
      mrp: itemRate,
      discountPercent: itemDiscount > 0 ? itemDiscount : undefined,
      amount: lineAmount
    };

    setBillItems((prev) => [...prev, newItem]);

    // Reset item inputs
    setSelectedProductId('');
    setProductPickerSearch('');
    setCustomItemName('');
    setItemBatch('');
    setItemExp('');
    setItemQty(1);
    setItemRate(0);
    setItemDiscount(0);
  };

  // Remove Item from Bill
  const handleRemoveItem = (index: number) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate Subtotals
  const grossSubtotal = billItems.reduce((sum, it) => sum + it.qty * it.mrp, 0);
  const grandTotal = billItems.reduce((sum, it) => sum + it.amount, 0);
  const discountTotal = Math.max(0, grossSubtotal - grandTotal);
  const totalItemsCount = billItems.length;
  const totalQtyCount = billItems.reduce((sum, it) => sum + it.qty, 0);

  // Clear Form
  const handleResetForm = () => {
    setCustomerName('');
    setMobileNumber('');
    setAddress('Udaipur');
    setDoctorName('Self / Registered Medical Practitioner');
    setPaymentMode('Cash');
    setNotes('');
    setFromOrderId(null);
    if (onClearInitialOrder) onClearInitialOrder();
    setBillItems([]);
    setSelectedProductId('');
    setProductPickerSearch('');
    setCustomItemName('');
    setItemBatch('');
    setItemExp('');
    setItemQty(1);
    setItemRate(0);
    setItemDiscount(0);
  };

  // Save Bill
  const handleSaveBill = (shouldPrint: boolean) => {
    if (billItems.length === 0) {
      alert('Please add at least one item to the bill.');
      return;
    }

    const currentNum = nextBillNumber;
    const formattedDate = billDate ? billDate.split('-').reverse().join('/') : new Date().toLocaleDateString('en-GB');

    const newBill: Bill = {
      id: `bill-${currentNum}-${Date.now()}`,
      billNumber: currentNum,
      billNumberPrefix: 'M - ',
      date: formattedDate,
      customerName: customerName.trim() || 'Cash / Walk-in Customer',
      address: address.trim() || 'Udaipur',
      mobileNumber: mobileNumber.trim(),
      doctorName: doctorName.trim() || 'Self / Registered Medical Practitioner',
      items: billItems,
      subtotal: grossSubtotal,
      discountTotal,
      grandTotal,
      paymentMode,
      notes: notes.trim() || undefined,
      orderId: fromOrderId || undefined,
      createdAt: new Date().toISOString()
    };

    createBill(newBill);

    setSaveSuccessMsg(`Bill No. M - ${currentNum} generated successfully & store stock deducted!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);

    if (shouldPrint) {
      setActiveBillToPrint(newBill);
    }

    handleResetForm();
  };

  // Save custom next bill number
  const handleSaveNextBillNum = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNextNumInput > 0) {
      updateNextBillNumber(customNextNumInput);
      setIsBillNumModalOpen(false);
    }
  };

  // Delete Bill with confirmation
  const handleDeleteBill = (bill: Bill) => {
    const shouldRestoreStock = window.confirm(
      `Delete Bill No. M - ${bill.billNumber} (${bill.customerName})?\n\nClick OK to delete and RESTORE the stock of items.\nClick Cancel if you don't want to delete.`
    );
    if (shouldRestoreStock) {
      deleteBillById(bill.id, true);
    }
  };

  // Filtered past bills for history search
  const filteredBills = bills.filter((b) => {
    if (!billSearch) return true;
    const q = billSearch.toLowerCase();
    return (
      b.billNumber.toString().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.mobileNumber.toLowerCase().includes(q) ||
      b.doctorName.toLowerCase().includes(q) ||
      b.date.includes(q)
    );
  });

  const totalBilledRevenue = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Tabs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-xl text-slate-900">
                Retail Billing & Cash Memo (A5)
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Auto Stock Deduction Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Create customer bills with legal drug license details, automatic stock updates, and A5 printable receipt.
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'create'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create New Bill</span>
          </button>

          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Invoices ({bills.length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Online Order Notice Banner */}
      {fromOrderId && (
        <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-sky-950 animate-in fade-in slide-in-from-top-2 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">
                Pre-filled from Website Order #{fromOrderId}
              </div>
              <p className="text-[11px] text-sky-700">
                Customer information and ordered medicines are automatically populated. Review details and click "Save & Print A5 Bill".
              </p>
            </div>
          </div>
          <button
            onClick={() => setFromOrderId(null)}
            className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 px-2.5 py-1 rounded-lg cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW 1: CREATE BILL / POS */}
      {viewMode === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Bill Customer & Item Entry Form (8 Cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Customer & Prescription Details Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-sm text-slate-900">
                    Bill Header & Customer Information
                  </span>
                </div>

                {/* Stamped Bill Number Badge */}
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-700">Next Bill No:</span>
                  <span className="font-mono font-black text-sm text-red-600 tracking-wider">
                    M - {nextBillNumber}
                  </span>
                  <button
                    onClick={() => {
                      setCustomNextNumInput(nextBillNumber);
                      setIsBillNumModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-red-700 transition-colors cursor-pointer"
                    title="Change Starting Bill Number"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Customer's Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar / Walk-in"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98290XXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Customer Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector-14, Udaipur"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Doctor's Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Prescribing Doctor's Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Verma / Self"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Credit">Khata / Credit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fast Item Entry Bar */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-heading font-black text-sm text-emerald-400">
                  Select Products from Inventory / Add Items
                </span>
                <span className="text-[11px] text-slate-400">
                  {products.length} products loaded from catalog
                </span>
              </div>

              {/* Product Selector Dropdown & Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">
                    Quick Search Catalog Item
                  </label>
                  <input
                    type="text"
                    placeholder="Type name / brand to filter list..."
                    value={productPickerSearch}
                    onChange={(e) => setProductPickerSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1">
                    Select Store Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleSelectProduct(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer truncate"
                  >
                    <option value="">-- Or enter custom item below --</option>
                    {filteredProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} • Stock: {p.stock} • ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Item Details Row */}
              <form onSubmit={handleAddItem} className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                  {/* Medicine Name */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      Medicine / Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Item name"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Batch */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      Batch No.
                    </label>
                    <input
                      type="text"
                      placeholder="Batch"
                      value={itemBatch}
                      onChange={(e) => setItemBatch(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Exp */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      Exp. Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={itemExp}
                      onChange={(e) => setItemExp(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Qty */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      Qty *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={itemQty}
                      onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs font-bold text-white text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Rate / MRP */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      Rate ₹ *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={itemRate || ''}
                      onChange={(e) => setItemRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs font-bold text-white text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Stock & Expiry Warning & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800">
                  <div className="space-y-1">
                    {selectedProduct && (
                      <div className="flex items-center gap-2 text-[11px] flex-wrap">
                        <span className="text-slate-400">Available Stock:</span>
                        <span
                          className={`font-black font-mono ${
                            selectedProduct.stock <= 0
                              ? 'text-rose-400'
                              : selectedProduct.stock < itemQty
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {selectedProduct.stock} units
                        </span>
                        {selectedProduct.stock < itemQty && (
                          <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Billing exceeds current stock!
                          </span>
                        )}
                      </div>
                    )}

                    {/* Expiry Warning during billing */}
                    {itemExp && (() => {
                      const expInfo = getExpiryInfo(itemExp);
                      if (expInfo.isExpired) {
                        return (
                          <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>🚨 Warning: This item is EXPIRED ({expInfo.formattedDate}). Do not dispense!</span>
                          </div>
                        );
                      } else if (expInfo.isExpiringSoon) {
                        return (
                          <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span>⚠️ Notice: Expiring soon in {expInfo.daysRemaining} days ({expInfo.formattedDate}).</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer self-end"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item to Bill</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Current Bill Items Table */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-heading font-black text-sm text-slate-900">
                  Billed Items List ({billItems.length})
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Total Units: {totalQtyCount}
                </span>
              </div>

              {billItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-1">
                  <Receipt className="w-10 h-10 mx-auto stroke-1 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No items added to this bill yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Select medicines from the dark box above and click "Add Item to Bill".
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-200 font-semibold">
                      <tr>
                        <th className="p-2.5 text-center w-10">#</th>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5 text-center">Batch</th>
                        <th className="p-2.5 text-center">Exp</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Rate (₹)</th>
                        <th className="p-2.5 text-right">Amount (₹)</th>
                        <th className="p-2.5 text-center w-10">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {item.name}
                            {item.productId && (
                              <span className="block font-normal text-[10px] text-emerald-700">
                                Catalog Product ✓
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-mono text-[11px] text-slate-600">
                            {item.batch || '-'}
                          </td>
                          <td className="p-2.5 text-center font-mono text-[11px] text-slate-600">
                            {item.expDate || '-'}
                          </td>
                          <td className="p-2.5 text-center font-black text-slate-900">{item.qty}</td>
                          <td className="p-2.5 text-right font-mono text-slate-700">
                            ₹{item.mrp.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            ₹{item.amount.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Bill Summary & Action Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 sticky top-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="font-heading font-black text-sm text-slate-900">
                  Billing Summary
                </span>
                <span className="bg-slate-100 text-slate-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
                  No. M - {nextBillNumber}
                </span>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Items</span>
                  <span className="font-bold text-slate-900">{totalItemsCount} items ({totalQtyCount} pcs)</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900">₹{grossSubtotal.toFixed(2)}</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Applied</span>
                    <span className="font-mono">- ₹{discountTotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span>Payment Mode</span>
                  <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                    {paymentMode}
                  </span>
                </div>

                {/* Grand Total Box */}
                <div className="bg-slate-950 text-white rounded-2xl p-4 mt-3 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Net Payable Amount
                  </span>
                  <div className="font-heading font-black text-3xl text-emerald-400">
                    ₹{grandTotal.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800 leading-tight">
                    {numberToWordsINR(grandTotal)}
                  </p>
                </div>
              </div>

              {/* Notes / Rx Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bill Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Strip morning & night after meals"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleSaveBill(true)}
                  disabled={billItems.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Save & Print A5 Bill</span>
                </button>

                <button
                  onClick={() => handleSaveBill(false)}
                  disabled={billItems.length === 0}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Save Bill (No Print)</span>
                </button>

                <button
                  onClick={handleResetForm}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear & Reset Form</span>
                </button>
              </div>

              {/* Legal Note */}
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-[10px] text-slate-600 leading-tight space-y-0.5">
                <div className="font-bold text-slate-800">Drug License: DRUG/2025-26/146975-76</div>
                <div>GSTIN: 08OICPS9799Q1ZF</div>
                <div className="text-slate-500 pt-0.5">
                  Saving automatically deducts sold quantities from store catalog stock live.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PAST INVOICES / BILLS HISTORY */}
      {viewMode === 'history' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
          {/* Top Bar: Search & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Past Retail Invoices Archive ({bills.length})
              </h3>
              <p className="text-xs text-slate-500">
                Search, review, re-print A5 cash memos, and view transaction records.
              </p>
            </div>

            {/* Total Revenue Box */}
            <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-center gap-3">
              <span className="text-xs text-slate-400">Total Billed Revenue:</span>
              <span className="font-heading font-black text-base text-emerald-400 font-mono">
                ₹{totalBilledRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Bill No., Customer, Mobile, Doctor..."
              value={billSearch}
              onChange={(e) => setBillSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Bills List Table */}
          {filteredBills.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Receipt className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No bills found matching your search.</p>
              <p className="text-xs text-slate-500">
                Generated bills will appear here with instant A5 print and deletion options.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 font-semibold">
                  <tr>
                    <th className="p-3">Bill No.</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer Details</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3 text-center">Items</th>
                    <th className="p-3 text-right">Grand Total (₹)</th>
                    <th className="p-3 text-center">Payment</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-black text-red-600 text-sm">
                        M - {bill.billNumber}
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{bill.date}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{bill.customerName}</div>
                        {bill.mobileNumber && (
                          <div className="text-[11px] text-slate-500 font-mono">
                            {bill.mobileNumber}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 max-w-[150px] truncate">{bill.doctorName}</td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {bill.items.length}
                      </td>
                      <td className="p-3 text-right font-heading font-black text-sm text-slate-900 font-mono">
                        ₹{bill.grandTotal.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          {bill.paymentMode || 'Cash'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveBillToPrint(bill)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            title="Print / View A5 Bill"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>A5 Print</span>
                          </button>

                          <button
                            onClick={() => handleDeleteBill(bill)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Bill & Restore Stock"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: A5 PRINT PREVIEW */}
      {activeBillToPrint && (
        <A5BillPrint
          bill={activeBillToPrint}
          onClose={() => setActiveBillToPrint(null)}
        />
      )}

      {/* MODAL: CHANGE STARTING BILL NUMBER */}
      {isBillNumModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-heading font-black text-lg text-slate-900">
              Configure Starting Bill Number
            </h3>
            <p className="text-xs text-slate-500">
              Set the sequence number for the next generated invoice (e.g. 2000, 2001, etc.).
            </p>

            <form onSubmit={handleSaveNextBillNum} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Next Bill Number (M - [number])
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={customNextNumInput}
                  onChange={(e) => setCustomNextNumInput(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBillNumModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  Save Sequence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
