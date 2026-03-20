import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useStore';
import { formatCurrency, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/store';
import { CalendarDays, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { format, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  awaiting_payment: 'bg-amber-500',
  awaiting_art: 'bg-orange-400',
  art_approved: 'bg-blue-500',
  in_production: 'bg-violet-500',
  finished: 'bg-emerald-500',
  delivered: 'bg-muted-foreground',
};

export default function AgendaPage() {
  const { orders } = useOrders();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const ordersWithDate = useMemo(
    () => orders.filter((o) => o.delivery_date),
    [orders],
  );

  // Dates that have deliveries
  const deliveryDates = useMemo(() => {
    const map = new Map<string, number>();
    ordersWithDate.forEach((o) => {
      const key = o.delivery_date!;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [ordersWithDate]);

  // Orders for the selected day
  const dayOrders = useMemo(() => {
    if (!selectedDate) return [];
    return ordersWithDate.filter((o) =>
      isSameDay(new Date(o.delivery_date! + 'T12:00:00'), selectedDate),
    );
  }, [selectedDate, ordersWithDate]);

  // Overdue orders
  const overdueOrders = useMemo(() => {
    const today = startOfDay(new Date());
    return ordersWithDate.filter(
      (o) =>
        o.status !== 'delivered' &&
        o.status !== 'finished' &&
        isBefore(new Date(o.delivery_date! + 'T12:00:00'), today),
    );
  }, [ordersWithDate]);

  // Week summary
  const weekSummary = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return ordersWithDate.filter((o) => {
      const d = new Date(o.delivery_date! + 'T12:00:00');
      return d >= startOfDay(now) && d <= weekEnd && o.status !== 'delivered';
    }).length;
  }, [ordersWithDate]);

  // Custom day rendering modifiers
  const modifiers = useMemo(() => {
    const dates: Date[] = [];
    deliveryDates.forEach((_, key) => {
      dates.push(new Date(key + 'T12:00:00'));
    });
    return { delivery: dates };
  }, [deliveryDates]);

  const modifiersStyles = {
    delivery: {
      fontWeight: 700,
    } as React.CSSProperties,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Agenda de Entregas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visualize seus prazos e evite sobrecarga de trabalho
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Entregas esta semana</p>
              <p className="text-xl font-bold font-heading">{weekSummary}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 ${overdueOrders.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-xs text-muted-foreground">Atrasados</p>
              <p className="text-xl font-bold font-heading">{overdueOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total com data</p>
              <p className="text-xl font-bold font-heading">{ordersWithDate.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-6">
        {/* Calendar */}
        <Card className="w-fit">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              components={{
                DayContent: ({ date }) => {
                  const key = format(date, 'yyyy-MM-dd');
                  const count = deliveryDates.get(key);
                  const overdue =
                    count &&
                    isBefore(date, startOfDay(new Date())) &&
                    ordersWithDate.some(
                      (o) =>
                        o.delivery_date === key &&
                        o.status !== 'delivered' &&
                        o.status !== 'finished',
                    );
                  return (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <span>{date.getDate()}</span>
                      {count && (
                        <span
                          className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                            overdue ? 'bg-destructive' : 'bg-primary'
                          }`}
                        />
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Day details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedDate
                ? isToday(selectedDate)
                  ? 'Hoje — ' + format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                  : format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
                : 'Selecione um dia'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nenhuma entrega nesta data
              </p>
            ) : (
              <div className="space-y-3">
                {dayOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40"
                  >
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_COLORS[o.status] || 'bg-muted-foreground'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{o.client_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {o.event_theme}
                      </p>
                      {o.personalization && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          🎨 {o.personalization}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(Number(o.total))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue section */}
      {overdueOrders.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Pedidos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between text-sm rounded-md bg-destructive/10 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{o.client_name}</span>
                    <span className="text-muted-foreground truncate">— {o.event_theme}</span>
                  </div>
                  <Badge variant="destructive" className="text-[10px] shrink-0">
                    {format(new Date(o.delivery_date! + 'T12:00:00'), 'dd/MM')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
