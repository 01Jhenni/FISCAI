import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { Building, Upload as UploadIcon, CheckCircle, AlertCircle, FilePlus2, Calendar, BarChart2, FileSpreadsheet, Loader2 } from 'lucide-react';
import Select from 'react-select';

interface Company {
  id: string;
  nome: string;
  cnpj: string;
}

interface FileTypeStatus {
  id: string;
  name: string;
  description: string;
  uploaded: boolean;
  date: Date | null;
  files: File[];
  month?: string; // Mês de referência do arquivo
  isUploading?: boolean;
  remotePath?: string;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  uploaded: boolean;
  date: Date | null;
  file: File | null;
  month: string | null;
  type: 'dashboard' | 'financial';
  isUploading?: boolean;
  remotePath?: string;
}

// Add these type definitions at the top of the file after the imports
type AllowedFileTypes = {
  [key: string]: string[];
};

const ALLOWED_FILE_TYPES: AllowedFileTypes = {
  'sped': ['.txt'],
  'nfe': ['.xml', '.zip'],
  'nfs-tomado': ['.pdf', '.xml', '.zip'],
  'nfs-prestado': ['.xml', '.zip'],
  'nfce': ['.xml', '.zip'],
  'cte-entrada': ['.xml', '.zip'],
  'cte-saida': ['.xml', '.zip'],
  'cte-cancelado': ['.xml', '.zip'],
  'planilha': ['.csv', '.xlsx']
};

const getFileTypeError = (fileType: string, allowedTypes: string[]): string => {
  return `Tipo de arquivo inválido. Para ${fileType}, são aceitos apenas os formatos: ${allowedTypes.join(', ')}`;
};

const ALL_FILE_TYPES = [
  { id: 'sped', name: 'SPED', description: 'Arquivos SPED Fiscal e Contribuições' },
  { id: 'nfe', name: 'NFE', description: 'Notas Fiscais Eletrônicas' },
  { id: 'nfs-tomado', name: 'NFS Tomado', description: 'Notas Fiscais de Serviço Tomados (PDFs)' },
  { id: 'nfs-prestado', name: 'NFS Prestado', description: 'Notas Fiscais de Serviço Prestados (PDFs)' },
  { id: 'nfce', name: 'NFCE', description: 'Notas Fiscais de Consumidor Eletrônica' },
  { id: 'cte-entrada', name: 'CTE Entrada', description: 'Conhecimentos de Transporte Eletrônico de Entrada' },
  { id: 'cte-saida', name: 'CTE Saída', description: 'Conhecimentos de Transporte Eletrônico de Saída' },
  { id: 'cte-cancelado', name: 'CTE Cancelado', description: 'Conhecimentos de Transporte Eletrônico Cancelados' },
  { id: 'planilha', name: 'Planilhas', description: 'Planilhas Excel de controle' },
];

const Upload = () => {
  const { user } = useAuth();
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [fileTypes, setFileTypes] = useState<FileTypeStatus[]>([
    { 
      id: 'sped', 
      name: 'SPED', 
      description: 'Arquivos SPED Fiscal e Contribuições', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'nfe', 
      name: 'NFE', 
      description: 'Notas Fiscais Eletrônicas', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'cte-entrada', 
      name: 'CTE Entrada', 
      description: 'Conhecimentos de Transporte Eletrônico de Entrada', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'cte-saida', 
      name: 'CTE Saída', 
      description: 'Conhecimentos de Transporte Eletrônico de Saída', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'cte-cancelado', 
      name: 'CTE Cancelado', 
      description: 'Conhecimentos de Transporte Eletrônico Cancelados', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'nfs-tomado', 
      name: 'NFS Tomado', 
      description: 'Notas Fiscais de Serviço Tomados (PDFs)', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'nfs-prestado', 
      name: 'NFS Prestado', 
      description: 'Notas Fiscais de Serviço Prestados (PDFs)', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'nfce', 
      name: 'NFCE', 
      description: 'Notas Fiscais de Consumidor Eletrônica', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'planilha', 
      name: 'Planilhas', 
      description: 'Planilhas Excel de controle', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>([]);

  const [reportTypes, setReportTypes] = useState<ReportType[]>([
    {
      id: 'dashboard-report',
      name: 'Relatório do Dashboard',
      description: 'Planilha Excel com dados para atualização do dashboard principal',
      uploaded: false,
      date: null,
      file: null,
      month: null,
      type: 'dashboard'
    },
    {
      id: 'financial-report',
      name: 'Relatório Financeiro',
      description: 'Planilha Excel com dados financeiros para atualização do dashboard financeiro',
      uploaded: false,
      date: null,
      file: null,
      month: null,
      type: 'financial'
    }
  ]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.id) {
      fetch(`${apiUrl}/usuarios/${user.id}/empresas`)
        .then(res => res.json())
        .then(data => setCompanies(data))
        .catch(() => setCompanies([]));
    }
  }, [user]);

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

  // Buscar uploads feitos e marcar status
  useEffect(() => {
    if (user?.id && selectedCompany && selectedMonth) {
      fetch(`${apiUrl}/uploads?usuario_id=${user.id}&empresa_id=${selectedCompany}&mes=${selectedMonth}`)
        .then(res => res.json())
        .then(data => {
          setFileTypes(prev =>
            prev.map(type => ({
              ...type,
              uploaded: data.some(u => u.tipo_arquivo === type.id)
            }))
          );
        });
    }
  }, [user, selectedCompany, selectedMonth]);

  // Buscar tipos permitidos ao selecionar empresa
  useEffect(() => {
    if (selectedCompany) {
      fetch(`${apiUrl}/empresas/${selectedCompany}/tipos-arquivos`)
        .then(res => res.json())
        .then(tiposPermitidos => {
          setAllowedFileTypes(tiposPermitidos);
          // Reconstrói fileTypes apenas com os tipos permitidos
          setFileTypes(
            tiposPermitidos.map(typeId => {
              const typeInfo = ALL_FILE_TYPES.find(t => t.id === typeId);
              return {
                id: typeId,
                name: typeInfo?.name || typeId.toUpperCase(),
                description: typeInfo?.description || '',
                uploaded: false,
                date: null,
                files: [],
                month: null
              };
            })
          );
        });
    }
  }, [selectedCompany]);

  // Após atualizar fileTypes e allowedFileTypes, buscar uploads feitos
  useEffect(() => {
    if (user?.id && selectedCompany && selectedMonth && allowedFileTypes.length > 0) {
      fetch(`${apiUrl}/uploads?usuario_id=${user.id}&empresa_id=${selectedCompany}&mes=${selectedMonth}`)
        .then(res => res.json())
        .then(data => {
          setFileTypes(prev =>
            prev.map(type => ({
              ...type,
              uploaded: data.some(u => u.tipo_arquivo === type.id)
            }))
          );
        });
    }
  }, [user, selectedCompany, selectedMonth, allowedFileTypes]);

  const enviarArquivo = async (arquivo: File, tipoArquivo: string) => {
    try {
      setProgresso(0);
      setErro(null);

      // Criar FormData para envio
      const formData = new FormData();
      formData.append('arquivo', arquivo);

      // Enviar para o backend
      const url = `${apiUrl}/upload/${tipoArquivo}/${selectedCompany}/${selectedMonth}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: { 'x-user-id': user?.id }
      });

      if (!response.ok) {
        let erroMsg = 'Erro ao enviar arquivo';
        try {
          const erro = await response.json();
          erroMsg = erro.erro || erroMsg;
        } catch {
          // resposta não é JSON
          erroMsg = await response.text();
        }
        throw new Error(erroMsg);
      }

      let resultado = {};
      try {
        resultado = await response.json();
      } catch {
        // resposta não é JSON, ignora
      }
      // Atualizar progresso para 100% quando concluído
      setProgresso(100);
      // Mostrar mensagem de sucesso
      toast({
        title: 'Arquivo enviado com sucesso!',
        variant: 'default',
      });
      // Limpar arquivo selecionado
      setFileTypes(prev => prev.map(type => 
        type.id === tipoArquivo ? { 
          ...type, 
          uploaded: true, 
          date: new Date(), 
          files: [arquivo],
          month: selectedMonth,
          isUploading: false,
          remotePath: resultado.remotePath
        } : type
      ));

    } catch (erro) {
      console.error('Erro no upload:', erro);
      setErro(erro.message);
      toast({
        title: 'Erro no envio',
        description: `Erro ao enviar arquivo: ${erro.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, tipoArquivoId: string) => {
    if (event.target.files && event.target.files.length > 0) {
      const arquivo = event.target.files[0];
      const tiposPermitidos = ALLOWED_FILE_TYPES[tipoArquivoId];
      const extensaoArquivo = '.' + arquivo.name.split('.').pop()?.toLowerCase();
      
      if (!tiposPermitidos.includes(extensaoArquivo)) {
        const tipoArquivo = fileTypes.find(ta => ta.id === tipoArquivoId)?.name || tipoArquivoId;
        toast({
          title: "Formato inválido",
          description: `Tipo de arquivo inválido. Para ${tipoArquivo}, são aceitos apenas os formatos: ${tiposPermitidos.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      try {
        // Mostrar estado de carregamento
        setFileTypes(prev => prev.map(tipo => 
          tipo.id === tipoArquivoId ? 
          { 
            ...tipo, 
            uploaded: false, 
            date: null, 
            files: [arquivo],
            month: selectedMonth,
            isUploading: true
          } : tipo
        ));

        await enviarArquivo(arquivo, tipoArquivoId);
      } catch (erro) {
        console.error('Erro no envio:', erro);
        
        // Resetar estado em caso de erro
        setFileTypes(prev => prev.map(tipo => 
          tipo.id === tipoArquivoId ? 
          { 
            ...tipo, 
            uploaded: false, 
            date: null, 
            files: [],
            month: null,
            isUploading: false
          } : tipo
        ));

        toast({
          title: "Erro no envio",
          description: "Não foi possível enviar o arquivo para o servidor. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedCompany) {
      toast({
        title: "Selecione uma empresa",
        description: "É necessário selecionar uma empresa antes de enviar os arquivos",
        variant: "destructive",
      });
      return;
    }

    const hasAnyFiles = fileTypes.some(type => type.uploaded);
    if (!hasAnyFiles) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione ao menos um arquivo para enviar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Verificar se há arquivos Excel para atualizar o dashboard
      const hasExcelFiles = fileTypes.some(type => 
        type.uploaded && 
        type.files.some(file => 
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')
        )
      );

      if (hasExcelFiles) {
        // Notificar que o dashboard será atualizado
        toast({
          title: "Arquivos enviados com sucesso!",
          description: "O dashboard será atualizado com os novos dados após o processamento.",
        });
      } else {
        toast({
          title: "Arquivos enviados com sucesso!",
          description: "Seus arquivos foram recebidos e estão sendo processados.",
        });
      }
      
      // Reset dos campos após envio
      setFileTypes(prev => prev.map(type => ({ 
        ...type, 
        files: [],
        uploaded: false,
        date: null,
        month: null
      })));
    } catch (error) {
      toast({
        title: "Erro ao enviar arquivos",
        description: "Ocorreu um erro durante o envio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyOptions = companies.map(emp => ({
    value: emp.id,
    label: `${emp.nome} (${emp.cnpj})`
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload de Arquivos</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Selecione a empresa
            </label>
            
            <Select
              options={companyOptions}
              value={companyOptions.find(opt => opt.value === selectedCompany) || null}
              onChange={option => setSelectedCompany(option ? option.value : "")}
              placeholder="Digite ou selecione a empresa"
              isClearable
              isSearchable
              styles={{
                container: base => ({ ...base, minWidth: 300 }),
                menu: base => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mês de referência
            </label>
            
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {getAvailableMonths().map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {fileTypes.filter(type => allowedFileTypes.includes(type.id)).map((fileType) => (
            <Card 
              key={fileType.id} 
              className={`border ${fileType.uploaded ? 'border-green-500 bg-green-50' : 'border-red-200 bg-red-50'}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  {fileType.name}
                  {fileType.uploaded ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  }
                </CardTitle>
                <CardDescription>{fileType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fileType.uploaded ? (
                    <div>
                      <div className="mb-2 text-sm text-gray-500">
                        {fileType.files.length} arquivo(s) selecionado(s)
                      </div>
                      <div className="text-sm text-gray-500">
                        Data: {fileType.date?.toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-500">
                      Pendente
                    </div>
                  )}
                  
                  <div>
                    <Button 
                      variant={fileType.uploaded ? "outline" : "default"} 
                      className="w-full flex items-center gap-2"
                      asChild
                    >
                      <label>
                        <input 
                          type="file"
                          onChange={(e) => handleFileChange(e, fileType.id)}
                          accept={ALLOWED_FILE_TYPES[fileType.id].join(',')}
                          className="hidden"
                          id={`file-${fileType.id}`}
                          disabled={!selectedCompany || fileType.isUploading}
                        />
                        <FilePlus2 className="h-4 w-4" />
                        {fileType.isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : fileType.uploaded ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Enviado
                          </>
                        ) : (
                          <>
                            <UploadIcon className="h-5 w-5" />
                            Enviar Arquivo
                          </>
                        )}
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Upload;
