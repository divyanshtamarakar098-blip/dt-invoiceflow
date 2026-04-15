export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  notes: string;
}

export const getInvoiceTotal = (items: InvoiceItem[]) =>
  items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
