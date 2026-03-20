import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOrders, useClients } from '@/hooks/useStore';
import { formatCurrency, generateId, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type Order, type OrderStatus, type OrderItem } from '@/lib/store';

const statusOptions: OrderStatus[] = ['awaiting_payment', 'awaiting_art', 'art_approval', 'art_approved', 'in_production', 'finished', 'delivered'];

export default function OrdersPage() {
  const { orders, add, update, remove } = useOrders();
  const { clients } = useClients();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  // Form state
  const [form, setForm] = useState({
    clientName: '', eventTheme: '', deliveryDate: '', personalization: '', artNotes: '',
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const resetForm = () => {
    setForm({ clientName: '', eventTheme: '', deliveryDate: '', personalization: '', artNotes: '' });
    setItems([]);
    setEditingId(null);
  };

  const handleSave = () => {
    const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    if (editingId) {
      const existing = orders.find(o => o.id === editingId)!;
      update({ ...existing, ...form, items, total });
    } else {
      add({
        clientId: clients.find(c => c.name === form.clientName)?.id || '',
        clientName: form.clientName,
        eventTheme: form.eventTheme,
        deliveryDate: form.deliveryDate,
        items,
        status: 'awaiting_payment',
        artApproved: false,
        artNotes: form.artNotes,
        personalization: form.personalization,
        total,
      });
    }
    setOpen(false);
    resetForm();
  };

  const startEdit = (o: Order) => {
    setForm({ clientName: o.clientName, eventTheme: o.eventTheme, deliveryDate: o.deliveryDate, personalization: o.personalization || '', artNotes: o.artNotes || '' });
    setItems(o.items);
    setEditingId(o.id);
    setOpen(true);
  };

  const addItem = () => setItems(prev => [...prev, { id: generateId(), name: '', quantity: 1, unitPrice: 0 }]);

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
                  <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Nome do cliente" />
                </div>
                <div>
                  <Label className="text-xs">Data de Entrega</Label>
                  <Input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Tema da Festa/Evento</Label>
                <Input value={form.eventTheme} onChange={e => setForm(f => ({ ...f, eventTheme: e.target.value }))} placeholder="Ex: Safari, Princesas" />
              </div>
              <div>
                <Label className="text-xs">Personalização (nome, idade, etc.)</Label>
                <Textarea value={form.personalization} onChange={e => setForm(f => ({ ...f, personalization: e.target.value }))} rows={2} placeholder="Ex: Maria, 5 anos" />
              </div>
              <div>
                <Label className="text-xs">Notas da Arte</Label>
                <Textarea value={form.artNotes} onChange={e => setForm(f => ({ ...f, artNotes: e.target.value }))} rows={2} placeholder="Detalhes sobre a arte..." />
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
              <Button className="w-full" onClick={handleSave} disabled={!form.clientName}>
                {editingId ? 'Salvar Alterações' : 'Criar Pedido'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
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

      {/* Orders list */}
      <div className="space-y-3 animate-fade-up stagger-2">
        {filteredOrders.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum pedido encontrado.</CardContent></Card>
        ) : (
          filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
            <Card key={order.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{order.clientName}</span>
                      <Badge variant="outline" className={`text-[11px] ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                      {order.artApproved ? (
                        <Badge variant="outline" className="text-[11px] bg-success/15 text-success border-success/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Arte OK
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] bg-warning/15 text-warning-foreground border-warning/30">
                          <XCircle className="h-3 w-3 mr-1" /> Arte Pendente
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{order.eventTheme} — Entrega: {new Date(order.deliveryDate).toLocaleDateString('pt-BR')}</p>
                    {order.personalization && <p className="text-xs text-muted-foreground">📝 {order.personalization}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Select value={order.status} onValueChange={(v) => update({ ...order, status: v as OrderStatus })}>
                    <SelectTrigger className="h-8 text-xs w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(s => <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant={order.artApproved ? 'outline' : 'secondary'} size="sm" className="text-xs h-8" onClick={() => update({ ...order, artApproved: !order.artApproved })}>
                    {order.artApproved ? 'Revogar Arte' : 'Aprovar Arte'}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => startEdit(order)}>Editar</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive" onClick={() => remove(order.id)}>Excluir</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
