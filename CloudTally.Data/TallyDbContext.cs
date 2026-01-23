
using Microsoft.EntityFrameworkCore;
using CloudTally.Core.Models;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CloudTally.Data
{
    public class TallyDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Ledger> Ledgers { get; set; }
        public DbSet<StockItem> StockItems { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<VoucherItem> VoucherItems { get; set; }
        public DbSet<LedgerEntry> LedgerEntries { get; set; }
        public DbSet<MessageHistory> MessageHistories { get; set; }
        
        // Backup Tables
        public DbSet<BackupSettings> BackupSettings { get; set; }
        public DbSet<BackupLog> BackupLogs { get; set; }

        // Configuration Tables
        public DbSet<CompanyProfile> CompanyProfiles { get; set; }
        public DbSet<VoucherPrintSettings> VoucherPrintSettings { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            options.UseSqlite("Data Source=cloudtally.db");
            options.AddInterceptors(new BackupInterceptor());
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Voucher>().HasIndex(v => v.VoucherNumber).IsUnique();
            modelBuilder.Entity<StockItem>().HasIndex(s => s.SKU).IsUnique();
            
            modelBuilder.Entity<BackupSettings>().HasData(new BackupSettings { Id = 1 });

            modelBuilder.Entity<CompanyProfile>().HasData(new CompanyProfile { 
                Id = 1, 
                Name = "SM INTERNATIONAL", 
                Currency = "BDT",
                Address = "123 Business Avenue, Dhaka, BD"
            });

            modelBuilder.Entity<VoucherPrintSettings>().HasData(new VoucherPrintSettings { 
                Id = 1,
                PaperSize = "A4",
                SalesTitle = "TAX INVOICE",
                PurchaseTitle = "PURCHASE VOUCHER"
            });

            modelBuilder.Entity<User>().HasData(new User 
            { 
                Id = 1, 
                Username = "admin", 
                PasswordHash = "admin123",
                Role = UserRole.Admin 
            });
        }
    }
    
    // ... BackupInterceptor remains unchanged
    public class BackupInterceptor : SaveChangesInterceptor
    {
        private static DateTime _lastBackupAttempt = DateTime.MinValue;

        public override async ValueTask<int> SavedChangesAsync(SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
        {
            _ = Task.Run(() => TriggerAutoBackup(eventData.Context as TallyDbContext));
            return await base.SavedChangesAsync(eventData, result, cancellationToken);
        }

        private async Task TriggerAutoBackup(TallyDbContext context)
        {
            if (context == null) return;
            try
            {
                using var db = new TallyDbContext();
                var settings = await db.BackupSettings.FirstOrDefaultAsync();
                if (settings == null || !settings.AutoBackupEnabled) return;
                if ((DateTime.Now - _lastBackupAttempt).TotalMinutes < settings.CooldownMinutes)
                    return;
                _lastBackupAttempt = DateTime.Now;
            }
            catch { }
        }
    }
}
