import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/store';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[];
}

interface CatalogProfile {
  user_id: string;
  company_name: string | null;
  company_phone: string | null;
  company_logo_url: string | null;
}

export default function CatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<CatalogProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }

    async function load() {
      // Public read — requires RLS policy "Public catalog read" on profiles
      const { data: prof, error: profError } = await (supabase
        .from('profiles' as any)
        .select('user_id, company_name, company_phone, company_logo_url')
        .eq('catalog_slug', slug)
        .maybeSingle()) as { data: CatalogProfile | null; error: any };

      if (profError || !prof) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(prof);

      // Public read — requires RLS policy "Public products read" on products
      const { data: prods } = await supabase
        .from('products')
        .select('id, name, description, base_price, images')
        .eq('user_id', prof.user_id)
        .order('created_at', { ascending: false });

      setProducts((prods || []).map((p: any) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
      })));
      setLoading(false);
    }

    load();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Carregando catálogo...</div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-2">
        <p className="text-2xl font-bold">Catálogo não encontrado</p>
        <p className="text-muted-foreground text-sm">O link pode estar incorreto ou o catálogo foi removido.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center gap-4">
          {profile?.company_logo_url && (
            <img src={profile.company_logo_url} alt="Logo" className="h-14 w-14 rounded-full object-cover border" />
          )}
          <div>
            <h1 className="text-2xl font-bold font-heading">{profile?.company_name || 'Catálogo de Produtos'}</h1>
            {profile?.company_phone && (
              <p className="text-sm text-muted-foreground mt-0.5">📞 {profile.company_phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Nenhum produto disponível no momento.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {product.images.length > 0 ? (
                  <div
                    className="aspect-square overflow-hidden cursor-pointer bg-muted"
                    onClick={() => setLightbox({ images: product.images, index: 0 })}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    Sem foto
                  </div>
                )}
                <div className="p-4 space-y-1">
                  <h2 className="font-semibold text-base">{product.name}</h2>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  )}
                  <p className="text-primary font-bold text-lg pt-1">{formatCurrency(Number(product.base_price))}</p>
                  {product.images.length > 1 && (
                    <button
                      className="text-xs text-muted-foreground underline"
                      onClick={() => setLightbox({ images: product.images, index: 0 })}
                    >
                      Ver {product.images.length} fotos
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-foreground/70 hover:text-foreground" onClick={() => setLightbox(null)}>
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-[90vw] max-h-[85vh] flex items-center" onClick={e => e.stopPropagation()}>
            {lightbox.images.length > 1 && (
              <button
                className="absolute -left-12 p-2 rounded-full bg-card border hover:bg-accent transition-colors"
                onClick={() => setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <img src={lightbox.images[lightbox.index]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            {lightbox.images.length > 1 && (
              <button
                className="absolute -right-12 p-2 rounded-full bg-card border hover:bg-accent transition-colors"
                onClick={() => setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
          {lightbox.images.length > 1 && (
            <div className="absolute bottom-4 text-sm text-muted-foreground">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
