
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using CloudTally.Core.Models;
using CloudTally.Data;
using CloudTally.Services;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Win32;
using System.IO;
using Microsoft.EntityFrameworkCore;

namespace CloudTally.App.ViewModels
{
    public class BulkImportViewModel : BaseViewModel
    {
        private readonly ImportService _importService = new();
        private readonly TallyDbContext _db = new();

        public ObservableCollection<ImportRow> PreviewRows { get; } = new();
        public Action RequestClose { get; set; }

        private bool _upsertMode = true;
        public bool UpsertMode { get => _upsertMode; set { _upsertMode = value; OnPropertyChanged(); } }

        private string _statusText = "Ready";
        public string StatusText { get => _statusText; set { _statusText = value; OnPropertyChanged(); } }

        public IAsyncRelayCommand ImportExcelCommand { get; }
        public IAsyncRelayCommand SaveCommand { get; }

        public BulkImportViewModel()
        {
            ImportExcelCommand = new AsyncRelayCommand(OnImportExcel);
            SaveCommand = new AsyncRelayCommand(OnSave, () => PreviewRows.Any(r => r.IsValid));
            PreviewRows.CollectionChanged += (s, e) => SaveCommand.NotifyCanExecuteChanged();
        }

        private async Task OnImportExcel()
        {
            var dialog = new OpenFileDialog { Filter = "Excel Files|*.xlsx" };
            if (dialog.ShowDialog() == true)
            {
                IsBusy = true;
                StatusText = "Reading Excel file...";
                var result = await _importService.ParseExcelAsync(dialog.FileName);
                PreviewRows.Clear();
                foreach (var row in result.Rows) PreviewRows.Add(row);
                IsBusy = false;
            }
        }

        private async Task OnSave()
        {
            IsBusy = true;
            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                int processed = 0;
                foreach (var row in PreviewRows.Where(r => r.IsValid))
                {
                    var existing = await _db.StockItems.FirstOrDefaultAsync(s => s.SKU == row.SKU);
                    if (existing != null)
                    {
                        if (UpsertMode)
                        {
                            existing.Name = row.Name;
                            existing.Category = row.Category;
                            existing.SalesPrice = row.SalePrice;
                            existing.PurchasePrice = row.PurchasePrice;
                            existing.Quantity = row.OpeningQty;
                            existing.UpdatedAt = DateTime.Now;
                            processed++;
                        }
                    }
                    else
                    {
                        var newItem = new StockItem
                        {
                            SKU = row.SKU,
                            Name = row.Name,
                            Category = row.Category,
                            Unit = row.Unit,
                            PurchasePrice = row.PurchasePrice,
                            SalesPrice = row.SalePrice,
                            Quantity = row.OpeningQty,
                            ReorderLevel = row.ReorderLevel,
                            Barcode = row.Barcode,
                            UpdatedAt = DateTime.Now
                        };
                        _db.StockItems.Add(newItem);
                        processed++;
                    }
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                
                MessageBox.Show($"Successfully processed {processed} products.");
                RequestClose?.Invoke();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                MessageBox.Show($"Import failed: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
