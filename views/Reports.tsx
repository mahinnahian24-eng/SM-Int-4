
import React, { useState } from 'react';
import { 
  BarChart, Search, Download, Printer, PieChart, 
  ClipboardList, Calculator, ArrowUpRight, ArrowDownLeft,
  Eye, Edit3, Trash2
} from 'lucide-react';
import { Voucher, Ledger, StockItem, Company, AccountGroup } from '../types';
import VoucherPreviewModal from './VoucherPreviewModal';

interface ReportsProps {
  vouchers: Voucher[];
  ledgers: Ledger[];
  items: StockItem[];
  company: Company;
  onEditVoucher: (v: Voucher) => void;
}

const Reports: React.FC<ReportsProps> = ({ vouchers, ledgers, items, company, onEditVoucher }) => {
  const [activeReport, setActiveReport] = useState<'PL' | 'BS' | 'STOCK' | 'REGISTER'>('REGISTER');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (v: Voucher) => {
    setSelectedVoucher(v);
    setIsPreviewOpen(true);
  };

  const handlePrint = (v: Voucher) => {
    // Call C# PrintService bridge
    alert(`Sending Voucher ${v.number} to System Printer Dialog...`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Registers</h1>
          <p className="text-gray-500">Access your transaction history and audit logs.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
          <Download size={18} /> Export All (Excel)
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportTab active={activeReport === 'REGISTER'} label="Voucher Register" icon={<BarChart size={20} />} onClick={() => setActiveReport('REGISTER')} />
        <ReportTab active={activeReport === 'STOCK'} label="Stock Summary" icon={<PieChart size={20} />} onClick={() => setActiveReport('STOCK')} />
        <ReportTab active={activeReport === 'PL'} label="Profit & Loss" icon={<Calculator size={20} />} onClick={() => setActiveReport('PL')} />
        <ReportTab active={activeReport === 'BS'} label="Balance Sheet" icon={<ClipboardList size={20} />} onClick={() => setActiveReport('BS')} />
      </div>

      <div className="bg-white rounded-3xl border shadow-sm p-8 min-h-[500px]">
        {activeReport === 'REGISTER' && (
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">Day Book / Register</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="Search Vouchers..." className="pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 ring-indigo-500 outline-none w-64" />
                </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="border-b bg-gray-50/50">
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-4 py-3">Voucher No</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {vouchers.map(v => (
                      <tr key={v.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-4 py-4 font-bold text-indigo-600">{v.number}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{v.date}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            v.type === 'Sales' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>{v.type}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 italic">{v.reference || '---'}</td>
                        <td className="px-4 py-4 text-right font-black text-gray-900">{company.currency} {v.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                             <button 
                               onClick={() => handlePreview(v)}
                               className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="Preview Invoice">
                               <Eye size={18} />
                             </button>
                             <button 
                               onClick={() => onEditVoucher(v)}
                               className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors" title="Edit Voucher">
                               <Edit3 size={18} />
                             </button>
                             <button 
                               onClick={() => handlePrint(v)}
                               className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Print Directly">
                               <Printer size={18} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               {vouchers.length === 0 && (
                 <div className="py-20 text-center text-gray-400 italic">No transactions found for the selected period.</div>
               )}
             </div>
          </div>
        )}
      </div>

      {selectedVoucher && (
        <VoucherPreviewModal 
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          voucher={selectedVoucher}
          company={company}
          onEdit={() => onEditVoucher(selectedVoucher)}
          onPrint={() => handlePrint(selectedVoucher)}
        />
      )}
    </div>
  );
};

const ReportTab: React.FC<{ active: boolean, label: string, icon: React.ReactNode, onClick: () => void }> = ({ active, label, icon, onClick }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${active ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-white text-gray-600 hover:bg-indigo-50 border-gray-100'}`}>
    <div className={active ? 'text-indigo-200' : 'text-indigo-500'}>{icon}</div>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export default Reports;
