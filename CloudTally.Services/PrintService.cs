
using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;
using CloudTally.Core.Models;
using CloudTally.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace CloudTally.Services
{
    public class PrintService
    {
        public List<string> GetInstalledPrinters()
        {
            return PrinterSettings.InstalledPrinters.Cast<string>().ToList();
        }

        public async Task PrintVoucherAsync(Voucher voucher, string printerName = null)
        {
            try
            {
                Log.Information("Initializing print for Voucher: {Num}", voucher.VoucherNumber);
                
                using var db = new TallyDbContext();
                var profile = await db.CompanyProfiles.FirstOrDefaultAsync() ?? new CompanyProfile { Name = "CloudTally Co." };
                var settings = await db.VoucherPrintSettings.FirstOrDefaultAsync() ?? new VoucherPrintSettings();

                PrintDialog printDialog = new PrintDialog();
                
                if (printDialog.ShowDialog() == true)
                {
                    FlowDocument doc = CreateVoucherDocument(voucher, profile, settings);
                    
                    // Paper Size Logic
                    if (settings.PaperSize == "A5") {
                        doc.PageWidth = 559; // Roughly 148mm in points
                        doc.PageHeight = 794; // Roughly 210mm
                    } else if (settings.PaperSize == "POS80") {
                        doc.PageWidth = 226; // Roughly 80mm
                        doc.PagePadding = new Thickness(10);
                    } else {
                        doc.PagePadding = new Thickness(50);
                        doc.ColumnWidth = printDialog.PrintableAreaWidth;
                    }
                    
                    IDocumentPaginatorSource idp = doc;
                    printDialog.PrintDocument(idp.DocumentPaginator, $"CloudTally_{voucher.VoucherNumber}");
                    
                    Log.Information("Print job sent successfully for {Num}", voucher.VoucherNumber);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Hardware printing error for {Num}", voucher.VoucherNumber);
                MessageBox.Show("Could not complete print: " + ex.Message, "Printer Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private FlowDocument CreateVoucherDocument(Voucher voucher, CompanyProfile profile, VoucherPrintSettings settings)
        {
            FlowDocument doc = new FlowDocument { FontFamily = new FontFamily("Segoe UI") };
            
            // 1. Header (Dynamic from Profile)
            Section header = new Section();
            Paragraph companyName = new Paragraph(new Run(profile.Name.ToUpper())) { FontSize = 22, FontWeight = FontWeights.Bold };
            header.Blocks.Add(companyName);

            Paragraph contactInfo = new Paragraph();
            contactInfo.FontSize = 10;
            contactInfo.Foreground = Brushes.Gray;
            contactInfo.Inlines.Add(new Run(profile.Address + "\n"));
            if (settings.ShowPhone) contactInfo.Inlines.Add(new Run($"Tel: {profile.Phone}  "));
            if (settings.ShowEmail) contactInfo.Inlines.Add(new Run($"Email: {profile.Email}"));
            header.Blocks.Add(contactInfo);
            doc.Blocks.Add(header);

            // 2. Invoice Title (Dynamic from Settings)
            string titleText = voucher.Type == VoucherType.Sales ? settings.SalesTitle : settings.PurchaseTitle;
            Paragraph title = new Paragraph(new Run(titleText)) 
            { 
                TextAlignment = TextAlignment.Center, 
                FontSize = 18, 
                FontWeight = FontWeights.Black,
                Margin = new Thickness(0, 20, 0, 10)
            };
            doc.Blocks.Add(title);

            Paragraph info = new Paragraph();
            info.Inlines.Add(new Bold(new Run("Voucher No: "))); info.Inlines.Add(voucher.VoucherNumber + "\t\t");
            info.Inlines.Add(new Bold(new Run("Date: "))); info.Inlines.Add(voucher.Date.ToString("dd-MMM-yyyy") + "\n");
            doc.Blocks.Add(info);

            // 3. Line Items Table (Conditional Columns)
            Table table = new Table { CellSpacing = 0, BorderBrush = Brushes.Black, BorderThickness = new Thickness(0, 0, 0, 1) };
            if (settings.ShowSKU) table.Columns.Add(new TableColumn { Width = new GridLength(80) });
            table.Columns.Add(new TableColumn { Width = new GridLength(1, GridUnitType.Star) }); // Name
            table.Columns.Add(new TableColumn { Width = new GridLength(60) });  // Qty
            table.Columns.Add(new TableColumn { Width = new GridLength(100) }); // Rate
            table.Columns.Add(new TableColumn { Width = new GridLength(100) }); // Total

            TableRowGroup group = new TableRowGroup();
            TableRow hRow = new TableRow { Background = Brushes.GhostWhite, FontWeight = FontWeights.Bold };
            if (settings.ShowSKU) hRow.Cells.Add(new TableCell(new Paragraph(new Run("SKU"))));
            hRow.Cells.Add(new TableCell(new Paragraph(new Run("Description"))));
            hRow.Cells.Add(new TableCell(new Paragraph(new Run("Qty"))));
            hRow.Cells.Add(new TableCell(new Paragraph(new Run("Rate"))));
            hRow.Cells.Add(new TableCell(new Paragraph(new Run("Amount"))));
            group.Rows.Add(hRow);

            foreach (var item in voucher.Items)
            {
                TableRow row = new TableRow();
                if (settings.ShowSKU) row.Cells.Add(new TableCell(new Paragraph(new Run(item.StockItem?.SKU))));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.StockItem?.Name))));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Quantity.ToString()))));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Rate.ToString("N2")))));
                row.Cells.Add(new TableCell(new Paragraph(new Run(item.Total.ToString("N2")))));
                group.Rows.Add(row);
            }
            table.RowGroups.Add(group);
            doc.Blocks.Add(table);

            // 4. Totals & Footer
            Paragraph footer = new Paragraph(new Run($"Grand Total: {voucher.TotalAmount:N2}"))
            {
                FontSize = 16,
                FontWeight = FontWeights.Bold,
                TextAlignment = TextAlignment.Right,
                Margin = new Thickness(0, 30, 0, 0)
            };
            doc.Blocks.Add(footer);

            if (settings.ShowBankInfo && !string.IsNullOrEmpty(profile.BankName)) {
                Paragraph bank = new Paragraph();
                bank.Margin = new Thickness(0, 20, 0, 0);
                bank.Inlines.Add(new Bold(new Run("Bank: "))); bank.Inlines.Add(profile.BankName + "\n");
                bank.Inlines.Add(new Bold(new Run("A/C: "))); bank.Inlines.Add(profile.AccountNumber);
                doc.Blocks.Add(bank);
            }

            Paragraph note = new Paragraph(new Run(settings.FooterNote)) { 
                FontSize = 9, 
                FontStyle = FontStyles.Italic, 
                TextAlignment = TextAlignment.Center,
                Margin = new Thickness(0, 40, 0, 0)
            };
            doc.Blocks.Add(note);

            return doc;
        }
    }
}
