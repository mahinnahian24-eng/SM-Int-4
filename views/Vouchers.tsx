
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Save, Calendar, Search, 
  CheckCircle2, Printer, Eye, ArrowLeft, Percent, X, AlertTriangle, 
  ChevronDown, Keyboard
} from 'lucide-react';
import { 
  Voucher, VoucherType, Ledger, StockItem, VoucherItem, LedgerEntry, Company, VoucherPrintSettings, LedgerType 
} from '../types';
import VoucherPreviewModal from './VoucherPreviewModal';

interface VouchersProps {
  vouchers: Voucher[];
  addVoucher: (voucher: Voucher) => void;
  ledgers: Ledger[];
  items: StockItem[];
  company: Company;
  printSettings: VoucherPrintSettings;
  editingVoucher?: Voucher | null;
  clearEdit?: () => void;
}

const Vouchers: React.FC<VouchersProps> = ({ 
  vouchers, addVoucher, ledgers, items, company, printSettings, editingVoucher, clearEdit 
}) => {
  const [activeTab, setActiveTab] = useState<VoucherType>(VoucherType.SALES);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLedgerId, setSelectedLedgerId] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [narration, setNarration] = useState('');
  const [voucherItems, setVoucherItems] = useState<Partial<VoucherItem>[]>([{ itemId: '', quantity: 1, rate: 0, discount: 0, amount: 0 }]);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<Voucher | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for keyboard navigation
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingVoucher) {
      setIsEditMode(true);
      setActiveTab(editingVoucher.type);
      setDate(editingVoucher.date);
      setNarration(editingVoucher.narration);
      const ledgerId = editingVoucher.ledgerEntries[0]?.ledgerId || '';
      setSelectedLedgerId(ledgerId);
      const ledger = ledgers.find(l => l.id === ledgerId);
      if (ledger) setLedgerSearch(ledger.name);
      setVoucherItems(editingVoucher.items || [{ itemId: '', quantity: 1, rate: 0, discount: 0, amount: 0 }]);
    }
  }, [editingVoucher, ledgers]);

  const filteredLedgers = useMemo(() => {
    return ledgers.filter(l => 
      l.name.toLowerCase().includes(ledgerSearch.toLowerCase())
    );
  }, [ledgers, ledgerSearch]);

  const voucherNumber = useMemo(() => {
    if (isEditMode && editingVoucher) return editingVoucher.number;
    const typeVouchers = vouchers.filter(v => v.type === activeTab);
    return `${activeTab.substring(0, 3).toUpperCase()}-${(typeVouchers.length + 1).toString().padStart(4, '0')}`;
  }, [vouchers, activeTab, isEditMode, editingVoucher]);

  const totalAmount = voucherItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...voucherItems];
    const item = { ...updated[index], [field]: value };
    
    if (field === 'itemId') {
      const stockItem = items.find(i => i.id === value);
      if (stockItem) {
        item.itemName = stockItem.name;
        item.rate = activeTab === VoucherType.SALES ? stockItem.salesPrice : stockItem.purchasePrice;
        item.discount = 0;
        // Auto-focus quantity field after selecting item
        setTimeout(() => {
          const nextInput = document.querySelector(`[data-pos="${index}-1"]`) as HTMLInputElement;
          nextInput?.focus();
          nextInput?.select();
        }, 10);
      }
    }

    const qty = item.quantity || 0;
    const rate = item.rate || 0;
    const discPercent = item.discount || 0;
    
    const gross = qty * rate;
    const discAmount = gross * (discPercent / 100);
    item.amount = gross - discAmount;
    
    updated[index] = item;
    setVoucherItems(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    const totalCols = 4; // Item, Qty, Rate, Disc
    const totalRows = voucherItems.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (row < totalRows - 1) focusCell(row + 1, col);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) focusCell(row - 1, col);
        break;
      case 'ArrowRight':
        // Only move if cursor is at the end of the input
        if (col < totalCols - 1) focusCell(row, col + 1);
        break;
      case 'ArrowLeft':
        if (col > 0) focusCell(row, col - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (col < totalCols - 1) {
          focusCell(row, col + 1);
        } else if (row === totalRows - 1) {
          addNewRow();
          setTimeout(() => focusCell(row + 1, 0), 10);
        } else {
          focusCell(row + 1, 0);
        }
        break;
    }
  };

  const focusCell = (row: number, col: number) => {
    const target = document.querySelector(`[data-pos="${row}-${col}"]`) as HTMLInputElement | HTMLSelectElement;
    if (target) {
      target.focus();
      if (target instanceof HTMLInputElement) target.select();
    }
  };

  const addNewRow = () => {
    setVoucherItems([...voucherItems, { itemId: '', quantity: 1, rate: 0, discount: 0, amount: 0 }]);
  };

  const removeRow = (index: number) => {
    if (voucherItems.length > 1) {
      setVoucherItems(voucherItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!selectedLedgerId) {
      setError('Please select a party account.');
      return;
    }

    if (voucherItems.some(item => !item.itemId)) {
      setError('Please select items for all rows.');
      return;
    }

    const selectedLedger = ledgers.find(l => l.id === selectedLedgerId);
    if (!selectedLedger) return;

    const ledgerEntries: LedgerEntry[] = [];
    
    if (activeTab === VoucherType.SALES) {
      const salesLedger = ledgers.find(l => l.type === LedgerType.SALES) || ledgers.find(l => l.name.toLowerCase().includes('sales'));
      if (!salesLedger) { setError('Sales Ledger not found.'); return; }

      ledgerEntries.push({ ledgerId: selectedLedger.id, ledgerName: selectedLedger.name, debit: totalAmount, credit: 0 });
      ledgerEntries.push({ ledgerId: salesLedger.id, ledgerName: salesLedger.name, debit: 0, credit: totalAmount });
    } else {
      ledgerEntries.push({ ledgerId: selectedLedger.id, ledgerName: selectedLedger.name, debit: totalAmount, credit: 0 });
    }

    const autoRef = `REF-${Date.now()}`;

    const voucher: Voucher = {
      id: isEditMode ? editingVoucher!.id : Math.random().toString(36).substr(2, 9),
      number: voucherNumber,
      date,
      type: activeTab,
      reference: isEditMode ? (editingVoucher?.reference || autoRef) : autoRef,
      narration,
      items: voucherItems as VoucherItem[],
      ledgerEntries,
      totalAmount
    };

    addVoucher(voucher);
    setSaveSuccess(voucher);
  };

  const resetForm = () => {
    setSaveSuccess(null);
    setIsEditMode(false);
    clearEdit?.();
    setVoucherItems([{ itemId: '', quantity: 1, rate: 0, discount: 0, amount: 0 }]);
    setNarration('');
    setSelectedLedgerId('');
    setLedgerSearch('');
    setError(null);
  };

  if (saveSuccess) {
    return (
      <VoucherPreviewModal 
        isOpen={true}
        onClose={resetForm}
        voucher={saveSuccess}
        company={company}
        printSettings={printSettings}
        onPrint={() => window.print()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{isEditMode ? 'Edit Transaction' : 'New Sale'}</h1>
           <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Invoice ID: {voucherNumber}</p>
        </div>
        <div className="flex bg-gray-200 p-1 rounded-2xl gap-1">
          {Object.values(VoucherType).slice(0, 4).map(type => (
            <button
              key={type}
              onClick={() => setActiveTab(type as VoucherType)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                activeTab === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-sm">
          <AlertTriangle size={18} /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-8 bg-slate-50 border-b grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Party Selection (Search Ledger)</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Type Customer Name..."
                  value={ledgerSearch}
                  onChange={e => {
                    setLedgerSearch(e.target.value);
                    setIsLedgerDropdownOpen(true);
                  }}
                  onFocus={() => setIsLedgerDropdownOpen(true)}
                  className="w-full bg-white border rounded-2xl pl-12 pr-10 py-4 font-bold text-indigo-600 outline-none focus:ring-2 ring-indigo-500 shadow-sm transition-all"
                />
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isLedgerDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                
                {isLedgerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-2 duration-200">
                    {filteredLedgers.length > 0 ? (
                      filteredLedgers.map(l => (
                        <button 
                          key={l.id}
                          className="w-full text-left px-6 py-4 hover:bg-indigo-50 font-bold border-b last:border-none flex justify-between items-center group"
                          onClick={() => {
                            setSelectedLedgerId(l.id);
                            setLedgerSearch(l.name);
                            setIsLedgerDropdownOpen(false);
                          }}
                        >
                          <span>{l.name}</span>
                          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{l.type}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-gray-400 font-bold">No accounts found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Billing Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border rounded-2xl px-5 py-4 font-bold focus:ring-2 ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Keyboard Guide</label>
                <div className="bg-indigo-50 px-4 py-4 rounded-2xl border border-indigo-100 flex items-center gap-3 text-indigo-700">
                  <Keyboard size={20} />
                  <p className="text-[10px] font-bold uppercase leading-tight">Use Arrow keys & Enter <br/>for fast entry</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-600/30">
            <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Calculated Net Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold opacity-50">{company.currency}</span>
              <span className="text-6xl font-black tracking-tight leading-none">{totalAmount.toLocaleString()}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
              <CheckCircle2 size={12} /> Auto-Computed Row Totals
            </div>
          </div>
        </div>

        {/* Transaction Grid */}
        <div className="p-8" ref={gridContainerRef}>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-4">Product / Service</th>
                  <th className="px-4 text-right w-24">Qty</th>
                  <th className="px-4 text-right w-32">Rate</th>
                  <th className="px-4 text-right w-24">Disc %</th>
                  <th className="px-4 text-right w-36">Total</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {voucherItems.map((vItem, index) => (
                  <tr key={index} className="group">
                    <td className="px-1">
                      <select 
                        data-pos={`${index}-0`}
                        onKeyDown={e => handleKeyDown(e, index, 0)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none font-bold text-gray-900 appearance-none"
                        value={vItem.itemId}
                        onChange={e => handleItemChange(index, 'itemId', e.target.value)}
                      >
                        <option value="">Select Item...</option>
                        {items.map(i => <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>)}
                      </select>
                    </td>
                    <td className="px-1">
                      <input 
                        type="number"
                        data-pos={`${index}-1`}
                        onKeyDown={e => handleKeyDown(e, index, 1)}
                        value={vItem.quantity}
                        onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 p-4 rounded-2xl text-right font-bold outline-none"
                      />
                    </td>
                    <td className="px-1">
                      <input 
                        type="number"
                        data-pos={`${index}-2`}
                        onKeyDown={e => handleKeyDown(e, index, 2)}
                        value={vItem.rate}
                        onChange={e => handleItemChange(index, 'rate', Number(e.target.value))}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 p-4 rounded-2xl text-right font-bold outline-none"
                      />
                    </td>
                    <td className="px-1">
                      <input 
                        type="number"
                        data-pos={`${index}-3`}
                        onKeyDown={e => handleKeyDown(e, index, 3)}
                        value={vItem.discount}
                        onChange={e => handleItemChange(index, 'discount', Number(e.target.value))}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 p-4 rounded-2xl text-right font-bold outline-none"
                      />
                    </td>
                    <td className="px-4 text-right">
                      <span className="font-black text-indigo-600 text-lg">{(vItem.amount || 0).toLocaleString()}</span>
                    </td>
                    <td>
                      <button onClick={() => removeRow(index)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-between items-start pt-8 border-t">
            <div className="w-full max-w-lg space-y-4">
               <button 
                 onClick={addNewRow}
                 className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 px-6 py-3 rounded-2xl transition-all border-2 border-dashed border-indigo-200"
               >
                 <Plus size={16} /> Append Item Line (Ctrl+A)
               </button>
               <textarea 
                 value={narration} 
                 onChange={e => setNarration(e.target.value)}
                 rows={2}
                 placeholder="Enter Narration / Remarks..."
                 className="w-full bg-slate-50 border-none rounded-3xl p-6 text-sm italic font-medium outline-none focus:ring-2 ring-indigo-500 transition-all"
               />
            </div>
            
            <div className="flex gap-4">
               <button onClick={resetForm} className="px-10 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:bg-gray-100 transition-all">Cancel</button>
               <button 
                 onClick={() => handleSubmit()}
                 className="px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 transition-all active:scale-95"
               >
                 <Save size={18} /> Post & Print Invoice
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
