
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

namespace CloudTally.App.ViewModels
{
    public class ImportViewModel : BaseViewModel
    {
        private readonly ImportService _importService = new();
        private readonly TemplateGenerator _templateGenerator = new();
        private readonly TallyDbContext _db = new();

        public ObservableCollection<ImportRow> PreviewRows { get; } = new();
        
        // Settings
        private bool _upsertMode = true;
        public bool UpsertMode { get => _upsertMode; set { _upsertMode = value; OnPropertyChanged(); } }

        private bool _createCategoryIfMissing = true;
        public bool CreateCategoryIfMissing { get => _createCategoryIfMissing; set { _createCategoryIfMissing = value; OnPropertyChanged(); } }

        private string _statusText = "Ready";
        public string StatusText { get => _statusText; set { _statusText = value; OnPropertyChanged(); } }

        public int ValidCount => PreviewRows.Count(r => r.IsValid);
        public int InvalidCount => PreviewRows.Count(r => !r.IsValid);

        public IAsyncRelayCommand ImportExcelCommand { get; }
        public IAsyncRelayCommand ImportPdfCommand { get; }
        public IAsyncRelayCommand DownloadTemplateCommand { get; }
        public IAsyncRelayCommand SaveCommand { get; }

        public ImportViewModel()
        {
            ImportExcelCommand = new AsyncRelayCommand(OnImportExcel);
            ImportPdfCommand = new AsyncRelayCommand(OnImportPdf);
            DownloadTemplateCommand = new AsyncRelayCommand(OnDownloadTemplate);
            SaveCommand = new AsyncRelayCommand(OnSave, () => PreviewRows.Any(r => r.IsValid));
            
            PreviewRows.CollectionChanged += (s, e) => {
                OnPropertyChanged(nameof(ValidCount));
                OnPropertyChanged(nameof(InvalidCount));
                SaveCommand.NotifyCanExecuteChanged();
            };
        }

        private async Task OnImportExcel()
        {
            var dialog = new OpenFileDialog { Filter = "Excel Files|*.xlsx" };
            if (dialog.ShowDialog() == true)
            {
                IsBusy = true;
                StatusText = "Reading Excel...";
                var result = await _importService.ParseExcelAsync(dialog.FileName);
                UpdatePreview(result);
                IsBusy = false;
            }
        }

        private async Task OnImportPdf()
        {
            var dialog = new OpenFileDialog { Filter = "PDF Files|*.pdf" };
            if (dialog.ShowDialog() == true)
            {
                IsBusy = true;
                StatusText = "Extracting PDF Tables...";
                var result = await _importService.ParsePdfAsync(dialog.FileName);
                UpdatePreview(result);
                IsBusy = false;
            }
        }

        private void UpdatePreview(ImportResult result)
        {
            PreviewRows.Clear();
            foreach (var row in result.Rows) PreviewRows.Add(row);
            StatusText = $"Loaded {result.TotalRows} items.";
        }

        private async Task OnDownloadTemplate()
        {
            var dialog = new SaveFileDialog { Filter = "Excel File|*.xlsx", FileName = "CloudTally_Product_Template.xlsx" };
            if (dialog.ShowDialog() == true)
            {
                _templateGenerator.CreateProductTemplate(dialog.FileName);
                MessageBox.Show("Template downloaded successfully.");
            }
        }

        private async Task OnSave()
        {
            IsBusy = true;
            StatusText = "Saving items...";
            try
            {
                int processedCount = 0;
                foreach (var row in PreviewRows.Where(r => r.IsValid))
                {
                    var existing = _db.StockItems.FirstOrDefault(s => s.SKU == row.SKU);
                    if (existing != null)
                    {
                        if (UpsertMode)
                        {
                            existing.Name = row.Name;
                            existing.Category = row.Category;
                            existing.SalesPrice = row.SalePrice;
                            existing.PurchasePrice = row.PurchasePrice;
                            existing.Quantity = row.OpeningQty;
                            existing.Barcode = row.Barcode;
                            existing.UpdatedAt = DateTime.Now;
                            processedCount++;
                        }
                    }
                    else
                    {
                        _db.StockItems.Add(new StockItem
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
                        });
                        processedCount++;
                    }
                }
                await _db.SaveChangesAsync();
                MessageBox.Show($"Processed {processedCount} items successfully.");
                PreviewRows.Clear();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error saving items: {ex.Message}");
            }
            finally
            {
                IsBusy = false;
                StatusText = "Ready";
            }
        }
    }
}
