
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Menu, X, Command, LogOut, User as UserIcon } from 'lucide-react';
import { NAVIGATION } from './constants';
import Dashboard from './views/Dashboard';
import Masters from './views/Masters';
import Inventory from './views/Inventory';
import Vouchers from './views/Vouchers';
import Reports from './views/Reports';
import SettingsView from './views/SettingsView';
import BackupView from './views/BackupView';
import CompanySettings from './views/CompanySettings';
import LoginView from './views/LoginView';
import { Ledger, StockItem, Voucher, Company, VoucherType, LedgerType, AccountGroup, VoucherPrintSettings, User, UserRole } from './types';

const RouterContext = React.createContext<{ path: string; setPath: (path: string) => void }>({
  path: '/',
  setPath: () => {},
});

const MemoryRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState('/');
  return (
    <RouterContext.Provider value={{ path, setPath }}>
      {children}
    </RouterContext.Provider>
  );
};

const useLocation = () => {
  const { path } = React.useContext(RouterContext);
  return { pathname: path };
};

const Link: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({ to, className, children }) => {
  const { setPath } = React.useContext(RouterContext);
  return (
    <a 
      href={`#${to}`} 
      className={className} 
      onClick={(e) => {
        e.preventDefault();
        setPath(to);
      }}
    >
      {children}
    </a>
  );
};

const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path } = React.useContext(RouterContext);
  let match: React.ReactNode = null;
  
  React.Children.forEach(children, (child) => {
    if (match) return;
    if (React.isValidElement(child)) {
      const { path: routePath, element } = child.props as any;
      if (routePath === path || (routePath !== '/' && path.startsWith(routePath))) {
        match = element;
      }
    }
  });
  
  return <>{match}</>;
};

const Route: React.FC<{ path: string; element: React.ReactNode }> = () => null;

const INITIAL_COMPANY: Company = {
  name: "SM INTERNATIONAL",
  address: "123 Business Avenue, Dhaka, BD",
  vatNumber: "VAT-99228811",
  currency: "BDT",
  phone: "+880 1234 567890",
  email: "contact@sminternational.com",
  website: "www.sminternational.com",
  bankName: "Standard Chartered",
  accountNumber: "9988-7766-5544",
  invoiceFooter: "Thank you for your business!"
};

const INITIAL_PRINT_SETTINGS: VoucherPrintSettings = {
  showPhone: true,
  showEmail: true,
  showBankInfo: true,
  showTax: true,
  showDiscount: true,
  showSKU: true,
  showBarcode: false,
  paperSize: 'A4',
  footerNote: "This is a computer-generated invoice.",
  salesTitle: "TAX INVOICE",
  purchaseTitle: "PURCHASE VOUCHER"
};

const INITIAL_USERS: User[] = [
  { id: '1', username: 'mahin', password: '1122', role: UserRole.ADMIN, isActive: true }
];

const App: React.FC = () => {
  const [company, setCompany] = useState<Company>(INITIAL_COMPANY);
  const [printSettings, setPrintSettings] = useState<VoucherPrintSettings>(INITIAL_PRINT_SETTINGS);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [items, setItems] = useState<StockItem[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [path, setPath] = useState('/');
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    const savedVouchers = localStorage.getItem('vouchers');
    const savedLedgers = localStorage.getItem('ledgers');
    const savedItems = localStorage.getItem('items');
    const savedCompany = localStorage.getItem('companyProfile');
    const savedSettings = localStorage.getItem('printSettings');
    const savedUsers = localStorage.getItem('appUsers');

    if (savedVouchers) setVouchers(JSON.parse(savedVouchers));
    if (savedLedgers) setLedgers(JSON.parse(savedLedgers));
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedCompany) setCompany(JSON.parse(savedCompany));
    if (savedSettings) setPrintSettings(JSON.parse(savedSettings));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('appUsers', JSON.stringify(newUsers));
  };

  // Global Shortcuts for Quick Actions
  useEffect(() => {
    if (!currentUser) return;
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        navigateToNewSale();
      } else if (e.key === 'F3') {
        e.preventDefault();
        navigateToNewLedger();
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [currentUser]);

  const navigateToNewSale = () => {
    console.log("Dashboard Quick Action: New Sale clicked");
    setEditingVoucher(null); // Ensure fresh entry
    setPath('/vouchers');
  };

  const navigateToNewLedger = () => {
    console.log("Dashboard Quick Action: New Ledger clicked");
    setPath('/masters');
  };

  const addVoucher = useCallback((voucher: Voucher) => {
    setVouchers(prev => {
      const exists = prev.find(v => v.id === voucher.id);
      let updated;
      if (exists) {
        updated = prev.map(v => v.id === voucher.id ? voucher : v);
      } else {
        updated = [voucher, ...prev];
      }
      localStorage.setItem('vouchers', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleEditVoucher = (v: Voucher) => {
    setEditingVoucher(v);
    setPath('/vouchers');
  };

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} users={users} />;
  }

  return (
    <RouterContext.Provider value={{ path, setPath }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#1E293B] text-slate-300 transition-all duration-300 flex flex-col shrink-0`}>
          <div className="p-6 flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg text-white"><Command size={24} /></div>
            {isSidebarOpen && <span className="font-bold text-xl text-white tracking-tight">SM INTERNATIONAL</span>}
          </div>
          <nav className="flex-1 mt-4 px-3 space-y-1">
            {NAVIGATION.map((item) => (
              <SidebarLink key={item.name} item={item} collapsed={!isSidebarOpen} />
            ))}
          </nav>
          <div className="p-4 border-t border-slate-700">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-700 transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm shrink-0">
             <div className="flex items-center gap-4">
                <Search className="text-gray-400" size={18} />
                <input type="text" placeholder="Global Search (Alt+S)" className="bg-gray-100 rounded-full px-4 py-2 text-sm w-80 outline-none" />
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 pr-6 border-r">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">{currentUser.username}</p>
                        <p className="text-[10px] font-bold text-orange-600 uppercase">{currentUser.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold uppercase border"><UserIcon size={20} /></div>
                </div>
                <button 
                  onClick={() => setCurrentUser(null)}
                  className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all group"
                  title="Logout"
                >
                    <LogOut size={20} />
                </button>
             </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 scrollbar-hide bg-[#F8FAFC]">
            <Routes>
              <Route path="/" element={<Dashboard vouchers={vouchers} items={items} ledgers={ledgers} company={company} onNewSale={navigateToNewSale} onNewLedger={navigateToNewLedger} />} />
              <Route path="/company" element={<CompanySettings company={company} setCompany={(c) => { setCompany(c); localStorage.setItem('companyProfile', JSON.stringify(c)); }} printSettings={printSettings} setPrintSettings={(s) => { setPrintSettings(s); localStorage.setItem('printSettings', JSON.stringify(s)); }} />} />
              <Route path="/masters" element={<Masters ledgers={ledgers} setLedgers={setLedgers} />} />
              <Route path="/inventory" element={<Inventory items={items} setItems={setItems} />} />
              <Route path="/vouchers" element={<Vouchers vouchers={vouchers} addVoucher={addVoucher} ledgers={ledgers} items={items} company={company} editingVoucher={editingVoucher} clearEdit={() => setEditingVoucher(null)} />} />
              <Route path="/reports" element={<Reports vouchers={vouchers} ledgers={ledgers} items={items} company={company} onEditVoucher={handleEditVoucher} />} />
              <Route path="/backup" element={<BackupView />} />
              <Route path="/settings" element={<SettingsView company={company} setCompany={setCompany} users={users} setUsers={handleUpdateUsers} currentUser={currentUser} />} />
            </Routes>
          </main>
        </div>
      </div>
    </RouterContext.Provider>
  );
};

const SidebarLink: React.FC<{ item: any, collapsed: boolean }> = ({ item, collapsed }) => {
  const { path: currentPath } = React.useContext(RouterContext);
  const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
  return (
    <Link to={item.path} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'hover:bg-slate-700 hover:text-white'}`}>
      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
      {!collapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
    </Link>
  );
};

export default App;
