import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProfile, usePricingConfig } from '@/hooks/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/store';
import { toast } from 'sonner';
import { Save, Copy, Check, ExternalLink, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function SettingsPage() {
  const { config, loading: configLoading, save: saveConfig } = usePricingConfig();
  const { profile, loading: profileLoading, save: saveProfile } = useProfile();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [address, setAddress] = useState('');
  const [catalogSlug, setCatalogSlug] = useState('');
  const [slugSaving, setSlugSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

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
    setCompanyDescription((profile as any).company_description || '');
    setWhatsapp(profile.whatsapp || '');
    setInstagram(profile.instagram || '');
    setAddress(profile.address || '');
    setCatalogSlug((profile as any).catalog_slug || '');
    setProfileInit(true);
  }

  if (config && !configInit) {
    setSalary(String(config.desired_monthly_salary));
    setHours(String(config.monthly_work_hours));
    setMarginVal(String(config.default_margin));
    setTaxVal(String(config.default_tax_rate));
    setConfigInit(true);
  }

  const handleSaveProfile = useCallback(async () => {
    await saveProfile({
      company_name: companyName.trim(),
      company_phone: companyPhone.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim(),
      address: address.trim(),
      company_description: companyDescription.trim(),
    } as any);
    toast.success('Perfil da empresa atualizado!');
  }, [companyName, companyPhone, whatsapp, instagram, address, companyDescription, saveProfile]);

  const handleSaveSlug = async () => {
    if (!profile) return;
    const slug = catalogSlug.trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) { toast.error('Digite um link válido'); return; }

    setSlugSaving(true);
    // Check uniqueness
    const { data: existing } = await (supabase
      .from('profiles' as any)
      .select('id')
      .eq('catalog_slug' as any, slug)
      .neq('id', (profile as any).id)
      .maybeSingle() as any);

    if (existing) {
      toast.error('Esse link já está em uso, escolha outro.');
      setSlugSaving(false);
      return;
    }

    await (supabase.from('profiles' as any).update({ catalog_slug: slug } as any).eq('id', (profile as any).id) as any);
    setCatalogSlug(slug);
    setSlugSaving(false);
    toast.success('Link do catálogo atualizado!');
  };

  const handleCopyLink = async () => {
    const url = `https://mimoflow.vercel.app/${catalogSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLogoUpload = async (file: File) => {
    if (!user || !profile) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem muito grande (máx 2MB)'); return; }
    setLogoUploading(true);
    const ext = file.name.split('.').pop() || 'png';
    const path = `${user.id}/logo/logo.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      console.error('Logo upload error:', error);
      toast.error(`Erro ao enviar logo: ${error.message}`);
      setLogoUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    await saveProfile({ company_logo_url: `${publicUrl}?t=${Date.now()}` });
    setLogoUploading(false);
    toast.success('Logo atualizado!');
  };

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

  if (configLoading || profileLoading) return <div className="p-8 text-muted-foreground">Carregando...</div>;

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
          {/* Logo upload */}
          <div className="flex items-center gap-4">
            {profile?.company_logo_url ? (
              <img src={profile.company_logo_url} alt="Logo" className="h-16 w-16 rounded-full object-cover border" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted border flex items-center justify-center text-muted-foreground text-xs">Logo</div>
            )}
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 transition-colors text-xs text-muted-foreground">
              <Upload className="h-4 w-4" />
              {logoUploading ? 'Enviando...' : 'Enviar logo'}
              <input type="file" accept="image/*" className="hidden" disabled={logoUploading} onChange={e => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); e.target.value = ''; }} />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Nome da Empresa</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Minha Empresa" maxLength={100} />
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} />
            </div>
            <div>
              <Label className="text-xs">WhatsApp</Label>
              <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999999999" maxLength={20} />
              <p className="text-[11px] text-muted-foreground mt-0.5">Somente números com DDI (ex: 5511999999999)</p>
            </div>
            <div>
              <Label className="text-xs">Instagram</Label>
              <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@minhaempresa" maxLength={60} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Endereço</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua Exemplo, 123 - Cidade/UF" maxLength={200} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Descrição da Empresa</Label>
              <textarea
                value={companyDescription}
                onChange={e => setCompanyDescription(e.target.value)}
                placeholder="Conte um pouco sobre sua empresa, especialidades, diferenciais..."
                maxLength={300}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <p className="text-[11px] text-muted-foreground mt-0.5">{companyDescription.length}/300</p>
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
          <CardTitle className="text-base">Catálogo Público</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Defina o link do seu catálogo virtual. Deve ser único e usar apenas letras, números e hífens.
          </p>
          <div>
            <Label className="text-xs">Link do Catálogo</Label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">mimoflow.vercel.app/</span>
              <Input
                value={catalogSlug}
                onChange={e => setCatalogSlug(e.target.value)}
                placeholder="nome-da-empresa"
                maxLength={60}
                className="flex-1"
              />
            </div>
          </div>
          {catalogSlug && (
            <p className="text-xs text-muted-foreground">
              Prévia: <span className="text-primary">https://mimoflow.vercel.app/{catalogSlug}</span>
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveSlug} disabled={slugSaving}>
              <Save className="h-3.5 w-3.5 mr-1.5" /> {slugSaving ? 'Salvando...' : 'Salvar Link'}
            </Button>
            {catalogSlug && (
              <>
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  Copiar Link
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href={`https://mimoflow.vercel.app/${catalogSlug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Abrir
                  </a>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-up stagger-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sobre o App</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            MimoFlow — Sua gestão no fluxo certo.
            Seus dados são salvos com segurança na nuvem.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
