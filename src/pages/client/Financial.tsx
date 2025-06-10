
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

const ClientFinancial = () => {
  const monthlyData = [
    { name: 'Jan', receita: 12000, despesa: 9000 },
    { name: 'Fev', receita: 15000, despesa: 10000 },
    { name: 'Mar', receita: 18000, despesa: 12000 },
    { name: 'Abr', receita: 16000, despesa: 11000 },
    { name: 'Mai', receita: 17000, despesa: 12000 },
    { name: 'Jun', receita: 19000, despesa: 13000 },
    { name: 'Jul', receita: 20000, despesa: 14000 },
    { name: 'Ago', receita: 21000, despesa: 15000 },
    { name: 'Set', receita: 19000, despesa: 14000 },
    { name: 'Out', receita: 20000, despesa: 15000 },
    { name: 'Nov', receita: 22000, despesa: 16000 },
    { name: 'Dez', receita: 25000, despesa: 18000 },
  ];

  const expensesByCategory = [
    { name: 'Pessoal', valor: 8000 },
    { name: 'Operacional', valor: 4500 },
    { name: 'Marketing', valor: 2200 },
    { name: 'Impostos', valor: 3800 },
    { name: 'Outros', valor: 1500 },
  ];

  const revenueByProduct = [
    { name: 'Produto A', valor: 10500 },
    { name: 'Produto B', valor: 7200 },
    { name: 'Produto C', valor: 5300 },
    { name: 'Serviços', valor: 2000 },
  ];

  const financialIndicators = [
    { name: 'Liquidez Corrente', valor: 2.3, isGood: true, change: '+0.2' },
    { name: 'Margem Líquida', valor: '18.5%', isGood: true, change: '+1.2%' },
    { name: 'ROI', valor: '22.7%', isGood: true, change: '+2.5%' },
    { name: 'Endividamento', valor: '36.4%', isGood: false, change: '+1.8%' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const chartConfig = {
    receita: {
      label: "Receita",
      theme: { light: "#0ea5e9", dark: "#38bdf8" },
    },
    despesa: {
      label: "Despesa",
      theme: { light: "#ef4444", dark: "#f87171" },
    },
    resultado: {
      label: "Resultado",
      theme: { light: "#22c55e", dark: "#4ade80" },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialIndicators.map((indicator, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{indicator.name}</CardDescription>
              <CardTitle className="flex items-center justify-between">
                {indicator.valor}
                {indicator.isGood ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xs ${indicator.isGood ? 'text-green-600' : 'text-red-600'}`}>
                {indicator.change} em relação ao período anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita x Despesa</CardTitle>
            <CardDescription>Comparativo mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-80" config={chartConfig}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="receita" name="receita" fill="var(--color-receita)" />
                <Bar dataKey="despesa" name="despesa" fill="var(--color-despesa)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado Mensal</CardTitle>
            <CardDescription>Evolução do resultado financeiro</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-80" config={chartConfig}>
              <LineChart
                data={monthlyData.map(item => ({
                  name: item.name,
                  resultado: item.receita - item.despesa
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="resultado" 
                  name="resultado" 
                  stroke="var(--color-resultado)" 
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
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Despesas por Categoria
            </CardTitle>
            <CardDescription>Distribuição dos gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Receita por Produto/Serviço
            </CardTitle>
            <CardDescription>Distribuição das receitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByProduct}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueByProduct.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientFinancial;
