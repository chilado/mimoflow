import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Search, DollarSign, CheckCircle, XCircle, Clock, ExternalLink, MessageSquare, Eye } from 'lucide-react';

interface PaymentProof {
  id: string;
  user_id: string;
  company_name: string | null;
  plan: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  amount: number;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

const PLAN_LABELS = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

const STATUS_LABELS = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export function AdminPaymentsTab() {
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentProof[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, filterStatus]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar pagamentos:', error);
      toast({
        title: 'Erro ao carregar',
        description: error.message || 'Não foi possível carregar os pagamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (payment: PaymentProof) => {
    setSelectedPayment(payment);
    setAdminNotes(payment.admin_notes || '');
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      // Atualizar status do comprovante
      const { error: proofError } = await supabase
        .from('payment_proofs')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          approved_at: new Date().toISOString(),
          approved_by: 'jarbas.alexa@gmail.com',
        })
        .eq('id', selectedPayment.id);

      if (proofError) throw proofError;

      // Buscar o user_id do profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', selectedPayment.user_id)
        .single();

      if (!profileData) throw new Error('Perfil não encontrado');

      // Calcular data de expiração
      const daysMap = {
        monthly: 30,
        quarterly: 90,
        semiannual: 180,
        annual: 365,
      };
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysMap[selectedPayment.plan]);

      // Verificar se já existe uma assinatura ativa
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', selectedPayment.user_id)
        .eq('status', 'active')
        .single();

      if (existingSub) {
        // Atualizar assinatura existente
        await supabase
          .from('subscriptions')
          .update({
            plan: selectedPayment.plan,
            expires_at: expiresAt.toISOString(),
          })
          .eq('id', existingSub.id);
      } else {
        // Criar nova assinatura
        await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedPayment.user_id,
            plan: selectedPayment.plan,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          });
      }

      // Atualizar profile
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: selectedPayment.plan,
          subscription_end_date: expiresAt.toISOString(),
          is_blocked: false,
        })
        .eq('user_id', selectedPayment.user_id);

      toast({
        title: 'Pagamento aprovado',
        description: 'A assinatura foi ativada com sucesso',
      });

      setDialogOpen(false);
      loadPayments();
    } catch (error: any) {
      console.error('Erro ao aprovar pagamento:', error);
      toast({
        title: 'Erro ao aprovar',
        description: error.message || 'Não foi possível aprovar o pagamento',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('payment_proofs')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      toast({
        title: 'Pagamento rejeitado',
        description: 'O comprovante foi marcado como rejeitado',
      });

      setDialogOpen(false);
      loadPayments();
    } catch (error: any) {
      console.error('Erro ao rejeitar pagamento:', error);
      toast({
        title: 'Erro ao rejeitar',
        description: error.message || 'Não foi possível rejeitar o pagamento',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const sendWhatsAppMessage = (payment: PaymentProof) => {
    const message = `Olá! Sobre o pagamento do plano ${PLAN_LABELS[payment.plan]} no valor de R$ ${payment.amount.toFixed(2)}...`;
    const whatsappUrl = `https://wa.me/5598974002272?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Aprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Rejeitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadPayments} variant="outline">
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comprovantes de Pagamento ({filteredPayments.length})</CardTitle>
          <CardDescription>
            Gerencie os comprovantes de pagamento enviados pelos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum pagamento encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.company_name || 'Sem nome'}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {payment.user_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{PLAN_LABELS[payment.plan]}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm">{formatDate(payment.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(payment.proof_url, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(payment)}
                          >
                            Gerenciar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendWhatsAppMessage(payment)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Management Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Pagamento</DialogTitle>
            <DialogDescription>
              {selectedPayment?.company_name || 'Empresa sem nome'}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Plano</p>
                  <p className="font-medium">{PLAN_LABELS[selectedPayment.plan]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valor</p>
                  <p className="font-medium">R$ {selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Data de Envio</p>
                  <p className="font-medium">{formatDate(selectedPayment.created_at)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Comprovante</Label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(selectedPayment.proof_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Comprovante em Nova Aba
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-notes">Notas Administrativas</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Adicione observações sobre este pagamento..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {selectedPayment.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar e Ativar Plano
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={processing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}

              {selectedPayment.status !== 'pending' && (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Este pagamento já foi processado e não pode ser alterado.
                  </p>
                  {selectedPayment.approved_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Processado em: {formatDate(selectedPayment.approved_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
