import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { recorrenciaService } from '../../services/recorrenciaService';
import { tipoRecorrenciaService } from '../../services/tiporecorrenciaService';

export function NovaRecorrenciaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [tiposRecorrencia, setTiposRecorrencia] = useState<
    { id: number; nome: string }[]
  >([]);

  const [formData, setFormData] = useState({
    TipoLancamento: '0',
    DsRecorrente: '',
    ObRecorrente: '',
    Valor: '',
    DataInicio: new Date().toISOString().split('T')[0],
    QtdeRecorrente: '1',
    IntervaloEmDias: '1',
    IdTipoRecorrencia: '',
  });

  useEffect(() => {
    tipoRecorrenciaService.getAll().then((res) => {
      setTiposRecorrencia(res);
    });
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.IdTipoRecorrencia) {
      toast.error('Selecione um tipo de recorrência');
      return;
    }

    setIsLoading(true);

    try {
      await recorrenciaService.create({
      tipoLancamento: Number(formData.TipoLancamento),
      dsRecorrente: formData.DsRecorrente,
      obRecorrente: formData.ObRecorrente,
      valor: parseFloat(formData.Valor),
      dataInicio: new Date(formData.DataInicio).toISOString(),
      qtdeRecorrente: Number(formData.QtdeRecorrente),
      idTipoRecorrencia: Number(formData.IdTipoRecorrencia)
    });

      toast.success('Recorrência criada com sucesso!');
      navigate('/recorrencias');
    } catch (error: any) {
      toast.error('Erro ao criar recorrência');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/recorrencias')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nova Recorrência
            </h1>
            <p className="text-gray-600 mt-1">
              Registre uma nova recorrência financeira
            </p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Tipo Lançamento */}
            <div>
              <Label>Tipo de Lançamento *</Label>
              <Select
                value={formData.TipoLancamento}
                onValueChange={(value) =>
                  handleChange('TipoLancamento', value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Receita</SelectItem>
                  <SelectItem value="1">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div>
              <Label>Descrição *</Label>
              <Input
                value={formData.DsRecorrente}
                onChange={(e) =>
                  handleChange('DsRecorrente', e.target.value)
                }
                placeholder="Ex: Mensalidade, Assinatura, Aluguel..."
                required
                className="mt-1"
              />
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.Valor}
                  onChange={(e) =>
                    handleChange('Valor', e.target.value)
                  }
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Data Início *</Label>
                <Input
                  type="date"
                  value={formData.DataInicio}
                  onChange={(e) =>
                    handleChange('DataInicio', e.target.value)
                  }
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Quantidade */}
            <div>
              <Label>Quantidade de Ocorrências *</Label>
              <Input
                type="number"
                min="1"
                value={formData.QtdeRecorrente}
                onChange={(e) =>
                  handleChange('QtdeRecorrente', e.target.value)
                }
                required
                className="mt-1"
              />
            </div>

            {/* Intervalo em Dias */}
            <div>
              <Label>Intervalo em Dias *</Label>
              <Input
                type="number"
                min="1"
                value={formData.IntervaloEmDias}
                onChange={(e) =>
                  handleChange('IntervaloEmDias', e.target.value)
                }
                placeholder="Ex: 1 (diário), 7 (semanal), 30 (mensal)"
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Número de dias entre cada ocorrência, baseado na data de início</p>
            </div>

            {/* Tipo Recorrência */}
            <div>
              <Label>Tipo de Recorrência *</Label>
              <Select
                value={formData.IdTipoRecorrencia}
                onValueChange={(value) =>
                  handleChange('IdTipoRecorrencia', value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposRecorrencia.map((tipo) => (
                    <SelectItem
                      key={tipo.id}
                      value={tipo.id.toString()}
                    >
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observação */}
            <div>
              <Label>Observação</Label>
              <Textarea
                value={formData.ObRecorrente}
                onChange={(e) =>
                  handleChange('ObRecorrente', e.target.value)
                }
                rows={4}
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
                    Salvar Recorrência
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/recorrencias')}
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