
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Save, Search, 
  CheckCircle2, AlertTriangle, 
  ChevronDown, Keyboard, X
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
    const totalCols = 4;
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
      setError('VALIDATION_ERROR: Party account selection is mandatory.');
      return;
    }

    if (voucherItems.some(item => !item.itemId)) {
      setError('VALIDATION_ERROR: Please specify items for all entries.');
      return;
    }

    const selectedLedger = ledgers.find(l => l.id === selectedLedgerId);
    if (!selectedLedger) return;

    const ledgerEntries: LedgerEntry[] = [];
    
    if (activeTab === VoucherType.SALES) {
      const salesLedger = ledgers.find(l => l.type === LedgerType.SALES) || ledgers.find(l => l.name.toLowerCase().includes('sales'));
      if (!salesLedger) { setError('LEDGER_ERROR: Primary Sales account missing in Masters.'); return; }

      ledgerEntries.push({ ledgerId: selectedLedger.id, ledgerName: selectedLedger.name, debit: totalAmount, credit: 0 });
      ledgerEntries.push({ ledgerId: salesLedger.id, ledgerName: salesLedger.name, debit: 0, credit: totalAmount });
    } else {
      ledgerEntries.push({ ledgerId: selectedLedger.id, ledgerName: selectedLedger.name, debit: totalAmount, credit: 0 });
    }

    const autoRef = `SM-${Date.now()}`;

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
    <div className="space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{isEditMode ? 'Modify Entry' : 'New Terminal Transaction'}</h1>
           <p className="text-orange-600 text-[10px] font-black uppercase tracking-[0.3em]">{voucherNumber} // SYNC ACTIVE</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-[1.5rem] gap-1 shadow-inner">
          {Object.values(VoucherType).slice(0, 4).map(type => (
            <button
              key={type}
              onClick={() => setActiveTab(type as VoucherType)}
              className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === type ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-5 rounded-3xl flex items-center gap-4 text-rose-600 font-black text-[11px] uppercase tracking-wider animate-in slide-in-from-top-4">
          <AlertTriangle size={20} /> {error}
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-full"><X size={18}/></button>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
        {/* Header Block */}
        <div className="p-10 bg-[#FDFCFB] border-b border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Select Partner Account</label>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Search Customers / Suppliers..."
                  value={ledgerSearch}
                  onChange={e => {
                    setLedgerSearch(e.target.value);
                    setIsLedgerDropdownOpen(true);
                  }}
                  onFocus={() => setIsLedgerDropdownOpen(true)}
                  className="w-full bg-white border-2 border-transparent focus:border-orange-500/10 rounded-[1.5rem] pl-14 pr-12 py-5 font-black text-orange-600 outline-none focus:ring-4 ring-orange-500/5 shadow-sm transition-all placeholder:text-slate-300"
                />
                <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-300 ${isLedgerDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                
                {isLedgerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] max-h-72 overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-4 duration-300 scrollbar-hide">
                    {filteredLedgers.length > 0 ? (
                      filteredLedgers.map(l => (
                        <button 
                          key={l.id}
                          className="w-full text-left px-8 py-5 hover:bg-orange-50 font-black border-b border-slate-50 last:border-none flex justify-between items-center group transition-colors"
                          onClick={() => {
                            setSelectedLedgerId(l.id);
                            setLedgerSearch(l.name);
                            setIsLedgerDropdownOpen(false);
                          }}
                        >
                          <span className="text-slate-700 group-hover:text-orange-700">{l.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-tighter">{l.type}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-8 py-10 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">No matching accounts</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Posting Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border-2 border-transparent focus:border-orange-500/10 rounded-2xl px-6 py-4 font-black text-slate-800 outline-none focus:ring-4 ring-orange-500/5 shadow-sm transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Speed Entry</label>
                <div className="bg-orange-50 px-6 py-4 rounded-2xl border border-orange-100 flex items-center gap-4 text-orange-700">
                  <Keyboard size={24} className="animate-pulse" />
                  <p className="text-[10px] font-black uppercase leading-tight tracking-tighter">Use Arrows & Enter<br/>for rapid processing</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-slate-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] relative z-10">Final Amount Payable</span>
            <div className="flex items-baseline gap-3 relative z-10">
              <span className="text-2xl font-black text-orange-500">{company.currency}</span>
              <span className="text-7xl font-black tracking-tighter leading-none">{totalAmount.toLocaleString()}</span>
            </div>
            <div className="mt-6 flex items-center gap-3 text-[10px] font-black bg-white/5 w-fit px-5 py-2.5 rounded-full backdrop-blur-md relative z-10 border border-white/5 uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-orange-500" /> Ledger Balance Updates Live
            </div>
          </div>
        </div>

        {/* Dynamic Grid */}
        <div className="p-10" ref={gridContainerRef}>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-6 pb-2">Product Description</th>
                  <th className="px-4 pb-2 text-right w-24">QTY</th>
                  <th className="px-4 pb-2 text-right w-36">UNIT RATE</th>
                  <th className="px-4 pb-2 text-right w-24">DISC %</th>
                  <th className="px-6 pb-2 text-right w-44">LINE TOTAL</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {voucherItems.map((vItem, index) => (
                  <tr key={index} className="group">
                    <td className="px-1">
                      <select 
                        data-pos={`${index}-0`}
                        onKeyDown={e => handleKeyDown(e, index, 0)}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white rounded-3xl px-6 py-5 outline-none font-black text-slate-900 appearance-none transition-all shadow-sm"
                        value={vItem.itemId}
                        onChange={e => handleItemChange(index, 'itemId', e.target.value)}
                      >
                        <option value="">Choose Item...</option>
                        {items.map(i => <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
                      </select>
                    </td>
                    <td className="px-1">
                      <input 
                        type="number"
                        data-pos={`${index}-1`}
                        onKeyDown={e => handleKeyDown(e, index, 1)}
                        value={vItem.quantity}
                        onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white p-5 rounded-3xl text-right font-black outline-none transition-all shadow-sm"
                      />
                    </td>
                    <td className="px-1">
                      <input 
                        type="number"
                        data-pos={`${index}-2`}
                        onKeyDown={e => handleKeyDown(e, index, 2)}
                        value={vItem.rate}
                        onChange={e => handleItemChange(index, 'rate', Number(e.target.value))}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white p-5 rounded-3xl text-right font-black outline-none transition-all shadow-sm"
                      />
                    </td>
                    <td className="px-1">
                      <input 
                        type="number"
                        data-pos={`${index}-3`}
                        onKeyDown={e => handleKeyDown(e, index, 3)}
                        value={vItem.discount}
                        onChange={e => handleItemChange(index, 'discount', Number(e.target.value))}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/30 focus:bg-white p-5 rounded-3xl text-right font-black outline-none transition-all shadow-sm"
                      />
                    </td>
                    <td className="px-6 text-right">
                      <span className="font-black text-orange-600 text-xl tracking-tighter">{(vItem.amount || 0).toLocaleString()}</span>
                    </td>
                    <td>
                      <button onClick={() => removeRow(index)} className="p-3 text-slate-300 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-2xl active:scale-90">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Bar */}
          <div className="mt-12 flex flex-col md:flex-row justify-between items-start gap-12 pt-10 border-t border-slate-50">
            <div className="w-full max-w-xl space-y-6">
               <button 
                 onClick={addNewRow}
                 className="flex items-center gap-3 text-orange-600 font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 hover:text-white px-8 py-4 rounded-[1.5rem] transition-all border-2 border-dashed border-orange-200 hover:border-orange-600"
               >
                 <Plus size={18} /> Append Record Line (Ctrl+A)
               </button>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Internal Narration</label>
                 <textarea 
                   value={narration} 
                   onChange={e => setNarration(e.target.value)}
                   rows={3}
                   placeholder="Enter official transaction remarks..."
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/10 rounded-[2rem] p-6 text-sm italic font-bold outline-none focus:bg-white transition-all shadow-inner"
                 />
               </div>
            </div>
            
            <div className="flex gap-4 self-end pb-2">
               <button onClick={resetForm} className="px-12 py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest text-slate-400 hover:bg-slate-100 transition-all">Clear Terminal</button>
               <button 
                 onClick={() => handleSubmit()}
                 className="px-16 py-6 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] flex items-center gap-4 hover:bg-orange-700 shadow-[0_25px_50px_-12px_rgba(234,88,12,0.4)] active:scale-95 transition-all"
               >
                 <Save size={22} /> Commit & Launch Print
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
