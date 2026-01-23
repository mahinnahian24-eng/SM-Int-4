
export enum AccountGroup {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense'
}

export enum LedgerType {
  CASH = 'Cash',
  BANK = 'Bank',
  CUSTOMER = 'Customer',
  SUPPLIER = 'Supplier',
  SALES = 'Sales',
  PURCHASE = 'Purchase',
  EXPENSE = 'Expense',
  TAX = 'Tax'
}

export interface Ledger {
  id: string;
  name: string;
  type: LedgerType;
  group: AccountGroup;
  openingBalance: number;
  currentBalance: number;
  phone?: string;
  email?: string;
}

export interface MessageHistory {
  id: string;
  ledgerId: string;
  channel: 'SMS' | 'WhatsApp';
  phone: string;
  messageText: string;
  status: 'Sent' | 'Failed' | 'Pending';
  sentAt: string;
  errorMessage?: string;
}

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  purchasePrice: number;
  salesPrice: number;
  quantity: number;
  reorderLevel: number;
  taxRate: number;
}

export enum VoucherType {
  SALES = 'Sales',
  PURCHASE = 'Purchase',
  RECEIPT = 'Receipt',
  PAYMENT = 'Payment',
  JOURNAL = 'Journal'
}

export interface VoucherItem {
  itemId: string;
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
  discount?: number;
  taxAmount?: number;
}

export interface LedgerEntry {
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
}

export interface Voucher {
  id: string;
  number: string;
  date: string;
  type: VoucherType;
  reference: string;
  narration: string;
  items?: VoucherItem[];
  ledgerEntries: LedgerEntry[];
  totalAmount: number;
}

export interface Company {
  name: string;
  address: string;
  vatNumber: string;
  currency: string;
  phone?: string;
  email?: string;
  website?: string;
  bankName?: string;
  accountNumber?: string;
  invoiceHeader?: string;
  invoiceFooter?: string;
  twilioSid?: string;
  twilioToken?: string;
  twilioFrom?: string;
}

export interface VoucherPrintSettings {
  showPhone: boolean;
  showEmail: boolean;
  showBankInfo: boolean;
  showTax: boolean;
  showDiscount: boolean;
  showSKU: boolean;
  showBarcode: boolean;
  paperSize: 'A4' | 'A5' | 'POS80';
  footerNote: string;
  salesTitle: string;
  purchaseTitle: string;
}
