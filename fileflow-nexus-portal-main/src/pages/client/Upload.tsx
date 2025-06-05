import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { Building, Upload as UploadIcon, CheckCircle, AlertCircle, FilePlus2, Calendar, BarChart2, FileSpreadsheet } from 'lucide-react';
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
}

const Upload = () => {
  const { user } = useAuth();
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
      id: 'cte', 
      name: 'CTE', 
      description: 'Conhecimentos de Transporte Eletrônico', 
      uploaded: false, 
      date: null, 
      files: [],
      month: null 
    },
    { 
      id: 'nfs', 
      name: 'NFS', 
      description: 'Notas Fiscais de Serviço (PDFs)', 
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, typeId: string) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      
      // Verificar se é um arquivo Excel
      const isExcel = files.some(file => 
        file.name.endsWith('.xlsx') || 
        file.name.endsWith('.xls')
      );

      if (isExcel) {
        // Se for Excel, atualizar o mês de referência
        setFileTypes(prev => prev.map(type => 
          type.id === typeId ? 
          { 
            ...type, 
            uploaded: true, 
            date: new Date(), 
            files,
            month: selectedMonth
          } : type
        ));

        // Notificar que um novo relatório Excel foi carregado
        toast({
          title: "Relatório Excel carregado",
          description: "O dashboard será atualizado com os novos dados após o processamento.",
        });
      } else {
        // Para outros tipos de arquivo
        setFileTypes(prev => prev.map(type => 
          type.id === typeId ? 
          { 
            ...type, 
            uploaded: true, 
            date: new Date(), 
            files,
            month: selectedMonth
          } : type
        ));

        toast({
          title: "Arquivos selecionados",
          description: `${files.length} arquivo(s) selecionado(s) para ${fileTypes.find(t => t.id === typeId)?.name}`,
        });
      }
    }
  };

  const handleReportChange = (event: React.ChangeEvent<HTMLInputElement>, reportId: string) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Verificar se é um arquivo Excel
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setReportTypes(prev => prev.map(report => 
          report.id === reportId ? 
          { 
            ...report, 
            uploaded: true, 
            date: new Date(), 
            file,
            month: selectedMonth
          } : report
        ));

        const reportType = reportTypes.find(r => r.id === reportId);
        toast({
          title: "Relatório carregado",
          description: `O dashboard ${reportType?.type === 'dashboard' ? 'principal' : 'financeiro'} será atualizado após o processamento.`,
        });
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
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
      // Simulando envio para o servidor
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      // Simulando envio para o servidor
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

    const formData = new FormData();
    formData.append('companyId', selectedCompany);
    formData.append('month', selectedMonth); // Assuming month is relevant for backend path
    formData.append('fileType', typeId);
    
    fileType.files.forEach(file => {
      formData.append('files', file);
    });

    try {
      // TODO: Replace with actual backend API call
      console.log(`Simulating upload for ${fileType.name} to backend...`);
      console.log('Files:', fileType.files);
      console.log('Company ID:', selectedCompany);
      console.log('Month:', selectedMonth);
      console.log('File Type:', typeId);

      // Simulate a backend response
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: `${fileType.name} enviados com sucesso!`,
        description: "Seus arquivos foram recebidos e estão sendo processados.",
      });

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
                              className="hidden" 
                              multiple 
                              onChange={(e) => handleFileChange(e, fileType.id)} 
                              disabled={!selectedCompany}
                            />
                            <FilePlus2 className="h-4 w-4" />
                            {fileType.uploaded ? "Trocar arquivos" : "Selecionar arquivos"}
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
