
import React, { useState } from 'react';
import { Lock, User, Key, Command, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLogin: (user: UserType) => void;
  users: UserType[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password && u.isActive);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password. Access Denied.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in zoom-in duration-300">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border">
          <div className="bg-slate-900 p-10 text-center text-white space-y-4">
            <img src="logo.png" alt="SM International Logo" className="w-40 h-40 mx-auto mb-2 object-contain drop-shadow-2xl animate-pulse-slow" />
            <h1 className="text-2xl font-black uppercase tracking-widest text-orange-600">SM International</h1>
            <p className="text-slate-400 text-sm font-medium">Cloud Accounting Terminal</p>
          </div>

          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ring-orange-500 font-bold text-slate-800 transition-all"
                />
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ring-orange-500 font-bold text-slate-800 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-700 shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
            >
              <Lock size={18} /> Authenticate
            </button>

            <div className="text-center pt-2">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Secure Terminal Connection Verified</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
