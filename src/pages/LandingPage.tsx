import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calculator, ClipboardList, Package, Users, DollarSign,
  CalendarDays, ShoppingBag, CheckCircle2, Star, Zap, Shield,
  ArrowRight, Sparkles,
} from 'lucide-react';

const features = [
  { icon: Calculator, title: 'Precificação Inteligente', desc: 'Calcule o preço ideal com custo de materiais, mão de obra e margem de lucro.' },
  { icon: ClipboardList, title: 'Gestão de Pedidos', desc: 'Controle status, aprovação de arte e gere PDFs de orçamento e recibos.' },
  { icon: Package, title: 'Controle de Estoque', desc: 'Gerencie insumos, fornecedores e receba alertas de estoque baixo.' },
  { icon: Users, title: 'Cadastro de Clientes', desc: 'Histórico completo de pedidos e contatos organizados.' },
  { icon: DollarSign, title: 'Financeiro Completo', desc: 'Fluxo de caixa, relatórios e gráficos de faturamento mensal.' },
  { icon: CalendarDays, title: 'Agenda de Entregas', desc: 'Calendário visual com prazos, alertas e filtros por status.' },
  { icon: ShoppingBag, title: 'Produtos & Kits', desc: 'Galeria de fotos, ficha técnica e composição de materiais.' },
  { icon: Shield, title: 'Dados Seguros', desc: 'Seus dados são criptografados e isolados na nuvem com segurança.' },
];

const planFeatures = [
  'Precificação inteligente com custos fixos',
  'Gestão ilimitada de pedidos',
  'Controle completo de estoque',
  'Cadastro ilimitado de clientes',
  'Geração de PDF (orçamentos e recibos)',
  'Dashboard com gráficos e curva ABC',
  'Agenda de entregas com alertas',
  'Galeria de produtos e ficha técnica',
  'Fluxo de caixa e relatórios',
  'Dados salvos na nuvem com segurança',
];

const LandingPage = memo(function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-heading text-lg font-bold">MimoFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button size="sm" onClick={() => navigate('/auth')}>
              Começar agora <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 gap-1 px-3 py-1">
            <Sparkles className="h-3 w-3" /> Feito para papelarias personalizadas
          </Badge>
          <h1 className="font-heading text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Gestão inteligente para seu{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              negócio criativo
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Precifique com precisão, controle pedidos, estoque e finanças em um só lugar.
            Pare de perder dinheiro e tempo com planilhas.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto text-base px-8" onClick={() => navigate('/auth')}>
              Criar conta grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Teste 7 dias grátis • Sem cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              Tudo que você precisa em um só app
            </h2>
            <p className="mt-3 text-muted-foreground">
              Funcionalidades pensadas para quem trabalha com papelaria personalizada
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="card-hover border-transparent bg-card">
                <CardContent className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-sm font-semibold">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16 sm:py-20 bg-muted/40" id="pricing">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Plano único, completo e acessível
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Sem surpresas. Todas as funcionalidades por um preço justo.
          </p>

          <Card className="mt-8 border-primary/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <Badge variant="secondary" className="text-xs">Mais popular</Badge>
              </div>
              <h3 className="font-heading text-xl font-bold">Plano Profissional</h3>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <span className="font-heading text-5xl font-bold text-primary">19</span>
                <span className="font-heading text-2xl font-bold text-primary">,99</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Cancele quando quiser • Sem taxa de adesão
              </p>

              <div className="mt-6 space-y-3 text-left">
                {planFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-sm">{feat}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-8 text-base" size="lg" onClick={() => navigate('/auth')}>
                <Zap className="mr-2 h-5 w-5" /> Começar agora
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">7 dias grátis para testar</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Pronta para organizar seu negócio?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Junte-se a centenas de empreendedoras que já transformaram sua gestão.
          </p>
          <Button size="lg" className="mt-8 text-base px-8" onClick={() => navigate('/auth')}>
            Criar minha conta <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">P</span>
            </div>
            <span className="font-heading text-sm font-semibold">PapelariaApp</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PapelariaApp. Gestão Inteligente para Papelaria Personalizada.
          </p>
        </div>
      </footer>
    </div>
  );
});

export default LandingPage;
