
import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { Ledger } from '../types';

interface SendReminderModalProps {
  ledger: Ledger;
  onClose: () => void;
}

const SendReminderModal: React.FC<SendReminderModalProps> = ({ ledger, onClose }) => {
  const [phone, setPhone] = useState(ledger.phone || '');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Default template
    const draft = `Dear ${ledger.name}, this is a friendly reminder from SM INTERNATIONAL. Your outstanding due balance is BDT ${ledger.currentBalance.toLocaleString()}. Please clear it at your earliest convenience. Thank you.`;
    setMessage(draft);
  }, [ledger]);

  const handleSend = async () => {
    if (!phone) {
      setStatus('error');
      setErrorMessage('Phone number is required for SMS reminders.');
      return;
    }

    setIsSending(true);
    setStatus('idle');

    // Simulate C# Bridge Call
    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate for simulation
        if (success) {
            setStatus('success');
            console.log("Reminder Sent:", { ledgerId: ledger.id, phone, message });
        } else {
            setStatus('error');
            setErrorMessage("Twilio API Error: Account balance low or invalid credentials.");
        }
        setIsSending(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-8 py-5 border-b flex justify-between items-center bg-orange-600 text-white">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} />
            <h2 className="font-bold text-xl">Billing Alert</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-6">
          {status === 'success' ? (
            <div className="py-10 text-center space-y-4 animate-in fade-in duration-500">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle2 size={32} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-gray-900">Reminder Sent!</h3>
                  <p className="text-sm text-gray-500">A message has been dispatched to {ledger.name}.</p>
               </div>
               <button onClick={onClose} className="px-8 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Close Dialog</button>
            </div>
          ) : (
            <>
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Customer Overview</p>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="font-bold text-lg text-gray-900">{ledger.name}</p>
                      <p className="text-xs text-gray-500">Total Dues: BDT {ledger.currentBalance.toLocaleString()}</p>
                   </div>
                   <span className="text-[10px] font-black px-2 py-1 bg-white border border-orange-200 text-orange-600 rounded uppercase">Outstanding</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Recipient Phone</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880..." 
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-gray-800 border-2 border-transparent focus:border-orange-100 transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Reminder Message (Editable)</label>
                <textarea 
                  rows={4} 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm font-medium text-gray-700 border-2 border-transparent focus:border-orange-100 transition-all resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="shrink-0" size={18} />
                  <p className="text-xs font-bold leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 border rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-orange-700 shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
                >
                  {isSending ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <><Send size={18} /> Dispatch SMS</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendReminderModal;
