import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, FileText, Calendar, Search, Filter, AlertCircle, CheckCircle, Mail, Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/contexts/AuthContext';

interface Import {
  id: string;
  company: {
    id: string;
    name: string;
    responsible: {
      name: string;
      email: string;
    };
  };
  type: {
    id: string;
    name: string;
    description: string;
  };
  file: {
    name: string;
    url: string;
  };
  month: string;
  status: 'success' | 'error';
  errorDescription?: string;
  errorImage?: string;
  date: Date;
  emailSent: boolean;
}

const ImportsList = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    try {
      console.log('ImportsList mounted');
      console.log('Auth state:', { user, isAuthenticated });
      console.log('Mock data:', { companies, importTypes, imports });
    } catch (error) {
      console.error('Error in ImportsList useEffect:', error);
    }
  }, [user, isAuthenticated]);

  // Dados fictícios para demonstração
  const companies = [
    { id: 'emp1', name: 'Empresa A' },
    { id: 'emp2', name: 'Empresa B' },
  ];

  const importTypes = [
    { id: 'sped', name: 'SPED' },
    { id: 'nfe', name: 'NFE' },
    { id: 'cte', name: 'CTE' },
    { id: 'nfs', name: 'NFS' },
    { id: 'nfce', name: 'NFCE' },
    { id: 'planilha', name: 'Planilhas' },
  ];

  const imports: Import[] = [
    {
      id: '1',
      company: {
        id: 'emp1',
        name: 'Empresa A',
        responsible: {
          name: 'João Silva',
          email: 'joao.silva@empresaa.com'
        }
      },
      type: {
        id: 'sped',
        name: 'SPED',
        description: 'Arquivos SPED Fiscal e Contribuições'
      },
      file: {
        name: 'sped_fiscal_202310.zip',
        url: '/files/sped_fiscal_202310.zip'
      },
      month: '2023-10',
      status: 'success',
      date: new Date('2023-10-15T10:30:00'),
      emailSent: true
    },
    {
      id: '2',
      company: {
        id: 'emp2',
        name: 'Empresa B',
        responsible: {
          name: 'Maria Santos',
          email: 'maria.santos@empresab.com'
        }
      },
      type: {
        id: 'nfe',
        name: 'NFE',
        description: 'Notas Fiscais Eletrônicas'
      },
      file: {
        name: 'nfe_202310.xml',
        url: '/files/nfe_202310.xml'
      },
      month: '2023-10',
      status: 'error',
      errorDescription: 'Arquivo XML inválido: erro na estrutura do documento',
      errorImage: '/errors/nfe_error_202310.png',
      date: new Date('2023-10-16T14:20:00'),
      emailSent: true
    }
  ];

  // Função para gerar lista de meses disponíveis (últimos 12 meses)
  const getAvailableMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label: monthStr, value: monthValue });
    }
    return months;
  };

  // Filtrar importações
  const filteredImports = imports.filter(import_ => {
    const matchesSearch = 
      import_.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      import_.type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      import_.file.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = selectedCompany === 'all' || import_.company.id === selectedCompany;
    const matchesType = selectedType === 'all' || import_.type.id === selectedType;
    const matchesMonth = selectedMonth === 'all' || import_.month === selectedMonth;
    const matchesStatus = selectedStatus === 'all' || import_.status === selectedStatus;

    return matchesSearch && matchesCompany && matchesType && matchesMonth && matchesStatus;
  });

  const handleDownload = (import_: Import) => {
    // Simular download do arquivo
    console.log('Downloading file:', import_.file.url);
  };

  const handleResendEmail = (import_: Import) => {
    // Simular reenvio de email
    console.log('Resending email to:', import_.company.responsible.email);
  };

  try {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Importações</h1>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre as importações por empresa, tipo, mês e status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </Label>
                <Input
                  placeholder="Buscar por empresa, tipo ou arquivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Empresa
                </Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as empresas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tipo
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {importTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Mês
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {getAvailableMonths().map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status
                </Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Importações</CardTitle>
            <CardDescription>
              {filteredImports.length} importação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Mês</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImports.length > 0 ? (
                  filteredImports.map(import_ => (
                    <TableRow key={import_.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{import_.company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {import_.company.responsible.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{import_.type.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {import_.type.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{import_.file.name}</div>
                      </TableCell>
                      <TableCell>
                        {new Date(import_.month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        {import_.status === 'success' ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sucesso
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {import_.date.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {import_.emailSent ? (
                          <Badge variant="outline" className="bg-green-50">
                            <Mail className="h-3 w-3 mr-1" />
                            Enviado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50">
                            <Mail className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(import_)}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                          {import_.status === 'error' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendEmail(import_)}
                              className="flex items-center gap-1"
                            >
                              <Mail className="h-4 w-4" />
                              Reenviar Email
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      Nenhuma importação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error rendering ImportsList:', error);
    return (
      <div className="p-4 text-red-600">
        Erro ao carregar a página. Por favor, tente novamente.
      </div>
    );
  }
};

export default ImportsList; 