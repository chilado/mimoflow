import { useState } from 'react';
import { Plus, Trash2, Edit2, Phone, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useClients, useOrders } from '@/hooks/useStore';
import { formatCurrency, ORDER_STATUS_LABELS, type Client } from '@/lib/store';

export default function ClientsPage() {
  const { clients, add, update, remove } = useClients();
  const { orders } = useOrders();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [search, setSearch] = useState('');

  const resetForm = () => { setForm({ name: '', phone: '', email: '', notes: '' }); setEditingId(null); };

  const handleSave = () => {
    if (editingId) {
      const existing = clients.find(c => c.id === editingId)!;
      update({ ...existing, ...form });
    } else {
      add(form);
    }
    setOpen(false);
    resetForm();
  };

  const startEdit = (c: Client) => {
    setForm({ name: c.name, phone: c.phone, email: c.email || '', notes: c.notes || '' });
    setEditingId(c.id);
    setOpen(true);
  };

  const getClientOrders = (name: string) => orders.filter(o => o.clientName === name);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Telefone</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Observações</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!form.name}>{editingId ? 'Salvar' : 'Cadastrar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm animate-fade-up stagger-1" />

      <div className="space-y-3 animate-fade-up stagger-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum cliente encontrado.</CardContent></Card>
        ) : (
          filtered.map(client => {
            const clientOrders = getClientOrders(client.name);
            const totalSpent = clientOrders.reduce((s, o) => s + o.total, 0);
            return (
              <Card key={client.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{client.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="font-medium">{client.name}</span>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                            {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                          </div>
                        </div>
                      </div>
                      {clientOrders.length > 0 && (
                        <div className="mt-2 ml-13 text-xs text-muted-foreground">
                          {clientOrders.length} pedido{clientOrders.length > 1 ? 's' : ''} — Total: {formatCurrency(totalSpent)}
                          <div className="mt-1 space-y-0.5">
                            {clientOrders.slice(-3).map(o => (
                              <div key={o.id}>{o.eventTheme} — {ORDER_STATUS_LABELS[o.status]}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(client)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(client.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
