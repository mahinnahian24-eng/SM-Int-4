
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using CloudTally.Core.Models;
using CloudTally.Data;
using CommunityToolkit.Mvvm.Input;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using ClosedXML.Excel;
using System.Windows;

namespace CloudTally.App.ViewModels
{
    public class InventorySummaryViewModel : BaseViewModel
    {
        private readonly TallyDbContext _db = new();
        private List<StockItem> _allData = new();

        public ObservableCollection<StockItem> FilteredItems { get; } = new();
        
        private string _searchText;
        public string SearchText { get => _searchText; set { _searchText = value; OnPropertyChanged(); ApplyFilter(); } }

        private bool _lowStockOnly;
        public bool LowStockOnly { get => _lowStockOnly; set { _lowStockOnly = value; OnPropertyChanged(); ApplyFilter(); } }

        private decimal _totalValue;
        public decimal TotalValue { get => _totalValue; set { _totalValue = value; OnPropertyChanged(); } }

        private double _totalQty;
        public double TotalQty { get => _totalQty; set { _totalQty = value; OnPropertyChanged(); } }

        private int _lowStockCount;
        public int LowStockCount { get => _lowStockCount; set { _lowStockCount = value; OnPropertyChanged(); } }

        public IAsyncRelayCommand RefreshCommand { get; }
        public IRelayCommand ExportExcelCommand { get; }
        public IRelayCommand BulkAddCommand { get; }
        public IRelayCommand DownloadTemplateCommand { get; }

        public InventorySummaryViewModel()
        {
            RefreshCommand = new AsyncRelayCommand(RefreshDataAsync);
            ExportExcelCommand = new RelayCommand(OnExportExcel);
            BulkAddCommand = new RelayCommand(OnBulkAdd);
            DownloadTemplateCommand = new RelayCommand(OnDownloadTemplate);
            _ = RefreshDataAsync();
        }

        public async Task RefreshDataAsync()
        {
            IsBusy = true;
            _allData = await _db.StockItems.ToListAsync();
            
            TotalQty = _allData.Sum(x => x.Quantity);
            TotalValue = _allData.Sum(x => (decimal)x.Quantity * x.PurchasePrice);
            LowStockCount = _allData.Count(x => x.Quantity <= x.ReorderLevel && x.ReorderLevel > 0);

            ApplyFilter();
            IsBusy = false;
        }

        private void ApplyFilter()
        {
            var query = _allData.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(SearchText))
                query = query.Where(x => x.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase) || x.SKU.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
            
            if (LowStockOnly)
                query = query.Where(x => x.Quantity <= x.ReorderLevel && x.ReorderLevel > 0);

            FilteredItems.Clear();
            foreach (var item in query) FilteredItems.Add(item);
        }

        private void OnBulkAdd()
        {
            // Note: In a real WPF app, you would use a Window Service or open the dialog here.
            // Assuming we instantiate the dialog:
            // var dialog = new Views.BulkImportDialog();
            // if (dialog.ShowDialog() == true) { _ = RefreshDataAsync(); }
            MessageBox.Show("Opening Bulk Import Wizard...");
        }

        private void OnDownloadTemplate()
        {
            var dialog = new SaveFileDialog { Filter = "Excel File|*.xlsx", FileName = "Product_Import_Template.xlsx" };
            if (dialog.ShowDialog() == true)
            {
                var generator = new CloudTally.Services.TemplateGenerator();
                generator.CreateProductTemplate(dialog.FileName);
                MessageBox.Show("Template saved successfully.");
            }
        }

        private void OnExportExcel()
        {
            var dialog = new SaveFileDialog { Filter = "Excel File|*.xlsx", FileName = "Inventory_Summary.xlsx" };
            if (dialog.ShowDialog() == true)
            {
                using var workbook = new XLWorkbook();
                var ws = workbook.Worksheets.Add("Summary");
                ws.Cell(1, 1).InsertTable(FilteredItems.Select(x => new { x.SKU, x.Name, x.Category, x.Quantity, x.PurchasePrice, x.SalesPrice, x.Status }));
                ws.Columns().AdjustToContents();
                workbook.SaveAs(dialog.FileName);
            }
        }
    }
}
