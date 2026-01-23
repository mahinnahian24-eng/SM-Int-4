
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SM INTERNATIONAL Dashboard</h1>
          <p className="text-gray-500 font-medium">Business activity overview at a glance.</p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={onNewSale}
          className="group flex items-center justify-between p-6 bg-white border-2 border-orange-50 rounded-3xl hover:border-orange-600 hover:shadow-xl hover:shadow-orange-600/10 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-600 text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-orange-600/30">
              <DollarSign size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">New Sale</h3>
              <p className="text-sm text-gray-500 font-medium">Create customer invoice (F2)</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button 
          onClick={onNewLedger}
          className="group flex items-center justify-between p-6 bg-white border-2 border-orange-50 rounded-3xl hover:border-orange-600 hover:shadow-xl hover:shadow-orange-600/10 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-800 text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-slate-800/30">
              <UserPlus size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">New Ledger</h3>
              <p className="text-sm text-gray-500 font-medium">Add Customer/Supplier (F3)</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Sales" 
          value={`${company.currency} ${totalSales.toLocaleString()}`} 
          icon={<TrendingUp className="text-orange-600" />} 
          trend="+12.5%" 
          trendUp={true} 
        />
        <StatsCard 
          title="Stock Value" 
          value={`${company.currency} ${stockValue.toLocaleString()}`} 
          icon={<Package className="text-orange-600" />} 
          trend="In Warehouse" 
          trendUp={true} 
        />
        <StatsCard 
          title="Total Purchases" 
          value={`${company.currency} ${totalPurchase.toLocaleString()}`} 
          icon={<ShoppingBag className="text-slate-600" />} 
          trend="-2.4%" 
          trendUp={false} 
        />
        <StatsCard 
          title="Low Stock Alerts" 
          value={lowStockItems.toString()} 
          icon={<AlertTriangle className="text-amber-600" />} 
          trend="Needs Attention" 
          trendUp={false} 
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Sales vs Purchases</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="purchase" stroke="#94a3b8" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="flex-1 space-y-4">
            {vouchers.slice(0, 5).map((v) => (
              <div key={v.id} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer border-b last:border-none">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  v.type === 'Sales' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {v.type === 'Sales' ? <TrendingUp size={18} /> : <ShoppingBag size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{v.reference || `Voucher ${v.number}`}</p>
                  <p className="text-xs text-gray-500">{v.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{company.currency} {v.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">{v.type}</p>
                </div>
              </div>
            ))}
          </div>
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
  color?: string
}> = ({ title, value, icon, trend, trendUp, color = 'bg-white' }) => (
  <div className={`${color} p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-100 rounded-xl">{icon}</div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
        {trend}
      </span>
    </div>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export default Dashboard;
