import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaterials, type Material } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/store';
import { MaterialFormDialog, MATERIAL_CATEGORIES, MATERIAL_UNITS } from '@/components/MaterialFormDialog';

export default function InventoryPage() {
  const { materials, update, remove } = useMaterials();
  const [openNew, setOpenNew] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', category: 'Papéis', quantity: 0, unit: 'folha',
    cost_per_unit: 0, min_stock: 5, supplier: '', supplier_contact: '', last_price: 0,
  });
  const [filterCat, setFilterCat] = useState('all');

  const startEdit = (m: Material) => {
    setEditForm({
      name: m.name, category: m.category, quantity: Number(m.quantity), unit: m.unit,
      cost_per_unit: Number(m.cost_per_unit), min_stock: Number(m.min_stock),
      supplier: m.supplier || '', supplier_contact: m.supplier_contact || '',
      last_price: Number(m.last_price || 0),
    });
    setEditingMaterial(m);
  };

  const handleEditSave = () => {
    if (!editingMaterial) return;
    update({ ...editingMaterial, ...editForm });
    setEditingMaterial(null);
  };

  const filtered = filterCat === 'all' ? materials : materials.filter(m => m.category === filterCat);
  const lowStockCount = materials.filter(m => Number(m.quantity) <= Number(m.min_stock)).length;

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
        <Button onClick={() => setOpenNew(true)}><Plus className="h-4 w-4 mr-1" /> Novo Material</Button>
      </div>

      <MaterialFormDialog open={openNew} onOpenChange={setOpenNew} />

      {/* Edit Dialog */}
      <Dialog open={!!editingMaterial} onOpenChange={(v) => { if (!v) setEditingMaterial(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Material</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Categoria</Label>
                <Select value={editForm.category} onValueChange={v => setEditForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MATERIAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Unidade</Label>
                <Select value={editForm.unit} onValueChange={v => setEditForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MATERIAL_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Quantidade em Estoque</Label>
                <Input type="number" value={editForm.quantity || ''} onChange={e => setEditForm(f => ({ ...f, quantity: +e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Custo/Unidade (R$)</Label>
                <Input type="number" step="0.01" value={editForm.cost_per_unit || ''} onChange={e => setEditForm(f => ({ ...f, cost_per_unit: +e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Estoque Mínimo</Label>
                <Input type="number" value={editForm.min_stock || ''} onChange={e => setEditForm(f => ({ ...f, min_stock: +e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Fornecedor</Label>
                <Input value={editForm.supplier} onChange={e => setEditForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Nome do fornecedor" />
              </div>
              <div>
                <Label className="text-xs">Contato Fornecedor</Label>
                <Input value={editForm.supplier_contact} onChange={e => setEditForm(f => ({ ...f, supplier_contact: e.target.value }))} placeholder="Telefone/email" />
              </div>
            </div>
            <Button className="w-full" onClick={handleEditSave} disabled={!editForm.name}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 flex-wrap animate-fade-up stagger-1">
        <Badge variant={filterCat === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterCat('all')}>Todos</Badge>
        {MATERIAL_CATEGORIES.map(c => (
          <Badge key={c} variant={filterCat === c ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterCat(c)}>{c}</Badge>
        ))}
      </div>

      <div className="grid gap-3 animate-fade-up stagger-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum material cadastrado.</CardContent></Card>
        ) : (
          filtered.map(m => {
            const isLow = Number(m.quantity) <= Number(m.min_stock);
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
                      {m.quantity} {m.unit} — {formatCurrency(Number(m.cost_per_unit))}/{m.unit}
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
