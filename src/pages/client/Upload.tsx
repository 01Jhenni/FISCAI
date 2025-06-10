import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { Building, Upload as UploadIcon, CheckCircle, AlertCircle, FilePlus2, Calendar, BarChart2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Company {
  id: string;
  name: string;
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

const Upload = () => {
  const { user } = useAuth();
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>(user?.companyId || '');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeTab, setActiveTab] = useState<string>("files");
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
  const [companies] = useState<Company[]>([
    { id: 'emp1', name: 'Empresa Teste' },
    { id: 'emp2', name: 'Outra Empresa' },
  ]);

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

  const enviarArquivo = async (arquivo: File, tipoArquivo: string) => {
    try {
      setProgresso(0);
      setErro(null);

      // Criar FormData para envio
      const formData = new FormData();
      formData.append('arquivo', arquivo);

      // Enviar para o backend
      const response = await fetch(
        `http://localhost:3001/upload/${tipoArquivo}/${selectedCompany}/${selectedMonth}`,
        {
          method: 'POST',
          body: formData
        }
      );

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

  const handleReportChange = async (event: React.ChangeEvent<HTMLInputElement>, idRelatorio: string) => {
    if (event.target.files && event.target.files.length > 0) {
      const arquivo = event.target.files[0];
      const extensaoArquivo = '.' + arquivo.name.split('.').pop()?.toLowerCase();
      
      if (extensaoArquivo !== '.xlsx' && extensaoArquivo !== '.xls') {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
          variant: "destructive",
        });
        return;
      }

      try {
        // Mostrar estado de carregamento
        setReportTypes(prev => prev.map(relatorio => 
          relatorio.id === idRelatorio ? 
          { 
            ...relatorio, 
            uploaded: false, 
            date: null, 
            file: arquivo,
            month: selectedMonth,
            isUploading: true
          } : relatorio
        ));

        await enviarArquivo(arquivo, 'planilha');

        const tipoRelatorio = reportTypes.find(r => r.id === idRelatorio);
        toast({
          title: "Relatório enviado com sucesso",
          description: `O dashboard ${tipoRelatorio?.type === 'dashboard' ? 'principal' : 'financeiro'} será atualizado após o processamento.`,
        });
      } catch (erro) {
        console.error('Erro no envio:', erro);
        
        // Resetar estado em caso de erro
        setReportTypes(prev => prev.map(relatorio => 
          relatorio.id === idRelatorio ? 
          { 
            ...relatorio, 
            uploaded: false, 
            date: null, 
            file: null,
            month: null,
            isUploading: false
          } : relatorio
        ));

        toast({
          title: "Erro no envio",
          description: "Não foi possível enviar o relatório para o servidor. Tente novamente.",
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

  const handleReportSubmit = async () => {
    const hasAnyReports = reportTypes.some(report => report.uploaded);
    if (!hasAnyReports) {
      toast({
        title: "Nenhum relatório selecionado",
        description: "Por favor, selecione pelo menos um relatório para enviar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Notificar sobre atualização dos dashboards
      const dashboardReport = reportTypes.find(r => r.id === 'dashboard-report' && r.uploaded);
      const financialReport = reportTypes.find(r => r.id === 'financial-report' && r.uploaded);

      if (dashboardReport && financialReport) {
        toast({
          title: "Relatórios enviados com sucesso!",
          description: "Ambos os dashboards serão atualizados após o processamento.",
        });
      } else if (dashboardReport) {
        toast({
          title: "Relatório enviado com sucesso!",
          description: "O dashboard principal será atualizado após o processamento.",
        });
      } else if (financialReport) {
        toast({
          title: "Relatório enviado com sucesso!",
          description: "O dashboard financeiro será atualizado após o processamento.",
        });
      }
      
      // Reset dos campos após envio
      setReportTypes(prev => prev.map(report => ({ 
        ...report, 
        uploaded: false,
        date: null,
        file: null,
        month: null
      })));
    } catch (error) {
      toast({
        title: "Erro ao enviar relatórios",
        description: "Ocorreu um erro durante o envio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIndividualFileUpload = async (typeId: string) => {
    if (!selectedCompany) {
      toast({
        title: "Selecione uma empresa",
        description: "É necessário selecionar uma empresa antes de enviar os arquivos",
        variant: "destructive",
      });
      return;
    }

    const fileType = fileTypes.find(type => type.id === typeId);
    if (!fileType || fileType.files.length === 0) {
      toast({
        title: `Nenhum arquivo selecionado para ${fileType?.name || 'este tipo'}`,
        description: "Por favor, selecione ao menos um arquivo para enviar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true); // Consider a more granular loading state per file type

    try {
      // Enviar todos os arquivos selecionados para esse tipo
      for (const arquivo of fileType.files) {
        await enviarArquivo(arquivo, typeId);
      }
      // Optionally reset files for this type after successful upload
      setFileTypes(prev => prev.map(type =>
        type.id === typeId ? { ...type, files: [], uploaded: false, date: null } : type
      ));
    } catch (error) {
      console.error(`Error uploading ${fileType.name}:`, error);
      toast({
        title: `Erro ao enviar ${fileType.name}`,
        description: "Ocorreu um erro durante o envio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Consider a more granular loading state
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload de Arquivos</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FilePlus2 className="h-4 w-4" />
            Arquivos
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Selecione a empresa
                </label>
                
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  disabled={!!user?.companyId}
                >
                  <option value="">Selecionar empresa...</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
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
              {fileTypes.map((fileType) => (
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
                      {fileType.files.length > 0 && ( // Only show "Enviar" if files are selected for this type
                        <div>
                          <Button
                            variant="default"
                            className="w-full flex items-center gap-2 mt-2"
                            onClick={() => handleIndividualFileUpload(fileType.id)}
                            disabled={isSubmitting || !selectedCompany}
                          >
                            {isSubmitting ? ( // You might want a separate loading state for each button
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                <span>Enviando {fileType.name}...</span>
                              </div>
                            ) : (
                              <>
                                <UploadIcon className="h-5 w-5" />
                                Enviar {fileType.name}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Selecione a empresa
                </label>
                
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  disabled={!!user?.companyId}
                >
                  <option value="">Selecionar empresa...</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((report) => (
                <Card 
                  key={report.id} 
                  className={`border ${report.uploaded ? 'border-green-500 bg-green-50' : 'border-red-200 bg-red-50'}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      {report.name}
                      {report.uploaded ? 
                        <CheckCircle className="h-5 w-5 text-green-500" /> : 
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      }
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report.uploaded ? (
                        <div>
                          <div className="mb-2 text-sm text-gray-500">
                            Arquivo: {report.file?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Data: {report.date?.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Mês: {new Date(report.month || '').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-500">
                          Pendente
                        </div>
                      )}
                      
                      <div>
                        <Button 
                          variant={report.uploaded ? "outline" : "default"} 
                          className="w-full flex items-center gap-2"
                          asChild
                        >
                          <label>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".xlsx,.xls"
                              onChange={(e) => handleReportChange(e, report.id)} 
                              disabled={!selectedCompany}
                            />
                            <FileSpreadsheet className="h-4 w-4" />
                            {report.uploaded ? "Trocar relatório" : "Selecionar relatório"}
                          </label>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Button 
                onClick={handleReportSubmit} 
                className="w-full md:w-auto flex items-center gap-2"
                disabled={isSubmitting || !selectedCompany}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5" />
                    Enviar Relatórios
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;
