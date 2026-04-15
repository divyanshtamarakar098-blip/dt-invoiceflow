import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInvoices } from '@/context/InvoiceContext';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { Plus, X } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  rate: 0,
});

const InvoiceFormDialog = ({ open, onOpenChange }: Props) => {
  const { invoices, addInvoice } = useInvoices();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(it => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: num,
      clientName,
      clientPhone,
      clientEmail,
      items,
      status: 'pending',
      dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      notes,
    };
    addInvoice(invoice);
    onOpenChange(false);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setDueDate('');
    setNotes('');
    setItems([emptyItem()]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Client Name</Label>
              <Input required value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+1..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <button type="button" onClick={() => setItems([...items, emptyItem()])} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-2 items-start">
                  <Input className="flex-1" placeholder="Description" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} required />
                  <Input className="w-16" type="number" min={1} placeholder="Qty" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} required />
                  <Input className="w-20" type="number" min={0} step={0.01} placeholder="Rate" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} required />
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-2 text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceFormDialog;
