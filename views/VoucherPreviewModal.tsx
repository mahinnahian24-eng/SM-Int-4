
import React from 'react';
import { 
  X, Printer, User, Calendar, Hash, FileText, CheckCircle2 
} from 'lucide-react';
import { Voucher, Company, VoucherType, VoucherPrintSettings } from '../types';

interface VoucherPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher;
  company: Company;
  printSettings?: VoucherPrintSettings; // Made optional for backward compatibility
  onEdit?: (v: Voucher) => void;
  onPrint?: (v: Voucher) => void;
}

const DEFAULT_SETTINGS: VoucherPrintSettings = {
  showPhone: true,
  showEmail: true,
  showBankInfo: true,
  showTax: true,
  showDiscount: true,
  showSKU: true,
  showBarcode: false,
  paperSize: 'A4',
  footerNote: "This is a computer-generated invoice.",
  salesTitle: "TAX INVOICE",
  purchaseTitle: "PURCHASE VOUCHER"
};

const VoucherPreviewModal: React.FC<VoucherPreviewModalProps> = ({ 
  isOpen, onClose, voucher, company, printSettings = DEFAULT_SETTINGS, onEdit, onPrint 
}) => {
  if (!isOpen) return null;

  const headerTitle = voucher.type === VoucherType.SALES ? printSettings.salesTitle : printSettings.purchaseTitle;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className={`bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300 ${printSettings.paperSize === 'A5' ? 'aspect-[1/1.4]' : ''}`}>
        
        {/* Header Toolbar */}
        <div className="px-8 py-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
               voucher.type === VoucherType.SALES ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {voucher.type} Voucher
            </span>
            <h2 className="font-bold text-gray-800">Print Preview: {voucher.number}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPrint?.(voucher)}
              className="p-2 hover:bg-white border rounded-xl text-indigo-600 transition-all flex items-center gap-2 px-4 font-bold text-sm"
            >
              <Printer size={18} /> Print Now
            </button>
            <button 
              onClick={() => onEdit?.(voucher)}
              className="p-2 hover:bg-white border rounded-xl text-amber-600 transition-all px-4 font-bold text-sm"
            >
              Edit
            </button>
            <button onClick={onClose} className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-white" id="printable-area">
          {/* Company & Info */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-indigo-600">{company.name}</h1>
              <p className="text-gray-500 text-sm whitespace-pre-line">{company.address}</p>
              <div className="flex flex-wrap gap-4 mt-2">
                {printSettings.showPhone && company.phone && <span className="text-xs font-bold text-gray-500">P: {company.phone}</span>}
                {printSettings.showEmail && company.email && <span className="text-xs font-bold text-gray-500">E: {company.email}</span>}
              </div>
              <p className="text-sm font-bold mt-2">VAT: {company.vatNumber}</p>
            </div>
            <div className="text-right space-y-4">
              <div className="inline-block bg-gray-100 px-6 py-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{headerTitle}</p>
                <p className="text-3xl font-black text-gray-900">{company.currency} {voucher.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 border-y py-8">
            <div className="space-y-4">
               <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing To</h4>
               <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">{voucher.ledgerEntries[0]?.ledgerName || 'Cash Customer'}</p>
                    <p className="text-sm text-gray-500">Party Ledger: {voucher.ledgerEntries[0]?.ledgerId || '---'}</p>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Voucher Date</h4>
                  <p className="font-bold text-gray-700">{voucher.date}</p>
               </div>
               <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ref Number</h4>
                  <p className="font-bold text-gray-700">{voucher.reference || '---'}</p>
               </div>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-4">
                  <th className="pb-4">Description</th>
                  {printSettings.showSKU && <th className="pb-4">SKU</th>}
                  <th className="pb-4 text-right">Qty</th>
                  <th className="pb-4 text-right">Rate</th>
                  {printSettings.showDiscount && <th className="pb-4 text-right">Disc</th>}
                  {printSettings.showTax && <th className="pb-4 text-right">Tax</th>}
                  <th className="pb-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {voucher.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-5">
                      <p className="font-bold text-gray-900">{item.itemName}</p>
                    </td>
                    {printSettings.showSKU && <td className="py-5 text-gray-500 text-xs">#{item.itemId.slice(0, 5)}</td>}
                    <td className="py-5 text-right font-medium">{item.quantity}</td>
                    <td className="py-5 text-right font-medium">{item.rate.toLocaleString()}</td>
                    {printSettings.showDiscount && <td className="py-5 text-right text-gray-500">{item.discount?.toLocaleString() || '0'}</td>}
                    {printSettings.showTax && <td className="py-5 text-right text-gray-500">{item.taxAmount?.toLocaleString() || '0'}</td>}
                    <td className="py-5 text-right font-black">{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer & Bank */}
          <div className="flex justify-between items-start border-t pt-8 mt-12">
            <div className="max-w-xs space-y-4">
              {printSettings.showBankInfo && company.bankName && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Details</h4>
                   <p className="text-xs font-bold text-gray-700">{company.bankName}</p>
                   <p className="text-xs text-gray-500">A/C: {company.accountNumber}</p>
                </div>
              )}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Narration</h4>
                <p className="text-sm text-gray-600 italic">"{voucher.narration || 'No remarks provided.'}"</p>
              </div>
            </div>
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold">{voucher.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl border-t pt-3">
                <span className="font-black text-gray-900">Grand Total</span>
                <span className="font-black text-indigo-600">{company.currency} {voucher.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-8 py-6 bg-gray-50 text-center border-t">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{printSettings.footerNote}</p>
           <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{company.invoiceFooter || 'Digital Document Generated via CloudTally'}</p>
        </div>
      </div>
    </div>
  );
};

export default VoucherPreviewModal;
