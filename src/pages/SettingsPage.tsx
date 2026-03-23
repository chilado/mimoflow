import { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProfile, usePricingConfig } from '@/hooks/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/store';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default memo(function SettingsPage() {
  const { config, loading: configLoading, save: saveConfig } = usePricingConfig();
  const { profile, loading: profileLoading, save: saveProfile } = useProfile();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  // Pricing config local state
  const [salary, setSalary] = useState('');
  const [hours, setHours] = useState('');
  const [marginVal, setMarginVal] = useState('');
  const [taxVal, setTaxVal] = useState('');

  const [profileInit, setProfileInit] = useState(false);
  const [configInit, setConfigInit] = useState(false);

  if (profile && !profileInit) {
    setCompanyName(profile.company_name || '');
    setCompanyPhone(profile.company_phone || '');
    setProfileInit(true);
  }

  if (config && !configInit) {
    setSalary(String(config.desired_monthly_salary));
    setHours(String(config.monthly_work_hours));
    setMarginVal(String(config.default_margin));
    setTaxVal(String(config.default_tax_rate));
    setConfigInit(true);
  }

  if (configLoading || profileLoading) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const handleSaveProfile = useCallback(async () => {
    await saveProfile({ company_name: companyName.trim(), company_phone: companyPhone.trim() });
    toast.success('Perfil da empresa atualizado!');
  }, [companyName, companyPhone, saveProfile]);

  const handleSaveConfig = useCallback(async () => {
    if (!config) return;
    await saveConfig({
      ...config,
      desired_monthly_salary: +salary || 0,
      monthly_work_hours: +hours || 0,
      default_margin: +marginVal || 0,
      default_tax_rate: +taxVal || 0,
    });
    toast.success('Configurações de precificação salvas!');
  }, [config, salary, hours, marginVal, taxVal, saveConfig]);

  const hourlyRate = (+hours || 0) > 0 ? (+salary || 0) / (+hours) : 0;

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Nome da Empresa</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Minha Papelaria" maxLength={100} />
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Email: {user?.email}</p>
          <Button size="sm" onClick={handleSaveProfile}>
            <Save className="h-3.5 w-3.5 mr-1.5" /> Salvar Dados da Empresa
          </Button>
        </CardContent>
      </Card>

      {config && (
        <Card className="animate-fade-up stagger-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Precificação Padrão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Salário Desejado (R$/mês)</Label>
                <Input type="number" value={salary} onChange={e => setSalary(e.target.value)} min={0} />
              </div>
              <div>
                <Label className="text-xs">Horas Trabalhadas/Mês</Label>
                <Input type="number" value={hours} onChange={e => setHours(e.target.value)} min={0} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Margem de Lucro Padrão (%)</Label>
                <Input type="number" value={marginVal} onChange={e => setMarginVal(e.target.value)} min={0} />
              </div>
              <div>
                <Label className="text-xs">Taxa de Imposto Padrão (%)</Label>
                <Input type="number" value={taxVal} onChange={e => setTaxVal(e.target.value)} min={0} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Valor da sua hora: <strong className="text-foreground">{formatCurrency(hourlyRate)}</strong>
            </p>
            <Button size="sm" onClick={handleSaveConfig}>
              <Save className="h-3.5 w-3.5 mr-1.5" /> Salvar Precificação
            </Button>
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
});
