
import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  Trash2
} from 'lucide-react';
import { StockItem } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItems: StockItem[];
  onImportSuccess: (success: number, failed: number, updatedItems: StockItem[]) => void;
}

interface ImportRow {
  sku: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  openingQty: number;
  reorderLevel: number;
  taxRate: number;
  barcode: string;
  errors: string[];
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, existingItems, onImportSuccess }) => {
  const [step, setStep] = useState(1);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [isUpsertEnabled, setIsUpsertEnabled] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  // Mock parsing for the demo
  const handleFileSelect = (type: 'excel' | 'pdf') => {
    setIsBusy(true);
    setTimeout(() => {
      const mockData: ImportRow[] = [
        { sku: 'PROD-101', name: 'Dell Monitor 24"', category: 'Electronics', unit: 'pcs', purchasePrice: 12000, salePrice: 15000, openingQty: 10, reorderLevel: 2, taxRate: 5, barcode: '881122', errors: [] },
        { sku: 'PROD-102', name: 'Logitech Mouse MX', category: 'Accessories', unit: 'pcs', purchasePrice: 4500, salePrice: 6000, openingQty: 25, reorderLevel: 5, taxRate: 5, barcode: '881133', errors: [] },
        { sku: '', name: 'Broken Row', category: 'Misc', unit: 'pcs', purchasePrice: 0, salePrice: 0, openingQty: -5, reorderLevel: 0, taxRate: 0, barcode: '', errors: ['SKU is required', 'Quantity cannot be negative'] },
        { sku: 'LAP-001', name: 'MacBook Pro M3 (Existing)', category: 'Laptop', unit: 'pcs', purchasePrice: 220000, salePrice: 245000, openingQty: 15, reorderLevel: 5, taxRate: 5, barcode: '', errors: [] }
      ];
      setImportRows(mockData);
      setIsBusy(false);
      setStep(2);
    }, 1500);
  };

  const handleSave = () => {
    setIsBusy(true);
    setTimeout(() => {
      const validRows = importRows.filter(r => r.errors.length === 0);
      let newItemsList = [...existingItems];
      let successCount = 0;

      validRows.forEach(row => {
        const index = newItemsList.findIndex(item => item.sku === row.sku);
        if (index !== -1) {
          if (isUpsertEnabled) {
            newItemsList[index] = {
              ...newItemsList[index],
              name: row.name,
              purchasePrice: row.purchasePrice,
              salesPrice: row.salePrice,
              quantity: row.openingQty
            };
            successCount++;
          }
        } else {
          newItemsList.push({
            id: Math.random().toString(36).substr(2, 9),
            sku: row.sku,
            name: row.name,
            unit: row.unit,
            purchasePrice: row.purchasePrice,
            salesPrice: row.salePrice,
            quantity: row.openingQty,
            reorderLevel: row.reorderLevel,
            taxRate: row.taxRate
          });
          successCount++;
        }
      });

      onImportSuccess(successCount, importRows.length - validRows.length, newItemsList);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Upload size={24} />
            <h2 className="font-bold text-xl">Bulk Product Import Wizard</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex bg-slate-50 px-8 py-4 border-b">
          <StepIndicator current={step} step={1} label="Choose File" />
          <div className="w-12 h-[2px] bg-slate-200 self-center mx-2"></div>
          <StepIndicator current={step} step={2} label="Preview & Validate" />
          <div className="w-12 h-[2px] bg-slate-200 self-center mx-2"></div>
          <StepIndicator current={step} step={3} label="Import Settings" />
          <div className="w-12 h-[2px] bg-slate-200 self-center mx-2"></div>
          <StepIndicator current={step} step={4} label="Finalize" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {isBusy && (
            <div className="h-full flex flex-col items-center justify-center text-indigo-600">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Processing your data...</p>
            </div>
          )}

          {!isBusy && step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">
              <div 
                onClick={() => handleFileSelect('excel')}
                className="group p-10 border-2 border-dashed border-slate-200 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer text-center"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">Import from Excel</h3>
                <p className="text-slate-500">Fastest and most reliable method. Use our .xlsx template.</p>
              </div>
              <div 
                onClick={() => handleFileSelect('pdf')}
                className="group p-10 border-2 border-dashed border-slate-200 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer text-center"
              >
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">Import from PDF</h3>
                <p className="text-slate-500">Best for digital invoices. Supports table-based parsing.</p>
              </div>
            </div>
          )}

          {!isBusy && step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Verification Results</h3>
                <div className="flex gap-4">
                  <div className="text-sm"><span className="font-bold text-green-600">{importRows.filter(r => r.errors.length === 0).length}</span> Valid</div>
                  <div className="text-sm"><span className="font-bold text-rose-600">{importRows.filter(r => r.errors.length > 0).length}</span> Invalid</div>
                </div>
              </div>
              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {importRows.map((row, i) => (
                      <tr key={i} className={row.errors.length > 0 ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                        <td className="px-4 py-3 font-bold text-indigo-600">{row.sku || 'MISSING'}</td>
                        <td className="px-4 py-3 text-slate-700">{row.name}</td>
                        <td className="px-4 py-3 text-right">{row.openingQty}</td>
                        <td className="px-4 py-3 text-right">{row.salePrice.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          {row.errors.length > 0 ? (
                            <div className="flex items-center gap-1 text-rose-600 font-bold text-[10px]">
                              <AlertCircle size={12} /> {row.errors[0]}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600 font-bold text-[10px]">
                              <CheckCircle2 size={12} /> Ready
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isBusy && step === 3 && (
            <div className="space-y-8 max-w-xl mx-auto py-10">
              <div className="space-y-4">
                <h3 className="font-bold text-xl">Execution Strategy</h3>
                <p className="text-slate-500">Decide how to handle existing products in your inventory.</p>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-5 bg-white border-2 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-indigo-600"
                    checked={isUpsertEnabled}
                    onChange={(e) => setIsUpsertEnabled(e.target.checked)}
                  />
                  <div>
                    <p className="font-bold">Upsert Mode (Update Existing)</p>
                    <p className="text-sm text-slate-500">If a SKU exists, update its name, prices, and stock levels.</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-5 bg-white border-2 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50">
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" defaultChecked />
                  <div>
                    <p className="font-bold">Auto-Create Missing Categories</p>
                    <p className="text-sm text-slate-500">Automatically register new categories found in the file.</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-5 bg-white border-2 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50">
                  <input type="checkbox" className="w-5 h-5 accent-indigo-600" />
                  <div>
                    <p className="font-bold">Allow Blank Prices</p>
                    <p className="text-sm text-slate-500">Defaults price to 0 if column is empty.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {!isBusy && step === 4 && (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-6">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center animate-bounce">
                <Database size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Ready to commit?</h3>
                <p className="text-slate-500">
                  You are about to process <span className="font-bold text-slate-900">{importRows.filter(r => r.errors.length === 0).length}</span> products. 
                  This will update your database and stock balances.
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm max-w-md">
                <strong>Note:</strong> Opening Stock entries will be created for new products to track initial inventory.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t bg-slate-50 flex justify-between">
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || isBusy}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-0"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
            {step < 4 ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && importRows.length === 0}
                className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
              >
                Next Step
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
              >
                Post Products
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StepIndicator: React.FC<{ current: number, step: number, label: string }> = ({ current, step, label }) => (
  <div className={`flex items-center gap-2 transition-all ${current >= step ? 'text-indigo-600' : 'text-slate-400'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
      current > step ? 'bg-indigo-600 text-white' : 
      current === step ? 'bg-white border-2 border-indigo-600' : 
      'bg-slate-200'
    }`}>
      {current > step ? <CheckCircle2 size={16} /> : step}
    </div>
    <span className="text-xs font-bold whitespace-nowrap">{label}</span>
  </div>
);

export default BulkImportModal;
