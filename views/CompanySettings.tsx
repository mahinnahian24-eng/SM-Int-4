
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
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company & Print Configuration</h1>
          <p className="text-gray-500">Manage your business identity and voucher layouts.</p>
        </div>
        {showToast && (
          <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg animate-bounce">
            <CheckCircle2 size={18} />
            Changes Saved Successfully!
          </div>
        )}
      </div>

      <div className="flex bg-white p-1 rounded-2xl border w-fit">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Building2 size={18} />
          Company Profile
        </button>
        <button 
          onClick={() => setActiveTab('template')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'template' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <LayoutTemplate size={18} />
          Print Template
        </button>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden min-h-[600px]">
        {activeTab === 'profile' ? (
          <form onSubmit={handleSaveCompany} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2"><Building2 className="text-indigo-600" /> Basic Information</h3>
                <div className="space-y-4">
                  <InputField label="Company Name" value={tempCompany.name} onChange={v => setTempCompany({...tempCompany, name: v})} icon={<Building2 size={16}/>} />
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Office Address</label>
                    <textarea 
                      className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 ring-indigo-500 h-24"
                      value={tempCompany.address}
                      onChange={e => setTempCompany({...tempCompany, address: e.target.value})}
                    />
                  </div>
                  <InputField label="VAT / Tax ID" value={tempCompany.vatNumber} onChange={v => setTempCompany({...tempCompany, vatNumber: v})} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2"><Phone className="text-indigo-600" /> Contact & Web</h3>
                <div className="space-y-4">
                  <InputField label="Contact Phone" value={tempCompany.phone || ''} onChange={v => setTempCompany({...tempCompany, phone: v})} icon={<Phone size={16}/>} />
                  <InputField label="Support Email" value={tempCompany.email || ''} onChange={v => setTempCompany({...tempCompany, email: v})} icon={<Mail size={16}/>} />
                  <InputField label="Website" value={tempCompany.website || ''} onChange={v => setTempCompany({...tempCompany, website: v})} icon={<Globe size={16}/>} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2"><Landmark className="text-indigo-600" /> Banking Details</h3>
                <div className="space-y-4">
                  <InputField label="Bank Name" value={tempCompany.bankName || ''} onChange={v => setTempCompany({...tempCompany, bankName: v})} icon={<Landmark size={16}/>} />
                  <InputField label="Account Number" value={tempCompany.accountNumber || ''} onChange={v => setTempCompany({...tempCompany, accountNumber: v})} icon={<CreditCard size={16}/>} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2"><Eye className="text-indigo-600" /> Invoice Content</h3>
                <div className="space-y-4">
                  <InputField label="Header Text (Global)" value={tempCompany.invoiceHeader || ''} onChange={v => setTempCompany({...tempCompany, invoiceHeader: v})} />
                  <InputField label="Footer Disclaimer" value={tempCompany.invoiceFooter || ''} onChange={v => setTempCompany({...tempCompany, invoiceFooter: v})} />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t flex justify-end">
              <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2">
                <Save size={18} /> Update Company Profile
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveSettings} className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2"><LayoutTemplate className="text-indigo-600" /> Display Toggles</h3>
                <div className="grid grid-cols-1 gap-4">
                  <ToggleField label="Show Company Phone" checked={tempSettings.showPhone} onChange={v => setTempSettings({...tempSettings, showPhone: v})} />
                  <ToggleField label="Show Company Email" checked={tempSettings.showEmail} onChange={v => setTempSettings({...tempSettings, showEmail: v})} />
                  <ToggleField label="Show Bank / Account Info" checked={tempSettings.showBankInfo} onChange={v => setTempSettings({...tempSettings, showBankInfo: v})} />
                  <ToggleField label="Show SKU Column" checked={tempSettings.showSKU} onChange={v => setTempSettings({...tempSettings, showSKU: v})} />
                  <ToggleField label="Show Discount Column" checked={tempSettings.showDiscount} onChange={v => setTempSettings({...tempSettings, showDiscount: v})} />
                  <ToggleField label="Show Tax Column" checked={tempSettings.showTax} onChange={v => setTempSettings({...tempSettings, showTax: v})} />
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2"><Printer className="text-indigo-600" /> Page & Titles</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Default Paper Size</label>
                    <select 
                      className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 ring-indigo-500"
                      value={tempSettings.paperSize}
                      onChange={e => setTempSettings({...tempSettings, paperSize: e.target.value as any})}
                    >
                      <option value="A4">A4 (Standard)</option>
                      <option value="A5">A5 (Half Size)</option>
                      <option value="POS80">Thermal 80mm</option>
                    </select>
                  </div>
                  <InputField label="Sales Voucher Title" value={tempSettings.salesTitle} onChange={v => setTempSettings({...tempSettings, salesTitle: v})} />
                  <InputField label="Purchase Voucher Title" value={tempSettings.purchaseTitle} onChange={v => setTempSettings({...tempSettings, purchaseTitle: v})} />
                  <InputField label="Global Footer Note" value={tempSettings.footerNote} onChange={v => setTempSettings({...tempSettings, footerNote: v})} />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t flex justify-end">
              <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2">
                <Save size={18} /> Apply Print Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode }> = ({ label, value, onChange, icon }) => (
  <div className="space-y-1">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className={`w-full bg-gray-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-500 ${icon ? 'pl-11' : ''}`}
      />
    </div>
  </div>
);

const ToggleField: React.FC<{ label: string, checked: boolean, onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-indigo-100">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={e => onChange(e.target.checked)}
      className="w-5 h-5 accent-indigo-600 rounded"
    />
  </label>
);

export default CompanySettings;
