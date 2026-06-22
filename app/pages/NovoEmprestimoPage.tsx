import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { emprestimoService } from '../../services/emprestimoService';
import { toast } from 'sonner';

export function NovoEmprestimoPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nomeEmprestimo: '',
    descricaoEmprestimo: '',
    provedorEmprestimo: '',
    valorEmprestimo: '',
    parcelasEmprestimo: '',
    IOFemprestimo: '',
    despesasEmprestimo: '',
    tarifasEmprestimo: '',
    Data: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await emprestimoService.create({
        nomeEmprestimo: formData.nomeEmprestimo,
        descricaoEmprestimo: formData.descricaoEmprestimo,
        provedorEmprestimo: formData.provedorEmprestimo,
        valorEmprestimo: parseFloat(formData.valorEmprestimo),
        parcelasEmprestimo: parseInt(formData.parcelasEmprestimo),
        ioFemprestimo: parseFloat(formData.IOFemprestimo),
        despesasEmprestimo: parseFloat(formData.despesasEmprestimo || '0'),
        tarifasEmprestimo: parseFloat(formData.tarifasEmprestimo || '0'),
        data: new Date(formData.Data).toISOString(),
      });

      toast.success('Empréstimo criado com sucesso!');
      navigate('/emprestimos');
    } catch (error: any) {
      toast.error('Erro ao criar empréstimo');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/emprestimos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Empréstimo</h1>
            <p className="text-gray-600 mt-1">Registre um novo empréstimo ou financiamento</p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="nome">Nome do Empréstimo *</Label>
              <Input
                id="nome"
                value={formData.nomeEmprestimo}
                onChange={(e) => handleChange('nomeEmprestimo', e.target.value)}
                placeholder="Ex: Empréstimo Banco X"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricaoEmprestimo}
                onChange={(e) => handleChange('descricaoEmprestimo', e.target.value)}
                placeholder="Informações adicionais..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="provedor">Provedor</Label>
              <Input
                id="provedor"
                value={formData.provedorEmprestimo}
                onChange={(e) => handleChange('provedorEmprestimo', e.target.value)}
                placeholder="Banco, financeira, pessoa..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor">Valor do Empréstimo *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorEmprestimo}
                  onChange={(e) => handleChange('valorEmprestimo', e.target.value)}
                  placeholder="0,00"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="parcelas">Parcelas *</Label>
                <Input
                  id="parcelas"
                  type="number"
                  min="1"
                  value={formData.parcelasEmprestimo}
                  onChange={(e) => handleChange('parcelasEmprestimo', e.target.value)}
                  placeholder="Número de parcelas"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="iof">IOF *</Label>
                <Input
                  id="iof"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={formData.IOFemprestimo}
                  onChange={(e) => handleChange('IOFemprestimo', e.target.value)}
                  placeholder="Ex: 0.0038"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="despesas">Despesas</Label>
                <Input
                  id="despesas"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.despesasEmprestimo}
                  onChange={(e) => handleChange('despesasEmprestimo', e.target.value)}
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tarifas">Tarifas</Label>
                <Input
                  id="tarifas"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tarifasEmprestimo}
                  onChange={(e) => handleChange('tarifasEmprestimo', e.target.value)}
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.Data}
                onChange={(e) => handleChange('Data', e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Empréstimo
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/emprestimos')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}