import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  refreshInvoices: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const mapRow = (row: any): Invoice => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  clientName: row.client_name,
  clientPhone: row.client_phone || '',
  clientEmail: row.client_email || '',
  items: (row.items as InvoiceItem[]) || [],
  status: row.status as InvoiceStatus,
  dueDate: row.due_date,
  createdAt: row.created_at?.split('T')[0] || '',
  notes: row.notes || '',
});

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshInvoices = useCallback(async () => {
    if (!user) { setInvoices([]); setLoading(false); return; }
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setInvoices((data || []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { refreshInvoices(); }, [refreshInvoices]);

  const addInvoice = useCallback(async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    if (!user) return;
    await supabase.from('invoices').insert({
      user_id: user.id,
      invoice_number: invoice.invoiceNumber,
      client_name: invoice.clientName,
      client_phone: invoice.clientPhone,
      client_email: invoice.clientEmail,
      items: invoice.items as any,
      status: invoice.status as any,
      due_date: invoice.dueDate,
      notes: invoice.notes,
    });
    await refreshInvoices();
  }, [user, refreshInvoices]);

  const updateInvoice = useCallback(async (invoice: Invoice) => {
    await supabase.from('invoices').update({
      invoice_number: invoice.invoiceNumber,
      client_name: invoice.clientName,
      client_phone: invoice.clientPhone,
      client_email: invoice.clientEmail,
      items: invoice.items as any,
      status: invoice.status as any,
      due_date: invoice.dueDate,
      notes: invoice.notes,
    }).eq('id', invoice.id);
    await refreshInvoices();
  }, [refreshInvoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    await supabase.from('invoices').delete().eq('id', id);
    await refreshInvoices();
  }, [refreshInvoices]);

  const updateStatus = useCallback(async (id: string, status: InvoiceStatus) => {
    await supabase.from('invoices').update({ status: status as any }).eq('id', id);
    await refreshInvoices();
  }, [refreshInvoices]);

  return (
    <InvoiceContext.Provider value={{ invoices, loading, addInvoice, updateInvoice, deleteInvoice, updateStatus, refreshInvoices }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoices must be used within InvoiceProvider');
  return ctx;
};
