import { useState, useEffect } from 'react';
import { Link } from 'react-router'
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { emprestimoService } from '../../services/emprestimoService';
import type { Emprestimo } from '../../types';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { canManageModule, isCompanyAdmin } from '../../utils/permissions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
   AlertDialogTitle } from '../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';

export function EmprestimosPage() {
  const { user } = useAuth();
  const canManage = canManageModule(user, 'emprestimos');
  const isAdmin = isCompanyAdmin(user);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState<Emprestimo | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadEmprestimos();
  }, []);

  const loadEmprestimos = async () => {
    try {
      setIsLoading(true);
      const data = isAdmin
        ? await emprestimoService.getAll()
        : await emprestimoService.getAllEmpresa();
      setEmprestimos(data);
    } catch (error: any) {
      toast.error('Erro ao carregar empréstimos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEdit = async () => {
    if (!editData) return;

      try {
        await emprestimoService.update(editData.idSimEmprestimo, editData);
        setEmprestimos(prev => prev.map(emp => emp.idSimEmprestimo === editData.idSimEmprestimo ? editData : emp));
        
        toast.success('Empréstimo atualizado com sucesso!');
        setEditData(null);
      } catch (error: any) {
        toast.error('Erro ao atualizar empréstimo');
        console.error(error);
      }
    };
    
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await emprestimoService.delete(deleteId);
      toast.success('Empréstimo excluído com sucesso!');
      setEmprestimos((prev) => prev.filter((emp) => emp.idSimEmprestimo !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      toast.error('Erro ao excluir empréstimo');
      console.error(error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner text="Carregando empréstimos..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empréstimos</h1>
            <p className="text-gray-600 mt-1">Gerencie seus empréstimos e financiamentos</p>
          </div>
          <Link to="/emprestimos/novo" className={canManage ? '' : 'hidden'}>
            <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Novo Empréstimo
            </Button>
          </Link>
        </div>

        {/* Tabela */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Provedor</TableHead>
                <TableHead>Valor do Empréstimo</TableHead>
                <TableHead>Valor Final</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Valor Parcela</TableHead>
                <TableHead>IOF</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emprestimos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhum empréstimo cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                emprestimos.map((emp) => (
                  <TableRow key={emp.idSimEmprestimo}>
                    <TableCell className="font-medium">{emp.nomeEmprestimo}</TableCell>
                    <TableCell>{emp.provedorEmprestimo}</TableCell>

                    {/* Valor do Empréstimo */}
                    <TableCell>{formatCurrency(emp.valorEmprestimo)}</TableCell>

                    {/* Valor Final */}
                    <TableCell>
                      {formatCurrency(
                        (emp.valorEmprestimo ?? 0) +
                          (emp.ioFemprestimo ?? 0) +
                          (emp.despesasEmprestimo ?? 0) +
                          (emp.tarifasEmprestimo ?? 0)
                      )}
                    </TableCell>

                    <TableCell>{emp.parcelasEmprestimo}x</TableCell>
                    <TableCell>{formatCurrency(emp.valorParcelas)}</TableCell>

                    {/* IOF em percentual */}
                    <TableCell>
                      {emp.ioFemprestimo != null && !isNaN(Number(emp.ioFemprestimo))
                        ? (Number(emp.ioFemprestimo) * 100).toFixed(3) + '%'
                        : '-'}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                              className="p-2 text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1a1a1a] rounded-lg transition-all"
                              variant="ghost" 
                              size="sm"
                              disabled={!canManage}
                              onClick={() => setEditData(emp)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className={canManage ? '' : 'hidden'} onClick={() => setDeleteId(emp.idSimEmprestimo)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

          <Dialog open={editData !== null} onOpenChange={(open) => { if (!open) setEditData(null); }}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar Empréstimo</DialogTitle>
    </DialogHeader>

    {editData && (
      <div className="space-y-4">

        {/* Nome */}
        <div>
          <Label>Nome do Empréstimo</Label>
          <Input
            value={editData.nomeEmprestimo ?? ""}
            onChange={(e) => setEditData({ ...editData, nomeEmprestimo: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Descrição */}
        <div>
          <Label>Descrição</Label>
          <Input
            value={editData.descricaoEmprestimo ?? ""}
            onChange={(e) => setEditData({ ...editData, descricaoEmprestimo: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Provedor */}
        <div>
          <Label>Provedor</Label>
          <Input
            value={editData.provedorEmprestimo ?? ""}
            onChange={(e) => setEditData({ ...editData, provedorEmprestimo: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Valor */}
        <div>
          <Label>Valor</Label>
          <Input
            type="number"
            value={editData.valorEmprestimo ?? ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                valorEmprestimo: parseFloat(e.target.value) || 0,
              })
            }
            className="mt-1"
          />
        </div>

        {/* Parcelas */}
        <div>
          <Label>Parcelas</Label>
          <Input
            type="number"
            value={editData.parcelasEmprestimo ?? ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                parcelasEmprestimo: parseInt(e.target.value) || 0,
              })
            }
            className="mt-1"
          />
        </div>

        {/* IOF */}
        <div>
          <Label>IOF</Label>
          <Input
            type="number"
            value={editData.ioFemprestimo ?? ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                ioFemprestimo: parseFloat(e.target.value) || 0,
              })
            }
            className="mt-1"
          />
        </div>

        {/* Despesas */}
        <div>
          <Label>Despesas</Label>
          <Input
            type="number"
            value={editData.despesasEmprestimo ?? ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                despesasEmprestimo: parseFloat(e.target.value) || 0,
              })
            }
            className="mt-1"
          />
        </div>

        {/* Tarifas */}
        <div>
          <Label>Tarifas</Label>
          <Input
            type="number"
            value={editData.tarifasEmprestimo ?? ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                tarifasEmprestimo: parseFloat(e.target.value) || 0,
              })
            }
            className="mt-1"
          />
        </div>

        {/* Data */}
        <div>
          <Label>Data</Label>
          <Input
            type="date"
            value={editData.data ? editData.data.split("T")[0] : ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                data: e.target.value,
              })
            }
            className="mt-1"
          />
        </div>

      </div>
    )}

    <DialogFooter>
      <Button variant="outline" onClick={() => setEditData(null)}>
        Cancelar
      </Button>

      <Button
        onClick={handleEdit}
        className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium"
      >
        Salvar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>            


          {/* Delete Dialog */}
          <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este empréstimo? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </Layout>
  );
}   
