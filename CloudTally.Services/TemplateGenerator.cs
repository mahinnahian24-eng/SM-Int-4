
using System;
using ClosedXML.Excel;

namespace CloudTally.Services
{
    public class TemplateGenerator
    {
        public void CreateProductTemplate(string filePath)
        {
            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("Product Import");

            // Headers
            string[] headers = { "SKU", "Name", "Category", "Unit", "PurchasePrice", "SalePrice", "OpeningQty", "ReorderLevel", "TaxRate", "Barcode" };
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = ws.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            // Sample Row
            ws.Cell(2, 1).Value = "PROD-001";
            ws.Cell(2, 2).Value = "Sample Product";
            ws.Cell(2, 3).Value = "General";
            ws.Cell(2, 4).Value = "pcs";
            ws.Cell(2, 5).Value = 100.00;
            ws.Cell(2, 6).Value = 150.00;
            ws.Cell(2, 7).Value = 10;
            ws.Cell(2, 8).Value = 5;
            ws.Cell(2, 9).Value = 5;
            ws.Cell(2, 10).Value = "123456789";

            ws.Columns().AdjustToContents();
            workbook.SaveAs(filePath);
        }
    }
}
