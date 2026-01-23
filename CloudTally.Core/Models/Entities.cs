
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CloudTally.Core.Models
{
    public enum AccountGroup { Asset, Liability, Equity, Revenue, Expense }
    public enum LedgerType { Cash, Bank, Customer, Supplier, Sales, Purchase, Expense, Tax }
    public enum VoucherType { Sales, Purchase, Receipt, Payment, Journal }
    public enum UserRole { Admin, Accountant, Sales, Viewer }

    public class MessageHistory
    {
        public int Id { get; set; }
        public int LedgerId { get; set; }
        public string Channel { get; set; } = "SMS";
        public string Phone { get; set; }
        public string MessageText { get; set; }
        public string Status { get; set; } // Sent, Failed
        public string ProviderMessageId { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime SentAt { get; set; } = DateTime.Now;
    }

    public class CompanyProfile
    {
        [Key] public int Id { get; set; } = 1;
        [Required] public string Name { get; set; }
        public string Address { get; set; }
        public string VatNumber { get; set; }
        public string Currency { get; set; } = "BDT";
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string InvoiceHeaderText { get; set; }
        public string InvoiceFooterText { get; set; }
        
        // SMS Gateway Config
        public string TwilioSid { get; set; }
        public string TwilioTokenEncrypted { get; set; }
        public string TwilioFromNumber { get; set; }
        
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
    
    // ... Rest of entities remain unchanged
    public class VoucherPrintSettings
    {
        [Key] public int Id { get; set; } = 1;
        public bool ShowPhone { get; set; } = true;
        public bool ShowEmail { get; set; } = true;
        public bool ShowBankInfo { get; set; } = true;
        public bool ShowTax { get; set; } = true;
        public bool ShowDiscount { get; set; } = true;
        public bool ShowSKU { get; set; } = true;
        public bool ShowBarcode { get; set; } = false;
        public string PaperSize { get; set; } = "A4";
        public string FooterNote { get; set; } = "This is a computer-generated invoice.";
        public string SalesTitle { get; set; } = "TAX INVOICE";
        public string PurchaseTitle { get; set; } = "PURCHASE VOUCHER";
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }

    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class Ledger
    {
        public int Id { get; set; }
        [Required] public string Name { get; set; }
        public LedgerType Type { get; set; }
        public AccountGroup Group { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal CurrentBalance { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public string TaxId { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class StockItem
    {
        public int Id { get; set; }
        [Required] public string SKU { get; set; }
        [Required] public string Name { get; set; }
        public string Category { get; set; }
        public string Barcode { get; set; }
        public string Unit { get; set; } = "pcs";
        public decimal PurchasePrice { get; set; }
        public decimal SalesPrice { get; set; }
        public double Quantity { get; set; }
        public double ReorderLevel { get; set; }
        public decimal TaxRate { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        
        public string Status => (Quantity <= ReorderLevel && ReorderLevel > 0) ? "LOW" : "OK";
    }

    public class Voucher
    {
        public int Id { get; set; }
        public string VoucherNumber { get; set; }
        public DateTime Date { get; set; }
        public VoucherType Type { get; set; }
        public string Reference { get; set; }
        public string Narration { get; set; }
        public decimal TotalAmount { get; set; }
        public int? LedgerId { get; set; }
        public Ledger Ledger { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<VoucherItem> Items { get; set; } = new();
        public List<LedgerEntry> LedgerEntries { get; set; } = new();
    }

    public class VoucherItem
    {
        public int Id { get; set; }
        public int VoucherId { get; set; }
        public int StockItemId { get; set; }
        public StockItem StockItem { get; set; }
        public double Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
    }

    public class LedgerEntry
    {
        public int Id { get; set; }
        public int LedgerId { get; set; }
        public Ledger Ledger { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
    }
}
