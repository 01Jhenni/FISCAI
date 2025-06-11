import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Search, UserPlus, Building, Trash2, Edit, Save, X, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Select from 'react-select';

interface Company {
  id: string;
  nome: string;
  cnpj: string;
}

interface AuthUser {
  id: string;
  email: string;
}

const ALL_FILE_TYPES = [
  { value: 'sped', label: 'SPED' },
  { value: 'nfe', label: 'NFE' },
  { value: 'nfs-tomado', label: 'NFS Tomado' },
  { value: 'nfs-prestado', label: 'NFS Prestado' },
  { value: 'nfce', label: 'NFCE' },
  { value: 'cte-entrada', label: 'CTE Entrada' },
  { value: 'cte-saida', label: 'CTE Saída' },
  { value: 'cte-cancelado', label: 'CTE Cancelado' },
  { value: 'planilha', label: 'Planilha' },
];

const StaffSettings = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedAuthUser, setSelectedAuthUser] = useState<AuthUser | null>(null);
  const [userCompanies, setUserCompanies] = useState<string[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companyFileTypes, setCompanyFileTypes] = useState<string[]>([]);

  // Buscar empresas ao carregar
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/empresas`)
      .then(res => res.json())
      .then(setCompanies);
  }, []);

  // Buscar usuários autenticados ao carregar
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/usuarios-auth`)
      .then(res => res.json())
      .then(data => setAuthUsers(Array.isArray(data) ? data : []));
  }, []);

  // Buscar empresas do usuário selecionado
  useEffect(() => {
    if (selectedAuthUser) {
      fetch(`${import.meta.env.VITE_API_URL}/usuarios/${selectedAuthUser.id}/empresas`)
        .then(res => res.json())
        .then(empresas => setUserCompanies(empresas.map((e: Company) => e.id)));
    } else {
      setUserCompanies([]);
    }
  }, [selectedAuthUser]);

  // Salvar empresas do usuário
  const handleSaveCompanies = async () => {
    if (!selectedAuthUser) return;
    await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${selectedAuthUser.id}/empresas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresas: userCompanies })
    });
    toast({
      title: 'Empresas atualizadas',
      description: 'As permissões de empresas foram atualizadas para o usuário.',
    });
  };

  const filteredAuthUsers = authUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para abrir edição de tipos de arquivos
  const handleEditCompanyFileTypes = async (companyId: string) => {
    console.log('Abrindo edição de tipos para empresa:', companyId);
    setEditingCompanyId(companyId);
    // Buscar tipos permitidos atuais
    const url = `${import.meta.env.VITE_API_URL}/empresas/${companyId}/tipos-arquivos`;
    console.log('Buscando tipos permitidos em:', url);
    const res = await fetch(url);
    const tipos = await res.json();
    setCompanyFileTypes(tipos);
  };

  // Função para salvar tipos permitidos
  const handleSaveCompanyFileTypes = async () => {
    if (!editingCompanyId) return;
    const url = `${import.meta.env.VITE_API_URL}/empresas/${editingCompanyId}/tipos-arquivos`;
    console.log('Salvando tipos permitidos em:', url, 'tipos:', companyFileTypes);
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipos: companyFileTypes })
    });
    toast({ title: 'Tipos de arquivos atualizados', description: 'Tipos de arquivos permitidos atualizados para a empresa.' });
    setEditingCompanyId(null);
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
        >Usuários</button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'companies' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
          onClick={() => setActiveTab('companies')}
        >Empresas</button>
      </div>
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Gerenciar Permissões de Usuários</CardTitle>
                <CardDescription>
                  Selecione um usuário (e-mail) e vincule empresas permitidas.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Usuário (e-mail)</label>
              <Select
                options={filteredAuthUsers.map(u => ({ value: u.id, label: u.email }))}
                value={selectedAuthUser ? { value: selectedAuthUser.id, label: selectedAuthUser.email } : null}
                onChange={option => {
                  const user = authUsers.find(u => u.id === option?.value);
                  setSelectedAuthUser(user || null);
                }}
                placeholder="Selecione o e-mail do usuário"
              />
            </div>
            {selectedAuthUser && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Empresas permitidas</label>
                <Select
                  isMulti
                  options={companies.map(c => ({ value: c.id, label: `${c.nome} (${c.cnpj})` }))}
                  value={companies.filter(c => userCompanies.includes(c.id)).map(c => ({ value: c.id, label: `${c.nome} (${c.cnpj})` }))}
                  onChange={opts => setUserCompanies(opts.map(o => o.value))}
                  className="mb-2"
                />
                <Button onClick={handleSaveCompanies}>Salvar Permissões</Button>
              </div>
            )}
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
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  Gerenciar Permissões
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-left">CNPJ</th>
                    <th className="px-4 py-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {company.nome}
                        </td>
                        <td className="px-4 py-3">
                          {company.cnpj}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCompanyFileTypes(company.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {}}
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
      {editingCompanyId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Tipos de arquivos permitidos</h3>
            <Select
              isMulti
              options={ALL_FILE_TYPES}
              value={ALL_FILE_TYPES.filter(t => companyFileTypes.includes(t.value))}
              onChange={opts => setCompanyFileTypes(opts.map(o => o.value))}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCompanyId(null)}>Cancelar</Button>
              <Button onClick={handleSaveCompanyFileTypes}>Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSettings;
