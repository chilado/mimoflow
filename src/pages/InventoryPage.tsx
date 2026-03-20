import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaterials } from '@/hooks/useStore';
import { formatCurrency, type Material } from '@/lib/store';

const categories = ['Papéis', 'Tintas', 'Vinil', 'Laços/Fitas', 'Colas', 'Embalagens', 'Outros'];
const units = ['unidade', 'folha', 'metro', 'grama', 'ml', 'rolo', 'pacote'];

export default function InventoryPage() {
  const { materials, add, update, remove } = useMaterials();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', category: 'Papéis', quantity: 0, unit: 'folha', costPerUnit: 0, minStock: 5, supplier: '', supplierContact: '', lastPrice: 0,
  });
  const [filterCat, setFilterCat] = useState('all');

  const resetForm = () => {
    setForm({ name: '', category: 'Papéis', quantity: 0, unit: 'folha', costPerUnit: 0, minStock: 5, supplier: '', supplierContact: '', lastPrice: 0 });
    setEditingId(null);
  };

  const handleSave = () => {
    if (editingId) {
      update({ ...form, id: editingId } as Material);
    } else {
      add(form);
    }
    setOpen(false);
    resetForm();
  };

  const startEdit = (m: Material) => {
    setForm({ name: m.name, category: m.category, quantity: m.quantity, unit: m.unit, costPerUnit: m.costPerUnit, minStock: m.minStock, supplier: m.supplier || '', supplierContact: m.supplierContact || '', lastPrice: m.lastPrice || 0 });
    setEditingId(m.id);
    setOpen(true);
  };

  const filtered = filterCat === 'all' ? materials : materials.filter(m => m.category === filterCat);
  const lowStockCount = materials.filter(m => m.quantity <= m.minStock).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold">Estoque de Insumos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {materials.length} materiais cadastrados
            {lowStockCount > 0 && <span className="text-warning ml-2">• {lowStockCount} em estoque baixo</span>}
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo Material</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Material' : 'Novo Material'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Papel A4 180g" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Unidade</Label>
                  <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Quantidade</Label>
                  <Input type="number" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Custo/Unidade</Label>
                  <Input type="number" step="0.01" value={form.costPerUnit || ''} onChange={e => setForm(f => ({ ...f, costPerUnit: +e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Estoque Mínimo</Label>
                  <Input type="number" value={form.minStock || ''} onChange={e => setForm(f => ({ ...f, minStock: +e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Fornecedor</Label>
                  <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Nome do fornecedor" />
                </div>
                <div>
                  <Label className="text-xs">Contato Fornecedor</Label>
                  <Input value={form.supplierContact} onChange={e => setForm(f => ({ ...f, supplierContact: e.target.value }))} placeholder="Telefone/email" />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!form.name}>{editingId ? 'Salvar' : 'Cadastrar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap animate-fade-up stagger-1">
        <Badge variant={filterCat === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterCat('all')}>Todos</Badge>
        {categories.map(c => (
          <Badge key={c} variant={filterCat === c ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterCat(c)}>{c}</Badge>
        ))}
      </div>

      <div className="grid gap-3 animate-fade-up stagger-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum material cadastrado.</CardContent></Card>
        ) : (
          filtered.map(m => {
            const isLow = m.quantity <= m.minStock;
            return (
              <Card key={m.id} className={`card-hover ${isLow ? 'border-warning/40' : ''}`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{m.name}</span>
                      <Badge variant="secondary" className="text-[11px]">{m.category}</Badge>
                      {isLow && (
                        <Badge variant="outline" className="text-[11px] bg-warning/15 text-warning-foreground border-warning/30">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Baixo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {m.quantity} {m.unit} — {formatCurrency(m.costPerUnit)}/{m.unit}
                      {m.supplier && <span className="ml-2">• Fornecedor: {m.supplier}</span>}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(m)}><Edit2 className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(m.id)}><Trash2 className="h-3 w-3" /></Button>
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
