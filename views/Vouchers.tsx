
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Trash2, Save, Calendar, Search, 
  CheckCircle2, Printer, Eye, ArrowLeft
} from 'lucide-react';
import { 
  Voucher, VoucherType, Ledger, StockItem, VoucherItem, LedgerEntry, Company 
} from '../types';

interface VouchersProps {
  vouchers: Voucher[];
  addVoucher: (voucher: Voucher) => void;
  ledgers: Ledger[];
  items: StockItem[];
  company: Company;
  editingVoucher?: Voucher | null;
  clearEdit?: () => void;
}

const Vouchers: React.FC<VouchersProps> = ({ 
  vouchers, addVoucher, ledgers, items, company, editingVoucher, clearEdit 
}) => {
  const [activeTab, setActiveTab] = useState<VoucherType>(VoucherType.SALES);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLedgerId, setSelectedLedgerId] = useState('');
  const [narration, setNarration] = useState('');
  const [reference, setReference] = useState('');
  const [voucherItems, setVoucherItems] = useState<Partial<VoucherItem>[]>([{ itemId: '', quantity: 1, rate: 0, amount: 0 }]);
  
  // New States for Flow Control
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<Voucher | null>(null);

  useEffect(() => {
    if (editingVoucher) {
      setIsEditMode(true);
      setActiveTab(editingVoucher.type);
      setDate(editingVoucher.date);
      setReference(editingVoucher.reference);
      setNarration(editingVoucher.narration);
      setSelectedLedgerId(editingVoucher.ledgerEntries[0]?.ledgerId || '');
      setVoucherItems(editingVoucher.items || [{ itemId: '', quantity: 1, rate: 0, amount: 0 }]);
    }
  }, [editingVoucher]);

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
      }
    }
    item.amount = (item.quantity || 0) * (item.rate || 0);
    updated[index] = item;
    setVoucherItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLedgerId) return alert('Please select a party account.');

    const selectedLedger = ledgers.find(l => l.id === selectedLedgerId)!;
    const ledgerEntries: LedgerEntry[] = [];
    
    // Core accounting logic remains constant
    if (activeTab === VoucherType.SALES) {
      const salesLedger = ledgers.find(l => l.name.toLowerCase().includes('sales'))!;
      ledgerEntries.push({ ledgerId: selectedLedger.id, ledgerName: selectedLedger.name, debit: totalAmount, credit: 0 });
      ledgerEntries.push({ ledgerId: salesLedger.id, ledgerName: salesLedger.name, debit: 0, credit: totalAmount });
    }

    const voucher: Voucher = {
      id: isEditMode ? editingVoucher!.id : Math.random().toString(36).substr(2, 9),
      number: voucherNumber,
      date,
      type: activeTab,
      reference,
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
    setVoucherItems([{ itemId: '', quantity: 1, rate: 0, amount: 0 }]);
    setNarration('');
    setReference('');
    setSelectedLedgerId('');
  };

  if (saveSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 animate-in zoom-in duration-300">
        <div className="bg-white rounded-3xl border shadow-2xl p-12 text-center space-y-8">
           <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={48} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-gray-900">Voucher Posted!</h2>
              <p className="text-gray-500 mt-2">Transaction <span className="font-bold text-orange-600">{saveSuccess.number}</span> has been updated in the ledger.</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => alert('Opening Preview Window...')} className="flex items-center justify-center gap-3 bg-white border-2 border-orange-600 text-orange-600 py-4 rounded-2xl font-bold hover:bg-orange-50 transition-all">
                <Eye size={20} /> Preview Invoice
              </button>
              <button onClick={() => alert('Sending to System Printer...')} className="flex items-center justify-center gap-3 bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-600/20 transition-all">
                <Printer size={20} /> Print Invoice
              </button>
           </div>

           <button onClick={resetForm} className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 font-bold text-sm mx-auto">
              <ArrowLeft size={16} /> Create Another Voucher
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Modify Existing Voucher' : 'New Voucher Entry'}</h1>
        <div className="flex bg-gray-200 p-1 rounded-xl gap-1">
          {Object.values(VoucherType).slice(0, 4).map(type => (
            <button
              key={type}
              disabled={isEditMode}
              onClick={() => setActiveTab(type as VoucherType)}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === type ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              } ${isEditMode ? 'opacity-50' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="p-10 bg-slate-50 border-b grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Reference #</label>
              <input type="text" value={reference} onChange={e => setReference(e.target.value)} className="w-full bg-transparent border-b border-gray-200 py-1 outline-none font-bold text-gray-800 focus:border-orange-600 transition-colors" placeholder="e.g. INV/2024/001" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Party Account</label>
              <select 
                className="w-full bg-transparent border-b border-gray-200 py-1 outline-none font-bold text-orange-600 cursor-pointer"
                value={selectedLedgerId}
                onChange={e => setSelectedLedgerId(e.target.value)}
              >
                <option value="">Choose Account...</option>
                {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
           </div>
           <div className="bg-orange-600 rounded-3xl p-6 text-white text-right shadow-2xl shadow-orange-600/30">
              <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Grand Total</span>
              <p className="text-4xl font-black">{company.currency} {totalAmount.toLocaleString()}</p>
           </div>
        </div>

        {/* Lines Table */}
        <div className="p-10">
           <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-4">
                  <th className="pb-6">Product / Service Description</th>
                  <th className="pb-6 text-right w-32">Quantity</th>
                  <th className="pb-6 text-right w-40">Rate</th>
                  <th className="pb-6 text-right w-40">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {voucherItems.map((vItem, index) => (
                  <tr key={index}>
                    <td className="py-6 pr-6">
                      <select 
                        className="w-full bg-gray-50/50 border-none rounded-2xl px-5 py-4 outline-none font-bold text-gray-700"
                        value={vItem.itemId}
                        onChange={e => handleItemChange(index, 'itemId', e.target.value)}
                      >
                        <option value="">Select Item...</option>
                        {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </td>
                    <td className="py-6 px-2 text-right">
                      <input type="number" value={vItem.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full bg-gray-50/50 p-4 rounded-2xl text-right font-bold outline-none border-2 border-transparent focus:border-orange-100" />
                    </td>
                    <td className="py-6 px-2 text-right">
                       <input type="number" value={vItem.rate} onChange={e => handleItemChange(index, 'rate', Number(e.target.value))} className="w-full bg-gray-50/50 p-4 rounded-2xl text-right font-bold outline-none border-2 border-transparent focus:border-orange-100" />
                    </td>
                    <td className="py-6 pl-4 text-right font-black text-orange-600">{(vItem.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
           </table>
           
           <div className="mt-12 flex justify-between items-center border-t pt-8">
              <div className="flex-1 max-w-lg">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Narration / Remarks</label>
                 <textarea value={narration} onChange={e => setNarration(e.target.value)} rows={2} className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm italic" placeholder="Type internal notes here..." />
              </div>
              <button onClick={handleSubmit} className="px-12 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-orange-700 shadow-2xl shadow-orange-600/30 transition-all active:scale-95">
                <Save size={18} /> {isEditMode ? 'Update Voucher' : 'Save & Post'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Vouchers;
