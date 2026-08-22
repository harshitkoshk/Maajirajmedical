import React, { useState } from 'react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import * as XLSX from 'xlsx';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  RefreshCw,
  Plus
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { importBulk, categories } = useShop();

  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'upsert' | 'add' | 'replace'>('upsert');
  const [importResult, setImportResult] = useState<{
    imported: number;
    updated: number;
    skipped: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const guessCategory = (name: string): { category: string; subcategory: string } => {
    const lower = name.toLowerCase();
    if (
      lower.includes('shampoo') ||
      lower.includes('oil') ||
      lower.includes('hair') ||
      lower.includes('conditioner')
    ) {
      return { category: 'Hair Care', subcategory: 'Shampoo' };
    }
    if (
      lower.includes('face') ||
      lower.includes('cream') ||
      lower.includes('sunscreen') ||
      lower.includes('wash') ||
      lower.includes('cleanser') ||
      lower.includes('acne')
    ) {
      return { category: 'Skin Care / Face', subcategory: 'Face Wash' };
    }
    if (
      lower.includes('soap') ||
      lower.includes('body') ||
      lower.includes('lotion') ||
      lower.includes('deo')
    ) {
      return { category: 'Body Care', subcategory: 'Soaps' };
    }
    if (
      lower.includes('lip') ||
      lower.includes('kajal') ||
      lower.includes('compact') ||
      lower.includes('makeup')
    ) {
      return { category: 'Cosmetics', subcategory: 'Makeup' };
    }
    if (
      lower.includes('baby') ||
      lower.includes('diaper') ||
      lower.includes('wipes')
    ) {
      return { category: 'Baby Care', subcategory: 'Baby Essentials' };
    }
    if (
      lower.includes('bandage') ||
      lower.includes('thermometer') ||
      lower.includes('monitor') ||
      lower.includes('gauge') ||
      lower.includes('ointment') ||
      lower.includes('strip')
    ) {
      return { category: 'Medical Supplies', subcategory: 'First Aid' };
    }
    return { category: 'Medicines', subcategory: 'General Medicines' };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          setErrorMessage('The uploaded spreadsheet contains no rows or valid data.');
          return;
        }

        // Map columns intelligently
        const productsList: Product[] = rawJson
          .map((row, index) => {
            const keys = Object.keys(row);

            // Name
            const nameKey = keys.find((k) =>
              /item|name|product|description|particular/i.test(k)
            );
            const rawName = nameKey ? String(row[nameKey]).trim() : '';
            if (!rawName) return null;

            // Quantity / Stock
            const qtyKey = keys.find((k) => /qty|quantity|stock|units|count/i.test(k));
            const rawQty = qtyKey ? Number(row[qtyKey]) || 0 : 15;

            // Rate / Price
            const rateKey = keys.find((k) => /rate|price|mrp|cost|amount/i.test(k));
            const rawRate = rateKey ? Number(row[rateKey]) || 0 : 50;

            // Batch
            const batchKey = keys.find((k) => /batch|lot|bch/i.test(k));
            const rawBatch = batchKey ? String(row[batchKey]).trim() : `BCH-${100 + index}`;

            // Category
            const catKey = keys.find((k) => /category|type|dept/i.test(k));
            const rawCat = catKey ? String(row[catKey]).trim() : '';

            const inferred = rawCat
              ? { category: rawCat, subcategory: 'General' }
              : guessCategory(rawName);

            // Check if prescription required
            const isRx =
              /tablet|capsule|inj|antibiotic|mg|ml|500|650|250/i.test(rawName) &&
              inferred.category === 'Medicines';

            const prod: Product = {
              id: `imported-${Date.now()}-${index}`,
              sku: `MRMC-IMP-${index + 1}`,
              name: rawName,
              brand: 'Maaji Raj Quality',
              category: inferred.category,
              subcategory: inferred.subcategory,
              description: `${rawName} stocked at Maaji Raj Medical and Cosmetics Udaipur.`,
              price: rawRate,
              mrp: Math.round(rawRate * 1.15),
              stock: rawQty,
              isAvailable: rawQty > 0,
              isPrescriptionRequired: isRx,
              isFeatured: index < 5,
              discountPercent: 10,
              image:
                inferred.category.includes('Cosmetics') || inferred.category.includes('Skin')
                  ? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
                  : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
              batchNumber: rawBatch,
              dosageForm: 'Standard',
              packSize: 'Standard Pack',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            return prod;
          })
          .filter(Boolean) as Product[];

        if (productsList.length === 0) {
          setErrorMessage('Could not extract valid products. Ensure column names like ITEM, QUANTITY, RATE exist.');
          return;
        }

        setParsedProducts(productsList);
      } catch (err: any) {
        setErrorMessage(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = () => {
    if (parsedProducts.length === 0) return;
    const res = importBulk(parsedProducts, importMode);
    setImportResult(res);
    setParsedProducts([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base">
                Bulk Stock & Inventory Import
              </h3>
              <p className="text-[11px] text-slate-400">
                Upload your Excel (.xlsx / .xls) or CSV spreadsheet (108+ items)
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

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/70 transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="font-heading font-bold text-sm text-slate-800">
              {fileName ? fileName : 'Choose or drag & drop Excel / CSV stock file'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard formats with columns: <strong>ITEM (Product Name), QUANTITY (Stock), RATE (Price), BATCH</strong>.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Import Operation Completed!</span>
              </div>
              <p className="text-emerald-700">
                • <strong>{importResult.imported}</strong> new products added to catalogue.
                <br />
                • <strong>{importResult.updated}</strong> existing products updated (prices/stocks).
                <br />
                • <strong>{importResult.skipped}</strong> duplicates skipped.
              </p>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedProducts.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-heading font-bold text-xs text-slate-800">
                  Preview Extracted Products ({parsedProducts.length} items found)
                </span>

                {/* Mode Selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Mode:</span>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as any)}
                    className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
                  >
                    <option value="upsert">Update Existing & Add New (Upsert)</option>
                    <option value="add">Add New Only (Skip duplicates)</option>
                    <option value="replace">Replace Entire Inventory</option>
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Rate (₹)</th>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5">Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedProducts.slice(0, 15).map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-800 truncate max-w-[200px]">
                          {p.name}
                        </td>
                        <td className="p-2 text-slate-500">{p.category}</td>
                        <td className="p-2 font-bold text-slate-900">₹{p.price.toFixed(2)}</td>
                        <td className="p-2 font-semibold text-emerald-700">{p.stock}</td>
                        <td className="p-2 text-slate-400 font-mono text-[10px]">{p.batchNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedProducts.length > 15 && (
                <p className="text-[11px] text-slate-400 text-right">
                  Showing first 15 of {parsedProducts.length} items...
                </p>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleExecuteImport}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-heading font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all active:scale-98"
                >
                  <Database className="w-4 h-4" />
                  <span>Execute Bulk Import into Database ({parsedProducts.length} Items)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
