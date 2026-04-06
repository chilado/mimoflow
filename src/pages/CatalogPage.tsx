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
  whatsapp: string | null;
  instagram: string | null;
  address: string | null;
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
      const { data: prof, error: profError } = await (supabase
        .from('profiles' as any)
        .select('user_id, company_name, company_phone, company_logo_url, whatsapp, instagram, address')
        .eq('catalog_slug', slug)
        .maybeSingle()) as { data: CatalogProfile | null; error: any };

      if (profError || !prof) { setNotFound(true); setLoading(false); return; }
      setProfile(prof);

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
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            {profile?.company_logo_url ? (
              <img src={profile.company_logo_url} alt="Logo" className="h-16 w-16 rounded-full object-cover border flex-shrink-0" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted border flex items-center justify-center text-muted-foreground text-xs flex-shrink-0">Logo</div>
            )}

            {/* Info + buttons */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold font-heading">{profile?.company_name || 'Catálogo de Produtos'}</h1>
              <div className="flex gap-3 mt-3 flex-wrap">
                {profile?.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                {profile?.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Como chegar
                  </a>
                )}
              </div>
            </div>
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
