
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, FileText, MessageSquare, Settings, Eye, Search } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  created_at: string;
  question_count: number;
  essay_count: number;
  last_activity: string;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os usuários da tabela profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      // Para cada usuário, buscar estatísticas
      const usersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Contar perguntas
          const { count: questionCount } = await supabase
            .from('student_questions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // Contar redações
          const { count: essayCount } = await supabase
            .from('essay_corrections')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // Buscar última atividade
          const { data: lastQuestion } = await supabase
            .from('student_questions')
            .select('created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { data: lastEssay } = await supabase
            .from('essay_corrections')
            .select('created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastActivity = [
            lastQuestion?.[0]?.created_at,
            lastEssay?.[0]?.created_at
          ].filter(Boolean).sort().reverse()[0] || profile.created_at;

          return {
            id: profile.id,
            name: profile.name || 'Nome não informado',
            email: profile.email || 'Email não informado',
            created_at: profile.created_at || new Date().toISOString(),
            question_count: questionCount || 0,
            essay_count: essayCount || 0,
            last_activity: lastActivity
          };
        })
      );

      setUsers(usersWithStats);
      setFilteredUsers(usersWithStats);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewUserDetails = (user: UserData) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate('/admin/dashboard')}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
              <Settings className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Configurações
              </h1>
              <p className="text-sm text-muted-foreground">Gerenciamento de usuários e sistema</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{users.length}</div>
              <p className="text-sm text-primary/80">Total de Usuários</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/10 to-accent/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {users.reduce((acc, user) => acc + user.question_count, 0)}
              </div>
              <p className="text-sm text-accent/80">Total de Perguntas</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-secondary/10 to-secondary/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {users.reduce((acc, user) => acc + user.essay_count, 0)}
              </div>
              <p className="text-sm text-secondary/80">Total de Redações</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os usuários cadastrados na plataforma
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 min-w-[300px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Perguntas</TableHead>
                    <TableHead>Redações</TableHead>
                    <TableHead>Última Atividade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {user.question_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <FileText className="h-3 w-3 mr-1" />
                          {user.essay_count}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.last_activity)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUserDetails(user)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'Nenhum usuário encontrado com os critérios de busca' : 'Nenhum usuário encontrado'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal/Card */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detalhes do Usuário: {selectedUser.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Informações Pessoais</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p><strong>Nome:</strong> {selectedUser.name}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>Data de Cadastro:</strong> {formatDate(selectedUser.created_at)}</p>
                      <p><strong>Última Atividade:</strong> {formatDate(selectedUser.last_activity)}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Estatísticas de Uso</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">{selectedUser.question_count}</div>
                        <p className="text-sm text-primary/80">Perguntas Enviadas</p>
                      </div>
                      <div className="bg-secondary/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-secondary">{selectedUser.essay_count}</div>
                        <p className="text-sm text-secondary/80">Redações Enviadas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
