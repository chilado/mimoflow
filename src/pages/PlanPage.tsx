import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle2, Crown, RefreshCw, XCircle, Clock, Loader2, AlertTriangle, MessageSquare, Send, Upload, DollarSign, Copy } from 'lucide-react';

type PlanKey = 'trial' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
type StatusKey = 'active' | 'cancelled' | 'expired';

interface Subscription {
  id: string;
  plan: PlanKey;
  status: StatusKey;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

const PLAN_LABELS: Record<PlanKey, string> = {
  trial: 'Período de Teste',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

const PLAN_PRICES: Record<PlanKey, string> = {
  trial: 'Grátis',
  monthly: 'R$ 29,90/mês',
  quarterly: 'R$ 85,00/trimestre',
  semiannual: 'R$ 150,00/semestre',
  annual: 'R$ 240,00/ano',
};

const PLAN_DURATION_DAYS: Record<Exclude<PlanKey, 'trial'>, number> = {
  monthly: 30,
  quarterly: 90,
  semiannual: 180,
  annual: 365,
};

const STATUS_LABELS: Record<StatusKey, string> = {
  active: 'Ativo',
  cancelled: 'Cancelado',
  expired: 'Expirado',
};

const plans: { key: Exclude<PlanKey, 'trial'>; label: string; price: string; perMonth: string; highlight?: boolean }[] = [
  { key: 'monthly',    label: 'Mensal',    price: 'R$ 29,90', perMonth: 'R$ 29,90/mês' },
  { key: 'quarterly',  label: 'Trimestral', price: 'R$ 85,00', perMonth: '≈ R$ 28,33/mês' },
  { key: 'semiannual', label: 'Semestral',  price: 'R$ 150,00', perMonth: '≈ R$ 25,00/mês', highlight: true },
  { key: 'annual',     label: 'Anual',      price: 'R$ 240,00', perMonth: '≈ R$ 20,00/mês' },
];

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function PlanPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Support ticket form
  const [ticketType, setTicketType] = useState('subscription');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await (supabase
      .from('subscriptions' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as any);
    const rows = (data || []) as Subscription[];
    setSub(rows[0] || null);
    setHistory(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Exclude<PlanKey, 'trial'> | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const handleUpgrade = async (plan: Exclude<PlanKey, 'trial'>) => {
    setSelectedPlan(plan);
    setPaymentDialogOpen(true);
  };

  const handleProofUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlan || !proofFile) return;

    setUploadingProof(true);
    try {
      // Buscar nome da empresa
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
      }

      // Upload do comprovante para o storage
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Tentando fazer upload do arquivo:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
      }

      console.log('Upload realizado com sucesso:', uploadData);

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      console.log('URL pública:', urlData.publicUrl);

      // Calcular valor do plano
      const planAmounts = {
        monthly: 29.90,
        quarterly: 85.00,
        semiannual: 150.00,
        annual: 240.00,
      };

      // Inserir registro de comprovante
      const { error: insertError } = await supabase
        .from('payment_proofs')
        .insert({
          user_id: user.id,
          company_name: profileData?.company_name || null,
          plan: selectedPlan,
          amount: planAmounts[selectedPlan],
          proof_url: urlData.publicUrl,
          status: 'pending',
        });

      if (insertError) {
        console.error('Erro ao inserir registro:', insertError);
        throw new Error(`Erro ao salvar comprovante: ${insertError.message}`);
      }

      toast.success('Comprovante enviado com sucesso! Aguarde a aprovação do pagamento.');
      setPaymentDialogOpen(false);
      setProofFile(null);
      setSelectedPlan(null);
    } catch (error: any) {
      console.error('Erro ao enviar comprovante:', error);
      toast.error(error.message || 'Erro ao enviar comprovante. Tente novamente.');
    } finally {
      setUploadingProof(false);
    }
  };

  const getPlanAmount = (plan: Exclude<PlanKey, 'trial'>) => {
    const amounts = {
      monthly: 'R$ 29,90',
      quarterly: 'R$ 85,00',
      semiannual: 'R$ 150,00',
      annual: 'R$ 240,00',
    };
    return amounts[plan];
  };

  const sendWhatsAppMessage = () => {
    if (!selectedPlan) return;
    const message = `Olá! Acabei de enviar o comprovante de pagamento do plano ${PLAN_LABELS[selectedPlan]} no valor de ${getPlanAmount(selectedPlan)}. Aguardo a confirmação.`;
    const whatsappUrl = `https://wa.me/5598974002272?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText('98974002272');
    toast.success('Chave PIX copiada!');
  };

  const handleRenew = () => {
    if (!sub || sub.plan === 'trial') return;
    handleUpgrade(sub.plan as Exclude<PlanKey, 'trial'>);
  };

  const handleCancel = async () => {
    if (!sub) return;
    await (supabase.from('subscriptions' as any).update({
      status: 'cancelled', cancelled_at: new Date().toISOString(),
    } as any).eq('id', sub.id) as any);
    toast.success('Plano cancelado.');
    await load();
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmittingTicket(true);
    try {
      // Buscar nome da empresa
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          company_name: profileData?.company_name || null,
          ticket_type: ticketType as any,
          subject: ticketSubject,
          description: ticketDescription,
          status: 'received' as any,
          priority: 'normal' as any,
        });

      if (error) throw error;

      toast.success('Chamado enviado com sucesso! Nossa equipe entrará em contato em breve.');
      
      // Limpar formulário
      setTicketSubject('');
      setTicketDescription('');
      setTicketType('subscription');
    } catch (error: any) {
      console.error('Erro ao enviar chamado:', error);
      toast.error('Erro ao enviar chamado. Tente novamente.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Carregando...</div>;

  const days = sub ? daysLeft(sub.expires_at) : null;
  const isActive = sub?.status === 'active';
  const isTrial = sub?.plan === 'trial';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold">Meu Plano</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua assinatura do MimoFlow</p>
      </div>

      {/* Alerta de assinatura inativa */}
      {(!isActive || sub?.status === 'expired' || sub?.status === 'cancelled') && (
        <Alert variant="destructive" className="animate-fade-up">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {sub?.status === 'expired' && (
              <span>Sua assinatura expirou. Escolha um plano abaixo para reativar seu acesso completo ao MimoFlow.</span>
            )}
            {sub?.status === 'cancelled' && (
              <span>Sua assinatura foi cancelada. Escolha um plano abaixo para reativar seu acesso ao MimoFlow.</span>
            )}
            {!sub && (
              <span>Você não possui uma assinatura ativa. Escolha um plano abaixo para começar a usar o MimoFlow.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de trial ativo */}
      {isActive && isTrial && days !== null && (
        <Alert className="animate-fade-up border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            Você está no período de teste gratuito! {days > 0 ? `Restam ${days} dia${days !== 1 ? 's' : ''} para aproveitar.` : 'Seu período de teste expira hoje.'} Escolha um plano abaixo para continuar usando o MimoFlow após o término.
          </AlertDescription>
        </Alert>
      )}

      {/* Current plan */}
      <Card className={`animate-fade-up stagger-1 ${isTrial && isActive ? 'border-blue-500' : 'border-primary/20'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" /> Plano Atual
            </CardTitle>
            <Badge variant={isActive ? 'default' : 'destructive'}>
              {sub ? STATUS_LABELS[sub.status] : 'Sem plano'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{sub ? PLAN_LABELS[sub.plan] : '-'}</span>
            <span className="text-sm text-muted-foreground">{sub ? PLAN_PRICES[sub.plan] : '-'}</span>
          </div>
          {isTrial && isActive && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                🎉 Período de Teste Gratuito
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Aproveite 7 dias para explorar todas as funcionalidades do MimoFlow!
              </p>
            </div>
          )}
          {sub && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="font-medium">{fmt(sub.started_at)}</p>
              </div>
              {sub.expires_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Validade</p>
                  <p className="font-medium">{fmt(sub.expires_at)}</p>
                </div>
              )}
              {days !== null && isActive && (
                <div className="col-span-2">
                  <div className={`flex items-center gap-2 text-sm ${days <= 7 ? 'text-warning' : 'text-success'}`}>
                    <Clock className="h-4 w-4" />
                    {days === 0 ? 'Expira hoje' : `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`}
                  </div>
                </div>
              )}
              {sub.cancelled_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Cancelado em</p>
                  <p className="font-medium">{fmt(sub.cancelled_at)}</p>
                </div>
              )}
            </div>
          )}
          {isActive && !isTrial && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={handleRenew}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Renovar
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={handleCancel}>
                <XCircle className="h-3.5 w-3.5 mr-1.5" /> Cancelar plano
              </Button>
            </div>
          )}
          {(!isActive || isTrial) && (
            <p className="text-xs text-muted-foreground pt-1">Escolha um plano abaixo para ativar sua assinatura.</p>
          )}
        </CardContent>
      </Card>

      {/* Upgrade / choose plan */}
      <Card className="animate-fade-up stagger-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{isTrial || !isActive ? 'Escolher Plano' : 'Fazer Upgrade'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {plans.map(p => {
              const isCurrent = sub?.plan === p.key && isActive;
              return (
                <div key={p.key} className={`rounded-xl border p-4 flex flex-col gap-2 ${p.highlight ? 'border-primary/40 bg-primary/[0.02]' : ''} ${isCurrent ? 'border-success/40 bg-success/[0.03]' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{p.label}</span>
                    {p.highlight && !isCurrent && <Badge className="text-[11px]">Popular</Badge>}
                    {isCurrent && <Badge variant="outline" className="text-[11px] text-success border-success/40">Atual</Badge>}
                  </div>
                  <div>
                    <span className="text-xl font-bold text-primary">{p.price}</span>
                    <p className="text-xs text-muted-foreground">{p.perMonth}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={isCurrent ? 'outline' : p.highlight ? 'default' : 'outline'}
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(p.key)}
                    className="mt-1"
                  >
                    {isCurrent ? 'Plano ativo' : 'Selecionar'}
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Todos os planos incluem acesso completo a todas as funcionalidades.
          </p>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Pagamento via PIX
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && `Plano ${PLAN_LABELS[selectedPlan]} - ${getPlanAmount(selectedPlan)}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informações PIX */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <h3 className="font-semibold text-sm">Dados para Transferência PIX</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">Jarbson Braga Santos</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chave PIX:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">98974002272</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={copyPixKey}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">Celular</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banco:</span>
                  <span className="font-medium">Santander</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-primary text-lg">
                    {selectedPlan && getPlanAmount(selectedPlan)}
                  </span>
                </div>
              </div>
            </div>

            {/* Upload do comprovante */}
            <form onSubmit={handleProofUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proof-file">Comprovante de Pagamento</Label>
                <Input
                  id="proof-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  required
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Envie uma foto ou PDF do comprovante de pagamento
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={uploadingProof || !proofFile}
                >
                  {uploadingProof ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Comprovante
                    </>
                  )}
                </Button>

                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={sendWhatsAppMessage}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar via WhatsApp
                </Button>
              </div>
            </form>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Após o envio do comprovante, nossa equipe analisará e liberará seu acesso em até 24 horas úteis.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* History */}
      {history.length > 1 && (
        <Card className="animate-fade-up stagger-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((h, i) => (
              <div key={h.id}>
                {i > 0 && <Separator className="my-2" />}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{PLAN_LABELS[h.plan]}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{fmt(h.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{PLAN_PRICES[h.plan]}</span>
                    <Badge variant={h.status === 'active' ? 'default' : 'secondary'} className="text-[11px]">
                      {STATUS_LABELS[h.status]}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Support Ticket Form */}
      <Card className="animate-fade-up stagger-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Abrir Chamado de Suporte</CardTitle>
          </div>
          <CardDescription>
            Precisa de ajuda? Envie um chamado e nossa equipe entrará em contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-type">Tipo de Chamado</Label>
              <Select value={ticketType} onValueChange={setTicketType}>
                <SelectTrigger id="ticket-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Assinatura</SelectItem>
                  <SelectItem value="technical">Problema Técnico</SelectItem>
                  <SelectItem value="billing">Cobrança</SelectItem>
                  <SelectItem value="feature">Solicitação de Funcionalidade</SelectItem>
                  <SelectItem value="bug">Reportar Erro</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-subject">Assunto</Label>
              <Input
                id="ticket-subject"
                placeholder="Descreva brevemente o problema"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-description">Descrição Detalhada</Label>
              <Textarea
                id="ticket-description"
                placeholder="Descreva o problema ou solicitação em detalhes..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                required
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {ticketDescription.length}/1000 caracteres
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submittingTicket || !ticketSubject || !ticketDescription}
            >
              {submittingTicket ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Chamado
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
