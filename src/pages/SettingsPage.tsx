import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProfile, usePricingConfig } from '@/hooks/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/store';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { config, loading: configLoading, save: saveConfig } = usePricingConfig();
  const { profile, loading: profileLoading, save: saveProfile } = useProfile();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setCompanyName(profile.company_name || '');
    setCompanyPhone(profile.company_phone || '');
    setInitialized(true);
  }

  if (configLoading || profileLoading) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const handleSaveProfile = async () => {
    await saveProfile({ company_name: companyName, company_phone: companyPhone });
    toast.success('Perfil da empresa atualizado!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Ajuste seus parâmetros</p>
      </div>

      <Card className="animate-fade-up stagger-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Estas informações aparecem no PDF de orçamento.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Nome da Empresa</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Minha Papelaria" />
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Email: {user?.email}</p>
          <Button size="sm" onClick={handleSaveProfile}>Salvar Dados da Empresa</Button>
        </CardContent>
      </Card>

      {config && (
        <Card className="animate-fade-up stagger-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Precificação Padrão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Salário Desejado (R$/mês)</Label>
                <Input type="number" value={config.desired_monthly_salary} onChange={e => saveConfig({ ...config, desired_monthly_salary: +e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Horas Trabalhadas/Mês</Label>
                <Input type="number" value={config.monthly_work_hours} onChange={e => saveConfig({ ...config, monthly_work_hours: +e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Margem de Lucro Padrão (%)</Label>
                <Input type="number" value={config.default_margin} onChange={e => saveConfig({ ...config, default_margin: +e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Taxa de Imposto Padrão (%)</Label>
                <Input type="number" value={config.default_tax_rate} onChange={e => saveConfig({ ...config, default_tax_rate: +e.target.value })} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Valor da sua hora: <strong className="text-foreground">{formatCurrency(Number(config.monthly_work_hours) > 0 ? Number(config.desired_monthly_salary) / Number(config.monthly_work_hours) : 0)}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-up stagger-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sobre o App</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            PapelariaApp — Gestão Inteligente para Empreendedores de Papelaria Personalizada.
            Seus dados são salvos com segurança na nuvem.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
