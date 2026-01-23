
using System;
using System.Linq;
using System.Threading.Tasks;
using CloudTally.Core.Models;
using CloudTally.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace CloudTally.App.ViewModels
{
    public class VoucherEditService
    {
        private readonly TallyDbContext _db;

        public VoucherEditService(TallyDbContext db)
        {
            _db = db;
        }

        public async Task<bool> RevertVoucherPostingsAsync(int voucherId)
        {
            try
            {
                var voucher = await _db.Vouchers
                    .Include(v => v.Items)
                    .Include(v => v.LedgerEntries)
                    .FirstOrDefaultAsync(v => v.Id == voucherId);

                if (voucher == null) return false;

                Log.Information("Reverting postings for Voucher {Num}", voucher.VoucherNumber);

                // 1. Reverse Stock
                foreach (var item in voucher.Items)
                {
                    var stock = await _db.StockItems.FindAsync(item.StockItemId);
                    if (stock != null)
                    {
                        if (voucher.Type == VoucherType.Sales)
                            stock.Quantity += item.Quantity; // Add back sold stock
                        else if (voucher.Type == VoucherType.Purchase)
                            stock.Quantity -= item.Quantity; // Remove purchased stock
                    }
                }

                // 2. Reverse Ledger Balances
                foreach (var entry in voucher.LedgerEntries)
                {
                    var ledger = await _db.Ledgers.FindAsync(entry.LedgerId);
                    if (ledger != null)
                    {
                        ledger.CurrentBalance -= entry.Debit;
                        ledger.CurrentBalance += entry.Credit;
                    }
                }

                // 3. Remove existing lines/entries (Cascade will handle if configured, but explicit is safer)
                _db.VoucherItems.RemoveRange(voucher.Items);
                _db.LedgerEntries.RemoveRange(voucher.LedgerEntries);

                await _db.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Revert failed for Voucher {Id}", voucherId);
                return false;
            }
        }
    }
}
