import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usePricingConfig } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/store';

export default function SettingsPage() {
  const { config, save } = usePricingConfig();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Ajuste seus parâmetros de precificação</p>
      </div>

      <Card className="animate-fade-up stagger-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Precificação Padrão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Salário Desejado (R$/mês)</Label>
              <Input type="number" value={config.desiredMonthlySalary} onChange={e => save({ ...config, desiredMonthlySalary: +e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Horas Trabalhadas/Mês</Label>
              <Input type="number" value={config.monthlyWorkHours} onChange={e => save({ ...config, monthlyWorkHours: +e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Margem de Lucro Padrão (%)</Label>
              <Input type="number" value={config.defaultMargin} onChange={e => save({ ...config, defaultMargin: +e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Taxa de Imposto Padrão (%)</Label>
              <Input type="number" value={config.defaultTaxRate} onChange={e => save({ ...config, defaultTaxRate: +e.target.value })} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Valor da sua hora: <strong className="text-foreground">{formatCurrency(config.monthlyWorkHours > 0 ? config.desiredMonthlySalary / config.monthlyWorkHours : 0)}</strong>
          </p>
        </CardContent>
      </Card>

      <Card className="animate-fade-up stagger-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sobre o App</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            PapelariaApp — Gestão Inteligente para Empreendedores de Papelaria Personalizada.
            Os dados são salvos localmente no seu navegador.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
