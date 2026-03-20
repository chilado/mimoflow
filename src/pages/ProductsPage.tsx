import { useState } from 'react';
import { Plus, Trash2, Edit2, Image, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, useMaterials, useProductMaterials, type Product } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { products, add, update, remove } = useProducts();
  const { materials } = useMaterials();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', base_price: 0 });
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { materials: prodMaterials, add: addProdMat, remove: removeProdMat } = useProductMaterials(selectedProduct);
  const [addMatId, setAddMatId] = useState('');
  const [addMatQty, setAddMatQty] = useState(1);

  const resetForm = () => { setForm({ name: '', description: '', base_price: 0 }); setEditingId(null); };

  const handleSave = async () => {
    if (editingId) {
      const existing = products.find(p => p.id === editingId)!;
      update({ ...existing, name: form.name, description: form.description, base_price: form.base_price });
    } else {
      add(form);
    }
    setOpen(false);
    resetForm();
  };

  const startEdit = (p: Product) => {
    setForm({ name: p.name, description: p.description || '', base_price: Number(p.base_price) });
    setEditingId(p.id);
    setOpen(true);
  };

  const handleImageUpload = async (productId: string, file: File) => {
    if (!user) return;
    const path = `${user.id}/${productId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { toast.error('Erro ao enviar imagem'); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    const product = products.find(p => p.id === productId);
    if (product) {
      const currentImages = (Array.isArray(product.images) ? product.images : []) as string[];
      update({ ...product, images: [...currentImages, publicUrl] as any });
    }
    toast.success('Imagem adicionada!');
  };

  const removeImage = (product: Product, imgUrl: string) => {
    const currentImages = (Array.isArray(product.images) ? product.images : []) as string[];
    update({ ...product, images: currentImages.filter(i => i !== imgUrl) as any });
  };

  const handleAddMaterial = async () => {
    if (!addMatId || !selectedProduct) return;
    await addProdMat(addMatId, addMatQty);
    setAddMatId('');
    setAddMatQty(1);
    toast.success('Material adicionado à ficha técnica!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold">Produtos & Kits</h1>
          <p className="text-muted-foreground text-sm mt-1">Galeria, ficha técnica e composição</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo Produto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Kit Festa Safari" />
              </div>
              <div>
                <Label className="text-xs">Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Inclui caixas, bandejas..." />
              </div>
              <div>
                <Label className="text-xs">Preço Base (R$)</Label>
                <Input type="number" value={form.base_price || ''} onChange={e => setForm(f => ({ ...f, base_price: +e.target.value }))} />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!form.name}>
                {editingId ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 animate-fade-up stagger-1">
        {products.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum produto cadastrado.</CardContent></Card>
        ) : (
          products.map(product => {
            const images = (Array.isArray(product.images) ? product.images : []) as string[];
            const isSelected = selectedProduct === product.id;
            return (
              <Card key={product.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                        <Badge variant="secondary" className="text-[11px]">{formatCurrency(Number(product.base_price))}</Badge>
                      </div>
                      {product.description && <p className="text-sm text-muted-foreground mt-0.5">{product.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(product)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant={isSelected ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setSelectedProduct(isSelected ? null : product.id)}>
                        <List className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(product.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="mt-3 flex gap-2 flex-wrap items-center">
                    {images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="h-20 w-20 object-cover rounded-md border" />
                        <button
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(product, img)}
                        >×</button>
                      </div>
                    ))}
                    <label className="h-20 w-20 rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Image className="h-5 w-5 text-muted-foreground" />
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(product.id, file);
                        e.target.value = '';
                      }} />
                    </label>
                  </div>

                  {/* Technical Sheet */}
                  {isSelected && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md space-y-3">
                      <h4 className="text-sm font-medium">Ficha Técnica — Materiais</h4>
                      {prodMaterials.length > 0 ? (
                        <div className="space-y-1">
                          {prodMaterials.map(pm => (
                            <div key={pm.id} className="flex items-center justify-between text-sm">
                              <span>{pm.material_name} — {pm.quantity_used} {pm.unit}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeProdMat(pm.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhum material adicionado.</p>
                      )}
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-[11px]">Material</Label>
                          <Select value={addMatId} onValueChange={setAddMatId}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                              {materials.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20">
                          <Label className="text-[11px]">Qtd</Label>
                          <Input className="h-8 text-xs" type="number" value={addMatQty} onChange={e => setAddMatQty(+e.target.value)} />
                        </div>
                        <Button size="sm" className="h-8" onClick={handleAddMaterial} disabled={!addMatId}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
