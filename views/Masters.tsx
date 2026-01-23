
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserPlus,
  BellRing,
  X
} from 'lucide-react';
import { Ledger, LedgerType, AccountGroup } from '../types';
import SendReminderModal from './SendReminderModal';

interface MastersProps {
  ledgers: Ledger[];
  setLedgers: React.Dispatch<React.SetStateAction<Ledger[]>>;
}

const Masters: React.FC<MastersProps> = ({ ledgers, setLedgers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLedgerForReminder, setSelectedLedgerForReminder] = useState<Ledger | null>(null);
  
  const [newLedger, setNewLedger] = useState<Partial<Ledger>>({
    type: LedgerType.CUSTOMER,
    group: AccountGroup.ASSET,
    openingBalance: 0,
    currentBalance: 0
  });

  const handleAddLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLedger.name) return;
    
    const ledger: Ledger = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLedger.name,
      type: newLedger.type as LedgerType,
      group: newLedger.group as AccountGroup,
      openingBalance: Number(newLedger.openingBalance) || 0,
      currentBalance: Number(newLedger.openingBalance) || 0,
      phone: (newLedger as any).phone || '',
    };

    setLedgers([...ledgers, ledger]);
    setIsModalOpen(false);
    setNewLedger({ type: LedgerType.CUSTOMER, group: AccountGroup.ASSET, openingBalance: 0 });
  };

  const filteredLedgers = ledgers.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ledger Masters</h1>
          <p className="text-gray-500 font-medium">Manage your financial partners and accounts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-600/20 active:scale-95"
        >
          <UserPlus size={18} />
          Create New Ledger
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, type..." 
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Account Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Current Balance</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filteredLedgers.map((ledger) => (
              <tr key={ledger.id} className="hover:bg-orange-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold uppercase">
                      {ledger.name[0]}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-900">{ledger.name}</span>
                        {ledger.phone && <p className="text-[10px] text-gray-400 font-medium">{ledger.phone}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold uppercase tracking-tight">
                    {ledger.type}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${ledger.currentBalance >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {ledger.currentBalance.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {ledger.type === LedgerType.CUSTOMER && (
                        <button 
                            onClick={() => setSelectedLedgerForReminder(ledger)}
                            className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
                            title="Send Billing Reminder"
                        >
                            <BellRing size={16} />
                        </button>
                    )}
                    <button className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg">Add New Ledger</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddLedger} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Account Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  value={newLedger.name || ''}
                  onChange={e => setNewLedger({...newLedger, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number (For SMS)</label>
                <input 
                  type="text" 
                  placeholder="+880..."
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  value={(newLedger as any).phone || ''}
                  onChange={e => setNewLedger({...newLedger, phone: e.target.value} as any)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Account Type</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newLedger.type}
                    onChange={e => setNewLedger({...newLedger, type: e.target.value as LedgerType})}
                  >
                    {Object.values(LedgerType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Group</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newLedger.group}
                    onChange={e => setNewLedger({...newLedger, group: e.target.value as AccountGroup})}
                  >
                    {Object.values(AccountGroup).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20"
                >
                  Save Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLedgerForReminder && (
          <SendReminderModal 
            ledger={selectedLedgerForReminder} 
            onClose={() => setSelectedLedgerForReminder(null)} 
          />
      )}
    </div>
  );
};

export default Masters;
