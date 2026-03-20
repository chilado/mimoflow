import { useMemo } from 'react';
import { TrendingUp, ShoppingBag, AlertTriangle, Clock, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { store, formatCurrency, ORDER_STATUS_LABELS } from '@/lib/store';

export default function DashboardPage() {
  const orders = store.getOrders();
  const transactions = store.getTransactions();
  const materials = store.getMaterials();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'finished');
    const lowStock = materials.filter(m => m.quantity <= m.minStock);
    const upcomingDeliveries = orders
      .filter(o => o.status !== 'delivered' && o.status !== 'finished')
      .filter(o => {
        const diff = (new Date(o.deliveryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      })
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

    return { income, expenses, profit: income - expenses, pendingOrders, lowStock, upcomingDeliveries };
  }, [orders, transactions, materials]);

  const summaryCards = [
    { title: 'Entradas do Mês', value: formatCurrency(stats.income), icon: DollarSign, color: 'text-success' },
    { title: 'Lucro Estimado', value: formatCurrency(stats.profit), icon: TrendingUp, color: stats.profit >= 0 ? 'text-success' : 'text-destructive' },
    { title: 'Pedidos Pendentes', value: stats.pendingOrders.length.toString(), icon: ShoppingBag, color: 'text-primary' },
    { title: 'Estoque Baixo', value: stats.lowStock.length.toString(), icon: Package, color: stats.lowStock.length > 0 ? 'text-warning' : 'text-muted-foreground' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <Card key={card.title} className={`card-hover animate-fade-up stagger-${i + 1}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="text-xl font-bold font-heading">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Alertas de estoque */}
        <Card className="animate-fade-up stagger-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum material em estoque baixo 🎉</p>
            ) : (
              <div className="space-y-2">
                {stats.lowStock.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm rounded-md bg-warning/10 px-3 py-2">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-muted-foreground">
                      {m.quantity} {m.unit} (mín: {m.minStock})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entregas próximas */}
        <Card className="animate-fade-up stagger-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" />
              Entregas Próximas (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma entrega nos próximos 7 dias</p>
            ) : (
              <div className="space-y-2">
                {stats.upcomingDeliveries.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between text-sm rounded-md bg-info/10 px-3 py-2">
                    <div>
                      <span className="font-medium">{o.clientName}</span>
                      <span className="text-muted-foreground ml-2">— {o.eventTheme}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(o.deliveryDate).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pedidos recentes */}
      <Card className="animate-fade-up stagger-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pedido cadastrado. Comece adicionando um pedido!</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(-5).reverse().map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm p-3 rounded-md border">
                  <div>
                    <span className="font-medium">{o.clientName}</span>
                    <span className="text-muted-foreground ml-2">{o.eventTheme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatCurrency(o.total)}</span>
                    <Badge variant="outline" className="text-xs">
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
