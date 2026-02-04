
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  AlertTriangle,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { Voucher, StockItem, Ledger, Company } from '../types';

interface DashboardProps {
  vouchers: Voucher[];
  items: StockItem[];
  ledgers: Ledger[];
  company: Company;
  onNewSale: () => void;
  onNewLedger: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ vouchers, items, ledgers, company, onNewSale, onNewLedger }) => {
  const totalSales = vouchers.filter(v => v.type === 'Sales').reduce((sum, v) => sum + v.totalAmount, 0);
  const totalPurchase = vouchers.filter(v => v.type === 'Purchase').reduce((sum, v) => sum + v.totalAmount, 0);
  const stockValue = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  const lowStockItems = items.filter(i => i.quantity <= i.reorderLevel).length;

  const chartData = [
    { name: 'Mon', sales: 4000, purchase: 2400 },
    { name: 'Tue', sales: 3000, purchase: 1398 },
    { name: 'Wed', sales: 2000, purchase: 9800 },
    { name: 'Thu', sales: 2780, purchase: 3908 },
    { name: 'Fri', sales: 1890, purchase: 4800 },
    { name: 'Sat', sales: 2390, purchase: 3800 },
    { name: 'Sun', sales: 3490, purchase: 4300 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <span className="text-orange-600">SM</span> CONTROL CENTER
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{company.name} OPERATIONAL HUB</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={onNewSale}
          className="group flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-orange-600 hover:shadow-2xl hover:shadow-orange-600/10 transition-all text-left overflow-hidden relative"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-orange-600 text-white rounded-[1.5rem] group-hover:scale-110 transition-transform shadow-xl shadow-orange-600/30">
              <DollarSign size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Create Sale</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Invoice Terminal (F2)</p>
            </div>
          </div>
          <ArrowRight className="text-slate-200 group-hover:text-orange-600 group-hover:translate-x-2 transition-all" size={28} />
        </button>

        <button 
          onClick={onNewLedger}
          className="group flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-slate-900 hover:shadow-2xl hover:shadow-slate-900/5 transition-all text-left overflow-hidden relative"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-slate-900 text-white rounded-[1.5rem] group-hover:scale-110 transition-transform shadow-xl shadow-slate-900/30">
              <UserPlus size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Add Ledger</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Partner Entry (F3)</p>
            </div>
          </div>
          <ArrowRight className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-2 transition-all" size={28} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Revenue" 
          value={`${company.currency} ${totalSales.toLocaleString()}`} 
          icon={<TrendingUp size={20} />} 
          trend="+12.5%" 
          trendUp={true} 
          color="bg-white border-orange-100"
          accent="text-orange-600"
        />
        <StatsCard 
          title="Inventory" 
          value={`${company.currency} ${stockValue.toLocaleString()}`} 
          icon={<Package size={20} />} 
          trend="Stocked" 
          trendUp={true} 
          color="bg-white border-slate-100"
          accent="text-slate-600"
        />
        <StatsCard 
          title="Expenses" 
          value={`${company.currency} ${totalPurchase.toLocaleString()}`} 
          icon={<ShoppingBag size={20} />} 
          trend="-2.4%" 
          trendUp={false} 
          color="bg-white border-slate-100"
          accent="text-slate-400"
        />
        <StatsCard 
          title="Stock Alerts" 
          value={lowStockItems.toString()} 
          icon={<AlertTriangle size={20} />} 
          trend="Critical" 
          trendUp={false} 
          color="bg-rose-50 border-rose-100"
          accent="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Growth Analytics</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded-full" />
                <span className="text-[10px] font-black uppercase text-slate-400">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-400 rounded-full" />
                <span className="text-[10px] font-black uppercase text-slate-400">Purchases</span>
              </div>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="purchase" stroke="#94a3b8" strokeWidth={4} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-8">Live Feed</h3>
          <div className="flex-1 space-y-5">
            {vouchers.slice(0, 5).map((v) => (
              <div key={v.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  v.type === 'Sales' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {v.type === 'Sales' ? <TrendingUp size={22} /> : <ShoppingBag size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tighter">{v.reference || `INV-${v.number}`}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{company.currency} {v.totalAmount.toLocaleString()}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${v.type === 'Sales' ? 'text-orange-600' : 'text-slate-400'}`}>{v.type}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-2">
            View All History <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsCard: React.FC<{ 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  trend: string, 
  trendUp: boolean,
  color?: string,
  accent: string
}> = ({ title, value, icon, trend, trendUp, color = 'bg-white', accent }) => (
  <div className={`${color} p-8 rounded-[2rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 bg-white rounded-2xl shadow-sm ${accent}`}>{icon}</div>
      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
        {trend}
      </span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
    <p className="text-2xl font-black text-slate-900 mt-2 tracking-tighter">{value}</p>
  </div>
);

export default Dashboard;
