import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { X, Save, Plus, Sparkles, ShieldAlert, Image, Layers } from 'lucide-react';

interface AdminProductModalProps {
  productToEdit: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  productToEdit,
  isOpen,
  onClose
}) => {
  const { categories, addProduct, editProduct } = useShop();

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: 'Medicines',
    subcategory: 'General Medicines',
    description: '',
    price: 50,
    mrp: 60,
    stock: 20,
    isAvailable: true,
    isPrescriptionRequired: false,
    isFeatured: false,
    discountPercent: 0,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    batchNumber: '',
    dosageForm: 'Tablets',
    packSize: 'Strip of 10'
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({ ...productToEdit });
    } else {
      setFormData({
        name: '',
        brand: '',
        category: 'Medicines',
        subcategory: 'General Medicines',
        description: '',
        price: 50,
        mrp: 60,
        stock: 25,
        isAvailable: true,
        isPrescriptionRequired: false,
        isFeatured: false,
        discountPercent: 0,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        batchNumber: `BCH-${Math.floor(100 + Math.random() * 900)}`,
        dosageForm: 'Tablets',
        packSize: 'Pack of 1'
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const currentCategoryObj = categories.find((c) => c.name === formData.category);
  const availableSubcategories = currentCategoryObj ? currentCategoryObj.subcategories : [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    const catObj = categories.find((c) => c.name === newCat);
    setFormData((prev) => ({
      ...prev,
      category: newCat,
      subcategory: catObj && catObj.subcategories.length > 0 ? catObj.subcategories[0] : 'General'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert('Product name is required');
      return;
    }

    const priceNum = Number(formData.price) || 0;
    const mrpNum = Number(formData.mrp) || priceNum;
    const stockNum = Number(formData.stock) || 0;

    const discountCalculated =
      mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

    const finalProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      sku: formData.sku || `MRMC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name.trim(),
      brand: formData.brand?.trim() || 'Maaji Raj Quality',
      category: formData.category || 'Medicines',
      subcategory: formData.subcategory || 'General',
      description: formData.description?.trim() || '',
      price: priceNum,
      mrp: mrpNum,
      stock: stockNum,
      isAvailable: stockNum > 0,
      isPrescriptionRequired: Boolean(formData.isPrescriptionRequired),
      isFeatured: Boolean(formData.isFeatured),
      discountPercent: discountCalculated,
      image:
        formData.image?.trim() ||
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      batchNumber: formData.batchNumber?.trim() || 'BCH-GEN-2024',
      dosageForm: formData.dosageForm?.trim() || '',
      packSize: formData.packSize?.trim() || '',
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (productToEdit) {
      editProduct(finalProduct);
    } else {
      addProduct(finalProduct);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base">
                {productToEdit ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Changes immediately publish to the live customer store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Row 1: Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ceflox 500mg Tablet"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brand / Manufacturer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Cipla / Himalaya / Lakme"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category || 'Medicines'}
                onChange={handleCategoryChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subcategory
              </label>
              <select
                value={formData.subcategory || ''}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Price (Rate), MRP & Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling Price (Rate ₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                M.R.P (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.mrp || ''}
                onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock !== undefined ? formData.stock : ''}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 4: Pack Size, Dosage Form & Admin Batch Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pack Size
              </label>
              <input
                type="text"
                value={formData.packSize || ''}
                onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                placeholder="e.g. Strip of 10 / 100ml"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dosage Form / Type
              </label>
              <input
                type="text"
                value={formData.dosageForm || ''}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                placeholder="e.g. Tablets / Cream / Syrup"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Batch # (Admin Only)</span>
              </label>
              <input
                type="text"
                value={formData.batchNumber || ''}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="e.g. BCH-CFX-2024"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 5: Product Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-emerald-600" />
              <span>Product Image URL</span>
            </label>
            <input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Row 6: Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Clinical Notes
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description, active salts, directions..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Row 7: Flags (Rx, Featured) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.isPrescriptionRequired)}
                onChange={(e) =>
                  setFormData({ ...formData, isPrescriptionRequired: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500"
              />
              <div>
                <span className="font-bold text-slate-800 block">Prescription Required (Rx)</span>
                <span className="text-[10px] text-slate-500">Requires pharmacist verification notice</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.isFeatured)}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 block">Featured Product</span>
                <span className="text-[10px] text-slate-500">Highlight on Homepage spotlights</span>
              </div>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{productToEdit ? 'Save Changes' : 'Create & Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
