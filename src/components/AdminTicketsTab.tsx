import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Search, MessageSquare, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  company_name: string | null;
  ticket_type: 'subscription' | 'technical' | 'billing' | 'feature' | 'bug' | 'other';
  subject: string;
  description: string;
  status: 'received' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function AdminTicketsTab() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filterStatus]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar chamados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os chamados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (ticketId: string, status: string, priority: string, adminNotes: string) => {
    try {
      const updateData: any = {
        status,
        priority,
        admin_notes: adminNotes || null,
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Chamado atualizado',
        description: 'As informações foram atualizadas com sucesso',
      });

      setDialogOpen(false);
      loadTickets();
    } catch (error: any) {
      console.error('Erro ao atualizar chamado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o chamado',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-blue-500"><AlertCircle className="h-3 w-3 mr-1" /> Recebido</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Em Andamento</Badge>;
      case 'waiting_response':
        return <Badge className="bg-orange-500"><MessageSquare className="h-3 w-3 mr-1" /> Aguardando Resposta</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Resolvido</Badge>;
      case 'closed':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" /> Fechado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">Alta</Badge>;
      case 'normal':
        return <Badge variant="outline">Normal</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      subscription: 'Assinatura',
      technical: 'Técnico',
      billing: 'Cobrança',
      feature: 'Funcionalidade',
      bug: 'Erro',
      other: 'Outro',
    };
    return <Badge variant="outline">{types[type] || type}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Total de Chamados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'received' || t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Aguardando Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'waiting_response').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Resolvidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
            </div>
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
                placeholder="Buscar por assunto, empresa ou descrição..."
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
                <SelectItem value="received">Recebidos</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="waiting_response">Aguardando Resposta</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadTickets} variant="outline">
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chamados ({filteredTickets.length})</CardTitle>
          <CardDescription>
            Gerencie os chamados de suporte dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum chamado encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="font-medium">{ticket.company_name || 'Sem nome'}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {ticket.user_id}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(ticket.ticket_type)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium truncate">{ticket.subject}</div>
                        <div className="text-xs text-muted-foreground truncate">{ticket.description}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell className="text-sm">{formatDate(ticket.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={dialogOpen && selectedTicket?.id === ticket.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (open) setSelectedTicket(ticket);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Gerenciar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Gerenciar Chamado</DialogTitle>
                              <DialogDescription>
                                {ticket.company_name || 'Empresa sem nome'}
                              </DialogDescription>
                            </DialogHeader>
                            <TicketManagementForm
                              ticket={ticket}
                              onSave={handleUpdateTicket}
                              onCancel={() => setDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de formulário de gerenciamento
function TicketManagementForm({
  ticket,
  onSave,
  onCancel,
}: {
  ticket: SupportTicket;
  onSave: (ticketId: string, status: string, priority: string, adminNotes: string) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<string>(ticket.status);
  const [priority, setPriority] = useState<string>(ticket.priority);
  const [adminNotes, setAdminNotes] = useState(ticket.admin_notes || '');

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Informações do Chamado</Label>
        <div className="p-4 rounded-lg border bg-muted/50 space-y-2">
          <div>
            <span className="text-sm font-medium">Tipo:</span>
            <span className="text-sm ml-2">{ticket.ticket_type}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Assunto:</span>
            <span className="text-sm ml-2">{ticket.subject}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Descrição:</span>
            <p className="text-sm mt-1 whitespace-pre-wrap">{ticket.description}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Criado em:</span>
            <span className="text-sm ml-2">{new Date(ticket.created_at).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="received">Recebido</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="waiting_response">Aguardando Resposta</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="closed">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Prioridade</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Notas do Administrador</Label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Adicione notas internas sobre este chamado..."
          rows={4}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave(ticket.id, status, priority, adminNotes)} className="flex-1">
          Salvar Alterações
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
