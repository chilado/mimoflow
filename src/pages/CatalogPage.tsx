import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/store';
import { ChevronLeft, ChevronRight, X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[];
}

interface CartItem extends Product {
  quantity: number;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll for header collapse
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Show collapsed header after scrolling down 100px
          if (currentScrollY > 100 && currentScrollY > lastScrollY) {
            setIsScrolled(true);
          } else if (currentScrollY < 50) {
            setIsScrolled(false);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${slug}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
      }
    }
  }, [slug]);

  // Save cart to localStorage
  useEffect(() => {
    if (slug) {
      localStorage.setItem(`cart-${slug}`, JSON.stringify(cart));
    }
  }, [cart, slug]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.base_price * item.quantity, 0);
  };

  const generateWhatsAppMessage = () => {
    if (!profile?.company_name) return '';
    
    let message = `Olá! Gostaria de fazer um pedido:\n\n`;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço unitário: ${formatCurrency(item.base_price)}\n`;
      message += `   Subtotal: ${formatCurrency(item.base_price * item.quantity)}\n\n`;
    });
    
    message += `*Total: ${formatCurrency(getTotalPrice())}*\n\n`;
    message += `Aguardo retorno!`;
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    if (!profile?.whatsapp || cart.length === 0) return;
    
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

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
      <div className={`border-b bg-card sticky top-0 z-40 shadow-sm transition-all duration-300 ${
        isScrolled ? 'sm:py-3 md:py-4' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          {/* Mobile Layout - Collapses on scroll */}
          <div className="sm:hidden">
            {/* Collapsed Header (shown when scrolled) */}
            <div className={`transition-all duration-300 overflow-hidden ${
              isScrolled ? 'max-h-16 py-3' : 'max-h-0 py-0'
            }`}>
              <div className="flex items-center justify-between">
                {/* Logo pequeno */}
                {profile?.company_logo_url ? (
                  <img 
                    src={profile.company_logo_url} 
                    alt="Logo" 
                    className="h-10 w-10 rounded-lg object-contain bg-white border p-0.5" 
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted border flex items-center justify-center text-muted-foreground text-[10px]">
                    Logo
                  </div>
                )}
                
                {/* Nome da empresa */}
                <h1 className="flex-1 mx-3 font-semibold text-sm truncate">
                  {profile?.company_name || 'Catálogo'}
                </h1>
                
                {/* Cart Button */}
                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="relative h-10 w-10"
                      aria-label={`Carrinho com ${getTotalItems()} itens`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {getTotalItems() > 0 && (
                        <Badge 
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          variant="destructive"
                        >
                          {getTotalItems()}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-lg">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Carrinho ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'})
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="flex flex-col h-full pt-6">
                      {cart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                          <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground">Seu carrinho está vazio</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Adicione produtos para fazer seu pedido
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 overflow-y-auto -mx-6 px-6">
                            <div className="space-y-4">
                              {cart.map(item => (
                                <div key={item.id} className="flex gap-3 p-3 rounded-lg border bg-card">
                                  {item.images.length > 0 ? (
                                    <img 
                                      src={item.images[0]} 
                                      alt={item.name}
                                      className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs text-muted-foreground">Sem foto</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm leading-tight">{item.name}</h3>
                                    <p className="text-primary font-semibold text-sm mt-1">
                                      {formatCurrency(item.base_price)}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 mt-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        aria-label="Diminuir quantidade"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      
                                      <span className="text-sm font-medium w-8 text-center">
                                        {item.quantity}
                                      </span>
                                      
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        aria-label="Aumentar quantidade"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 ml-auto text-destructive"
                                        onClick={() => removeFromCart(item.id)}
                                        aria-label="Remover item"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="border-t pt-4 mt-4 space-y-3">
                            <div className="flex items-center justify-between text-lg font-bold">
                              <span>Total:</span>
                              <span className="text-primary">{formatCurrency(getTotalPrice())}</span>
                            </div>
                            
                            {profile?.whatsapp && (
                              <Button 
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                                size="lg"
                                onClick={handleWhatsAppOrder}
                              >
                                <WaIcon />
                                <span className="ml-2">Fazer Pedido no WhatsApp</span>
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={clearCart}
                            >
                              Limpar Carrinho
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Expanded Header (shown when not scrolled) */}
            <div className={`transition-all duration-300 overflow-hidden ${
              isScrolled ? 'max-h-0 py-0' : 'max-h-[500px] py-4'
            }`}>
              <div className="flex flex-col items-center gap-4">
                {/* Logo e Carrinho */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-10" /> {/* Spacer */}
                  
                  {profile?.company_logo_url ? (
                    <img 
                      src={profile.company_logo_url} 
                      alt="Logo" 
                      className="h-16 w-16 rounded-xl object-contain bg-white border p-1" 
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground text-xs">
                      Logo
                    </div>
                  )}
                  
                  {/* Cart Button */}
                  <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="relative"
                        aria-label={`Carrinho com ${getTotalItems()} itens`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {getTotalItems() > 0 && (
                          <Badge 
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            variant="destructive"
                          >
                            {getTotalItems()}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                </div>
                
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
            </div>
          </div>

          {/* Desktop/Tablet Layout - Responsivo */}
          <div className="hidden sm:flex items-center gap-3 md:gap-4 lg:gap-5 py-3 md:py-4">
            {/* Logo - tamanho responsivo */}
            {profile?.company_logo_url ? (
              <img 
                src={profile.company_logo_url} 
                alt="Logo" 
                className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-xl md:rounded-2xl object-contain bg-white border flex-shrink-0 p-1" 
              />
            ) : (
              <div className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-xl md:rounded-2xl bg-muted border flex items-center justify-center text-muted-foreground text-xs flex-shrink-0">
                Logo
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold font-heading leading-tight">
                {profile?.company_name || 'Catálogo de Produtos'}
              </h1>
              {profile?.company_description && (
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 leading-relaxed line-clamp-2">
                  {profile.company_description}
                </p>
              )}
              
              <div className="flex gap-1.5 md:gap-2 mt-2 md:mt-3 flex-wrap">
                {profile?.whatsapp && (
                  <a 
                    href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs md:text-sm font-medium transition-colors touch-manipulation"
                    aria-label="Contato via WhatsApp"
                  >
                    <WaIcon /> <span className="hidden md:inline">WhatsApp</span><span className="md:hidden">WA</span>
                  </a>
                )}
                {profile?.instagram && (
                  <a 
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white text-xs md:text-sm font-medium transition-opacity touch-manipulation"
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
                    className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm font-medium transition-colors touch-manipulation"
                    aria-label="Ver localização no mapa"
                  >
                    <MapIcon /> <span className="hidden lg:inline">Como chegar</span><span className="lg:hidden">Mapa</span>
                  </a>
                )}
              </div>
            </div>
            
            {/* Cart Button Desktop - responsivo */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="default"
                  className="relative h-10 md:h-11 px-3 md:px-4"
                  aria-label={`Carrinho com ${getTotalItems()} itens`}
                >
                  <ShoppingCart className="h-5 w-5 md:mr-2" />
                  <span className="hidden md:inline">Carrinho</span>
                  {getTotalItems() > 0 && (
                    <Badge 
                      className="ml-0 md:ml-2 absolute md:relative -top-1 -right-1 md:top-auto md:right-auto"
                      variant="destructive"
                    >
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrinho ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'})
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col h-full pt-6">
                  {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Seu carrinho está vazio</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Adicione produtos para fazer seu pedido
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto -mx-6 px-6">
                        <div className="space-y-4">
                          {cart.map(item => (
                            <div key={item.id} className="flex gap-3 p-3 rounded-lg border bg-card">
                              {item.images.length > 0 ? (
                                <img 
                                  src={item.images[0]} 
                                  alt={item.name}
                                  className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-muted-foreground">Sem foto</span>
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm leading-tight">{item.name}</h3>
                                <p className="text-primary font-semibold text-sm mt-1">
                                  {formatCurrency(item.base_price)}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    aria-label="Diminuir quantidade"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  
                                  <span className="text-sm font-medium w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    aria-label="Aumentar quantidade"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 ml-auto text-destructive"
                                    onClick={() => removeFromCart(item.id)}
                                    aria-label="Remover item"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 mt-4 space-y-3">
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-primary">{formatCurrency(getTotalPrice())}</span>
                        </div>
                        
                        {profile?.whatsapp && (
                          <Button 
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                            size="lg"
                            onClick={handleWhatsAppOrder}
                          >
                            <WaIcon />
                            <span className="ml-2">Fazer Pedido no WhatsApp</span>
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={clearCart}
                        >
                          Limpar Carrinho
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Products — responsive grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
        {products.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-muted-foreground text-sm sm:text-base">
            Nenhum produto disponível no momento.
          </div>
        ) : (
          <>
            {/* Mobile list (< 640px) */}
            <div className="flex flex-col gap-3 sm:hidden">
              {products.map(product => (
                <div key={product.id} className="flex gap-3 rounded-xl border bg-card overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
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
                    
                    {/* Preço e botões */}
                    <div className="mt-auto pt-2">
                      <p className="text-primary font-bold text-base sm:text-lg mb-2">
                        {formatCurrency(Number(product.base_price))}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            addToCart(product);
                            setCartOpen(true);
                          }}
                          className="flex-1 bg-primary hover:bg-primary/90 h-9 min-w-0"
                          size="sm"
                          aria-label={`Adicionar ${product.name} ao carrinho`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1.5 flex-shrink-0" />
                          <span className="text-xs truncate">Adicionar</span>
                        </Button>
                        
                        {product.images.length > 0 && (
                          <Button
                            onClick={() => setLightbox({ images: product.images, index: 0 })}
                            variant="outline"
                            size="sm"
                            className="px-2.5 h-9 flex-shrink-0"
                            aria-label={`Ver ${product.images.length} fotos de ${product.name}`}
                          >
                            <span className="text-xs whitespace-nowrap">Ver ({product.images.length})</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Responsive grid (≥ 640px) */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
              {products.map(product => (
                <div key={product.id} className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                        loading="lazy" 
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      Sem foto
                    </div>
                  )}
                  
                  <div className="p-3 sm:p-4 lg:p-5">
                    <h2 className="font-semibold text-sm sm:text-base lg:text-lg leading-tight">
                      {product.name}
                    </h2>
                    {product.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <p className="text-primary font-bold text-base sm:text-lg lg:text-xl mt-2 sm:mt-3">
                      {formatCurrency(Number(product.base_price))}
                    </p>
                    
                    {/* Botões responsivos */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                      <Button
                        onClick={() => {
                          addToCart(product);
                          setCartOpen(true);
                        }}
                        className="flex-1 bg-primary hover:bg-primary/90 h-9 sm:h-10"
                        size="sm"
                        aria-label={`Adicionar ${product.name} ao carrinho`}
                      >
                        <ShoppingCart className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Adicionar</span>
                        <span className="sm:hidden ml-2">Adicionar ao Carrinho</span>
                      </Button>
                      
                      {product.images.length > 0 && (
                        <Button
                          onClick={() => setLightbox({ images: product.images, index: 0 })}
                          variant="outline"
                          size="sm"
                          className="h-9 sm:h-10 sm:flex-shrink-0"
                          aria-label={`Ver ${product.images.length} fotos de ${product.name}`}
                        >
                          <span className="text-xs sm:text-sm">Ver Fotos ({product.images.length})</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox - Responsivo */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos"
        >
          <button 
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full bg-card/90 backdrop-blur-sm border text-foreground hover:bg-card transition-colors touch-manipulation" 
            onClick={() => setLightbox(null)}
            aria-label="Fechar galeria"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <div className="relative w-full max-w-5xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {/* Botões de navegação - responsivos */}
            {lightbox.images.length > 1 && (
              <>
                <button 
                  className="absolute left-1 sm:left-2 md:-left-12 lg:-left-16 p-2 sm:p-2.5 md:p-3 rounded-full bg-card/90 backdrop-blur-sm border hover:bg-card transition-colors z-10 touch-manipulation"
                  onClick={() => setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null)}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </button>
                
                <button 
                  className="absolute right-1 sm:right-2 md:-right-12 lg:-right-16 p-2 sm:p-2.5 md:p-3 rounded-full bg-card/90 backdrop-blur-sm border hover:bg-card transition-colors z-10 touch-manipulation"
                  onClick={() => setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null)}
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </button>
              </>
            )}
            
            <img 
              src={lightbox.images[lightbox.index]} 
              alt={`Foto ${lightbox.index + 1} de ${lightbox.images.length}`}
              className="max-w-full max-h-[85vh] sm:max-h-[80vh] md:max-h-[85vh] object-contain rounded-lg" 
            />
          </div>
          
          {/* Contador de fotos - responsivo */}
          {lightbox.images.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-card/90 backdrop-blur-sm border text-xs sm:text-sm text-foreground font-medium">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
