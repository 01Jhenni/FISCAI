import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, FileCheck, FileWarning, ArrowUpRight, ArrowDownRight, Calendar, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ClientDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

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

  // Dados fictícios para demonstração - agora organizados por mês
  const monthlyData = {
    '2023-10': {
      uploadActivity: [
        { day: '01/10', uploads: 4 },
        { day: '02/10', uploads: 3 },
        { day: '03/10', uploads: 5 },
        // ... outros dias do mês
      ],
      pendingFiles: [
        { type: 'SPED', month: 'Outubro', status: 'pendente' },
        { type: 'NFE', month: 'Outubro', status: 'pendente' },
        { type: 'Planilhas', month: 'Outubro', status: 'pendente' },
      ],
      recentUploads: [
        { type: 'CTE', date: '15/10/2023', status: 'processado' },
        { type: 'NFCE', date: '10/10/2023', status: 'processado' },
        { type: 'NFS', date: '05/10/2023', status: 'processado' },
      ],
      financialData: {
        revenue: 'R$ 125.430,00',
        expenses: 'R$ 98.750,00',
        profit: 'R$ 26.680,00',
        profitMargin: '21,3%',
        growthRate: '5,2%',
        isPositive: true
      }
    },
    // ... outros meses
  };

  // Obter dados do mês selecionado
  const currentMonthData = monthlyData[selectedMonth] || {
    uploadActivity: [],
    pendingFiles: [],
    recentUploads: [],
    financialData: {
      revenue: 'R$ 0,00',
      expenses: 'R$ 0,00',
      profit: 'R$ 0,00',
      profitMargin: '0%',
      growthRate: '0%',
      isPositive: true
    }
  };

  const chartConfig = {
    uploads: {
      label: "Uploads",
      theme: { light: "#0ea5e9", dark: "#38bdf8" },
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableMonths().map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Receita</CardDescription>
            <CardTitle className="flex items-center justify-between">
              {currentMonthData.financialData.revenue}
              {currentMonthData.financialData.isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {currentMonthData.financialData.isPositive ? '+' : '-'}{currentMonthData.financialData.growthRate} em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Despesas</CardDescription>
            <CardTitle>{currentMonthData.financialData.expenses}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Gestão eficiente das despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lucro</CardDescription>
            <CardTitle className="flex items-center justify-between">
              {currentMonthData.financialData.profit}
              {currentMonthData.financialData.isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Margem de lucro: {currentMonthData.financialData.profitMargin}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próximo vencimento</CardDescription>
            <CardTitle className="text-orange-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              25/10/2023
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              ICMS a recolher
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade de Uploads</CardTitle>
            <CardDescription>Histórico de envio de arquivos do mês selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-80" config={chartConfig}>
              <AreaChart data={currentMonthData.uploadActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="uploads" 
                  name="uploads"
                  stroke="var(--color-uploads)"
                  fill="var(--color-uploads)" 
                  fillOpacity={0.2} 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Pendências
              </CardTitle>
              <CardDescription>Arquivos pendentes de envio para {new Date(selectedMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentMonthData.pendingFiles.map((file, index) => (
                  <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{file.type}</p>
                      <p className="text-sm text-muted-foreground">{file.month}</p>
                    </div>
                    <FileWarning className="h-5 w-5 text-amber-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-500" />
                Últimos Envios
              </CardTitle>
              <CardDescription>Arquivos enviados em {new Date(selectedMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentMonthData.recentUploads.map((upload, index) => (
                  <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{upload.type}</p>
                      <p className="text-sm text-muted-foreground">{upload.date}</p>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Processado
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
