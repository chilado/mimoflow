import { useMemo } from 'react';
import { TrendingUp, ShoppingBag, AlertTriangle, Clock, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/store';
import { useMaterials, useOrders, useTransactions } from '@/hooks/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(262,52%,58%)', 'hsl(205,76%,70%)', 'hsl(152,56%,48%)', 'hsl(38,92%,58%)', 'hsl(0,72%,58%)', 'hsl(262,30%,70%)'];

export default function DashboardPage() {
  const { orders } = useOrders();
  const { transactions } = useTransactions();
  const { materials } = useMaterials();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'finished');
    const lowStock = materials.filter(m => Number(m.quantity) <= Number(m.min_stock));
    const upcomingDeliveries = orders
      .filter(o => o.status !== 'delivered' && o.status !== 'finished' && o.delivery_date)
      .filter(o => {
        const diff = (new Date(o.delivery_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      })
      .sort((a, b) => new Date(a.delivery_date!).getTime() - new Date(b.delivery_date!).getTime());

    return { income, expenses, profit: income - expenses, pendingOrders, lowStock, upcomingDeliveries };
  }, [orders, transactions, materials]);

  // Monthly revenue chart (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { name: string; entradas: number; saidas: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      const mTx = transactions.filter(t => t.date.startsWith(key));
      months.push({
        name: label,
        entradas: mTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
        saidas: mTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
      });
    }
    return months;
  }, [transactions]);

  // ABC curve - top products by revenue
  const abcData = useMemo(() => {
    const itemMap: Record<string, number> = {};
    orders.forEach(o => {
      const items = (Array.isArray(o.items) ? o.items : []) as { name: string; quantity: number; unitPrice: number }[];
      items.forEach(item => {
        if (item.name) {
          itemMap[item.name] = (itemMap[item.name] || 0) + (item.quantity || 0) * (item.unitPrice || 0);
        }
      });
    });
    return Object.entries(itemMap)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [orders]);

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

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="animate-fade-up stagger-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.some(m => m.entradas > 0 || m.saidas > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,12%,90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="entradas" fill="hsl(152,56%,48%)" radius={[4, 4, 0, 0]} name="Entradas" />
                  <Bar dataKey="saidas" fill="hsl(0,72%,58%)" radius={[4, 4, 0, 0]} name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Adicione lançamentos financeiros para ver o gráfico</p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up stagger-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Curva ABC — Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {abcData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={abcData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {abcData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Adicione pedidos com itens para ver a curva ABC</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="animate-fade-up stagger-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Alertas de Estoque
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
                    <span className="text-muted-foreground">{m.quantity} {m.unit} (mín: {m.min_stock})</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up stagger-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" /> Entregas Próximas (7 dias)
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
                      <span className="font-medium">{o.client_name}</span>
                      <span className="text-muted-foreground ml-2">— {o.event_theme}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(o.delivery_date!).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-up stagger-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pedido cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm p-3 rounded-md border">
                  <div>
                    <span className="font-medium">{o.client_name}</span>
                    <span className="text-muted-foreground ml-2">{o.event_theme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatCurrency(Number(o.total))}</span>
                    <Badge variant="outline" className="text-xs">
                      {ORDER_STATUS_LABELS[o.status as OrderStatus]}
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
