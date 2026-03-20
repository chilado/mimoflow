// Types and constants for the app (data access moved to hooks/useStore.ts)

export type OrderStatus =
  | 'awaiting_payment'
  | 'awaiting_art'
  | 'art_approval'
  | 'art_approved'
  | 'in_production'
  | 'finished'
  | 'delivered';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: 'Aguardando Pagamento',
  awaiting_art: 'Aguardando Arte',
  art_approval: 'Arte para Aprovação',
  art_approved: 'Arte Aprovada',
  in_production: 'Em Produção',
  finished: 'Finalizado',
  delivered: 'Entregue',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  awaiting_payment: 'bg-warning/15 text-warning-foreground border-warning/30',
  awaiting_art: 'bg-info/15 text-info-foreground border-info/30',
  art_approval: 'bg-primary/15 text-primary border-primary/30',
  art_approved: 'bg-success/15 text-success border-success/30',
  in_production: 'bg-accent/15 text-accent-foreground border-accent/30',
  finished: 'bg-success/15 text-success border-success/30',
  delivered: 'bg-muted text-muted-foreground border-border',
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
