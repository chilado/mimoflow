import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calculator, ClipboardList, Package, Users, DollarSign,
  CalendarDays, ShoppingBag, CheckCircle2,
  ArrowRight, Sparkles, Link2, FileText, Image, Smartphone, Shield,
} from 'lucide-react';

const features = [
  { icon: Calculator, title: 'Precificação Inteligente', desc: 'Calcule o preço ideal com custo de materiais, mão de obra, custos fixos, impostos e taxas de plataforma.' },
  { icon: ClipboardList, title: 'Gestão de Pedidos', desc: 'Controle status, aprovação de arte, personalização e gere PDFs de orçamento e recibos com sua marca.' },
  { icon: Package, title: 'Controle de Estoque', desc: 'Gerencie insumos, fornecedores, custo por unidade e receba alertas de estoque baixo.' },
  { icon: ShoppingBag, title: 'Produtos & Kits', desc: 'Galeria de fotos, ficha técnica com composição de materiais e cálculo automático de custo.' },
  { icon: Link2, title: 'Catálogo Virtual', desc: 'Gere um link público do seu catálogo com vitrine de produtos, botões de WhatsApp, Instagram e Como chegar.' },
  { icon: Users, title: 'Cadastro de Clientes', desc: 'Histórico completo de pedidos e contatos organizados em um só lugar.' },
  { icon: DollarSign, title: 'Financeiro Completo', desc: 'Fluxo de caixa, relatórios e gráficos de faturamento mensal com curva ABC.' },
  { icon: CalendarDays, title: 'Agenda de Entregas', desc: 'Calendário visual com prazos, alertas e filtros por status de pedido.' },
  { icon: FileText, title: 'PDF com sua Marca', desc: 'Orçamentos e recibos com logotipo, cores da empresa, WhatsApp, Instagram e endereço.' },
  { icon: Image, title: 'Galeria de Fotos', desc: 'Adicione múltiplas fotos por produto com carrossel e lightbox no catálogo público.' },
  { icon: Smartphone, title: 'Otimizado para Mobile', desc: 'Interface responsiva com menu lateral adaptado para uso no celular.' },
  { icon: Shield, title: 'Dados Seguros na Nuvem', desc: 'Seus dados são criptografados e isolados com segurança total.' },
];

const planFeatures = [
  'Precificação inteligente com custos fixos e taxas',
  'Gestão ilimitada de pedidos com controle de arte',
  'Controle completo de estoque com alertas',
  'Cadastro ilimitado de clientes',
  'PDF de orçamentos e recibos com logotipo e marca',
  'Catálogo virtual público com link personalizado',
  'Vitrine com WhatsApp, Instagram e Como chegar',
  'Galeria de fotos com carrossel por produto',
  'Dashboard com gráficos e curva ABC',
  'Agenda de entregas com alertas',
  'Fluxo de caixa e relatórios financeiros',
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Entrar</Button>
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
            <Sparkles className="h-3 w-3" /> Sua gestão no fluxo certo
          </Badge>
          <h1 className="font-heading text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Gestão inteligente para seu{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              negócio criativo
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Precifique com precisão, controle pedidos, estoque e finanças — e ainda tenha seu catálogo virtual com link próprio para compartilhar com clientes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto text-base px-8" onClick={() => navigate('/auth')}>
              Criar conta grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">Teste 7 dias grátis • Sem cartão de crédito</p>
          </div>
        </div>
      </section>

      {/* Catalog highlight */}
      <section className="px-4 py-12 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 text-center sm:text-left">
            <Badge className="mb-3">Novidade</Badge>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              Seu catálogo virtual com link próprio
            </h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Crie sua vitrine online em segundos. Compartilhe o link com clientes e deixe seus produtos brilharem — com fotos em carrossel, botão de WhatsApp, Instagram e Como chegar direto no Google Maps.
            </p>
            <p className="mt-3 text-sm font-medium text-primary">
              mimoflow.vercel.app/<span className="opacity-60">sua-empresa</span>
            </p>
          </div>
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: Link2, label: 'Link personalizado' },
              { icon: Image, label: 'Fotos em carrossel' },
              { icon: Smartphone, label: 'Otimizado mobile' },
              { icon: Shield, label: 'Sempre online' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
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
              Funcionalidades pensadas para quem trabalha com criatividade
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
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Plano único, completo e acessível
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Escolha o período que faz mais sentido para você. Todas as funcionalidades em todos os planos.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Mensal */}
            <Card className="border-border relative overflow-hidden">
              <CardContent className="p-6 flex flex-col h-full">
                <h3 className="font-heading text-base font-bold">Mensal</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <span className="font-heading text-4xl font-bold text-primary">29</span>
                  <span className="font-heading text-xl font-bold text-primary">,90</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">por mês</p>
                <Button className="w-full mt-6" variant="outline" onClick={() => navigate('/auth')}>
                  Começar
                </Button>
              </CardContent>
            </Card>

            {/* Trimestral */}
            <Card className="border-border relative overflow-hidden">
              <CardContent className="p-6 flex flex-col h-full">
                <h3 className="font-heading text-base font-bold">Trimestral</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <span className="font-heading text-4xl font-bold text-primary">85</span>
                  <span className="font-heading text-xl font-bold text-primary">,00</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">a cada 3 meses</p>
                <Badge variant="secondary" className="text-[11px] w-fit mt-2">≈ R$28,33/mês</Badge>
                <Button className="w-full mt-6" variant="outline" onClick={() => navigate('/auth')}>
                  Começar
                </Button>
              </CardContent>
            </Card>

            {/* Semestral */}
            <Card className="border-primary/40 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold">Semestral</h3>
                  <Badge className="text-[11px]">Popular</Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <span className="font-heading text-4xl font-bold text-primary">150</span>
                  <span className="font-heading text-xl font-bold text-primary">,00</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">a cada 6 meses</p>
                <Badge variant="secondary" className="text-[11px] w-fit mt-2">≈ R$25,00/mês</Badge>
                <Button className="w-full mt-6" onClick={() => navigate('/auth')}>
                  Começar
                </Button>
              </CardContent>
            </Card>

            {/* Anual */}
            <Card className="border-accent/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-primary" />
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold">Anual</h3>
                  <Badge variant="secondary" className="text-[11px] bg-success/15 text-success border-success/30">Melhor valor</Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <span className="font-heading text-4xl font-bold text-primary">240</span>
                  <span className="font-heading text-xl font-bold text-primary">,00</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">por ano</p>
                <Badge variant="secondary" className="text-[11px] w-fit mt-2">≈ R$20,00/mês</Badge>
                <Button className="w-full mt-6" variant="outline" onClick={() => navigate('/auth')}>
                  Começar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features list */}
          <Card className="mt-8 border-border">
            <CardContent className="p-6">
              <p className="text-sm font-semibold mb-4">Todos os planos incluem:</p>
              <div className="grid sm:grid-cols-2 gap-2 text-left">
                {planFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="mt-4 text-xs text-muted-foreground">Cancele quando quiser • Sem taxa de adesão • 7 dias grátis</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Pronta para organizar seu negócio?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Junte-se a centenas de empreendedoras que já transformaram sua gestão com o MimoFlow.
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
              <span className="text-xs font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-heading text-sm font-semibold">MimoFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MimoFlow. Sua gestão no fluxo certo.
          </p>
        </div>
      </footer>
    </div>
  );
});

export default LandingPage;
