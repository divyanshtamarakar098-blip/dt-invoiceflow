import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useInvoices } from '@/context/InvoiceContext';
import { InvoiceItem } from '@/types/invoice';
import { Plus, X, Sparkles, Loader2, Upload, Mic, MicOff, HelpCircle, Wand2 } from 'lucide-react';
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

type GlowField = 'client' | 'phone' | 'email' | 'due' | 'items' | 'notes';

const NLP_EXAMPLES = [
  'Invoice ABC Corp for 5 hours consulting at $150/hr, due May 15',
  'Factura TechCo por 3 horas diseño web a 100€/hora',
  'ABC को 10 घंटे coding, ₹5000 प्रति घंटा',
  'Créer facture pour TechCo, 10h à 150€/h',
];

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

  // NLP state
  const [nlpInput, setNlpInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [glow, setGlow] = useState<Set<GlowField>>(new Set());
  const formRef = useRef<HTMLFormElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const finalTranscriptRef = useRef('');

  const triggerGlow = (fields: GlowField[]) => {
    setGlow(new Set(fields));
    window.setTimeout(() => setGlow(new Set()), 2100);
  };
  const glowCls = (f: GlowField) => (glow.has(f) ? 'ai-glow' : '');

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
        const newItems = extracted.items.map((it: any) => ({
          id: crypto.randomUUID(),
          description: String(it.description ?? ''),
          quantity: Number(it.quantity) || 1,
          rate: Number(it.rate) || 0,
        }));
        setItems((prev) => {
          const hasRealItems = prev.some(
            (p) => p.description.trim() !== '' || p.rate > 0,
          );
          return hasRealItems ? [...prev, ...newItems] : newItems;
        });
      }

      const conf = extracted.confidence ?? 'medium';
      toast.success(`Form filled (${conf} confidence). Review before saving.`);
      if (Array.isArray(extracted.warnings) && extracted.warnings.length) {
        extracted.warnings.forEach((w: string) => toast.warning(w));
      }
      triggerGlow(['client', 'phone', 'email', 'due', 'items', 'notes']);
    } catch (e: any) {
      console.error(e);
      const msg = e?.context?.error || e?.message || 'Extraction failed';
      toast.error(typeof msg === 'string' ? msg : 'Extraction failed');
    } finally {
      setScanning(false);
    }
  };

  const handleNlpExtract = async () => {
    if (!nlpInput.trim()) return;
    setIsExtracting(true);
    try {
      const wantsPrevious = /\b(same as last|previous invoice|like last|como la anterior|même que la dernière)\b/i.test(nlpInput);
      const previousInvoice = wantsPrevious && invoices[0]
        ? {
            client_name: invoices[0].clientName,
            client_email: invoices[0].clientEmail,
            client_phone: invoices[0].clientPhone,
            due_date: invoices[0].dueDate,
            notes: invoices[0].notes,
            line_items: invoices[0].items.map(i => ({
              description: i.description,
              quantity: i.quantity,
              rate: i.rate,
              amount: i.quantity * i.rate,
            })),
          }
        : undefined;

      const { data, error } = await supabase.functions.invoke('extract-invoice-nlp', {
        body: { text: nlpInput, previousInvoice },
      });
      if (error) throw error;
      if (!data?.success || !data?.data) throw new Error(data?.error || 'No data returned');

      const d = data.data;
      const filled: GlowField[] = [];

      if (d.client_name) { setClientName(d.client_name); filled.push('client'); }
      if (d.client_email) { setClientEmail(d.client_email); filled.push('email'); }
      if (d.client_phone) { setClientPhone(d.client_phone); filled.push('phone'); }
      if (d.due_date) { setDueDate(d.due_date); filled.push('due'); }
      if (d.notes) { setNotes(d.notes); filled.push('notes'); }
      if (Array.isArray(d.line_items) && d.line_items.length > 0) {
        setItems(d.line_items.map((it: any) => ({
          id: crypto.randomUUID(),
          description: String(it.description ?? ''),
          quantity: Number(it.quantity) || 1,
          rate: Number(it.rate) || 0,
        })));
        filled.push('items');
      }

      toast.success('✓ Invoice details extracted! Review and save.');
      triggerGlow(filled);
      // Smooth scroll to form
      window.setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e: any) {
      console.error(e);
      const msg = e?.context?.error || e?.message;
      toast.error(typeof msg === 'string' && msg ? msg : "Couldn't extract invoice details. Please be more specific or fill manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (isListening) {
      // Manual stop
      shouldListenRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
      return;
    }

    // Capture baseline so we always append to whatever was there when mic started
    finalTranscriptRef.current = nlpInput ? nlpInput.trim() + ' ' : '';

    const rec = new SpeechRecognition();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0].transcript;
        if (res.isFinal) {
          finalTranscriptRef.current += text + ' ';
        } else {
          interim += text;
        }
      }
      setNlpInput((finalTranscriptRef.current + interim).replace(/\s+/g, ' ').trimStart());
    };

    rec.onerror = (e: any) => {
      console.error('Speech error', e?.error || e);
      // 'no-speech' and 'aborted' shouldn't kill the session — let onend auto-restart
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        toast.error('Microphone permission denied. Please allow mic access.');
        shouldListenRef.current = false;
        setIsListening(false);
      } else if (e?.error && e.error !== 'no-speech' && e.error !== 'aborted') {
        toast.error(`Voice input error: ${e.error}`);
      }
    };

    rec.onend = () => {
      // Auto-restart while user hasn't manually stopped
      if (shouldListenRef.current) {
        try {
          rec.start();
        } catch (err) {
          console.error('Restart failed', err);
          setIsListening(false);
          shouldListenRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
    shouldListenRef.current = true;
    try {
      rec.start();
      setIsListening(true);
      toast.success('Listening… tap mic again to stop.');
    } catch (err) {
      console.error('Start failed', err);
      shouldListenRef.current = false;
      toast.error('Could not start voice input.');
    }
  };

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setDueDate('');
    setNotes('');
    setItems([emptyItem()]);
    setSelectedFile(null);
    setNlpInput('');
    setGlow(new Set());
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

        {/* AI Natural Language Input */}
        <div className="relative rounded-2xl p-[1.5px] gradient-primary shadow-elegant">
          <div className="rounded-2xl bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Describe your invoice in any language
                </span>
              </div>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="font-medium mb-1">Try examples:</p>
                    <ul className="space-y-1 text-xs">
                      {NLP_EXAMPLES.map((ex, i) => <li key={i}>• {ex}</li>)}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Textarea
              value={nlpInput}
              onChange={(e) => setNlpInput(e.target.value)}
              disabled={isExtracting}
              placeholder="Try: 'Invoice ABC Corp for 5 hours consulting at $150/hr, due May 15th' or 'Factura TechCo por 3 horas a 100€'"
              className="min-h-[120px] resize-none bg-background"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                onClick={handleNlpExtract}
                disabled={!nlpInput.trim() || isExtracting}
                className="flex-1 gap-2 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is extracting your invoice details...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Invoice with AI
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant={isListening ? 'destructive' : 'outline'}
                size="icon"
                onClick={toggleVoice}
                disabled={isExtracting}
                className={isListening ? 'mic-pulse' : ''}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Quick Fill from file */}
        <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Or upload an invoice image / PDF
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
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Client Name</Label>
              <Input required value={clientName} onChange={e => setClientName(e.target.value)} className={glowCls('client')} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+1..." className={glowCls('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className={glowCls('email')} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className={glowCls('due')} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <button type="button" onClick={() => setItems([...items, emptyItem()])} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Add item
              </button>
            </div>
            <div className={`space-y-2 rounded-md ${glowCls('items')}`}>
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
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={glowCls('notes')} />
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
