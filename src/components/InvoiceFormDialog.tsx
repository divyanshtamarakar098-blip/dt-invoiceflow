import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInvoices } from '@/context/InvoiceContext';
import { InvoiceItem } from '@/types/invoice';
import { Plus, X, Sparkles, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const InvoiceFormDialog = ({ open, onOpenChange }: Props) => {
  const { invoices, addInvoice } = useInvoices();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(it => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setScanning(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const { data, error } = await supabase.functions.invoke('scan-invoice', {
        body: { fileBase64: base64, mimeType: selectedFile.type || 'image/jpeg' },
      });
      if (error) throw error;
      const extracted = data?.data;
      if (!extracted) throw new Error('No data returned');

      if (extracted.clientName) setClientName(extracted.clientName);
      if (extracted.clientEmail) setClientEmail(extracted.clientEmail);
      if (extracted.clientPhone) setClientPhone(extracted.clientPhone);
      if (extracted.dueDate) setDueDate(extracted.dueDate);
      if (extracted.notes) setNotes(extracted.notes);
      if (Array.isArray(extracted.items) && extracted.items.length > 0) {
        setItems(
          extracted.items.map((it: any) => ({
            id: crypto.randomUUID(),
            description: String(it.description ?? ''),
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
          })),
        );
      }

      const conf = extracted.confidence ?? 'medium';
      toast.success(`Form filled (${conf} confidence). Review before saving.`);
      if (Array.isArray(extracted.warnings) && extracted.warnings.length) {
        extracted.warnings.forEach((w: string) => toast.warning(w));
      }
    } catch (e: any) {
      console.error(e);
      const msg = e?.context?.error || e?.message || 'Extraction failed';
      toast.error(typeof msg === 'string' ? msg : 'Extraction failed');
    } finally {
      setScanning(false);
    }
  };

  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setDueDate('');
    setNotes('');
    setItems([emptyItem()]);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const num = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    await addInvoice({
      invoiceNumber: num,
      clientName,
      clientPhone,
      clientEmail,
      items,
      status: 'pending',
      dueDate,
      notes,
    });
    onOpenChange(false);
    resetForm();
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        {/* AI Quick Fill */}
        <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Quick Fill: Upload Invoice Image / PDF
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent transition-colors overflow-hidden">
              <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate text-muted-foreground">
                {selectedFile ? selectedFile.name : 'Choose an image or PDF'}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <Button
              type="button"
              onClick={handleScan}
              disabled={!selectedFile || scanning}
              className="gap-2"
            >
              {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {scanning ? 'Extracting…' : 'Extract with AI'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            AI will pre-fill the fields below. Review and adjust before saving.
          </p>
        </div>

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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceFormDialog;
