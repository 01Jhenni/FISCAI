import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Search, UserPlus, Building, Trash2, Edit, Save, X, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  active: boolean;
}

interface Company {
  id: string;
  name: string;
  cnpj: string;
  active: boolean;
  createdAt: string;
}

const StaffSettings = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);

  // Dados fictícios para demonstração
  const [users, setUsers] = useState<User[]>([
    {
      id: 'u1',
      name: 'Administrador',
      email: 'admin@exemplo.com',
      role: 'admin',
      active: true
    },
    {
      id: 'u2',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      role: 'staff',
      active: true
    },
    {
      id: 'u3',
      name: 'Maria Souza',
      email: 'maria@exemplo.com',
      role: 'staff',
      active: true
    },
    {
      id: 'u4',
      name: 'Pedro Oliveira',
      email: 'pedro@exemplo.com',
      role: 'staff',
      active: false
    }
  ]);

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 'c1',
      name: 'Empresa A',
      cnpj: '12.345.678/0001-90',
      active: true,
      createdAt: '01/08/2023'
    },
    {
      id: 'c2',
      name: 'Empresa B',
      cnpj: '98.765.432/0001-10',
      active: true,
      createdAt: '15/09/2023'
    },
    {
      id: 'c3',
      name: 'Empresa C',
      cnpj: '45.678.901/0001-23',
      active: true,
      createdAt: '05/10/2023'
    },
    {
      id: 'c4',
      name: 'Empresa D',
      cnpj: '34.567.890/0001-12',
      active: false,
      createdAt: '20/05/2023'
    }
  ]);

  // Novos estados para formulários
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    role: 'staff',
    active: true
  });

  const [newCompany, setNewCompany] = useState<Omit<Company, 'id' | 'createdAt'>>({
    name: '',
    cnpj: '',
    active: true
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm)
  );

  const handleUserChange = (id: string, field: keyof User, value: any) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, [field]: value } : user
    ));
  };

  const handleCompanyChange = (id: string, field: keyof Company, value: any) => {
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, [field]: value } : company
    ));
  };

  const handleSaveUser = (id: string) => {
    setEditingUser(null);
    toast({
      title: "Usuário atualizado",
      description: "As informações do usuário foram atualizadas com sucesso.",
    });
  };

  const handleSaveCompany = (id: string) => {
    setEditingCompany(null);
    toast({
      title: "Empresa atualizada",
      description: "As informações da empresa foram atualizadas com sucesso.",
    });
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido com sucesso.",
    });
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(company => company.id !== id));
    toast({
      title: "Empresa removida",
      description: "A empresa foi removida com sucesso.",
    });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const id = `u${users.length + 1}`;
    setUsers(prev => [...prev, { ...newUser, id }]);
    setNewUser({
      name: '',
      email: '',
      role: 'staff',
      active: true
    });
    setShowAddUser(false);
    toast({
      title: "Usuário adicionado",
      description: "O novo usuário foi adicionado com sucesso.",
    });
  };

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.cnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const id = `c${companies.length + 1}`;
    const createdAt = new Date().toLocaleDateString('pt-BR');
    setCompanies(prev => [...prev, { ...newCompany, id, createdAt }]);
    setNewCompany({
      name: '',
      cnpj: '',
      active: true
    });
    setShowAddCompany(false);
    toast({
      title: "Empresa adicionada",
      description: "A nova empresa foi adicionada com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
      </div>

      <div className="flex space-x-2 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
          onClick={() => setActiveTab('users')}
        >
          Usuários
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'companies' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
          onClick={() => setActiveTab('companies')}
        >
          Empresas
        </button>
      </div>

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Gerenciar Usuários</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova usuários do sistema
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Button 
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  Adicionar Usuário
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showAddUser && (
              <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-medium mb-4">Novo Usuário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <Input
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Usuário</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'staff' }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="admin">Administrador</option>
                      <option value="staff">Colaborador</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                      id="user-active"
                      checked={newUser.active}
                      onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, active: checked === true }))}
                    />
                    <label htmlFor="user-active" className="text-sm font-medium">
                      Ativo
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancelar</Button>
                  <Button onClick={handleAddUser}>Adicionar</Button>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {editingUser === user.id ? (
                            <Input
                              value={user.name}
                              onChange={(e) => handleUserChange(user.id, 'name', e.target.value)}
                            />
                          ) : (
                            user.name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingUser === user.id ? (
                            <Input
                              value={user.email}
                              onChange={(e) => handleUserChange(user.id, 'email', e.target.value)}
                            />
                          ) : (
                            user.email
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingUser === user.id ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleUserChange(user.id, 'role', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="admin">Administrador</option>
                              <option value="staff">Colaborador</option>
                            </select>
                          ) : (
                            user.role === 'admin' ? 'Administrador' : 'Colaborador'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingUser === user.id ? (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`active-${user.id}`}
                                checked={user.active}
                                onCheckedChange={(checked) => handleUserChange(user.id, 'active', checked === true)}
                              />
                              <label htmlFor={`active-${user.id}`}>Ativo</label>
                            </div>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {editingUser === user.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveUser(user.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingUser(null)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingUser(user.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        Nenhum resultado encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'companies' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Gerenciar Empresas</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova empresas do sistema
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar empresas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Button 
                  onClick={() => setShowAddCompany(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Building className="h-4 w-4" />
                  Adicionar Empresa
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showAddCompany && (
              <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-medium mb-4">Nova Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
                    <Input
                      value={newCompany.name}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CNPJ</label>
                    <Input
                      value={newCompany.cnpj}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="company-active"
                      checked={newCompany.active}
                      onCheckedChange={(checked) => setNewCompany(prev => ({ ...prev, active: checked === true }))}
                    />
                    <label htmlFor="company-active" className="text-sm font-medium">
                      Ativa
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddCompany(false)}>Cancelar</Button>
                  <Button onClick={handleAddCompany}>Adicionar</Button>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-left">CNPJ</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Data de Cadastro</th>
                    <th className="px-4 py-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {editingCompany === company.id ? (
                            <Input
                              value={company.name}
                              onChange={(e) => handleCompanyChange(company.id, 'name', e.target.value)}
                            />
                          ) : (
                            company.name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingCompany === company.id ? (
                            <Input
                              value={company.cnpj}
                              onChange={(e) => handleCompanyChange(company.id, 'cnpj', e.target.value)}
                            />
                          ) : (
                            company.cnpj
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingCompany === company.id ? (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`active-${company.id}`}
                                checked={company.active}
                                onCheckedChange={(checked) => handleCompanyChange(company.id, 'active', checked === true)}
                              />
                              <label htmlFor={`active-${company.id}`}>Ativa</label>
                            </div>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs ${company.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {company.active ? 'Ativa' : 'Inativa'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{company.createdAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {editingCompany === company.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveCompany(company.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCompany(null)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCompany(company.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCompany(company.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        Nenhum resultado encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffSettings;
