import React, { createContext, useContext, useState, useCallback } from 'react';
import { Invoice, InvoiceStatus } from '@/types/invoice';

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  updateStatus: (id: string, status: InvoiceStatus) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const STORAGE_KEY = 'invoices_data';

const loadInvoices = (): Invoice[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : sampleInvoices;
  } catch {
    return sampleInvoices;
  }
};

const sampleInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    clientName: 'Acme Corp',
    clientPhone: '+1234567890',
    clientEmail: 'billing@acme.com',
    items: [
      { id: '1', description: 'Web Development', quantity: 40, rate: 100 },
      { id: '2', description: 'UI Design', quantity: 20, rate: 80 },
    ],
    status: 'paid',
    dueDate: '2025-04-01',
    createdAt: '2025-03-15',
    notes: '',
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    clientName: 'TechStart Inc',
    clientPhone: '+1987654321',
    clientEmail: 'pay@techstart.io',
    items: [
      { id: '1', description: 'API Integration', quantity: 25, rate: 120 },
    ],
    status: 'pending',
    dueDate: '2025-04-20',
    createdAt: '2025-04-01',
    notes: 'Net 30',
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    clientName: 'Green Solutions',
    clientPhone: '+1122334455',
    clientEmail: 'finance@green.co',
    items: [
      { id: '1', description: 'Consulting', quantity: 10, rate: 150 },
      { id: '2', description: 'Report Writing', quantity: 5, rate: 90 },
    ],
    status: 'overdue',
    dueDate: '2025-03-10',
    createdAt: '2025-02-20',
    notes: 'Follow up required',
  },
];

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(loadInvoices);

  const persist = useCallback((inv: Invoice[]) => {
    setInvoices(inv);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
  }, []);

  const addInvoice = useCallback((invoice: Invoice) => {
    persist([...invoices, invoice]);
  }, [invoices, persist]);

  const updateInvoice = useCallback((invoice: Invoice) => {
    persist(invoices.map(i => (i.id === invoice.id ? invoice : i)));
  }, [invoices, persist]);

  const deleteInvoice = useCallback((id: string) => {
    persist(invoices.filter(i => i.id !== id));
  }, [invoices, persist]);

  const updateStatus = useCallback((id: string, status: InvoiceStatus) => {
    persist(invoices.map(i => (i.id === id ? { ...i, status } : i)));
  }, [invoices, persist]);

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice, updateStatus }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoices must be used within InvoiceProvider');
  return ctx;
};
