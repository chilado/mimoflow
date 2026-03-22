import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle, FileText, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOrders, useClients, useProfile, type OrderItem, type Order } from '@/hooks/useStore';
import { formatCurrency, generateId, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/lib/store';
import { generateBudgetPDF, generateReceiptPDF } from '@/lib/pdfGenerator';

const statusOptions: OrderStatus[] = ['awaiting_payment', 'awaiting_art', 'art_approval', 'art_approved', 'in_production', 'finished', 'delivered'];
const paymentMethods = ['PIX', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Outro'];

export default function OrdersPage() {
  const { orders, add, update, remove } = useOrders();
  const { clients } = useClients();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [receiptDialog, setReceiptDialog] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const [form, setForm] = useState({
    client_name: '', event_theme: '', delivery_date: '', personalization: '', art_notes: '',
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const resetForm = () => {
    setForm({ client_name: '', event_theme: '', delivery_date: '', personalization: '', art_notes: '' });
    setItems([]);
    setEditingId(null);
  };

  const handleSave = () => {
    const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    if (editingId) {
      const existing = orders.find(o => o.id === editingId)!;
      update({
        ...existing,
        client_name: form.client_name, event_theme: form.event_theme,
        delivery_date: form.delivery_date || null,
        items: items as any, total,
        personalization: form.personalization, art_notes: form.art_notes,
      });
    } else {
      add({
        client_id: clients.find(c => c.name === form.client_name)?.id || null,
        client_name: form.client_name,
        event_theme: form.event_theme,
        delivery_date: form.delivery_date || null,
        items,
        status: 'awaiting_payment',
        art_approved: false,
        art_notes: form.art_notes,
        personalization: form.personalization,
        total,
      });
    }
    setOpen(false);
    resetForm();
  };

  const startEdit = (o: Order) => {
    setForm({
      client_name: o.client_name, event_theme: o.event_theme,
      delivery_date: o.delivery_date || '', personalization: o.personalization || '',
      art_notes: o.art_notes || '',
    });
    setItems(((Array.isArray(o.items) ? o.items : []) as any) as OrderItem[]);
    setEditingId(o.id);
    setOpen(true);
  };

  const addItem = () => setItems(prev => [...prev, { id: generateId(), name: '', quantity: 1, unitPrice: 0 }]);

  const orderItems = (o: Order): OrderItem[] => (Array.isArray(o.items) ? o.items : []) as any;

  const handleGenerateReceipt = () => {
    if (!receiptDialog) return;
    generateReceiptPDF(receiptDialog, orderItems(receiptDialog), profile, paymentMethod);
    setReceiptDialog(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus pedidos e orçamentos</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo Pedido</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Pedido' : 'Novo Pedido'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Cliente</Label>
                  <Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nome do cliente" />
                </div>
                <div>
                  <Label className="text-xs">Data de Entrega</Label>
                  <Input type="date" value={form.delivery_date} onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Tema da Festa/Evento</Label>
                <Input value={form.event_theme} onChange={e => setForm(f => ({ ...f, event_theme: e.target.value }))} placeholder="Ex: Safari, Princesas" />
              </div>
              <div>
                <Label className="text-xs">Personalização (nome, idade, etc.)</Label>
                <Textarea value={form.personalization} onChange={e => setForm(f => ({ ...f, personalization: e.target.value }))} rows={2} placeholder="Ex: Maria, 5 anos" />
              </div>
              <div>
                <Label className="text-xs">Notas da Arte</Label>
                <Textarea value={form.art_notes} onChange={e => setForm(f => ({ ...f, art_notes: e.target.value }))} rows={2} placeholder="Detalhes sobre a arte..." />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Itens do Pedido</Label>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Item</Button>
              </div>
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-[1fr_60px_80px_32px] gap-2 items-end">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Item {idx + 1}</Label>
                    <Input className="text-sm" value={item.name} onChange={e => setItems(prev => prev.map(x => x.id === item.id ? { ...x, name: e.target.value } : x))} placeholder="Caixa Milk" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Qtd</Label>
                    <Input className="text-sm" type="number" value={item.quantity || ''} onChange={e => setItems(prev => prev.map(x => x.id === item.id ? { ...x, quantity: +e.target.value } : x))} />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">R$ Unit.</Label>
                    <Input className="text-sm" type="number" value={item.unitPrice || ''} onChange={e => setItems(prev => prev.map(x => x.id === item.id ? { ...x, unitPrice: +e.target.value } : x))} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-9" onClick={() => setItems(prev => prev.filter(x => x.id !== item.id))}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="text-right text-sm font-medium">
                Total: {formatCurrency(items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!form.client_name}>
                {editingId ? 'Salvar Alterações' : 'Criar Pedido'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap animate-fade-up stagger-1">
        <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('all')}>Todos ({orders.length})</Badge>
        {statusOptions.map(s => {
          const count = orders.filter(o => o.status === s).length;
          return (
            <Badge key={s} variant={filter === s ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter(s)}>
              {ORDER_STATUS_LABELS[s]} ({count})
            </Badge>
          );
        })}
      </div>

      <div className="space-y-3 animate-fade-up stagger-2">
        {filteredOrders.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum pedido encontrado.</CardContent></Card>
        ) : (
          filteredOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(order => {
            const oItems = orderItems(order);
            return (
              <Card key={order.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{order.client_name}</span>
                        <Badge variant="outline" className={`text-[11px] ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                          {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                        </Badge>
                        {order.art_approved ? (
                          <Badge variant="outline" className="text-[11px] bg-success/15 text-success border-success/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Arte OK
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] bg-warning/15 text-warning-foreground border-warning/30">
                            <XCircle className="h-3 w-3 mr-1" /> Arte Pendente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{order.event_theme} — Entrega: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('pt-BR') : 'N/A'}</p>
                      {order.personalization && <p className="text-xs text-muted-foreground">📝 {order.personalization}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{formatCurrency(Number(order.total))}</p>
                      <p className="text-xs text-muted-foreground">{oItems.length} {oItems.length === 1 ? 'item' : 'itens'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Select value={order.status} onValueChange={(v) => update({ ...order, status: v })}>
                      <SelectTrigger className="h-8 text-xs w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant={order.art_approved ? 'outline' : 'secondary'} size="sm" className="text-xs h-8" onClick={() => update({ ...order, art_approved: !order.art_approved })}>
                      {order.art_approved ? 'Revogar Arte' : 'Aprovar Arte'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => startEdit(order)}>Editar</Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => generateBudgetPDF(order, oItems, profile)}>
                      <FileText className="h-3 w-3 mr-1" /> PDF
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setReceiptDialog(order); setPaymentMethod('PIX'); }}>
                      <Receipt className="h-3 w-3 mr-1" /> Recibo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive" onClick={() => remove(order.id)}>Excluir</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptDialog} onOpenChange={(v) => { if (!v) setReceiptDialog(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Gerar Recibo Digital</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pedido de <strong>{receiptDialog?.client_name}</strong> — {formatCurrency(Number(receiptDialog?.total || 0))}
            </p>
            <div>
              <Label className="text-xs">Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleGenerateReceipt}>
              <Receipt className="h-4 w-4 mr-2" /> Gerar Recibo em PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
