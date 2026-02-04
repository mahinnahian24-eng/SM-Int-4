
import React, { useState } from 'react';
import { Save, Building2, MapPin, Phone, Mail, Globe, Landmark, CreditCard, LayoutTemplate, Eye, Printer, CheckCircle2 } from 'lucide-react';
import { Company, VoucherPrintSettings } from '../types';

interface CompanySettingsProps {
  company: Company;
  setCompany: (c: Company) => void;
  printSettings: VoucherPrintSettings;
  setPrintSettings: (s: VoucherPrintSettings) => void;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ company, setCompany, printSettings, setPrintSettings }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'template'>('profile');
  const [tempCompany, setTempCompany] = useState<Company>(company);
  const [tempSettings, setTempSettings] = useState<VoucherPrintSettings>(printSettings);
  const [showToast, setShowToast] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setCompany(tempCompany);
    triggerToast();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setPrintSettings(tempSettings);
    triggerToast();
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">System Configuration</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Global Profile & Print Layout</p>
        </div>
        {showToast && (
          <div className="flex items-center gap-3 bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-emerald-500/30 animate-in zoom-in">
            <CheckCircle2 size={18} />
            Config Updated
          </div>
        )}
      </div>

      <div className="flex bg-slate-200/50 p-1.5 rounded-[1.5rem] w-fit shadow-inner">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-8 py-3.5 rounded-[1.2rem] font-black uppercase text-[11px] tracking-widest transition-all flex items-center gap-3 ${activeTab === 'profile' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Building2 size={18} />
          Business Profile
        </button>
        <button 
          onClick={() => setActiveTab('template')}
          className={`px-8 py-3.5 rounded-[1.2rem] font-black uppercase text-[11px] tracking-widest transition-all flex items-center gap-3 ${activeTab === 'template' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <LayoutTemplate size={18} />
          Invoice Logic
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
        {activeTab === 'profile' ? (
          <form onSubmit={handleSaveCompany} className="p-12 space-y-12">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
              <div className="w-full lg:w-72 space-y-6">
                 <div className="bg-[#0F172A] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl shadow-slate-900/20 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img src="logo.png" alt="SM" className="w-40 h-40 object-contain mb-6 drop-shadow-[0_0_15px_rgba(234,88,12,0.4)] animate-pulse-slow" />
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] relative z-10">Brand Identity</p>
                 </div>
                 <div className="bg-orange-50 p-6 rounded-[1.5rem] border border-orange-100">
                    <p className="text-[10px] font-black text-orange-600 uppercase mb-2 tracking-widest">Hardware Preview</p>
                    <p className="text-[11px] text-orange-800 font-bold leading-relaxed">This logo is hardcoded into your terminal firmware and printed vouchers.</p>
                 </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 border-b border-slate-50 pb-4">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" /> 
                    Legal Registration
                  </h3>
                  <div className="space-y-6">
                    <InputField label="Trade Name" value={tempCompany.name} onChange={v => setTempCompany({...tempCompany, name: v})} />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">HQ Address</label>
                      <textarea 
                        className="w-full bg-slate-50 rounded-[1.5rem] p-5 text-sm font-bold outline-none focus:bg-white focus:ring-4 ring-orange-500/5 border-2 border-transparent focus:border-orange-500/20 transition-all h-28"
                        value={tempCompany.address}
                        onChange={e => setTempCompany({...tempCompany, address: e.target.value})}
                      />
                    </div>
                    <InputField label="VAT Registration" value={tempCompany.vatNumber} onChange={v => setTempCompany({...tempCompany, vatNumber: v})} />
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 border-b border-slate-50 pb-4">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" /> 
                    Digital Presence
                  </h3>
                  <div className="space-y-6">
                    <InputField label="System Phone" value={tempCompany.phone || ''} onChange={v => setTempCompany({...tempCompany, phone: v})} />
                    <InputField label="System Email" value={tempCompany.email || ''} onChange={v => setTempCompany({...tempCompany, email: v})} />
                    <InputField label="Company URL" value={tempCompany.website || ''} onChange={v => setTempCompany({...tempCompany, website: v})} />
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 border-b border-slate-50 pb-4">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" /> 
                    Banking Protocol
                  </h3>
                  <div className="space-y-6">
                    <InputField label="Primary Bank" value={tempCompany.bankName || ''} onChange={v => setTempCompany({...tempCompany, bankName: v})} />
                    <InputField label="Account Number" value={tempCompany.accountNumber || ''} onChange={v => setTempCompany({...tempCompany, accountNumber: v})} />
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 border-b border-slate-50 pb-4">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" /> 
                    Document Text
                  </h3>
                  <div className="space-y-6">
                    <InputField label="Global Header" value={tempCompany.invoiceHeader || ''} onChange={v => setTempCompany({...tempCompany, invoiceHeader: v})} />
                    <InputField label="Global Footer" value={tempCompany.invoiceFooter || ''} onChange={v => setTempCompany({...tempCompany, invoiceFooter: v})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 flex justify-end">
              <button type="submit" className="bg-orange-600 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-orange-700 shadow-xl shadow-orange-600/30 active:scale-95 transition-all flex items-center gap-3">
                <Save size={20} /> Deploy Changes
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveSettings} className="p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 border-b border-slate-50 pb-4">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" /> 
                  UI Field Visibility
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  <ToggleField label="Display Phone Number" checked={tempSettings.showPhone} onChange={v => setTempSettings({...tempSettings, showPhone: v})} />
                  <ToggleField label="Display Email Channel" checked={tempSettings.showEmail} onChange={v => setTempSettings({...tempSettings, showEmail: v})} />
                  <ToggleField label="Display Settlement Bank" checked={tempSettings.showBankInfo} onChange={v => setTempSettings({...tempSettings, showBankInfo: v})} />
                  <ToggleField label="Display SKU/UPC Column" checked={tempSettings.showSKU} onChange={v => setTempSettings({...tempSettings, showSKU: v})} />
                  <ToggleField label="Display Discount/Promos" checked={tempSettings.showDiscount} onChange={v => setTempSettings({...tempSettings, showDiscount: v})} />
                  <ToggleField label="Display Tax Breakdown" checked={tempSettings.showTax} onChange={v => setTempSettings({...tempSettings, showTax: v})} />
                </div>
              </div>

              <div className="space-y-10">
                <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 border-b border-slate-50 pb-4">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" /> 
                  Voucher Metadata
                </h3>
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Terminal Print Standard</label>
                    <select 
                      className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-black text-slate-900 outline-none focus:ring-4 ring-orange-500/5 border-2 border-transparent focus:border-orange-500/20 appearance-none"
                      value={tempSettings.paperSize}
                      onChange={e => setTempSettings({...tempSettings, paperSize: e.target.value as any})}
                    >
                      <option value="A4">A4 ISO 216 Standard</option>
                      <option value="A5">A5 Retail Compact</option>
                      <option value="POS80">80mm Thermal Receipt</option>
                    </select>
                  </div>
                  <InputField label="Sales Header Title" value={tempSettings.salesTitle} onChange={v => setTempSettings({...tempSettings, salesTitle: v})} />
                  <InputField label="Purchase Header Title" value={tempSettings.purchaseTitle} onChange={v => setTempSettings({...tempSettings, purchaseTitle: v})} />
                  <InputField label="Bottom Legal Disclaimer" value={tempSettings.footerNote} onChange={v => setTempSettings({...tempSettings, footerNote: v})} />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 flex justify-end">
              <button type="submit" className="bg-orange-600 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-orange-700 shadow-xl shadow-orange-600/30 active:scale-95 transition-all flex items-center gap-3">
                <Save size={20} /> Update Layouts
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string, value: string, onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500/20 rounded-[1.5rem] p-5 text-sm font-black text-slate-800 outline-none focus:bg-white focus:ring-4 ring-orange-500/5 transition-all"
    />
  </div>
);

const ToggleField: React.FC<{ label: string, checked: boolean, onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] cursor-pointer hover:bg-white border-2 border-transparent hover:border-orange-500/10 transition-all group">
    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors">{label}</span>
    <div className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={e => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
    </div>
  </label>
);

export default CompanySettings;
