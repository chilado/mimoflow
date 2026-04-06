import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaterials } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const MATERIAL_CATEGORIES = ['Papéis', 'Tintas', 'Vinil', 'Laços/Fitas', 'Colas', 'Embalagens', 'Outros'];
export const MATERIAL_UNITS = ['unidade', 'folha', 'metro', 'grama', 'ml', 'rolo', 'pacote'];

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after material is saved, with the new material id and name */
  onSaved?: (id: string, name: string, costPerUnit: number, unit: string) => void;
}

export function MaterialFormDialog({ open, onOpenChange, onSaved }: MaterialFormDialogProps) {
  const { user } = useAuth();
  const { refresh } = useMaterials();
  const [form, setForm] = useState({
    name: '', category: 'Papéis', quantity: 0, unit: 'folha',
    cost_per_unit: 0, min_stock: 5, supplier: '', supplier_contact: '',
    total_paid: 0, package_qty: 1,
  });

  useEffect(() => {
    if (form.package_qty > 0 && form.total_paid > 0) {
      setForm(f => ({ ...f, cost_per_unit: +(f.total_paid / f.package_qty).toFixed(4) }));
    }
  }, [form.total_paid, form.package_qty]);

  const reset = () => setForm({
    name: '', category: 'Papéis', quantity: 0, unit: 'folha',
    cost_per_unit: 0, min_stock: 5, supplier: '', supplier_contact: '',
    total_paid: 0, package_qty: 1,
  });

  const handleSave = async () => {
    if (!user) return;
    const { data } = await supabase.from('materials').insert({
      name: form.name, category: form.category, quantity: form.quantity,
      unit: form.unit, cost_per_unit: form.cost_per_unit, min_stock: form.min_stock,
      supplier: form.supplier, supplier_contact: form.supplier_contact,
      last_price: form.total_paid, user_id: user.id,
    }).select('id').single();
    await refresh();
    onOpenChange(false);
    reset();
    onSaved?.(data?.id ?? '', form.name, form.cost_per_unit, form.unit);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Material</DialogTitle>
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
                <SelectContent>{MATERIAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Unidade</Label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MATERIAL_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3 space-y-3">
            <p className="text-xs font-medium text-primary">Cálculo automático do custo por unidade</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor Pago (R$)</Label>
                <Input type="number" step="0.01" value={form.total_paid || ''} onChange={e => setForm(f => ({ ...f, total_paid: +e.target.value }))} placeholder="Ex: 25.00" />
              </div>
              <div>
                <Label className="text-xs">Qtd no Pacote ({form.unit}s)</Label>
                <Input type="number" value={form.package_qty || ''} onChange={e => setForm(f => ({ ...f, package_qty: +e.target.value }))} placeholder="Ex: 50" />
              </div>
            </div>
            {form.total_paid > 0 && form.package_qty > 0 && (
              <p className="text-xs text-muted-foreground">
                Custo calculado: <strong className="text-foreground">{formatCurrency(form.total_paid / form.package_qty)}</strong> por {form.unit}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Quantidade em Estoque</Label>
              <Input type="number" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Custo/Unidade (R$)</Label>
              <Input type="number" step="0.01" value={form.cost_per_unit || ''} onChange={e => setForm(f => ({ ...f, cost_per_unit: +e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Estoque Mínimo</Label>
              <Input type="number" value={form.min_stock || ''} onChange={e => setForm(f => ({ ...f, min_stock: +e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Fornecedor</Label>
              <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Nome do fornecedor" />
            </div>
            <div>
              <Label className="text-xs">Contato Fornecedor</Label>
              <Input value={form.supplier_contact} onChange={e => setForm(f => ({ ...f, supplier_contact: e.target.value }))} placeholder="Telefone/email" />
            </div>
          </div>
          <Button className="w-full" onClick={handleSave} disabled={!form.name}>Cadastrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
