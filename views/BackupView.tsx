
import React, { useState } from 'react';
import { 
  Database, Cloud, Server, RefreshCw, CheckCircle2, 
  XCircle, Clock, ShieldCheck, Settings, Upload, Download
} from 'lucide-react';

const BackupView: React.FC = () => {
  const [dest, setDest] = useState<'GoogleDrive' | 'FTP'>('GoogleDrive');
  const [autoBackup, setAutoBackup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleManualBackup = async () => {
    setIsProcessing(true);
    // Simulate C# Bridge Call
    setTimeout(() => {
        setIsProcessing(false);
        alert("Manual Backup Triggered Successfully!");
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Database Backup & Security</h1>
        <p className="text-gray-500">Protect your accounting data with encrypted cloud and local backups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Destination & Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gray-50/50">
              <h3 className="font-bold flex items-center gap-2"><Settings size={18}/> Backup Configuration</h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDest('GoogleDrive')}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${dest === 'GoogleDrive' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <Cloud size={32} className={dest === 'GoogleDrive' ? 'text-indigo-600' : 'text-gray-400'} />
                  <span className="font-bold">Google Drive</span>
                </button>
                <button 
                  onClick={() => setDest('FTP')}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${dest === 'FTP' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <Server size={32} className={dest === 'FTP' ? 'text-indigo-600' : 'text-gray-400'} />
                  <span className="font-bold">FTP Server</span>
                </button>
              </div>

              <div className="p-6 bg-indigo-600 rounded-2xl text-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg flex items-center gap-2"><ShieldCheck /> Auto-Backup Shield</h4>
                  <p className="text-sm opacity-80">Sync data after every invoice, receipt, or ledger change.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={autoBackup} onChange={e => setAutoBackup(e.target.checked)} className="sr-only peer" />
                  <div className="w-14 h-7 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleManualBackup}
                  disabled={isProcessing}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : <Upload size={18} />}
                  Run Manual Backup Now
                </button>
                <button className="px-8 py-4 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <Download size={18} /> Restore
                </button>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl border shadow-sm">
             <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold">Backup History</h3>
                <span className="text-xs text-gray-400 font-bold uppercase">Last 10 Events</span>
             </div>
             <div className="divide-y">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">InventoryBackup_202405{20+i}.zip</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> May {20+i}, 2024 &bull; {i === 1 ? 'Google Drive' : 'FTP'}
                          </p>
                        </div>
                     </div>
                     <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded uppercase">Success</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Instructions / Sidebar */}
        <div className="space-y-6">
           <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-4">
              <h4 className="font-bold text-amber-800 flex items-center gap-2 underline decoration-amber-300">Important Note</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Before restoring a database, ensure no other users are logged in. The system will create a temporary "Pre-Restore" safety copy automatically.
              </p>
           </div>
           
           <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4">
              <h4 className="font-bold flex items-center gap-2">FTP Setup</h4>
              <div className="space-y-3">
                 <input type="text" placeholder="Host" className="w-full bg-slate-800 border-none rounded-lg text-sm p-3 focus:ring-1 ring-indigo-500" />
                 <input type="text" placeholder="Username" className="w-full bg-slate-800 border-none rounded-lg text-sm p-3 focus:ring-1 ring-indigo-500" />
                 <input type="password" placeholder="Password" className="w-full bg-slate-800 border-none rounded-lg text-sm p-3 focus:ring-1 ring-indigo-500" />
                 <button className="w-full py-2 bg-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Test Connection</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BackupView;
