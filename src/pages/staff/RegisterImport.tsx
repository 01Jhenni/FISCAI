import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { Building, Upload as UploadIcon, AlertCircle, FileText, Mail, Calendar, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Company {
  id: string;
  name: string;
  responsible: {
    name: string;
    email: string;
  };
}

interface ImportType {
  id: string;
  name: string;
  description: string;
}

const RegisterImport = () => {
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [file, setFile] = useState<File | null>(null);
  const [errorImage, setErrorImage] = useState<File | null>(null);
  const [errorDescription, setErrorDescription] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sendEmail, setSendEmail] = useState<boolean>(true);

  // Dados fictícios para demonstração
  const companies: Company[] = [
    {
      id: 'emp1',
      name: 'Empresa A',
      responsible: {
        name: 'João Silva',
        email: 'joao.silva@empresaa.com'
      }
    },
    {
      id: 'emp2',
      name: 'Empresa B',
      responsible: {
        name: 'Maria Santos',
        email: 'maria.santos@empresab.com'
      }
    }
  ];

  const importTypes: ImportType[] = [
    {
      id: 'sped',
      name: 'SPED',
      description: 'Arquivos SPED Fiscal e Contribuições'
    },
    {
      id: 'nfe',
      name: 'NFE',
      description: 'Notas Fiscais Eletrônicas'
    },
    {
      id: 'cte',
      name: 'CTE',
      description: 'Conhecimentos de Transporte Eletrônico'
    },
    {
      id: 'nfs',
      name: 'NFS',
      description: 'Notas Fiscais de Serviço'
    },
    {
      id: 'nfce',
      name: 'NFCE',
      description: 'Notas Fiscais de Consumidor Eletrônica'
    },
    {
      id: 'planilha',
      name: 'Planilhas',
      description: 'Planilhas Excel de controle'
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleErrorImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setErrorImage(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCompany || !selectedType || !file) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulando envio para o servidor
      await new Promise(resolve => setTimeout(resolve, 2000));

      const company = companies.find(c => c.id === selectedCompany);
      const importType = importTypes.find(t => t.id === selectedType);

      // Simulando envio de email
      if (sendEmail && company) {
        const emailSubject = hasError 
          ? `Erro na importação - ${importType?.name} - ${company.name}`
          : `Importação concluída - ${importType?.name} - ${company.name}`;

        const emailBody = hasError
          ? `Olá ${company.responsible.name},\n\nHouve um erro durante a importação do arquivo ${file.name}.\n\nDescrição do erro: ${errorDescription}\n\nPor favor, verifique e tente novamente.\n\nAtenciosamente,\nEquipe de Suporte`
          : `Olá ${company.responsible.name},\n\nA importação do arquivo ${file.name} foi concluída com sucesso.\n\nDetalhes:\n- Tipo: ${importType?.name}\n- Mês: ${new Date(selectedMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}\n\nAtenciosamente,\nEquipe de Suporte`;

        console.log('Email enviado para:', company.responsible.email);
        console.log('Assunto:', emailSubject);
        console.log('Corpo:', emailBody);
      }

      toast({
        title: "Importação registrada",
        description: hasError 
          ? "Importação registrada com erro. Email enviado ao responsável."
          : "Importação registrada com sucesso. Email enviado ao responsável.",
      });

      // Reset form
      setSelectedCompany('');
      setSelectedType('');
      setFile(null);
      setErrorImage(null);
      setErrorDescription('');
      setHasError(false);
    } catch (error) {
      toast({
        title: "Erro ao registrar importação",
        description: "Ocorreu um erro durante o registro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registrar Importação</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nova Importação</CardTitle>
          <CardDescription>Registre uma nova importação de arquivo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Empresa
                </Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCompany && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Responsável: {companies.find(c => c.id === selectedCompany)?.responsible.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tipo de Importação
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {importTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Mês de Referência
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableMonths().map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="flex items-center gap-2">
                  <UploadIcon className="h-4 w-4" />
                  Arquivo
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {file && (
                    <span className="text-sm text-muted-foreground">
                      {file.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasError"
                  checked={hasError}
                  onCheckedChange={(checked) => setHasError(checked === true)}
                />
                <Label htmlFor="hasError" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Registrar erro na importação
                </Label>
              </div>

              {hasError && (
                <div className="space-y-4 p-4 border rounded-lg bg-red-50">
                  <div className="space-y-2">
                    <Label htmlFor="errorDescription" className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Descrição do Erro
                    </Label>
                    <Textarea
                      id="errorDescription"
                      value={errorDescription}
                      onChange={(e) => setErrorDescription(e.target.value)}
                      placeholder="Descreva o erro encontrado..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="errorImage" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Imagem do Erro (opcional)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        id="errorImage"
                        accept="image/*"
                        onChange={handleErrorImageChange}
                        className="flex-1"
                      />
                      {errorImage && (
                        <span className="text-sm text-muted-foreground">
                          {errorImage.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendEmail"
                  checked={sendEmail}
                  onCheckedChange={(checked) => setSendEmail(checked === true)}
                />
                <Label htmlFor="sendEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Enviar email ao responsável
                </Label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedCompany || !selectedType || !file}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4" />
                    Registrar Importação
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterImport; 