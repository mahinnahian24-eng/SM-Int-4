
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using CloudTally.Core.Models;
using CloudTally.Data;
using Microsoft.EntityFrameworkCore;

namespace CloudTally.App.ViewModels
{
    public class SalesViewModel : BaseViewModel
    {
        private readonly TallyDbContext _db;
        
        public ObservableCollection<StockItem> SearchResults { get; set; } = new();
        public ObservableCollection<VoucherItem> LineItems { get; set; } = new();
        public ObservableCollection<Ledger> Customers { get; set; } = new();
        
        private Ledger _selectedCustomer;
        public Ledger SelectedCustomer
        {
            get => _selectedCustomer;
            set { _selectedCustomer = value; OnPropertyChanged(); }
        }

        private string _searchQuery;
        public string SearchQuery
        {
            get => _searchQuery;
            set { _searchQuery = value; OnPropertyChanged(); _ = SearchProductsAsync(); }
        }

        public decimal GrandTotal => LineItems.Sum(x => x.Total);

        public SalesViewModel()
        {
            _db = new TallyDbContext();
            _ = LoadCustomersAsync();
            LineItems.CollectionChanged += (s, e) => OnPropertyChanged(nameof(GrandTotal));
        }

        private async Task LoadCustomersAsync()
        {
            var data = await _db.Ledgers.Where(x => x.Type == LedgerType.Customer).ToListAsync();
            Customers.Clear();
            foreach (var c in data) Customers.Add(c);
        }

        private async Task SearchProductsAsync()
        {
            if (string.IsNullOrWhiteSpace(SearchQuery)) { SearchResults.Clear(); return; }
            var results = await _db.StockItems
                .Where(x => x.Name.ToLower().Contains(SearchQuery.ToLower()) || x.SKU.ToLower().Contains(SearchQuery.ToLower()))
                .Take(10)
                .ToListAsync();
            
            SearchResults.Clear();
            foreach (var item in results) SearchResults.Add(item);
        }

        public void AddToCart(StockItem item)
        {
            if (item == null) return;
            
            var existing = LineItems.FirstOrDefault(x => x.StockItemId == item.Id);
            if (existing != null)
            {
                existing.Quantity++;
                existing.Total = (decimal)existing.Quantity * existing.Rate;
            }
            else
            {
                LineItems.Add(new VoucherItem 
                { 
                    StockItemId = item.Id, 
                    StockItem = item,
                    Quantity = 1, 
                    Rate = item.SalesPrice,
                    Total = item.SalesPrice 
                });
            }
            OnPropertyChanged(nameof(GrandTotal));
        }

        public async Task PostSalesVoucherAsync()
        {
            if (SelectedCustomer == null) { MessageBox.Show("Please select a customer."); return; }
            if (!LineItems.Any()) { MessageBox.Show("Voucher is empty."); return; }

            IsBusy = true;
            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                // Generate sequential voucher number
                var count = await _db.Vouchers.CountAsync(v => v.Type == VoucherType.Sales);
                string vNum = $"SAL-{(count + 1):D5}";

                var voucher = new Voucher
                {
                    VoucherNumber = vNum,
                    Type = VoucherType.Sales,
                    Date = DateTime.Now,
                    LedgerId = SelectedCustomer.Id,
                    TotalAmount = GrandTotal,
                    Narration = $"Sale to {SelectedCustomer.Name}",
                    CreatedBy = "Admin" // Replace with Session User
                };

                foreach (var line in LineItems)
                {
                    // Re-fetch to avoid tracking issues
                    var stock = await _db.StockItems.FindAsync(line.StockItemId);
                    if (stock == null) throw new Exception("Product no longer exists.");
                    
                    if (stock.Quantity < line.Quantity)
                        throw new Exception($"Insufficient stock for {stock.Name}. Available: {stock.Quantity}");

                    stock.Quantity -= line.Quantity;
                    stock.UpdatedAt = DateTime.Now;
                    
                    voucher.Items.Add(new VoucherItem
                    {
                        StockItemId = line.StockItemId,
                        Quantity = line.Quantity,
                        Rate = line.Rate,
                        Total = line.Total
                    });
                }

                // Double Entry Posting
                // Dr Customer, Cr Sales Account (Assume Id 3 is Sales as per seed)
                voucher.LedgerEntries.Add(new LedgerEntry { LedgerId = SelectedCustomer.Id, Debit = GrandTotal });
                voucher.LedgerEntries.Add(new LedgerEntry { LedgerId = 3, Credit = GrandTotal });

                _db.Vouchers.Add(voucher);
                
                // Update Ledger Balances
                SelectedCustomer.CurrentBalance += GrandTotal;

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                
                MessageBox.Show($"Voucher {vNum} Posted Successfully.");
                LineItems.Clear();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                MessageBox.Show($"Error posting voucher: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
