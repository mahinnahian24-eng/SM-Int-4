
import React, { useState } from 'react';
import { Company, User, UserRole } from '../types';
import { 
  Save, User as UserIcon, MapPin, BadgeCheck, DollarSign, Globe, 
  Database, Cloud, Server, RefreshCw, AlertCircle, Clock,
  CheckCircle2, Download, Shield, Trash2, Plus, Key
} from 'lucide-react';

interface SettingsProps {
  company: Company;
  setCompany: React.Dispatch<React.SetStateAction<Company>>;
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User;
}

const SettingsView: React.FC<SettingsProps> = ({ company, setCompany, users, setUsers, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'backup' | 'security'>('general');
  const [formData, setFormData] = useState<Company>(company);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // User Management State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompany(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleManualBackup = async (dest: 'drive' | 'ftp') => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      alert(`Manual backup to ${dest} completed successfully!`);
    }, 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername,
      password: newPassword,
      role: newRole,
      isActive: true
    };

    setUsers([...users, newUser]);
    setNewUsername('');
    setNewPassword('');
    setNewRole(UserRole.USER);
  };

  const handleRemoveUser = (id: string) => {
    if (id === currentUser.id) {
      alert("You cannot remove your own account.");
      return;
    }
    if (window.confirm("Are you sure you want to remove this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Settings</h1>
          <p className="text-gray-500">Manage company profile, security, and backups.</p>
        </div>
        {showSuccess && (
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 animate-bounce">
            <BadgeCheck size={18} />
            Settings Saved!
          </div>
        )}
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
        >
          General Information
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'security' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
        >
          Security & Users
        </button>
        <button 
          onClick={() => setActiveTab('backup')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'backup' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
        >
          Backup & Restore
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
             <div className="bg-indigo-600 rounded-2xl p-6 text-white text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center text-4xl font-black mb-4 backdrop-blur-sm">
                  {formData.name[0]}
                </div>
                <h3 className="text-xl font-bold">{formData.name}</h3>
                <p className="text-sm opacity-70">Administrator Access</p>
             </div>
          </div>
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-8 space-y-6">
               <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase mb-2 block">Company Legal Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border focus:ring-2 ring-indigo-500 font-bold" />
                  </div>
               </div>
               <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Save Settings</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
           <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                 <h3 className="font-bold text-lg flex items-center gap-2"><Plus className="text-indigo-600" /> Add New User</h3>
                 <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Username</label>
                      <input 
                        type="text" 
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        placeholder="e.g. mahin2"
                        className="w-full bg-gray-50 p-3 rounded-xl border outline-none focus:ring-2 ring-indigo-500 font-bold text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Initial Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-gray-50 p-3 rounded-xl border outline-none focus:ring-2 ring-indigo-500 font-bold text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Account Role</label>
                      <select 
                        className="w-full bg-gray-50 p-3 rounded-xl border outline-none focus:ring-2 ring-indigo-500 font-bold text-sm"
                        value={newRole}
                        onChange={e => setNewRole(e.target.value as UserRole)}
                      >
                         <option value={UserRole.ADMIN}>Administrator</option>
                         <option value={UserRole.USER}>Standard User</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                       Register Account
                    </button>
                 </form>
              </div>
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex gap-3">
                 <AlertCircle className="text-orange-600 shrink-0" size={20} />
                 <p className="text-xs text-orange-800 font-medium leading-relaxed">
                   <strong>Security Tip:</strong> Use complex passwords for Admin accounts. Administrators have full control over inventory, vouchers, and user accounts.
                 </p>
              </div>
           </div>

           <div className="md:col-span-2">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                 <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Shield size={18} className="text-indigo-600" /> Authorized Users</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active System Access</span>
                 </div>
                 <div className="divide-y">
                    {users.map(u => (
                      <div key={u.id} className="p-6 flex items-center justify-between group hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${u.role === UserRole.ADMIN ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                             {u.username[0].toUpperCase()}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900">{u.username}</p>
                                {u.id === currentUser.id && <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-black uppercase">Current Session</span>}
                              </div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{u.role}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors" title="Reset Password">
                              <Key size={16} />
                           </button>
                           <button 
                             onClick={() => handleRemoveUser(u.id)}
                             disabled={u.id === currentUser.id}
                             className={`p-2 rounded-lg transition-colors ${u.id === currentUser.id ? 'text-gray-200 cursor-not-allowed' : 'text-rose-500 hover:bg-rose-50'}`} 
                             title="Delete User"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Last Backup</p>
                  <p className="font-bold flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    24 May 2024, 02:00 AM
                  </p>
               </div>
               <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                  <p className="font-bold text-green-600 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Success (FTP)
                  </p>
               </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
               <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Manual Backup</h3>
                  {isBackingUp && <RefreshCw size={18} className="animate-spin text-indigo-600" />}
               </div>
               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleManualBackup('drive')}
                    disabled={isBackingUp}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Cloud size={32} /></div>
                    <div className="text-center">
                       <p className="font-bold">Google Drive</p>
                       <p className="text-xs text-gray-500">Upload zip to cloud</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleManualBackup('ftp')}
                    disabled={isBackingUp}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform"><Server size={32} /></div>
                    <div className="text-center">
                       <p className="font-bold">FTP Server</p>
                       <p className="text-xs text-gray-500">Secure file transfer</p>
                    </div>
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm">
               <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Restore Data</h3>
                  <button className="text-xs font-bold text-indigo-600 hover:underline">List Remote Backups</button>
               </div>
               <div className="p-6">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 mb-6">
                     <AlertCircle className="text-amber-600 shrink-0" size={20} />
                     <p className="text-xs text-amber-800 font-medium">
                       Restoring data will overwrite your current local database. A temporary safety backup will be created before the process starts.
                     </p>
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                           <FileSpreadsheet size={18} className="text-gray-400" />
                           <span className="text-sm font-bold">Backup_20240523_1020.zip</span>
                        </div>
                        <button className="flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all">
                           <RefreshCw size={12} /> Restore
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
             <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold mb-4">Auto-Backup Config</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-600">Enabled</label>
                      <input type="checkbox" className="w-5 h-5 accent-indigo-600" defaultChecked />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Frequency</label>
                      <select className="w-full bg-gray-50 p-2 rounded-lg border text-sm font-bold">
                         <option>Daily</option>
                         <option>Weekly</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Backup Time</label>
                      <input type="time" defaultValue="02:00" className="w-full bg-gray-50 p-2 rounded-lg border text-sm font-bold" />
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="font-bold mb-4">FTP Details</h3>
                <div className="space-y-3">
                   <input type="text" placeholder="FTP Host" className="w-full bg-gray-50 p-2 rounded-lg text-sm border font-bold" />
                   <input type="text" placeholder="Username" className="w-full bg-gray-50 p-2 rounded-lg text-sm border font-bold" />
                   <input type="password" placeholder="Password" className="w-full bg-gray-50 p-2 rounded-lg text-sm border font-bold" />
                   <button className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-200 transition-all">Test Connection</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FileSpreadsheet: React.FC<{ size?: number, className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M14 13h2"></path><path d="M8 17h2"></path><path d="M14 17h2"></path></svg>
);

export default SettingsView;
