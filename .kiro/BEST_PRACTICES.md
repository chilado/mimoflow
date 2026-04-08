# Guia de Boas Práticas - MimoFlow

## 🔒 Segurança

### Sanitização de Inputs
```typescript
import { sanitizeString, sanitizeUrl, isValidEmail } from '@/lib/utils';

// ✅ CORRETO
const safeName = sanitizeString(userInput);
const safeUrl = sanitizeUrl(imageUrl);

// ❌ INCORRETO
const name = userInput; // Pode conter XSS
```

### Validação de Dados
```typescript
// ✅ CORRETO - Valide antes de usar
if (isValidEmail(email)) {
  await sendEmail(email);
}

// ❌ INCORRETO - Sem validação
await sendEmail(email);
```

### URLs de Imagens
```typescript
// ✅ CORRETO
const imageUrl = sanitizeUrl(product.image);
if (imageUrl) {
  <img src={imageUrl} alt={product.name} />
}

// ❌ INCORRETO
<img src={product.image} /> // URL não validada
```

## ⚡ Performance

### Memoização
```typescript
// ✅ CORRETO - Componente pesado
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* renderização complexa */}</div>;
});

// ✅ CORRETO - Cálculo pesado
const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => acc + item.value, 0);
}, [data]);

// ❌ INCORRETO - Memoização desnecessária
const SimpleComponent = memo(({ text }) => <span>{text}</span>);
```

### Callbacks
```typescript
// ✅ CORRETO
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ INCORRETO - Nova função a cada render
const handleClick = () => doSomething(id);
```

### Debounce em Buscas
```typescript
import { debounce } from '@/lib/utils';

// ✅ CORRETO
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    searchProducts(query);
  }, 300),
  []
);

<Input onChange={(e) => debouncedSearch(e.target.value)} />
```

### Lazy Loading
```typescript
// ✅ CORRETO - Páginas grandes
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// ❌ INCORRETO - Import direto
import DashboardPage from './pages/DashboardPage';
```

## ♿ Acessibilidade

### ARIA Labels
```typescript
// ✅ CORRETO
<button aria-label="Fechar modal" onClick={onClose}>
  <X aria-hidden="true" />
</button>

// ❌ INCORRETO
<button onClick={onClose}>
  <X />
</button>
```

### Navegação
```typescript
// ✅ CORRETO
<nav role="navigation" aria-label="Menu principal">
  <Link to="/" aria-current={isActive ? 'page' : undefined}>
    Home
  </Link>
</nav>

// ❌ INCORRETO
<div>
  <Link to="/">Home</Link>
</div>
```

### Foco Visível
```css
/* ✅ CORRETO */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* ❌ INCORRETO */
:focus {
  outline: none; /* Remove outline completamente */
}
```

## 🎨 Estilo e Design

### Unidades Responsivas
```css
/* ✅ CORRETO */
.container {
  padding: 1rem; /* 16px */
  font-size: 0.875rem; /* 14px */
  gap: 0.5rem; /* 8px */
}

/* ❌ INCORRETO */
.container {
  padding: 16px;
  font-size: 14px;
  gap: 8px;
}
```

### Cores Semânticas
```typescript
// ✅ CORRETO
<Badge variant="destructive">Erro</Badge>
<Badge variant="success">Sucesso</Badge>

// ❌ INCORRETO
<Badge className="bg-red-500">Erro</Badge>
```

### Animações
```css
/* ✅ CORRETO - Respeita preferências */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}

/* ✅ CORRETO - Animação suave */
.card {
  transition: transform 0.2s ease-out;
}
```

## 📝 TypeScript

### Tipos Estritos
```typescript
// ✅ CORRETO
interface User {
  id: string;
  name: string;
  email: string | null;
}

function getUser(id: string): User | null {
  // ...
}

// ❌ INCORRETO
function getUser(id: any): any {
  // ...
}
```

### Null Safety
```typescript
// ✅ CORRETO
const userName = user?.name ?? 'Anônimo';

// ❌ INCORRETO
const userName = user.name; // Pode ser null/undefined
```

### Type Guards
```typescript
// ✅ CORRETO
function isValidOrder(order: unknown): order is Order {
  return (
    typeof order === 'object' &&
    order !== null &&
    'id' in order &&
    'total' in order
  );
}

if (isValidOrder(data)) {
  // TypeScript sabe que data é Order
  console.log(data.total);
}
```

## 🧪 Testes

### Testes Unitários
```typescript
// ✅ CORRETO
describe('sanitizeString', () => {
  it('deve remover tags HTML', () => {
    expect(sanitizeString('<script>alert("xss")</script>'))
      .toBe('scriptalert("xss")/script');
  });

  it('deve remover javascript:', () => {
    expect(sanitizeString('javascript:alert(1)'))
      .toBe('alert(1)');
  });
});
```

### Testes de Componentes
```typescript
// ✅ CORRETO
import { render, screen } from '@testing-library/react';

test('renderiza botão com label acessível', () => {
  render(<Button aria-label="Salvar">Salvar</Button>);
  expect(screen.getByLabelText('Salvar')).toBeInTheDocument();
});
```

## 🔄 Estado e Dados

### React Query
```typescript
// ✅ CORRETO
const { data, isLoading, error } = useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders,
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// ❌ INCORRETO - Sem cache
useEffect(() => {
  fetchOrders().then(setOrders);
}, []);
```

### Context API
```typescript
// ✅ CORRETO - Memoizado
const value = useMemo(
  () => ({ user, loading, signOut }),
  [user, loading, signOut]
);

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);

// ❌ INCORRETO - Novo objeto a cada render
return (
  <AuthContext.Provider value={{ user, loading, signOut }}>
    {children}
  </AuthContext.Provider>
);
```

## 📦 Imports

### Organização
```typescript
// ✅ CORRETO - Ordem lógica
import { useState, useEffect, useMemo } from 'react'; // React
import { useNavigate } from 'react-router-dom'; // Bibliotecas
import { Button } from '@/components/ui/button'; // UI
import { useAuth } from '@/contexts/AuthContext'; // Contexts
import { formatCurrency } from '@/lib/utils'; // Utils
import type { Order } from '@/hooks/useStore'; // Types

// ❌ INCORRETO - Sem organização
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import type { Order } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
```

## 🚀 Build e Deploy

### Otimização de Bundle
```typescript
// ✅ CORRETO - Code splitting
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// ✅ CORRETO - Tree shaking
import { formatCurrency } from '@/lib/utils';

// ❌ INCORRETO - Import completo
import * as utils from '@/lib/utils';
```

### Variáveis de Ambiente
```typescript
// ✅ CORRETO
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ INCORRETO - Hardcoded
const apiUrl = 'https://api.example.com';
```

## 📚 Documentação

### Comentários
```typescript
// ✅ CORRETO - Explica o "porquê"
// Debounce necessário para evitar sobrecarga da API
// quando usuário digita rapidamente
const debouncedSearch = debounce(search, 300);

// ❌ INCORRETO - Explica o "o quê" (óbvio)
// Cria uma função debounced
const debouncedSearch = debounce(search, 300);
```

### JSDoc
```typescript
// ✅ CORRETO
/**
 * Sanitiza string removendo caracteres perigosos
 * @param input - String a ser sanitizada
 * @returns String sanitizada sem tags HTML ou scripts
 */
export function sanitizeString(input: string): string {
  // ...
}
```

## 🔍 Code Review Checklist

- [ ] Inputs sanitizados e validados
- [ ] Componentes pesados memoizados
- [ ] ARIA labels em elementos interativos
- [ ] Tipos TypeScript estritos
- [ ] Testes unitários adicionados
- [ ] Sem console.log em produção
- [ ] Tratamento de erros implementado
- [ ] Responsivo em todos os breakpoints
- [ ] Acessível por teclado
- [ ] Performance testada (Lighthouse)

---

**Mantenha este guia atualizado conforme o projeto evolui!**
