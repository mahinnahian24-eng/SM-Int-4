
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  AlertCircle, 
  Box, 
  ArrowRight,
  TrendingUp,
  History,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { StockItem } from '../types';
import BulkImportModal from './BulkImportModal';

interface InventoryProps {
  items: StockItem[];
  setItems: React.Dispatch<React.SetStateAction<StockItem[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ items, setItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [lastImportStatus, setLastImportStatus] = useState<{success: number, failed: number} | null>(null);
  
  const [newItem, setNewItem] = useState<Partial<StockItem>>({
    quantity: 0,
    unit: 'pcs',
    taxRate: 5,
    reorderLevel: 5
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.sku) return;

    const item: StockItem = {
      id: Math.random().toString(36).substr(2, 9),
      sku: newItem.sku,
      name: newItem.name,
      unit: newItem.unit || 'pcs',
      purchasePrice: Number(newItem.purchasePrice) || 0,
      salesPrice: Number(newItem.salesPrice) || 0,
      quantity: Number(newItem.quantity) || 0,
      reorderLevel: Number(newItem.reorderLevel) || 5,
      taxRate: Number(newItem.taxRate) || 0,
    };

    setItems([...items, item]);
    setIsModalOpen(false);
    setNewItem({ quantity: 0, unit: 'pcs', taxRate: 5, reorderLevel: 5 });
  };

  const handleBulkImportSuccess = (importedCount: number, failedCount: number, updatedItems: StockItem[]) => {
    setItems(updatedItems);
    setLastImportStatus({ success: importedCount, failed: failedCount });
    setTimeout(() => setLastImportStatus(null), 8000);
  };

  const downloadTemplate = () => {
    alert('Downloading SM INTERNATIONAL Template: Product_Import.xlsx');
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 font-medium">Global stock tracking for SM INTERNATIONAL.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm"
          >
            <FileSpreadsheet size={16} />
            Download Template
          </button>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 border border-orange-100 px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-100 transition-all text-sm"
          >
            <Upload size={16} />
            Bulk Add
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-600/20 active:scale-95 text-sm"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Import Status Bar */}
      {lastImportStatus && (
        <div className={`p-3 rounded-xl border flex items-center justify-between animate-in slide-in-from-top-2 ${
          lastImportStatus.failed === 0 ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {lastImportStatus.failed === 0 ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>
              Import complete: <strong>{lastImportStatus.success}</strong> items processed. 
              {lastImportStatus.failed > 0 && <span> <strong>{lastImportStatus.failed}</strong> rows had errors.</span>}
            </span>
          </div>
          <button onClick={() => setLastImportStatus(null)} className="opacity-50 hover:opacity-100"><XCircle size={18} /></button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Package size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-xl font-bold">{items.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Inventory Value</p>
            <p className="text-xl font-bold">{(items.reduce((sum, i) => sum + (i.quantity * i.purchasePrice), 0)).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Low Stock Items</p>
            <p className="text-xl font-bold">{items.filter(i => i.quantity <= i.reorderLevel).length}</p>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by SKU or Name..." 
              className="pl-10 pr-4 py-2 w-full bg-white border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            SM INTERNATIONAL STOCK CONTROL
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">SKU & Product Name</th>
                <th className="px-6 py-4 text-right">In Stock</th>
                <th className="px-6 py-4 text-right">Unit Price</th>
                <th className="px-6 py-4 text-right">Total Value</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-orange-600">{item.sku}</p>
                    <p className="text-gray-900 font-bold">{item.name}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${item.quantity <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{item.purchasePrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold">{(item.quantity * item.purchasePrice).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    {item.quantity <= item.reorderLevel ? (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase">Low Stock</span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-tight">Healthy</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 hover:bg-orange-100 rounded-lg text-orange-500" title="Stock History"><History size={16} /></button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Edit Item"><Plus size={16} className="rotate-45" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold">No products found in inventory.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <BulkImportModal 
          isOpen={isBulkModalOpen} 
          onClose={() => setIsBulkModalOpen(false)}
          existingItems={items}
          onImportSuccess={handleBulkImportSuccess}
        />
      )}

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg">Add Stock Item</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><Plus size={24} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleAddItem} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">SKU / Item Code</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newItem.sku || ''}
                    onChange={e => setNewItem({...newItem, sku: e.target.value})}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newItem.name || ''}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Purchase Price</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newItem.purchasePrice || 0}
                    onChange={e => setNewItem({...newItem, purchasePrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Selling Price</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newItem.salesPrice || 0}
                    onChange={e => setNewItem({...newItem, salesPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Opening Stock</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newItem.quantity || 0}
                    onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reorder Level</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newItem.reorderLevel || 5}
                    onChange={e => setNewItem({...newItem, reorderLevel: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 shadow-lg">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
