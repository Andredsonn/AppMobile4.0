import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Plus, Trash2, Filter, Edit2, Sparkles } from 'lucide-react';
import { projecaoService } from '../../services/projecaoService';
import { analiseIAService } from '../../services/analiseIAService';
import type { Projecao } from '../../types';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { canManageModule, isCompanyAdmin } from '../../utils/permissions';
import { AnaliseIAProjecao } from '../components/AnaliseIAProjecao';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';

export function ProjecoesPage() {
  const { user } = useAuth();
  const canManage = canManageModule(user, 'projecoes');
  const isAdmin = isCompanyAdmin(user);
  const [projecoes, setProjecoes] = useState<Projecao[]>([]);
  const [filteredProjecoes, setFilteredProjecoes] = useState<Projecao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState<Projecao | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    loadProjecoes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projecoes, filterYear, filterMonth]);

  useEffect(() => {
    if (filteredProjecoes.length > 0 && !suggestion && !suggestionLoading) {
      loadMidasSuggestion();
    }
  }, [filteredProjecoes]);

  const getSuggestedProjecao = () => {
    if (filteredProjecoes.length === 0) return null;
    return filteredProjecoes.reduce((best, current) => {
      return current.valorPrevisto > best.valorPrevisto ? current : best;
    }, filteredProjecoes[0]);
  };

  const loadMidasSuggestion = async () => {
    const proj = getSuggestedProjecao();
    if (!proj) return;

    setSuggestionLoading(true);
    setSuggestionError(null);
    try {
      const contexto = `Resumo da projeção: ${proj.titulo}. Valor previsto: R$ ${proj.valorPrevisto.toFixed(2)}. Data referência: ${formatDate(proj.dataReferencia)}.`;
      const resultado = await analiseIAService.analisarProjecao(proj.idProjecao, contexto);
      const snippet = resultado.analise.length > 260 ? `${resultado.analise.slice(0, 260).trim()}...` : resultado.analise;
      setSuggestion(`A IA recomenda atenção à projeção "${proj.titulo}". ${snippet}`);
    } catch (error: any) {
      console.error(error);
      setSuggestionError('Não foi possível gerar a sugestão no momento. Tente novamente.');
      setSuggestion(null);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const loadProjecoes = async () => {
    try {
      setIsLoading(true);
      const data = isAdmin
        ? await projecaoService.getAll()
        : await projecaoService.getAllEmpresa();
      setProjecoes(data);
    } catch (error: any) {
      toast.error('Erro ao carregar projeções');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projecoes];

    if (filterYear) {
      filtered = filtered.filter(p => new Date(p.dataReferencia).getFullYear() === parseInt(filterYear));
    }

    if (filterMonth) {
      filtered = filtered.filter(p => (new Date(p.dataReferencia).getMonth() + 1) === parseInt(filterMonth));
    }

    setFilteredProjecoes(filtered);
  };

  const handleEdit = async () => {
    if (!editData) return;

    try {
      await projecaoService.update(editData.idProjecao, editData);
      setProjecoes(prev => prev.map(p => p.idProjecao === editData.idProjecao ? editData : p));

      toast.success('Projeção atualizada com sucesso!');
      setEditData(null);
    } catch (error: any) {
      toast.error('Erro ao atualizar lançamento.')
      console.error(error);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await projecaoService.delete(deleteId);
      toast.success('Projeção excluída com sucesso!');
      setProjecoes(prev => prev.filter(p => p.idProjecao !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      toast.error('Erro ao excluir projeção');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner text="Carregando projeções..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projeções</h1>
            <p className="text-gray-600 mt-1">Planeje suas receitas e despesas futuras</p>
          </div>
          <Link to="/projecoes/nova" className={canManage ? '' : 'hidden'}>
            <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Nova Projeção
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex items-end gap-4">
            <Filter className="w-5 h-5 text-gray-600 mb-2" />
            <div className="flex-1">
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                type="number"
                placeholder="2026"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="month">Mês</Label>
              <Input
                id="month"
                type="number"
                placeholder="1-12"
                min="1"
                max="12"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setFilterYear('');
                setFilterMonth('');
              }}
            >
              Limpar
            </Button>
          </div>
        </Card>

        {/* Sugestão do Midas */}
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-700 font-semibold">
                <Sparkles className="w-5 h-5" />
                Sugestão do Midas
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Receba uma recomendação rápida baseada na projeção com maior impacto.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMidasSuggestion}
              disabled={suggestionLoading || filteredProjecoes.length === 0}
            >
              {suggestionLoading ? 'Atualizando...' : 'Gerar sugestão'}
            </Button>
          </div>
          <div className="mt-4 rounded-2xl border border-purple-200 bg-white p-4 min-h-[110px]">
            {suggestionLoading ? (
              <p className="text-sm text-gray-600">Gerando sugestão da IA...</p>
            ) : suggestionError ? (
              <p className="text-sm text-red-600">{suggestionError}</p>
            ) : suggestion ? (
              <p className="text-sm text-gray-700">{suggestion}</p>
            ) : (
              <p className="text-sm text-gray-500">Não há projeções suficientes para gerar uma sugestão.</p>
            )}
          </div>
        </Card>

        {/* Tabela */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor Previsto</TableHead>
                <TableHead>Data Referência</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead className="text-right">IA</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjecoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma projeção encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjecoes.map(proj => (
                  <TableRow key={proj.idProjecao}>
                    <TableCell className="font-medium">{proj.titulo}</TableCell>
                    <TableCell className="max-w-xs truncate">{proj.dsProjecao}</TableCell>
                    <TableCell className="font-bold text-[#4B0012]">{formatCurrency(proj.valorPrevisto)}</TableCell>
                    <TableCell>{formatDate(proj.dataReferencia)}</TableCell>
                    <TableCell>{formatDate(proj.dataCriacao)}</TableCell>
                    <TableCell className="text-right">
                      <AnaliseIAProjecao
                        projecaoId={proj.idProjecao}
                        titulo={proj.titulo}
                        valorPrevisto={proj.valorPrevisto}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        className="p-2 text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1a1a1a] rounded-lg transition-all"
                        variant="ghost"
                        size="sm"
                        disabled={!canManage}
                        onClick={() => setEditData(proj)}
                      >
                        <Edit2 className="w-4 h-4 text" />
                      </Button>
                      <Button variant="ghost" size="sm" className={canManage ? '' : 'hidden'} onClick={() => setDeleteId(proj.idProjecao)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editData} onOpenChange={() => setEditData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Projeção</DialogTitle>
            </DialogHeader>

            {editData && (
              <><div className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={editData.dsProjecao}
                    onChange={(e) => setEditData({ ...editData, dsProjecao: e.target.value })}
                    className="mt-1" />
                </div>
              </div><div>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={editData?.valorPrevisto}
                    onChange={(e) => setEditData({
                      ...editData!,
                      valorPrevisto: parseFloat(e.target.value),
                    })}

                    className="mt-1" />
                </div></>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditData(null)}>
                Cancelar
              </Button>
              <Button onClick={handleEdit} className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium">
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteId !== null} onOpenChange={open => { if (!open) setDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta projeção? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
