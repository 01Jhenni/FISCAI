
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, FileCheck, FileX, Clock, Filter, Download, MoreVertical, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImportItem {
  id: string;
  company: string;
  fileType: string;
  fileName: string;
  status: 'concluído' | 'erro' | 'pendente' | 'processando';
  dateReceived: string;
  dateProcessed: string | null;
  size: string;
  errorMessage?: string;
}

const StaffImports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewingErrorDetails, setViewingErrorDetails] = useState<ImportItem | null>(null);

  // Dados fictícios para demonstração
  const importItems: ImportItem[] = [
    {
      id: '1',
      company: 'Empresa A',
      fileType: 'SPED',
      fileName: 'SPED_Fiscal_Set2023.txt',
      status: 'concluído',
      dateReceived: '10/10/2023 14:30',
      dateProcessed: '10/10/2023 14:45',
      size: '2.4 MB'
    },
    {
      id: '2',
      company: 'Empresa B',
      fileType: 'NFE',
      fileName: 'NFe_lote_outubro.xml',
      status: 'erro',
      dateReceived: '11/10/2023 09:15',
      dateProcessed: '11/10/2023 09:25',
      size: '5.7 MB',
      errorMessage: 'Erro de validação XML: tag <emit> inválida na linha 145. Chave de acesso incorreta.'
    },
    {
      id: '3',
      company: 'Empresa C',
      fileType: 'CTE',
      fileName: 'CTE_Set2023.zip',
      status: 'pendente',
      dateReceived: '12/10/2023 11:45',
      dateProcessed: null,
      size: '8.2 MB'
    },
    {
      id: '4',
      company: 'Empresa D',
      fileType: 'NFS',
      fileName: 'NFS_lote_outubro.pdf',
      status: 'processando',
      dateReceived: '13/10/2023 16:20',
      dateProcessed: null,
      size: '3.1 MB'
    },
    {
      id: '5',
      company: 'Empresa A',
      fileType: 'NFCE',
      fileName: 'NFCE_Set2023.xml',
      status: 'concluído',
      dateReceived: '09/10/2023 10:30',
      dateProcessed: '09/10/2023 10:40',
      size: '1.8 MB'
    },
    {
      id: '6',
      company: 'Empresa B',
      fileType: 'SPED',
      fileName: 'SPED_Contribuições_Set2023.txt',
      status: 'concluído',
      dateReceived: '08/10/2023 14:10',
      dateProcessed: '08/10/2023 14:30',
      size: '3.5 MB'
    },
    {
      id: '7',
      company: 'Empresa E',
      fileType: 'Planilha',
      fileName: 'Controle_Estoque_Out2023.xlsx',
      status: 'erro',
      dateReceived: '14/10/2023 08:45',
      dateProcessed: '14/10/2023 08:50',
      size: '1.2 MB',
      errorMessage: 'Formato de célula inválido na coluna G. Valores não numéricos encontrados.'
    },
  ];

  const filteredItems = importItems.filter(item => {
    const matchesSearch = 
      item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileType.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleFilterByStatus = (status: string | null) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };
  
  const handleViewErrorDetails = (item: ImportItem) => {
    setViewingErrorDetails(item);
  };

  const handleCloseErrorDetails = () => {
    setViewingErrorDetails(null);
  };

  const handleReprocessFiles = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Selecione pelo menos um arquivo para reprocessar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reprocessamento iniciado",
      description: `${selectedItems.length} arquivo(s) enviados para reprocessamento.`,
    });
    
    // Resetar seleção
    setSelectedItems([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluído':
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case 'erro':
        return <FileX className="h-5 w-5 text-red-500" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'processando':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
        );
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'concluído':
        return 'text-green-600';
      case 'erro':
        return 'text-red-600';
      case 'pendente':
        return 'text-amber-600';
      case 'processando':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Gerenciamento de Importações</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            onClick={handleReprocessFiles} 
            disabled={selectedItems.length === 0}
            className="flex items-center gap-2"
          >
            <FileCheck className="h-4 w-4" />
            Reprocessar Selecionados
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Arquivos Importados</CardTitle>
              <CardDescription>Gerenciamento e análise de arquivos recebidos dos clientes</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-60"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={selectedStatus === 'concluído' ? 'default' : 'outline'} 
                  onClick={() => handleFilterByStatus('concluído')}
                  size="sm"
                  className={selectedStatus === 'concluído' ? 'bg-green-600' : ''}
                >
                  <FileCheck className="h-4 w-4 mr-1" /> Concluídos
                </Button>
                <Button 
                  variant={selectedStatus === 'erro' ? 'default' : 'outline'} 
                  onClick={() => handleFilterByStatus('erro')}
                  size="sm"
                  className={selectedStatus === 'erro' ? 'bg-red-600' : ''}
                >
                  <FileX className="h-4 w-4 mr-1" /> Com Erro
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">
                    <Checkbox 
                      checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length} 
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Empresa</th>
                  <th className="px-4 py-3 text-left">Arquivo</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Tamanho</th>
                  <th className="px-4 py-3 text-left">Data Recebido</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox 
                          checked={selectedItems.includes(item.id)} 
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked === true)}
                        />
                      </td>
                      <td className="px-4 py-3">{item.company}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={item.fileName}>{item.fileName}</td>
                      <td className="px-4 py-3">{item.fileType}</td>
                      <td className="px-4 py-3">{item.size}</td>
                      <td className="px-4 py-3">{item.dateReceived}</td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-2 ${getStatusClass(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.status === 'erro' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewErrorDetails(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                      Nenhum resultado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {viewingErrorDetails && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <FileX className="h-5 w-5" />
                Detalhes do Erro
              </CardTitle>
              <CardDescription>
                {viewingErrorDetails.fileName} - {viewingErrorDetails.company}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Arquivo</h3>
                <p>{viewingErrorDetails.fileName}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Data de recebimento</h3>
                <p>{viewingErrorDetails.dateReceived}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Data de processamento</h3>
                <p>{viewingErrorDetails.dateProcessed || 'Não processado'}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Mensagem de erro</h3>
                <p className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
                  {viewingErrorDetails.errorMessage || 'Erro não especificado'}
                </p>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button 
                variant="outline" 
                onClick={handleCloseErrorDetails}
              >
                Fechar
              </Button>
              <Button 
                onClick={() => {
                  handleSelectItem(viewingErrorDetails.id, true);
                  handleCloseErrorDetails();
                  handleReprocessFiles();
                }}
              >
                Reprocessar Arquivo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffImports;
