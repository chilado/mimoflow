import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Lock, Unlock, Search, LogOut, Users, CreditCard, Shield, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  company_name: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_end_date: string | null;
  is_blocked: boolean;
}

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('mimo_admin_auth');
    if (adminAuth === 'authenticated') {
      setIsAuthenticated(true);
      loadUsers();
    }
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filterStatus === 'blocked') return user.is_blocked;
        if (filterStatus === 'active') return user.subscription_status === 'active';
        if (filterStatus === 'inactive') return user.subscription_status !== 'active';
        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginEmail === 'jarbas.alexa@gmail.com' && loginPassword === 'Jarbas8080') {
      sessionStorage.setItem('mimo_admin_auth', 'authenticated');
      setIsAuthenticated(true);
      loadUsers();
      toast({
        title: 'Acesso autorizado',
        description: 'Bem-vindo ao painel administrativo',
      });
    } else {
      toast({
        title: 'Acesso negado',
        description: 'Credenciais inválidas',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mimo_admin_auth');
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
    toast({
      title: 'Sessão encerrada',
      description: 'Você saiu do painel administrativo',
    });
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('Carregando usuários...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar:', error);
        throw error;
      }

      console.log('Usuários carregados:', data?.length);

      const usersData = data.map((profile: any) => ({
        id: profile.id,
        email: profile.user_id || profile.id,
        created_at: profile.created_at,
        company_name: profile.company_name,
        subscription_status: profile.subscription_status || 'inactive',
        subscription_plan: profile.subscription_plan || null,
        subscription_end_date: profile.subscription_end_date || null,
        is_blocked: profile.is_blocked || false,
      }));

      setUsers(usersData);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro ao carregar',
        description: error.message || 'Não foi possível carregar os usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      console.log('Tentando atualizar usuário:', userId, 'bloquear:', block);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_blocked: block } as any)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Usuário atualizado com sucesso:', data);

      toast({
        title: block ? 'Usuário bloqueado' : 'Usuário desbloqueado',
        description: `O acesso foi ${block ? 'bloqueado' : 'liberado'} com sucesso`,
      });

      loadUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o usuário',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSubscription = async (userId: string, status: string, plan: string, endDate: string) => {
    try {
      console.log('Atualizando assinatura:', { userId, status, plan, endDate });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          subscription_status: status,
          subscription_plan: plan,
          subscription_end_date: endDate || null,
        } as any)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Assinatura atualizada com sucesso:', data);

      toast({
        title: 'Assinatura atualizada',
        description: 'As informações foram atualizadas com sucesso',
      });

      setEditDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar assinatura:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar a assinatura',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Sem plano</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return <Badge variant="outline">Nenhum</Badge>;
    
    switch (plan) {
      case 'basic':
        return <Badge variant="outline">Básico</Badge>;
      case 'pro':
        return <Badge className="bg-purple-500">Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-orange-500">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Painel Administrativo</CardTitle>
            <CardDescription className="text-slate-400">
              Acesso restrito - Autenticação necessária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-slate-900/50 border-slate-600 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Lock className="h-4 w-4 mr-2" />
                Acessar Painel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Painel administrativo
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Painel Administrativo</h1>
                <p className="text-xs text-muted-foreground">Gerenciamento de usuários e assinaturas</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-500" />
                Assinaturas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.subscription_status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-500" />
                Usuários Bloqueados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.is_blocked).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email ou empresa..."
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
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="blocked">Bloqueados</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadUsers} variant="outline">
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Gerencie usuários, assinaturas e permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className={user.is_blocked ? 'opacity-50' : ''}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.company_name || 'Sem nome'}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {user.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                        <TableCell>{getPlanBadge(user.subscription_plan)}</TableCell>
                        <TableCell className="text-sm">{formatDate(user.subscription_end_date)}</TableCell>
                        <TableCell className="text-sm">{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                              setEditDialogOpen(open);
                              if (open) setSelectedUser(user);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Editar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Assinatura</DialogTitle>
                                  <DialogDescription>
                                    {user.company_name || 'Usuário sem nome'}
                                  </DialogDescription>
                                </DialogHeader>
                                <EditSubscriptionForm
                                  user={user}
                                  onSave={handleUpdateSubscription}
                                  onCancel={() => setEditDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant={user.is_blocked ? 'default' : 'destructive'}
                              size="sm"
                              onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                            >
                              {user.is_blocked ? (
                                <><Unlock className="h-4 w-4 mr-1" /> Desbloquear</>
                              ) : (
                                <><Lock className="h-4 w-4 mr-1" /> Bloquear</>
                              )}
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
      </div>
    </div>
  );
}

// Componente de formulário de edição
function EditSubscriptionForm({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user: User; 
  onSave: (userId: string, status: string, plan: string, endDate: string) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState(user.subscription_status || 'inactive');
  const [plan, setPlan] = useState(user.subscription_plan || 'basic');
  const [endDate, setEndDate] = useState(user.subscription_end_date || '');

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Status da Assinatura</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Plano</Label>
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Básico</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Data de Vencimento</Label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave(user.id, status, plan, endDate)} className="flex-1">
          Salvar Alterações
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
