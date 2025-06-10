
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Folder, AlertCircle, CheckCircle, FileWarning, FileCheck } from "lucide-react";

const StaffDashboard = () => {
  // Dados fictícios para demonstração
  const importStatusData = [
    { name: 'Concluídas', valor: 68 },
    { name: 'Pendentes', valor: 12 },
    { name: 'Com erro', valor: 8 },
    { name: 'Em processamento', valor: 12 },
  ];

  const uploadsByCompanyData = [
    { company: 'Empresa A', uploads: 25 },
    { company: 'Empresa B', uploads: 18 },
    { company: 'Empresa C', uploads: 15 },
    { company: 'Empresa D', uploads: 12 },
    { company: 'Empresa E', uploads: 10 },
    { company: 'Outras', uploads: 20 },
  ];

  const dailyUploadsData = [
    { day: '01/10', uploads: 12 },
    { day: '02/10', uploads: 8 },
    { day: '03/10', uploads: 15 },
    { day: '04/10', uploads: 22 },
    { day: '05/10', uploads: 16 },
    { day: '06/10', uploads: 4 },
    { day: '07/10', uploads: 2 },
    { day: '08/10', uploads: 10 },
    { day: '09/10', uploads: 18 },
    { day: '10/10', uploads: 14 },
    { day: '11/10', uploads: 7 },
    { day: '12/10', uploads: 5 },
    { day: '13/10', uploads: 9 },
    { day: '14/10', uploads: 11 },
  ];

  const COLORS = ['#4CAF50', '#FFA726', '#EF5350', '#42A5F5'];

  const chartConfig = {
    uploads: {
      label: "Uploads",
      theme: { light: "#0ea5e9", dark: "#38bdf8" },
    }
  };

  const recentUploads = [
    { company: 'Empresa B', type: 'SPED', status: 'Erro', date: '14/10/2023 14:32' },
    { company: 'Empresa A', type: 'NFE', status: 'Concluído', date: '14/10/2023 13:45' },
    { company: 'Empresa D', type: 'Planilhas', status: 'Pendente', date: '14/10/2023 10:22' },
    { company: 'Empresa C', type: 'CTE', status: 'Concluído', date: '13/10/2023 16:08' },
    { company: 'Empresa E', type: 'NFCE', status: 'Concluído', date: '13/10/2023 15:17' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Erro':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Pendente':
        return <FileWarning className="h-4 w-4 text-amber-500" />;
      default:
        return <FileCheck className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'text-green-600';
      case 'Erro':
        return 'text-red-600';
      case 'Pendente':
        return 'text-amber-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Importações</CardDescription>
            <CardTitle>1.245</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              132 nos últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Empresas Ativas</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              28
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              3 novas empresas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Arquivos Processados</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-green-500" />
              5.782
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              543 nos últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Erros de Processamento</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              42
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              8 erros nos últimos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Importações</CardTitle>
            <CardDescription>Visão geral dos processos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <PieChart width={300} height={250}>
                <Pie
                  data={importStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {importStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Uploads por Dia</CardTitle>
            <CardDescription>Arquivos recebidos nos últimos 14 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-64" config={chartConfig}>
              <LineChart data={dailyUploadsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="uploads" 
                  name="uploads"
                  stroke="var(--color-uploads)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Uploads por Empresa</CardTitle>
            <CardDescription>Total de envios por cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-80" config={chartConfig}>
              <BarChart data={uploadsByCompanyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="company" type="category" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="uploads" 
                  name="uploads"
                  fill="var(--color-uploads)" 
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploads Recentes</CardTitle>
            <CardDescription>Últimos arquivos recebidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentUploads.map((upload, index) => (
                <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{upload.company}</p>
                    <p className="text-sm text-muted-foreground">{upload.type} - {upload.date}</p>
                  </div>
                  <div className={`flex items-center gap-2 font-medium ${getStatusClass(upload.status)}`}>
                    {getStatusIcon(upload.status)}
                    {upload.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
