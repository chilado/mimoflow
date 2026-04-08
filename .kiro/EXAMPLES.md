# Exemplos Práticos - MimoFlow

## 🔒 Segurança

### Exemplo 1: Formulário com Sanitização
```typescript
import { useState } from 'react';
import { sanitizeString, isValidEmail } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Sanitize inputs
    const safeName = sanitizeString(name);
    const safeEmail = email.trim().toLowerCase();

    // ✅ Validate
    if (!safeName) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!isValidEmail(safeEmail)) {
      toast.error('Email inválido');
      return;
    }

    // ✅ Safe to use
    await saveContact({ name: safeName, email: safeEmail });
    toast.success('Contato salvo!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
        maxLength={100}
        aria-label="Nome completo"
      />
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        maxLength={100}
        aria-label="Endereço de email"
      />
      <Button type="submit">Salvar</Button>
    </form>
  );
}
```

### Exemplo 2: Upload de Imagem Seguro
```typescript
import { sanitizeUrl } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function handleImageUpload(file: File, productId: string) {
  // ✅ Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    toast.error('Tipo de arquivo inválido. Use JPG, PNG ou WebP.');
    return null;
  }

  // ✅ Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error('Arquivo muito grande. Máximo 5MB.');
    return null;
  }

  // ✅ Generate safe filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${productId}/${timestamp}-${safeName}`;

  // ✅ Upload
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file);

  if (error) {
    toast.error('Erro ao enviar imagem');
    return null;
  }

  // ✅ Get and validate URL
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(path);

  const safeUrl = sanitizeUrl(data.publicUrl);
  return safeUrl;
}
```

## ⚡ Performance

### Exemplo 3: Busca com Debounce
```typescript
import { useState, useMemo } from 'react';
import { debounce } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/useStore';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { products } = useProducts();

  // ✅ Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    }, 300),
    [products]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <Input
        value={query}
        onChange={handleChange}
        placeholder="Buscar produtos..."
        aria-label="Buscar produtos"
      />
      <div>
        {results.map(product => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    </div>
  );
}
```

### Exemplo 4: Lista com Memoização
```typescript
import { memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/store';

interface Product {
  id: string;
  name: string;
  price: number;
}

// ✅ Memoized item component
const ProductItem = memo(({ product }: { product: Product }) => {
  return (
    <Card className="p-4">
      <h3>{product.name}</h3>
      <p>{formatCurrency(product.price)}</p>
    </Card>
  );
});
ProductItem.displayName = 'ProductItem';

// ✅ Memoized list
function ProductList({ products }: { products: Product[] }) {
  // ✅ Expensive calculation memoized
  const totalValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price, 0);
  }, [products]);

  return (
    <div>
      <h2>Total: {formatCurrency(totalValue)}</h2>
      <div className="grid gap-4">
        {products.map(product => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default memo(ProductList);
```

### Exemplo 5: Lazy Loading de Componente
```typescript
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// ✅ Lazy load heavy component
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* ✅ Suspense with loading state */}
      <Suspense fallback={
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

## ♿ Acessibilidade

### Exemplo 6: Modal Acessível
```typescript
import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function AccessibleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ✅ Focus management
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  // ✅ Keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onKeyDown={handleKeyDown}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* ✅ Accessible title */}
        <DialogTitle id="modal-title">
          Confirmar Ação
        </DialogTitle>

        {/* ✅ Descriptive content */}
        <p id="modal-description">
          Tem certeza que deseja continuar?
        </p>

        {/* ✅ Clear actions */}
        <div className="flex gap-2">
          <Button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Cancelar ação"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              // Perform action
              onClose();
            }}
            aria-label="Confirmar e continuar"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Exemplo 7: Formulário Acessível
```typescript
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function AccessibleForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ✅ Proper label association */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome <span aria-label="obrigatório">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {/* ✅ Error message linked to input */}
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span aria-label="obrigatório">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* ✅ Clear submit button */}
      <Button type="submit" aria-label="Enviar formulário">
        Enviar
      </Button>
    </form>
  );
}
```

## 🎨 Responsividade

### Exemplo 8: Grid Responsivo
```typescript
import { Card } from '@/components/ui/card';

function ResponsiveGrid({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(item => (
        <Card key={item.id} className="p-4">
          <h3 className="text-base sm:text-lg font-medium">{item.title}</h3>
          <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
        </Card>
      ))}
    </div>
  );
}
```

### Exemplo 9: Navegação Responsiva
```typescript
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

function ResponsiveNav() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Produtos', href: '/products' },
    { label: 'Sobre', href: '/about' },
  ];

  return (
    <nav className="flex items-center justify-between p-4">
      {/* ✅ Desktop navigation */}
      <div className="hidden md:flex gap-4">
        {navItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            className="hover:text-primary transition-colors"
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* ✅ Mobile navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="flex flex-col gap-4 mt-8">
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                className="text-lg hover:text-primary transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
```

## 🧪 Testes

### Exemplo 10: Teste de Sanitização
```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeUrl, isValidEmail } from '@/lib/utils';

describe('Security Utils', () => {
  describe('sanitizeString', () => {
    it('deve remover tags HTML', () => {
      expect(sanitizeString('<script>alert("xss")</script>'))
        .toBe('scriptalert("xss")/script');
    });

    it('deve remover javascript:', () => {
      expect(sanitizeString('javascript:alert(1)'))
        .toBe('alert(1)');
    });

    it('deve remover event handlers', () => {
      expect(sanitizeString('onclick=alert(1)'))
        .toBe('alert(1)');
    });
  });

  describe('sanitizeUrl', () => {
    it('deve aceitar URLs HTTPS válidas', () => {
      const url = 'https://example.com/image.jpg';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('deve rejeitar javascript:', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('deve rejeitar URLs inválidas', () => {
      expect(sanitizeUrl('not a url')).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('deve aceitar emails válidos', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('deve rejeitar emails inválidos', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });
});
```

---

## 💡 Dicas Finais

1. **Sempre sanitize** inputs de usuário
2. **Sempre valide** antes de processar
3. **Sempre memoize** componentes pesados
4. **Sempre adicione** ARIA labels
5. **Sempre teste** acessibilidade
6. **Sempre use** TypeScript strict
7. **Sempre documente** código complexo

## 📚 Recursos Adicionais

- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Accessibility](https://www.w3.org/WAI/fundamentals/)
- [OWASP Security](https://owasp.org/www-project-top-ten/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
