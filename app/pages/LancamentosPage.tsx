import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ExcelImportModal } from '../../components/ExcelImportModal';
import { ExcelLancamento } from '../../services/excelService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Plus, Trash2, Filter, Edit2 } from 'lucide-react';
import { lancamentoService } from '../../services/lancamentoService';
import type { Lancamento } from '../../types';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { canManageModule, isCompanyAdmin } from '../../utils/permissions';
import { recorrenciaService } from '../../services/recorrenciaService';
import type { Recorrencia } from '../../types';

export function LancamentosPage() {
  const { user } = useAuth();
  const canManage = canManageModule(user, 'lancamentos');
  const isAdmin = isCompanyAdmin(user);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [filteredLancamentos, setFilteredLancamentos] = useState<Lancamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState<Lancamento | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [showExcelImport, setShowExcelImport] = useState(false);

  useEffect(() => {
    loadLancamentos();
    loadRecorrencias();
  }, []);

  const loadRecorrencias = async () => {
    try {
      const data = isAdmin ? await recorrenciaService.getAll() : await recorrenciaService.getAllEmpresa();
      setRecorrencias(data.slice(0,5));
    } catch (error) {
      // silently ignore
    }
  };

  useEffect(() => {
    applyFilters();
  }, [lancamentos, filterYear, filterMonth]);

  const loadLancamentos = async () => {
    try {
      setIsLoading(true);
      const data = isAdmin
        ? await lancamentoService.getAll()
        : await lancamentoService.getAllEmpresa();
      setLancamentos(data);
    } catch (error: any) {
      toast.error('Erro ao carregar lançamentos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...lancamentos];

    if (filterYear) {
      filtered = filtered.filter(lanc => {
        const year = new Date(lanc.data).getFullYear();
        return year === parseInt(filterYear);
      });
    }

    if (filterMonth) {
      filtered = filtered.filter(lanc => {
        const month = new Date(lanc.data).getMonth() + 1;
        return month === parseInt(filterMonth);
      });
    }

    setFilteredLancamentos(filtered);
  };

  const handleEdit = async () => {
    if (!editData) return;

    try {
      await lancamentoService.update(editData.idLancamento, editData);
      setLancamentos(prev => prev.map(l => l.idLancamento === editData.idLancamento ? editData : l));

      toast.success('Lançamento atualizado com sucesso!');
      setEditData(null);
    } catch (error: any) {
      toast.error('Erro ao atualizar lançamento.      ');
      console.error(error);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await lancamentoService.delete(deleteId);
      toast.success('Lançamento excluído com sucesso!');
      setLancamentos(prev => prev.filter(l => l.idLancamento !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      toast.error('Erro ao excluir lançamento');
      console.error(error);
    }
  };

  const downloadTemplateExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Criar dados de exemplo
      const templateData = [
        {
          Data: '2026-06-19',
          'Descrição': 'Exemplo de receita',
          Valor: 1000.00,
          Tipo: 'receita',
          Categoria: 'Vendas',
          Responsável: user?.nomeUsuario || 'Usuário'
        },
        {
          Data: '2026-06-20',
          'Descrição': 'Exemplo de despesa',
          Valor: 250.50,
          Tipo: 'despesa',
          Categoria: 'Fornecedor',
          Responsável: user?.nomeUsuario || 'Usuário'
        }
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Configurar largura das colunas
      const columnWidths = [
        { wch: 12 }, // Data
        { wch: 25 }, // Descrição
        { wch: 12 }, // Valor
        { wch: 12 }, // Tipo
        { wch: 15 }, // Categoria
        { wch: 20 }  // Responsável
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lançamentos');
      XLSX.writeFile(workbook, 'template_lancamentos.xlsx');
      
      toast.success('Template baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar template');
      console.error(error);
    }
  };

  const handleExcelImport = async (excelLancamentos: ExcelLancamento[]) => {
    try {
      const createdLancamentos: Lancamento[] = [];
      
      for (const excelLanc of excelLancamentos) {
        const newLanc: any = {
          descricaoLancamento: excelLanc.DescricaoLancamento,
          valor: excelLanc.Valor,
          data: excelLanc.Data,
          tipoLancamento: excelLanc.TipoLancamento === 'receita' ? 'Receita' : 'Despesa',
          categoria: excelLanc.Categoria || 'Importado',
          responsavel: excelLanc.Responsavel || user?.nomeUsuario,
          idEmpresa: user?.idEmpresa || 1,
        };

        const created = await lancamentoService.create(newLanc);
        createdLancamentos.push(created);
      }

      setLancamentos(prev => [...prev, ...createdLancamentos]);
      toast.success(`${createdLancamentos.length} lançamentos importados com sucesso!`);
      await loadLancamentos();
    } catch (error: any) {
      toast.error('Erro ao importar lançamentos');
      console.error(error);
      throw error;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getTipoLabel = (tipo: number | string) => {
    if (tipo === 0 || tipo === 'Receita') return 'Receita';
    if (tipo === 1 || tipo === 'Despesa') return 'Despesa';
    return tipo;
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner text="Carregando lançamentos..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lançamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie todas as suas movimentações financeiras</p>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <>
                <Button 
                  onClick={() => downloadTemplateExcel()}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Baixar Template
                </Button>
                <Button 
                  onClick={() => setShowExcelImport(true)}
                  className="bg-[#4B0012] hover:bg-[#5d0825] text-white font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Importar Excel
                </Button>
              </>
            )}
            <Link to="/lancamentos/novo" className={canManage ? '' : 'hidden'}>
              <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Lançamento
              </Button>
            </Link>
          </div>
        </div>

        {/* Recorrências summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recorrências</h2>
              <p className="text-sm text-gray-500">Visualize e inclua recorrências diretamente aqui</p>
            </div>
            <div className="flex gap-2">
              <Link to="/recorrencias/novo">
                <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium">
                  <Plus className="w-4 h-4 mr-2" /> Nova Recorrência
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {recorrencias.length === 0 ? (
              <div className="text-gray-500">Nenhuma recorrência encontrada</div>
            ) : (
              recorrencias.map(r => (
                <div key={r.idRecorrente} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.dsRecorrente}</div>
                    <div className="text-sm text-gray-500">{r.qtdeRecorrente}x • {new Date(r.dataInicio).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right font-semibold">{r.valor ? new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(r.valor) : '-'}</div>
                </div>
              ))
            )}
          </div>
        </Card>

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

        {/* Tabela */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left pl-6">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-left pl-6">Tipo</TableHead>
                <TableHead className="text-left pl-6">Valor</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLancamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum lançamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLancamentos.map((lanc) => (
                  <TableRow key={lanc.idLancamento}>
                    <TableCell>{formatDate(lanc.data)}</TableCell>
                    <TableCell className="font-medium">{lanc.descricaoLancamento}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          getTipoLabel(lanc.tipoLancamento) === 'Receita'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }
                      >
                        {getTipoLabel(lanc.tipoLancamento)}
                      </Badge>
                    </TableCell>

                    <TableCell
                      className={`font-bold ${
                        getTipoLabel(lanc.tipoLancamento) === 'Receita'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(lanc.valor)}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {lanc.observacaoLancamento || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                          onClick={() => setEditData(lanc)}
                          className={`p-2 text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1a1a1a] rounded-lg transition-all ${canManage ? '' : 'hidden'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={canManage ? '' : 'hidden'}
                        onClick={() => setDeleteId(lanc.idLancamento)}
                      >
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
              <DialogTitle>Editar Lançamento</DialogTitle>
            </DialogHeader>

            {editData && (
              <><div className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={editData.descricaoLancamento}
                    onChange={(e) => setEditData({ ...editData, descricaoLancamento: e.target.value })}
                    className="mt-1" />
                </div>
              </div><div>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={editData?.valor}
                    onChange={(e) => setEditData({
                      ...editData!,
                      valor: parseFloat(e.target.value),
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
                



        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Excel Import Modal */}
        <ExcelImportModal 
          isOpen={showExcelImport}
          onClose={() => setShowExcelImport(false)}
          onImport={handleExcelImport}
        />
      </div>
    </Layout>
  );
}
