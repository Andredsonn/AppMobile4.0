import { useState, useEffect, useMemo } from 'react';

import { Layout } from '../components/Layout';

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Plus,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { toast } from 'sonner';

import { useNavigate } from 'react-router';

import { lancamentoService } from '../../services/lancamentoService';
import { useAuth } from '../../context/AuthContext';
import { isCompanyAdmin } from '../../utils/permissions';

import type { Lancamento } from '../../types';

export function DashboardPage() {

  const [lancamentos, setLancamentos] =
    useState<Lancamento[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = isCompanyAdmin(user);

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    try {

      setIsLoading(true);

      const now = new Date();

      const ano = now.getFullYear();

      const mes = now.getMonth() + 1;

      let data: Lancamento[];
      if (isAdmin) {
        data = await lancamentoService.getByMes(ano, mes);
      } else {
        const todos = await lancamentoService.getAllEmpresa();
        data = todos.filter(l => {
          const d = new Date(l.data);
          return d.getFullYear() === ano && d.getMonth() + 1 === mes;
        });
      }

      setLancamentos(data);

    } catch (error) {

      console.error(error);

      toast.error(
        'Erro ao carregar dashboard'
      );

    } finally {

      setIsLoading(false);
    }
  };

  const formatCurrency = (
    value: number
  ) => {

    return new Intl.NumberFormat(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      }
    ).format(value);
  };

  /* =========================================
     TOTALIZADORES
  ========================================= */

  const {
    totalReceitas,
    totalDespesas,
    saldo,
  } = useMemo(() => {

    let receitas = 0;

    let despesas = 0;

    lancamentos.forEach((l) => {

      if (l.tipoLancamento === 0) {
        receitas += l.valor;
      }

      if (l.tipoLancamento === 1) {
        despesas += l.valor;
      }
    });

    return {

      totalReceitas: receitas,

      totalDespesas: despesas,

      saldo: receitas - despesas,
    };

  }, [lancamentos]);

  /* =========================================
     GRÁFICO DE BARRAS ORDENADO
  ========================================= */

  const chartData = useMemo(() => {

    const grouped: {
      [key: string]: {
        dataCompleta: string;
        data: string;
        receitas: number;
        despesas: number;
      };
    } = {};

    lancamentos.forEach((l) => {

      if (!l.data) return;

      const date =
        new Date(l.data);

      const key =
        date.toISOString();

      const label =
        date.toLocaleDateString(
          'pt-BR',
          {
            day: '2-digit',
            month: '2-digit',
          }
        );

      if (!grouped[key]) {

        grouped[key] = {

          dataCompleta: key,

          data: label,

          receitas: 0,

          despesas: 0,
        };
      }

      if (l.tipoLancamento === 0) {

        grouped[key].receitas += l.valor;
      }

      if (l.tipoLancamento === 1) {

        grouped[key].despesas += l.valor;
      }
    });

    return Object.values(grouped)

      .sort(
        (a, b) =>
          new Date(a.dataCompleta).getTime() -
          new Date(b.dataCompleta).getTime()
      );

  }, [lancamentos]);

  /* =========================================
     DADOS PIZZA
  ========================================= */

  const pieData = [

    {
      name: 'Receitas',
      value: totalReceitas,
      color: '#10B981',
    },

    {
      name: 'Despesas',
      value: totalDespesas,
      color: '#EF4444',
    },
  ];

  /* =========================================
     ALERTAS
  ========================================= */

  const alerts = useMemo(() => {

    const list = [];

    if (
      totalDespesas > totalReceitas
    ) {

      list.push({

        message:
          'Suas despesas estão maiores que suas receitas!',

        type: 'danger',
      });
    }

    if (saldo > 0) {

      list.push({

        message:
          'Você está economizando este mês 👏',

        type: 'success',
      });
    }

    if (
      totalDespesas > 0 &&
      totalDespesas >
        totalReceitas * 0.8
    ) {

      list.push({

        message:
          'Atenção: você já gastou mais de 80% do que ganhou.',

        type: 'warning',
      });
    }

    return list;

  }, [
    totalReceitas,
    totalDespesas,
    saldo,
  ]);

  const goalMessage = useMemo(() => {
    if (totalReceitas === 0 && totalDespesas === 0) {
      return {
        message: 'Ainda não há dados suficientes. Registre receitas e despesas para que o Midas possa orientar seu caminho ao resultado positivo.',
        type: 'info',
      };
    }

    if (saldo > 0) {
      return {
        message: 'Resultado positivo alcançado: suas receitas estão superando as despesas. Foque em manter receitas crescentes e despesas controladas.',
        type: 'success',
      };
    }

    return {
      message: 'Para chegar ao resultado positivo, aumente receitas e reduza despesas. Priorize cortes nos gastos não essenciais e busque novas fontes de vendas.',
      type: 'danger',
    };
  }, [totalReceitas, totalDespesas, saldo]);

  /* =========================================
     SKELETON LOADING
  ========================================= */

  if (isLoading) {

    return (

      <Layout>

        <div className="space-y-6 animate-pulse">

          <div className="h-10 w-64 bg-gray-200 rounded-lg" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="h-32 bg-gray-200 rounded-xl" />

            <div className="h-32 bg-gray-200 rounded-xl" />

            <div className="h-32 bg-gray-200 rounded-xl" />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 h-[400px] bg-gray-200 rounded-xl" />

            <div className="h-[400px] bg-gray-200 rounded-xl" />

          </div>

          <div className="h-[300px] bg-gray-200 rounded-xl" />

        </div>

      </Layout>
    );
  }

  return (

    <Layout>

      <div className="space-y-8">

        {/* HEADER */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-[#4B0012]">
              Dashboard
            </h1>

            <p className="text-gray-600">
              Visão geral das suas finanças
            </p>

          </div>

          <Button
            className="bg-[#FFC107] hover:bg-[#FFB300] text-black"
            onClick={() =>
              navigate('/lancamentos/novo')
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Lançamento
          </Button>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card className="p-6 bg-green-50 border-green-200">

            <div className="flex justify-between">

              <div>

                <p className="text-sm text-green-700">
                  Receitas
                </p>

                <p className="text-2xl font-bold text-green-900 mt-2">
                  {formatCurrency(
                    totalReceitas
                  )}
                </p>

              </div>

              <TrendingUp className="w-8 h-8 text-green-600" />

            </div>

          </Card>

          <Card className="p-6 bg-red-50 border-red-200">

            <div className="flex justify-between">

              <div>

                <p className="text-sm text-red-700">
                  Despesas
                </p>

                <p className="text-2xl font-bold text-red-900 mt-2">
                  {formatCurrency(
                    totalDespesas
                  )}
                </p>

              </div>

              <TrendingDown className="w-8 h-8 text-red-600" />

            </div>

          </Card>

          <Card className="p-6 bg-[#4B0012]/10 border-[#4B0012]/30">

            <div className="flex justify-between">

              <div>

                <p className="text-sm text-[#4B0012]">
                  Saldo
                </p>

                <p className="text-2xl font-bold text-[#4B0012] mt-2">
                  {formatCurrency(saldo)}
                </p>

              </div>

              <Wallet className="w-8 h-8 text-[#4B0012]" />

            </div>

          </Card>

        </div>

        {/* GRÁFICOS */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* BARRAS */}

          <div className="lg:col-span-2">

            <Card className="p-6">

              <h2 className="text-xl font-bold mb-6">
                Receitas x Despesas
              </h2>

              <div className="animate-in fade-in duration-700">

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >

                  <BarChart data={chartData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="data" />

                    <YAxis />

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(
                          Number(value)
                        )
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="receitas"
                      fill="#10B981"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1200}
                    />

                    <Bar
                      dataKey="despesas"
                      fill="#EF4444"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1200}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </Card>

          </div>

          {/* ALERTAS + PIZZA */}

          <div className="space-y-6">

            <Card className="p-6">

              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">

                <AlertTriangle className="w-5 h-5 text-[#4B0012]" />

                Alertas

              </h3>

              <div className="space-y-3">

                {alerts.length === 0 && (

                  <p className="text-sm text-gray-500">
                    Nenhum alerta no momento.
                  </p>

                )}

                {alerts.map(
                  (alert, index) => (

                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm font-medium ${
                        alert.type === 'danger'
                          ? 'bg-red-100 text-red-700'
                          : alert.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {alert.message}
                    </div>
                  )
                )}

              </div>

            </Card>

            {/* PIZZA */}

            <Card className="p-6">

              <h3 className="text-xl font-bold mb-4">
                Distribuição
              </h3>

              <div className="animate-in fade-in zoom-in duration-700">

                <ResponsiveContainer
                  width="100%"
                  height={250}
                >

                  <PieChart>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                      animationDuration={1400}
                    >

                      {pieData.map(
                        (entry, index) => (

                          <Cell
                            key={index}
                            fill={entry.color}
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(
                          Number(value)
                        )
                      }
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </Card>

          </div>

        </div>

        {/* ÚLTIMOS LANÇAMENTOS */}

        <Card className="p-6">

          <h2 className="text-xl font-bold mb-4">
            Últimos Lançamentos
          </h2>

          <div className="space-y-3">

            {lancamentos
              .sort(
                (a, b) =>
                  new Date(
                    b.data
                  ).getTime() -
                  new Date(
                    a.data
                  ).getTime()
              )
              .slice(0, 5)
              .map((l) => {

                const isReceita =
                  l.tipoLancamento === 0;

                return (

                  <div
                    key={l.idLancamento}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >

                    <div>

                      <p className="font-medium">
                        {
                          l.descricaoLancamento
                        }
                      </p>

                      <p className="text-sm text-gray-500">

                        {new Date(
                          l.data
                        ).toLocaleDateString(
                          'pt-BR'
                        )}

                      </p>

                    </div>

                    <p
                      className={`font-bold ${
                        isReceita
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >

                      {isReceita
                        ? '+'
                        : '-'}

                      {' '}

                      {formatCurrency(
                        l.valor
                      )}

                    </p>

                  </div>
                );
              })}

          </div>

        </Card>

      </div>

    </Layout>
  );
}