import { useState } from 'react';
import { Plus, Trash2, Edit2, Image, List, X, ChevronLeft, ChevronRight, Upload, Link2, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, useMaterials, useProductMaterials, useProfile, type Product } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { products, add, update, remove } = useProducts();
  const { materials } = useMaterials();
  const { profile } = useProfile();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', base_price: 0 });
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { materials: prodMaterials, add: addProdMat, remove: removeProdMat } = useProductMaterials(selectedProduct);
  const [addMatId, setAddMatId] = useState('');
  const [addMatQty, setAddMatQty] = useState(1);
  const [copied, setCopied] = useState(false);

  // Lightbox state
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const catalogSlug = (profile as any)?.catalog_slug as string | null;
  const catalogUrl = catalogSlug ? `https://mimoflow.vercel.app/${catalogSlug}` : null;

  const generateSlug = (name: string) =>
    name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleGenerateCatalog = async () => {
    if (!user || !profile) return;
    const name = profile.company_name || 'catalogo';
    const slug = generateSlug(name);
    await (supabase.from('profiles' as any).update({ catalog_slug: slug } as any).eq('id', (profile as any).id) as any);
    const url = `https://mimoflow.vercel.app/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link do catálogo copiado!');
    setTimeout(() => { setCopied(false); }, 3000);
  };

  const handleCopyLink = async () => {
    if (!catalogUrl) return;
    await navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

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

  const handleImageUpload = async (productId: string, files: FileList) => {
    if (!user) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentImages = (Array.isArray(product.images) ? product.images : []) as string[];
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} é muito grande (máx 5MB)`); continue; }
      const path = `${user.id}/${productId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) { toast.error(`Erro ao enviar ${file.name}`); continue; }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
      newUrls.push(publicUrl);
    }

    if (newUrls.length > 0) {
      update({ ...product, images: [...currentImages, ...newUrls] as any });
      toast.success(`${newUrls.length} imagem(ns) adicionada(s)!`);
    }
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

  // Calculate total material cost for a product
  const getProductMaterialCost = () => {
    return prodMaterials.reduce((sum, pm) => {
      const mat = materials.find(m => m.id === pm.material_id);
      return sum + (mat ? Number(mat.cost_per_unit) * Number(pm.quantity_used) : 0);
    }, 0);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold">Produtos & Kits</h1>
          <p className="text-muted-foreground text-sm mt-1">Galeria, ficha técnica e composição</p>
        </div>
        <div className="flex gap-2">
          {catalogUrl ? (
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              Copiar link do catálogo
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleGenerateCatalog}>
              <Link2 className="h-4 w-4 mr-1" /> Gerar catálogo público
            </Button>
          )}
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Novo Produto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Kit Festa Safari" maxLength={100} />
                </div>
                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Inclui caixas, bandejas..." maxLength={500} />
                </div>
                <div>
                  <Label className="text-xs">Preço Base (R$)</Label>
                  <Input type="number" value={form.base_price || ''} onChange={e => setForm(f => ({ ...f, base_price: +e.target.value }))} min={0} />
                </div>
                <Button className="w-full" onClick={handleSave} disabled={!form.name}>
                  {editingId ? 'Salvar' : 'Cadastrar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
                  <div className="mt-3">
                    {images.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-2">
                        {images.map((img, i) => (
                          <div key={i} className="relative group aspect-square">
                            <img
                              src={img}
                              alt={`${product.name} foto ${i + 1}`}
                              className="h-full w-full object-cover rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                              loading="lazy"
                              onClick={() => setLightbox({ images, index: i })}
                            />
                            <button
                              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); removeImage(product, img); }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 transition-colors text-xs text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      Adicionar fotos
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                        if (e.target.files?.length) handleImageUpload(product.id, e.target.files);
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
                          {prodMaterials.map(pm => {
                            const mat = materials.find(m => m.id === pm.material_id);
                            const cost = mat ? Number(mat.cost_per_unit) * Number(pm.quantity_used) : 0;
                            return (
                              <div key={pm.id} className="flex items-center justify-between text-sm">
                                <span>{pm.material_name} — {pm.quantity_used} {pm.unit}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{formatCurrency(cost)}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeProdMat(pm.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex justify-between text-sm font-medium pt-2 border-t border-border">
                            <span>Custo Total dos Materiais</span>
                            <span className="text-primary">{formatCurrency(getProductMaterialCost())}</span>
                          </div>
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
                              {materials.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit}) — {formatCurrency(Number(m.cost_per_unit))}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20">
                          <Label className="text-[11px]">Qtd</Label>
                          <Input className="h-8 text-xs" type="number" value={addMatQty} onChange={e => setAddMatQty(+e.target.value)} min={0.01} step={0.1} />
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

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-foreground/70 hover:text-foreground" onClick={() => setLightbox(null)}>
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-[90vw] max-h-[85vh] flex items-center" onClick={e => e.stopPropagation()}>
            {lightbox.images.length > 1 && (
              <button
                className="absolute -left-12 p-2 rounded-full bg-card border text-foreground hover:bg-accent transition-colors"
                onClick={() => setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <img
              src={lightbox.images[lightbox.index]}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {lightbox.images.length > 1 && (
              <button
                className="absolute -right-12 p-2 rounded-full bg-card border text-foreground hover:bg-accent transition-colors"
                onClick={() => setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="absolute bottom-4 text-sm text-muted-foreground">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
