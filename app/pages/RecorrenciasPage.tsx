import { useEffect, useMemo, useState } from 'react';

import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Pencil,
  Calendar,
  CreditCard,
  BadgeDollarSign,
  Layers3,
  TimerReset,
  Receipt,
  ArrowRight,
} from 'lucide-react';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

import { motion, AnimatePresence } from 'framer-motion';

import { recorrenciaService } from '../../services/recorrenciaService';

import type { Recorrencia } from '../../types';

import { toast } from 'sonner';

import { Link } from 'react-router';

import { useAuth } from '../../context/AuthContext';
import { isCompanyAdmin } from '../../utils/permissions';

export function RecorrenciasPage() {

  const { user } = useAuth();
  const isAdmin = isCompanyAdmin(user);

  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // AGORA FUNCIONA CERTO
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [filtroTipo, setFiltroTipo] = useState<
    'TODOS' | 'MENSAL' | 'ANUAL'
  >('TODOS');

  useEffect(() => {
    loadRecorrencias();
  }, []);

  const loadRecorrencias = async () => {

    try {

      setIsLoading(true);

      const data = isAdmin
        ? await recorrenciaService.getAll()
        : await recorrenciaService.getAllEmpresa();

      setRecorrencias(data);

    } catch (error: any) {

      toast.error('Erro ao carregar recorrências');

      console.error(error);

    } finally {

      setIsLoading(false);

    }
  };

  const handleDelete = async () => {

    if (!deleteId) return;

    try {

      await recorrenciaService.delete(deleteId);

      setRecorrencias(prev =>
        prev.filter(r => r.idRecorrente !== deleteId)
      );

      toast.success('Recorrência excluída');

      setDeleteId(null);

    } catch (error: any) {

      toast.error('Erro ao excluir recorrência');

      console.error(error);

    }
  };

  // CONSERTO DEFINITIVO
  const toggleExpand = (index: number) => {

    setExpandedIndex(prev =>
      prev === index ? null : index
    );
  };

  const formatCurrency = (value?: number) => {

    return new Intl.NumberFormat(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      }
    ).format(value || 0);
  };

  const formatDate = (date?: string) => {

    if (!date) return '-';

    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTipoRecorrencia = (id?: number) => {

    switch (id) {

      case 1:
        return 'Diária';

      case 2:
        return 'Semanal';

      case 3:
        return 'Mensal';

      case 4:
        return 'Anual';

      default:
        return 'Não definida';
    }
  };

  const getStatus = (rec: Recorrencia) => {

    const hoje = new Date();

    const inicio = new Date(rec.dataInicio);

    if (inicio > hoje) {

      return {
        texto: 'Agendada',
        cor: 'bg-blue-100 text-blue-700'
      };
    }

    if ((rec.qtdeRecorrente || 0) <= 1) {

      return {
        texto: 'Finalizando',
        cor: 'bg-yellow-100 text-yellow-700'
      };
    }

    return {
      texto: 'Ativa',
      cor: 'bg-green-100 text-green-700'
    };
  };

  const recorrenciasFiltradas = useMemo(() => {

    if (filtroTipo === 'TODOS') {
      return recorrencias;
    }

    if (filtroTipo === 'MENSAL') {

      return recorrencias.filter(
        r =>
          r.idTipoRecorrencia === 3 ||
          r.tipoRecorrencia?.id === 3
      );
    }

    if (filtroTipo === 'ANUAL') {

      return recorrencias.filter(
        r =>
          r.idTipoRecorrencia === 4 ||
          r.tipoRecorrencia?.id === 4
      );
    }

    return recorrencias;

  }, [recorrencias, filtroTipo]);

  const pieData = useMemo(() => {

    const receitas = recorrencias.filter(
      r => r.tipoLancamento === 0
    ).length;

    const despesas = recorrencias.filter(
      r => r.tipoLancamento === 1
    ).length;

    return [
      {
        name: 'Receitas',
        value: receitas
      },
      {
        name: 'Despesas',
        value: despesas
      }
    ];

  }, [recorrencias]);

  const chartData = useMemo(() => {

    return [...recorrencias]
      .sort(
        (a, b) =>
          new Date(a.dataInicio).getTime() -
          new Date(b.dataInicio).getTime()
      )
      .map(rec => ({
        nome:
          rec.dsRecorrente?.slice(0, 12) || 'Sem Nome',
        valor: rec.valor || 0,
      }));

  }, [recorrencias]);

  if (isLoading) {

    return (

      <Layout>

        <div className="space-y-6">

          <div className="flex justify-between">

            <div className="space-y-2">

              <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />

              <div className="h-4 w-80 bg-gray-200 rounded-xl animate-pulse" />

            </div>

            <div className="h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 h-72 bg-gray-200 rounded-3xl animate-pulse" />

            <div className="h-72 bg-gray-200 rounded-3xl animate-pulse" />

          </div>

          {[1, 2, 3].map(item => (

            <div
              key={item}
              className="h-36 bg-gray-200 rounded-3xl animate-pulse"
            />

          ))}

        </div>

      </Layout>
    );
  }

  return (

    <Layout>

      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <h1 className="text-4xl font-bold text-[#4B0012]">
              Recorrências
            </h1>

            <p className="text-gray-500 mt-1">
              Controle das cobranças automáticas
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <Button
              variant={
                filtroTipo === 'TODOS'
                  ? 'default'
                  : 'outline'
              }
              onClick={() => setFiltroTipo('TODOS')}
            >
              Todos
            </Button>

            <Button
              variant={
                filtroTipo === 'MENSAL'
                  ? 'default'
                  : 'outline'
              }
              onClick={() => setFiltroTipo('MENSAL')}
            >
              Mensais
            </Button>

            <Button
              variant={
                filtroTipo === 'ANUAL'
                  ? 'default'
                  : 'outline'
              }
              onClick={() => setFiltroTipo('ANUAL')}
            >
              Anuais
            </Button>

            <Link to="/recorrencias/novo">

              <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black">

                <Plus className="w-4 h-4 mr-2" />

                Nova

              </Button>

            </Link>

          </div>

        </div>

        {/* DASH */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* BARRAS */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >

            <Card className="p-6 rounded-3xl border-0 shadow-sm">

              <div className="flex items-center gap-2 mb-6">

                <Layers3 className="w-5 h-5 text-[#4B0012]" />

                <h2 className="text-xl font-bold">
                  Volume de Recorrências
                </h2>

              </div>

              <ResponsiveContainer width="100%" height={300}>

                <BarChart data={chartData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="nome" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="valor"
                    fill="#4B0012"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1500}
                  />

                </BarChart>

              </ResponsiveContainer>

            </Card>

          </motion.div>

          {/* PIZZA */}

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >

            <Card className="p-6 rounded-3xl border-0 shadow-sm h-full">

              <div className="flex items-center gap-2 mb-6">

                <BadgeDollarSign className="w-5 h-5 text-[#4B0012]" />

                <h2 className="text-xl font-bold">
                  Receitas x Despesas
                </h2>

              </div>

              <ResponsiveContainer width="100%" height={250}>

                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    animationDuration={1500}
                    label
                  >

                    <Cell fill="#10B981" />

                    <Cell fill="#EF4444" />

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </Card>

          </motion.div>

        </div>

        {/* LISTA */}

        <div className="space-y-4">

          {recorrenciasFiltradas.length === 0 && (

            <Card className="p-12 rounded-3xl text-center">

              <p className="text-gray-500">
                Nenhuma recorrência encontrada.
              </p>

            </Card>

          )}

          {recorrenciasFiltradas.map((rec, index) => {

            const status = getStatus(rec);

            // AGORA FUNCIONA
            const isExpanded =
              expandedIndex === index;

            const quantidadeParcelas =
              rec.qtdeRecorrente || 0;

            return (

              <motion.div
                key={`${rec.idRecorrente}-${index}`}
                layout
              >

                <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">

                  {/* HEADER */}

                  <div className="p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                    <div className="flex items-start gap-4">

                      <div
                        className={`w-2 rounded-full min-h-[70px] ${
                          rec.tipoLancamento === 0
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />

                      <div>

                        <div className="flex items-center gap-3 flex-wrap">

                          <h2 className="text-xl font-bold text-[#4B0012]">

                            {rec.dsRecorrente}

                          </h2>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${status.cor}`}
                          >
                            {status.texto}
                          </span>

                        </div>

                        <div className="flex flex-wrap gap-5 mt-3 text-sm text-gray-600">

                          <div className="flex items-center gap-2">

                            <CreditCard className="w-4 h-4" />

                            {formatCurrency(rec.valor)}

                          </div>

                          <div className="flex items-center gap-2">

                            <Calendar className="w-4 h-4" />

                            {formatDate(rec.dataInicio)}

                          </div>

                          <div className="flex items-center gap-2">

                            <TimerReset className="w-4 h-4" />

                            {getTipoRecorrencia(
                              rec.idTipoRecorrencia ||
                              rec.tipoRecorrencia?.id
                            )}

                          </div>

                          <div className="flex items-center gap-2">

                            <Receipt className="w-4 h-4" />

                            {quantidadeParcelas} parcelas

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex flex-wrap gap-2">

                      <Button
                        variant="outline"
                        size="sm"
                      >

                        <Pencil className="w-4 h-4 mr-2" />

                        Editar

                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleExpand(index)
                        }
                      >

                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Detalhes
                          </>
                        )}

                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteId(rec.idRecorrente)
                        }
                      >

                        <Trash2 className="w-4 h-4 text-red-600" />

                      </Button>

                    </div>

                  </div>

                  {/* EXPANSIVEL */}

                  <AnimatePresence>

                    {isExpanded && (

                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0
                        }}
                        animate={{
                          opacity: 1,
                          height: 'auto'
                        }}
                        exit={{
                          opacity: 0,
                          height: 0
                        }}
                        transition={{
                          duration: 0.3
                        }}
                      >

                        <div className="bg-gray-50 border-t p-6">

                          {/* GRID */}

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                            <div className="bg-white rounded-2xl p-4">

                              <p className="text-sm text-gray-500">
                                Quantidade
                              </p>

                              <p className="text-2xl font-bold mt-1">
                                {quantidadeParcelas}x
                              </p>

                            </div>

                            <div className="bg-white rounded-2xl p-4">

                              <p className="text-sm text-gray-500">
                                Tipo
                              </p>

                              <p className="text-2xl font-bold mt-1">

                                {rec.tipoLancamento === 0
                                  ? 'Receita'
                                  : 'Despesa'}

                              </p>

                            </div>

                            <div className="bg-white rounded-2xl p-4">

                              <p className="text-sm text-gray-500">
                                Próxima Cobrança
                              </p>

                              <p className="text-2xl font-bold mt-1">

                                {formatDate(rec.dataInicio)}

                              </p>

                            </div>

                            <div className="bg-white rounded-2xl p-4">

                              <p className="text-sm text-gray-500">
                                ID Projeção
                              </p>

                              <p className="text-2xl font-bold mt-1">

                                {rec.idProjecao || '-'}

                              </p>

                            </div>

                          </div>

                          {/* TIMELINE */}

                          <div className="mt-8">

                            <h3 className="text-lg font-bold mb-5">
                              Timeline de Parcelas
                            </h3>

                            <div className="space-y-3">

                              {Array.from({
                                length: quantidadeParcelas
                              }).map((_, parcelaIndex) => {

                                const parcelaDate = new Date(
                                  rec.dataInicio
                                );

                                parcelaDate.setMonth(
                                  parcelaDate.getMonth() + parcelaIndex
                                );

                                return (

                                  <motion.div
                                    key={parcelaIndex}
                                    initial={{
                                      opacity: 0,
                                      x: -10
                                    }}
                                    animate={{
                                      opacity: 1,
                                      x: 0
                                    }}
                                    transition={{
                                      delay: parcelaIndex * 0.03
                                    }}
                                    className="bg-white rounded-2xl p-4 flex items-center justify-between"
                                  >

                                    <div className="flex items-center gap-4">

                                      <div className="w-10 h-10 rounded-full bg-[#4B0012] text-white flex items-center justify-center font-bold">

                                        {parcelaIndex + 1}

                                      </div>

                                      <div>

                                        <p className="font-semibold">
                                          Parcela {parcelaIndex + 1}
                                        </p>

                                        <p className="text-sm text-gray-500">

                                          {formatDate(
                                            parcelaDate.toISOString()
                                          )}

                                        </p>

                                      </div>

                                    </div>

                                    <div className="flex items-center gap-3">

                                      <span className="font-bold text-[#4B0012]">

                                        {formatCurrency(rec.valor)}

                                      </span>

                                      <ArrowRight className="w-4 h-4 text-gray-400" />

                                    </div>

                                  </motion.div>

                                );
                              })}

                            </div>

                          </div>

                        </div>

                      </motion.div>

                    )}

                  </AnimatePresence>

                </Card>

              </motion.div>

            );
          })}

        </div>

        {/* DELETE */}

        <AlertDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
        >

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>
                Confirmar Exclusão
              </AlertDialogTitle>

              <AlertDialogDescription>

                Deseja realmente excluir esta recorrência?

              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel>
                Cancelar
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>

      </div>

    </Layout>
  );
}