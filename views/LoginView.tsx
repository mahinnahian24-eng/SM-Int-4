
import React, { useState } from 'react';
import { Lock, User, Key, AlertCircle, ChevronRight } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLogin: (user: UserType) => void;
  users: UserType[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password && u.isActive);
    if (user) {
      onLogin(user);
    } else {
      setError('AUTH_ERROR: Invalid credentials provided.');
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decals */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-[460px] animate-in zoom-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100">
          <div className="bg-[#0F172A] p-12 text-center text-white relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <img 
              src="logo.png" 
              alt="SM" 
              className="w-44 h-44 mx-auto mb-6 object-contain drop-shadow-[0_0_20px_rgba(234,88,12,0.4)] animate-pulse-slow relative z-10" 
            />
            <div className="relative z-10">
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                <span className="text-orange-500">SM</span> INTERNATIONAL
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 opacity-60">Global ERP Terminal</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-12 space-y-8">
            <div className="space-y-5">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Authentication ID</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Enter Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-orange-500/20 focus:ring-4 ring-orange-500/5 font-bold text-slate-800 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Secure Passkey</label>
                <div className="relative">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-orange-500/20 focus:ring-4 ring-orange-500/5 font-bold text-slate-800 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-in slide-in-from-top-4">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-[11px] font-black uppercase tracking-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full py-5 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-orange-700 shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] active:scale-[0.98] transition-all relative overflow-hidden"
            >
              <Lock size={18} className={isHovered ? 'animate-bounce' : ''} />
              <span>Establish Link</span>
              <ChevronRight size={18} className={`transition-transform duration-300 ${isHovered ? 'translate-x-2' : ''}`} />
            </button>

            <div className="text-center pt-2">
               <div className="inline-flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  System Secure & Live
               </div>
            </div>
          </form>
        </div>
        <p className="text-center mt-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-40">
          © 2024 SM INTERNATIONAL GROUP
        </p>
      </div>
    </div>
  );
};

export default LoginView;
