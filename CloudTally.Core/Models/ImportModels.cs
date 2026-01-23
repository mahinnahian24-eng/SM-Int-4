
using System.Collections.Generic;

namespace CloudTally.Core.Models
{
    public class ImportRow
    {
        public int RowNumber { get; set; }
        public string SKU { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Unit { get; set; } = "pcs";
        public decimal PurchasePrice { get; set; }
        public decimal SalePrice { get; set; }
        public double OpeningQty { get; set; }
        public double ReorderLevel { get; set; }
        public decimal TaxRate { get; set; }
        public string Barcode { get; set; }
        
        public List<string> Errors { get; set; } = new();
        public bool IsValid => Errors.Count == 0;
        public string ErrorMessage => string.Join(", ", Errors);
    }

    public class ImportResult
    {
        public List<ImportRow> Rows { get; set; } = new();
        public int TotalRows => Rows.Count;
        public int ValidRows => Rows.FindAll(r => r.IsValid).Count;
        public int InvalidRows => Rows.FindAll(r => !r.IsValid).Count;
    }
}
