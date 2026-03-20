import { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTransactions } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/store';

const expenseCategories = ['Material', 'Equipamento', 'Aluguel', 'Energia', 'Internet', 'Transporte', 'Marketing', 'Outros'];
const incomeCategories = ['Venda', 'Encomenda', 'Outros'];

export default function FinancePage() {
  const { transactions, add, remove } = useTransactions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'income' as 'income' | 'expense', description: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Venda' });
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const handleSave = () => {
    add(form);
    setOpen(false);
    setForm({ type: 'income', description: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Venda' });
  };

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(monthFilter)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, monthFilter]);

  const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-heading text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground text-sm mt-1">Fluxo de caixa e relatórios</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Lançamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant={form.type === 'income' ? 'default' : 'outline'} className="w-full" onClick={() => setForm(f => ({ ...f, type: 'income', category: 'Venda' }))}>
                  <ArrowUpRight className="h-4 w-4 mr-1" /> Entrada
                </Button>
                <Button variant={form.type === 'expense' ? 'destructive' : 'outline'} className="w-full" onClick={() => setForm(f => ({ ...f, type: 'expense', category: 'Material' }))}>
                  <ArrowDownRight className="h-4 w-4 mr-1" /> Saída
                </Button>
              </div>
              <div>
                <Label className="text-xs">Descrição</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Venda Kit Festa" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Valor (R$)</Label>
                  <Input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Data</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(form.type === 'income' ? incomeCategories : expenseCategories).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!form.description || form.amount <= 0}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="w-48 animate-fade-up stagger-1" />

      <div className="grid grid-cols-3 gap-4 animate-fade-up stagger-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Entradas</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-lg font-bold text-success">{formatCurrency(income)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Saídas</span>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-lg font-bold text-destructive">{formatCurrency(expenses)}</p>
          </CardContent>
        </Card>
        <Card className={balance >= 0 ? 'border-success/30' : 'border-destructive/30'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Saldo</span>
            </div>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(balance)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-up stagger-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lançamentos do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {monthTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum lançamento neste mês.</p>
          ) : (
            <div className="space-y-2">
              {monthTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="font-medium">{t.description}</span>
                      <div className="text-xs text-muted-foreground">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(t.id)}><Trash2 className="h-3 w-3" /></Button>
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
