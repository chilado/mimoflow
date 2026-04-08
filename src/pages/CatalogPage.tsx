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
  company_description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  address: string | null;
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const IgIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

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
        .select('user_id, company_name, company_phone, company_logo_url, company_description, whatsapp, instagram, address')
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
          {/* Mobile Layout - Logo centralizado no topo */}
          <div className="flex flex-col items-center gap-4 sm:hidden">
            {/* Logo centralizado */}
            {profile?.company_logo_url ? (
              <img 
                src={profile.company_logo_url} 
                alt="Logo" 
                className="h-20 w-20 rounded-2xl object-contain bg-white border p-1" 
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-muted border flex items-center justify-center text-muted-foreground text-xs">
                Logo
              </div>
            )}
            
            {/* Informações centralizadas */}
            <div className="text-center w-full">
              <h1 className="text-xl font-bold font-heading">
                {profile?.company_name || 'Catálogo de Produtos'}
              </h1>
              {profile?.company_description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {profile.company_description}
                </p>
              )}
            </div>
            
            {/* Botões lado a lado em mobile */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {profile?.whatsapp && (
                <a 
                  href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                  aria-label="Contato via WhatsApp"
                >
                  <WaIcon />
                  <span className="text-xs">WhatsApp</span>
                </a>
              )}
              {profile?.instagram && (
                <a 
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white text-sm font-medium transition-opacity"
                  aria-label="Seguir no Instagram"
                >
                  <IgIcon />
                  <span className="text-xs">Instagram</span>
                </a>
              )}
              {profile?.address && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors ${
                    profile?.whatsapp && profile?.instagram ? 'col-span-2' : ''
                  }`}
                  aria-label="Ver localização no mapa"
                >
                  <MapIcon />
                  <span className="text-xs">Como chegar</span>
                </a>
              )}
            </div>
          </div>

          {/* Desktop Layout - Original */}
          <div className="hidden sm:flex items-center gap-5">
            {/* Logo */}
            {profile?.company_logo_url ? (
              <img 
                src={profile.company_logo_url} 
                alt="Logo" 
                className="h-24 w-24 rounded-2xl object-contain bg-white border flex-shrink-0 p-1" 
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-muted border flex items-center justify-center text-muted-foreground text-xs flex-shrink-0">
                Logo
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold font-heading">
                {profile?.company_name || 'Catálogo de Produtos'}
              </h1>
              {profile?.company_description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {profile.company_description}
                </p>
              )}
              
              <div className="flex gap-2 mt-3 flex-wrap">
                {profile?.whatsapp && (
                  <a 
                    href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                    aria-label="Contato via WhatsApp"
                  >
                    <WaIcon /> WhatsApp
                  </a>
                )}
                {profile?.instagram && (
                  <a 
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white text-sm font-medium transition-opacity"
                    aria-label="Seguir no Instagram"
                  >
                    <IgIcon /> Instagram
                  </a>
                )}
                {profile?.address && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                    aria-label="Ver localização no mapa"
                  >
                    <MapIcon /> Como chegar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products — grid on desktop, list on mobile */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Nenhum produto disponível no momento.</div>
        ) : (
          <>
            {/* Mobile list */}
            <div className="flex flex-col gap-3 sm:hidden">
              {products.map(product => (
                <div key={product.id} className="flex gap-3 rounded-xl border bg-card overflow-hidden shadow-sm">
                  {product.images.length > 0 ? (
                    <div 
                      className="w-28 h-28 flex-shrink-0 cursor-pointer bg-muted"
                      onClick={() => setLightbox({ images: product.images, index: 0 })}
                      role="button"
                      aria-label={`Ver fotos de ${product.name}`}
                    >
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover" 
                        loading="lazy" 
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-28 flex-shrink-0 bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      Sem foto
                    </div>
                  )}
                  
                  <div className="flex-1 py-3 pr-3 min-w-0 flex flex-col">
                    <h2 className="font-semibold text-sm leading-tight">
                      {product.name}
                    </h2>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    {/* Preço e botões lado a lado */}
                    <div className="mt-auto pt-2">
                      <p className="text-primary font-bold text-lg mb-2">
                        {formatCurrency(Number(product.base_price))}
                      </p>
                      
                      <div className="flex gap-2">
                        {profile?.whatsapp && (
                          <a
                            href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${product.name}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors"
                            aria-label={`Perguntar sobre ${product.name} via WhatsApp`}
                          >
                            <WaIcon />
                            <span>Perguntar</span>
                          </a>
                        )}
                        
                        {product.images.length > 0 && (
                          <button
                            onClick={() => setLightbox({ images: product.images, index: 0 })}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-xs font-medium"
                            aria-label={`Ver ${product.images.length} fotos de ${product.name}`}
                          >
                            <span>Ver Fotos</span>
                            <span className="text-[10px] opacity-70">({product.images.length})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {product.images.length > 0 ? (
                    <div 
                      className="aspect-square overflow-hidden cursor-pointer bg-muted"
                      onClick={() => setLightbox({ images: product.images, index: 0 })}
                      role="button"
                      aria-label={`Ver fotos de ${product.name}`}
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
                  
                  <div className="p-4">
                    <h2 className="font-semibold text-base">{product.name}</h2>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <p className="text-primary font-bold text-lg mt-3">
                      {formatCurrency(Number(product.base_price))}
                    </p>
                    
                    <div className="flex gap-2 mt-3">
                      {profile?.whatsapp && (
                        <a
                          href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${product.name}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                          aria-label={`Perguntar sobre ${product.name} via WhatsApp`}
                        >
                          <WaIcon />
                          <span>Perguntar</span>
                        </a>
                      )}
                      
                      {product.images.length > 0 && (
                        <button
                          onClick={() => setLightbox({ images: product.images, index: 0 })}
                          className="px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
                          aria-label={`Ver ${product.images.length} fotos de ${product.name}`}
                        >
                          Ver Fotos ({product.images.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos"
        >
          <button 
            className="absolute top-4 right-4 p-2 rounded-full bg-card/80 backdrop-blur-sm border text-foreground hover:bg-card transition-colors" 
            onClick={() => setLightbox(null)}
            aria-label="Fechar galeria"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="relative w-full max-w-4xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {/* Botões de navegação - mobile e desktop */}
            {lightbox.images.length > 1 && (
              <>
                <button 
                  className="absolute left-2 sm:-left-14 p-2 sm:p-3 rounded-full bg-card/90 backdrop-blur-sm border hover:bg-card transition-colors z-10"
                  onClick={() => setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null)}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                
                <button 
                  className="absolute right-2 sm:-right-14 p-2 sm:p-3 rounded-full bg-card/90 backdrop-blur-sm border hover:bg-card transition-colors z-10"
                  onClick={() => setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null)}
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}
            
            <img 
              src={lightbox.images[lightbox.index]} 
              alt={`Foto ${lightbox.index + 1} de ${lightbox.images.length}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg" 
            />
          </div>
          
          {/* Contador de fotos */}
          {lightbox.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-card/90 backdrop-blur-sm border text-sm text-foreground font-medium">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
