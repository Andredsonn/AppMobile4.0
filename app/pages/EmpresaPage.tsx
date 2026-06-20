import { useEffect, useState, useMemo, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Mail,
  Phone,
  FileText,
  Save,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
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
import { empresaService } from '../../services/empresaService';
import { lancamentoService } from '../../services/lancamentoService';
import { usuarioService } from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';
import type { Empresa, Usuario, Lancamento } from '../../types';
import { USER_PROFILES, isCompanyAdmin } from '../../utils/permissions';
import { formatCurrency, formatCNPJ, formatPhone } from '../../utils/formatters';
import { toast } from 'sonner';

/* =========================================
   CONSTANTES
========================================= */

const initialEmpresaForm = {
  razaoSocial: '',
  nomeFantasia: '',
  telefoneEmp: '',
  cnpjEmpresa: '',
  emailEmpresa: '',
};

const initialUsuarioForm = {
  nomeUsuario: '',
  passwordString: '',
  perfil: 'Responsável por Lançamentos' as string,
  sobrenome: '',
  emailUsuario: '',
  telefone: '',
};

/* =========================================
   HELPERS
========================================= */

function getEmpresaId(empresa: Empresa | null) {
  return empresa?.IdEmpresa || empresa?.idEmpresa || 0;
}

function getUsuarioId(usuario: Usuario) {
  return usuario.IdUsuario || usuario.idUsuario || 0;
}

function getMonthsBetween(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (current <= endMonth) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
}

/* =========================================
   PÁGINA PRINCIPAL
========================================= */

export function EmpresaPage() {
  const { user, updateUser } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allLancamentos, setAllLancamentos] = useState<Lancamento[]>([]);

  // Filtro de período
  const now = new Date();
  const [periodoInicio, setPeriodoInicio] = useState(() =>
    new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 7)
  );
  const [periodoFim, setPeriodoFim] = useState(() =>
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 7)
  );

  // Modal empresa
  const [editEmpresaOpen, setEditEmpresaOpen] = useState(false);
  const [empresaForm, setEmpresaForm] = useState(initialEmpresaForm);
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);

  // Modal usuário
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);
  const [usuarioForm, setUsuarioForm] = useState(initialUsuarioForm);
  const [isSavingUsuario, setIsSavingUsuario] = useState(false);

  const isAdmin = isCompanyAdmin(user);

  /* =========================================
     LOAD
  ========================================= */

  const loadEmpresa = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await empresaService.getMinha();
      setEmpresa(data);

      if (data) {
        setEmpresaForm({
          razaoSocial: data.razaoSocial || '',
          nomeFantasia: data.nomeFantasia || '',
          telefoneEmp: data.telefoneEmp || '',
          cnpjEmpresa: data.cnpjEmpresa || '',
          emailEmpresa: data.emailEmpresa || '',
        });

        if (isCompanyAdmin(user)) {
          const usuariosData = await usuarioService.getUsuariosEmpresa();
          setUsuarios(usuariosData);
          const lancamentosData = await lancamentoService.getAllEmpresa();
          setAllLancamentos(lancamentosData);
        } else {
          const lancamentosData = await lancamentoService.getAllEmpresa();
          setAllLancamentos(lancamentosData);
        }
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados da empresa');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadEmpresa();
  }, [loadEmpresa]);

  /* =========================================
     LANÇAMENTOS FILTRADOS POR PERÍODO
  ========================================= */

  const lancamentosFiltrados = useMemo(() => {
    const [anoInicio, mesInicio] = periodoInicio.split('-').map(Number);
    const [anoFim, mesFim] = periodoFim.split('-').map(Number);
    const start = new Date(anoInicio, mesInicio - 1, 1);
    const end = new Date(anoFim, mesFim, 0, 23, 59, 59);

    return allLancamentos.filter((l) => {
      const d = new Date(l.data);
      return d >= start && d <= end;
    });
  }, [allLancamentos, periodoInicio, periodoFim]);

  /* =========================================
     TOTALIZADORES
  ========================================= */

  const { totalReceitas, totalDespesas, saldo } = useMemo(() => {
    let receitas = 0;
    let despesas = 0;
    lancamentosFiltrados.forEach((l) => {
      if (l.tipoLancamento === 0) receitas += l.valor;
      if (l.tipoLancamento === 1) despesas += l.valor;
    });
    return { totalReceitas: receitas, totalDespesas: despesas, saldo: receitas - despesas };
  }, [lancamentosFiltrados]);

  /* =========================================
     GRÁFICO DE BARRAS (MENSAL)
  ========================================= */

  const chartData = useMemo(() => {
    const [anoInicio, mesInicio] = periodoInicio.split('-').map(Number);
    const [anoFim, mesFim] = periodoFim.split('-').map(Number);
    const months = getMonthsBetween(new Date(anoInicio, mesInicio - 1, 1), new Date(anoFim, mesFim - 1, 1));

    const grouped: Record<string, { receitas: number; despesas: number }> = {};
    months.forEach((m) => {
      const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = { receitas: 0, despesas: 0 };
    });

    lancamentosFiltrados.forEach((l) => {
      const d = new Date(l.data);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (grouped[key]) {
        if (l.tipoLancamento === 0) grouped[key].receitas += l.valor;
        if (l.tipoLancamento === 1) grouped[key].despesas += l.valor;
      }
    });

    return Object.entries(grouped).map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month - 1);
      return {
        mes: getMonthLabel(date),
        label: formatMonthYear(date),
        receitas: value.receitas,
        despesas: value.despesas,
      };
    });
  }, [lancamentosFiltrados, periodoInicio, periodoFim]);

  /* =========================================
     PIE DATA
  ========================================= */

  const pieData = [
    { name: 'Receitas', value: totalReceitas, color: '#10B981' },
    { name: 'Despesas', value: totalDespesas, color: '#EF4444' },
  ];

  /* =========================================
     HANDLERS - EMPRESA
  ========================================= */

  const handleEmpresaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingEmpresa(true);
    try {
      if (empresa) {
        await empresaService.update(getEmpresaId(empresa), empresaForm);
        toast.success('Dados da empresa atualizados!');
        await loadEmpresa();
        setEditEmpresaOpen(false);
        return;
      }

      const createdEmpresa = await empresaService.create(empresaForm);
      const empresaId = getEmpresaId(createdEmpresa);
      updateUser({
        IdEmpresa: empresaId,
        idEmpresa: empresaId,
        Perfil: 'Administrador',
        perfil: 'Administrador',
      });
      setEmpresa(createdEmpresa);
      toast.success('Empresa criada com sucesso!');
      setEditEmpresaOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar dados da empresa');
      console.error(error);
    } finally {
      setIsSavingEmpresa(false);
    }
  };

  /* =========================================
     HANDLERS - USUÁRIO
  ========================================= */

  const handleUsuarioSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingUsuario(true);
    try {
      await usuarioService.criarUsuarioEmpresa(usuarioForm);
      setUsuarioForm(initialUsuarioForm);
      const data = await usuarioService.getUsuariosEmpresa();
      setUsuarios(data);
      toast.success('Responsável criado com sucesso!');
      setNovoUsuarioOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar responsável');
      console.error(error);
    } finally {
      setIsSavingUsuario(false);
    }
  };

  const handlePerfilChange = async (usuario: Usuario, perfil: string) => {
    try {
      await usuarioService.atualizarPerfilEmpresa(getUsuarioId(usuario), { perfil });
      const data = await usuarioService.getUsuariosEmpresa();
      setUsuarios(data);
      toast.success('Perfil atualizado!');
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil');
      console.error(error);
    }
  };

  const handleDeleteUsuario = async (usuario: Usuario) => {
    try {
      await usuarioService.delete(getUsuarioId(usuario));
      const data = await usuarioService.getUsuariosEmpresa();
      setUsuarios(data);
      toast.success('Usuário removido!');
    } catch (error: any) {
      toast.error('Erro ao remover usuário');
      console.error(error);
    }
  };

  /* =========================================
     LOADING
  ========================================= */

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner text="Carregando dados da empresa..." />
      </Layout>
    );
  }

  if (!empresa) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center">
            <Building2 className="w-16 h-16 mx-auto text-[#4B0012]/60 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Empresa</h1>
            <p className="text-gray-600 mt-1">Você ainda não tem uma empresa.</p>
          </div>

          <Card className="p-6">
            <Dialog open={editEmpresaOpen} onOpenChange={setEditEmpresaOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium w-full">
                  <Building2 className="w-4 h-4 mr-2" />
                  Criar Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Empresa</DialogTitle>
                  <DialogDescription>Preencha os dados da sua empresa para começar.</DialogDescription>
                </DialogHeader>
                <EmpresaForm
                  form={empresaForm}
                  setForm={setEmpresaForm}
                  onSubmit={handleEmpresaSubmit}
                  isSaving={isSavingEmpresa}
                  isEditing={false}
                />
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </Layout>
    );
  }

  const empresaNome = empresa.nomeFantasia || empresa.razaoSocial;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* =========================================
           HEADER
        ========================================= */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#4B0012]">Empresa</h1>
            <p className="text-gray-600 mt-1">Informações e visão financeira da empresa</p>
          </div>

          {isAdmin && (
            <Dialog open={editEmpresaOpen} onOpenChange={setEditEmpresaOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-[#4B0012] text-[#4B0012]">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Editar Empresa</DialogTitle>
                  <DialogDescription>Atualize os dados cadastrais da empresa.</DialogDescription>
                </DialogHeader>
                <EmpresaForm
                  form={empresaForm}
                  setForm={setEmpresaForm}
                  onSubmit={handleEmpresaSubmit}
                  isSaving={isSavingEmpresa}
                  isEditing={true}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* =========================================
           CARD - PERFIL DA EMPRESA
        ========================================= */}
        <Card className="p-0 overflow-hidden">
          <div className="bg-[#4B0012] px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#FFC107] rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-[#4B0012]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{empresaNome}</h2>
                {empresa.razaoSocial && empresa.razaoSocial !== empresaNome && (
                  <p className="text-white/70 text-sm">{empresa.razaoSocial}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            <InfoItem icon={FileText} label="CNPJ" value={formatCNPJ(empresa.cnpjEmpresa)} />
            <InfoItem icon={Mail} label="E-mail" value={empresa.emailEmpresa || '-'} />
            <InfoItem icon={Phone} label="Telefone" value={empresa.telefoneEmp ? formatPhone(empresa.telefoneEmp) : '-'} />
            <InfoItem icon={Building2} label="ID Empresa" value={`#${getEmpresaId(empresa)}`} />
          </div>
        </Card>

        {/* =========================================
           RESUMO FINANCEIRO
        ========================================= */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#4B0012]" />
              Resumo Financeiro
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="periodoInicio" className="text-sm text-gray-500">De</Label>
                <Input
                  id="periodoInicio"
                  type="month"
                  value={periodoInicio}
                  onChange={(e) => setPeriodoInicio(e.target.value)}
                  className="w-40 h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="periodoFim" className="text-sm text-gray-500">Até</Label>
                <Input
                  id="periodoFim"
                  type="month"
                  value={periodoFim}
                  onChange={(e) => setPeriodoFim(e.target.value)}
                  className="w-40 h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-5 bg-green-50 border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-green-700">Receitas</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalReceitas)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-5 bg-red-50 border-red-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-red-700">Despesas</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(totalDespesas)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card className="p-5 bg-[#4B0012]/10 border-[#4B0012]/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-[#4B0012]">Saldo do Período</p>
                  <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(saldo)}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-[#4B0012]" />
              </div>
            </Card>
          </div>

          {lancamentosFiltrados.length === 0 && (
            <Card className="p-8 text-center text-gray-500">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Nenhum lançamento encontrado no período selecionado.</p>
            </Card>
          )}

          {lancamentosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico de Barras */}
              <Card className="p-5 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Receitas x Despesas por Mês</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="receitas" fill="#10B981" radius={[6, 6, 0, 0]} name="Receitas" />
                    <Bar dataKey="despesas" fill="#EF4444" radius={[6, 6, 0, 0]} name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Pizza */}
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  Distribuição
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                      animationDuration={1200}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </div>

        {/* =========================================
           SEÇÃO: RESPONSÁVEIS
        ========================================= */}
        {isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4B0012]" />
                Responsáveis
              </h2>
              <Dialog open={novoUsuarioOpen} onOpenChange={setNovoUsuarioOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Responsável
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Novo Responsável</DialogTitle>
                    <DialogDescription>Crie um novo usuário para acessar o sistema da empresa.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUsuarioSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Usuário *</Label>
                        <Input
                          value={usuarioForm.nomeUsuario}
                          onChange={(e) => setUsuarioForm((prev) => ({ ...prev, nomeUsuario: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Senha *</Label>
                        <Input
                          type="password"
                          value={usuarioForm.passwordString}
                          onChange={(e) => setUsuarioForm((prev) => ({ ...prev, passwordString: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Perfil *</Label>
                        <select
                          value={usuarioForm.perfil}
                          onChange={(e) => setUsuarioForm((prev) => ({ ...prev, perfil: e.target.value }))}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {USER_PROFILES.filter((p) => p !== 'Administrador').map((profile) => (
                            <option key={profile} value={profile}>
                              {profile}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={usuarioForm.emailUsuario}
                          onChange={(e) => setUsuarioForm((prev) => ({ ...prev, emailUsuario: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Sobrenome</Label>
                        <Input
                          value={usuarioForm.sobrenome}
                          onChange={(e) => setUsuarioForm((prev) => ({ ...prev, sobrenome: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Telefone</Label>
                        <Input
                          value={usuarioForm.telefone}
                          onChange={(e) => setUsuarioForm((prev) => ({ ...prev, telefone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isSavingUsuario}
                        className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium"
                      >
                        {isSavingUsuario ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Criar Responsável
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        Nenhum responsável cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {usuarios.map((usuario) => {
                    const usuarioId = getUsuarioId(usuario);
                    const isCurrentUser = usuarioId === (user?.IdUsuario || user?.idUsuario);
                    return (
                      <TableRow key={usuarioId}>
                        <TableCell className="font-medium">{usuario.nomeUsuario}</TableCell>
                        <TableCell>{usuario.emailUsuario || '-'}</TableCell>
                        <TableCell>
                          <select
                            value={usuario.Perfil || usuario.perfil || 'Somente leitura'}
                            onChange={(e) => handlePerfilChange(usuario, e.target.value)}
                            disabled={isCurrentUser}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            {USER_PROFILES.map((profile) => (
                              <option key={profile} value={profile}>
                                {profile}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isCurrentUser}
                            onClick={() => handleDeleteUsuario(usuario)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Info do sistema no rodapé */}
        {empresa && (
          <Card className="p-5 bg-gray-50 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Informações do Sistema</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">ID Empresa:</span> {getEmpresaId(empresa)} |{' '}
                <span className="font-medium">Responsável:</span> #{empresa.idResponsavel} |{' '}
                <span className="font-medium">Total de lançamentos:</span> {allLancamentos.length}
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

/* =========================================
   COMPONENTE: InfoItem (linha do header)
========================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-5">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#4B0012]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

/* =========================================
   COMPONENTE: EmpresaForm (compartilhado)
========================================= */

function EmpresaForm({
  form,
  setForm,
  onSubmit,
  isSaving,
  isEditing,
}: {
  form: typeof initialEmpresaForm;
  setForm: React.Dispatch<React.SetStateAction<typeof initialEmpresaForm>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
  isEditing: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="razaoSocial">Razão Social *</Label>
        <Input
          id="razaoSocial"
          value={form.razaoSocial}
          onChange={(e) => setForm((prev) => ({ ...prev, razaoSocial: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
        <Input
          id="nomeFantasia"
          value={form.nomeFantasia}
          onChange={(e) => setForm((prev) => ({ ...prev, nomeFantasia: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={form.cnpjEmpresa}
            onChange={(e) => setForm((prev) => ({ ...prev, cnpjEmpresa: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={form.telefoneEmp}
            onChange={(e) => setForm((prev) => ({ ...prev, telefoneEmp: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={form.emailEmpresa}
          onChange={(e) => setForm((prev) => ({ ...prev, emailEmpresa: e.target.value }))}
        />
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Salvar Alterações' : 'Criar Empresa'}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
