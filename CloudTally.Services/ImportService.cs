
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using CloudTally.Core.Models;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace CloudTally.Services
{
    public class ImportService
    {
        public async Task<ImportResult> ParseExcelAsync(string filePath)
        {
            return await Task.Run(() =>
            {
                var result = new ImportResult();
                try
                {
                    using var workbook = new XLWorkbook(filePath);
                    var worksheet = workbook.Worksheet(1);
                    
                    // Validate Headers
                    var firstRow = worksheet.Row(1);
                    string[] expectedHeaders = { "SKU", "Name", "Category", "Unit", "PurchasePrice", "SalePrice", "OpeningQty", "ReorderLevel", "TaxRate", "Barcode" };
                    for (int i = 0; i < expectedHeaders.Length; i++)
                    {
                        if (firstRow.Cell(i + 1).GetValue<string>() != expectedHeaders[i])
                        {
                            throw new Exception("Header mismatch. Please use the official template.");
                        }
                    }

                    var rows = worksheet.RangeUsed().RowsUsed().Skip(1);
                    foreach (var row in rows)
                    {
                        var importRow = new ImportRow { RowNumber = row.RowNumber() };
                        try {
                            importRow.SKU = row.Cell(1).GetValue<string>();
                            importRow.Name = row.Cell(2).GetValue<string>();
                            importRow.Category = row.Cell(3).GetValue<string>();
                            importRow.Unit = row.Cell(4).GetValue<string>() ?? "pcs";
                            importRow.PurchasePrice = row.Cell(5).GetValue<decimal>();
                            importRow.SalePrice = row.Cell(6).GetValue<decimal>();
                            importRow.OpeningQty = row.Cell(7).GetValue<double>();
                            importRow.ReorderLevel = row.Cell(8).GetValue<double>();
                            importRow.TaxRate = row.Cell(9).GetValue<decimal>();
                            importRow.Barcode = row.Cell(10).GetValue<string>();
                        } catch {
                            importRow.Errors.Add("Invalid data format in cell.");
                        }

                        ValidateRow(importRow);
                        result.Rows.Add(importRow);
                    }
                }
                catch (Exception ex) {
                    // Log error and provide feedback in result
                }
                return result;
            });
        }

        public async Task<ImportResult> ParsePdfAsync(string filePath)
        {
            return await Task.Run(() =>
            {
                var result = new ImportResult();
                try
                {
                    using var pdf = PdfDocument.Open(filePath);
                    foreach (var page in pdf.GetPages())
                    {
                        // Group words into lines based on Y-coordinate
                        var words = page.GetWords();
                        var lines = words.GroupBy(w => Math.Round(w.BoundingBox.Bottom, 0))
                                         .OrderByDescending(g => g.Key);

                        int rowIdx = 1;
                        foreach (var lineGroup in lines)
                        {
                            var lineWords = lineGroup.OrderBy(w => w.BoundingBox.Left).ToList();
                            
                            // Heuristic: A product row usually has SKU, Name, and Price (at least 3 words/groups)
                            if (lineWords.Count < 3) continue;

                            var row = new ImportRow { RowNumber = rowIdx++ };
                            
                            // Map SKU: First distinct block of text
                            row.SKU = lineWords[0].Text;
                            
                            // Map Name: Middle words
                            row.Name = string.Join(" ", lineWords.Skip(1).Take(lineWords.Count - 2).Select(w => w.Text));
                            
                            // Map Price: Last numeric-like value
                            var lastWord = lineWords.Last().Text.Replace(",", "");
                            if (decimal.TryParse(lastWord, out var price))
                            {
                                row.SalePrice = price;
                            }
                            else
                            {
                                row.Errors.Add("Could not detect numeric price in PDF row.");
                            }

                            ValidateRow(row);
                            result.Rows.Add(row);
                        }
                    }
                }
                catch { }
                return result;
            });
        }

        private void ValidateRow(ImportRow row)
        {
            if (string.IsNullOrWhiteSpace(row.SKU)) row.Errors.Add("SKU is required.");
            if (string.IsNullOrWhiteSpace(row.Name)) row.Errors.Add("Product Name is required.");
            if (row.PurchasePrice < 0) row.Errors.Add("Purchase Price cannot be negative.");
            if (row.SalePrice < 0) row.Errors.Add("Sale Price cannot be negative.");
            if (row.OpeningQty < 0) row.Errors.Add("Quantity cannot be negative.");
            
            // SKU length check
            if (row.SKU?.Length > 50) row.Errors.Add("SKU too long (max 50 chars).");
        }
    }
}
