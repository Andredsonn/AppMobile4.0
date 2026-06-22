import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CurrencyInput } from 'react-currency-input-field';
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

import {
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react';

import { lancamentoService } from '../../services/lancamentoService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function NovoLancamentoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({

    tipoLancamento: '0',
    descricaoLancamento: '',
    observacaoLancamento: '',
    valor: '',
    data: new Date()
      .toISOString()
      .split('T')[0],
    frequenciaRecorrencia: '0',
    qtdeRecorrencia: '1',
    modoRecorrenciaMensal: '0',
    dataRecorrencia: '1',
    diasIntervalo: '1',
  });

  const handleChange = (
    field: string,
    value: string
  ) => {

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!user) {

      toast.error(
        'Usuário não autenticado'
      );

      return;
    }

    setIsLoading(true);
    try {

      const possuiRecorrencia =
        Number(
          formData.frequenciaRecorrencia
        ) !== 0;

      const payload = {

        tipoLancamento:
          Number(
            formData.tipoLancamento
          ),

        descricaoLancamento:
          formData.descricaoLancamento,

        observacaoLancamento:
          formData.observacaoLancamento || null,

        valor:
          parseFloat(formData.valor),

        data:
          new Date(
            formData.data
          ).toISOString(),

        recorrencia:
          possuiRecorrencia
            ? {

              frequenciaRecorrencia:
                Number(
                  formData.frequenciaRecorrencia
                ),

              qtdeRecorrencia:
                Number(
                  formData.qtdeRecorrencia
                ),

              modoRecorrenciaMensal:
                Number(
                  formData.modoRecorrenciaMensal
                ),

              dataRecorrencia:
                formData.dataRecorrencia
                  ? Number(
                    formData.dataRecorrencia
                  )
                  : null,

              diasIntervalo:
                formData.diasIntervalo
                  ? Number(
                    formData.diasIntervalo
                  )
                  : null,
            }
            : null,
      };

      console.log(
        'Payload enviado:',
        JSON.stringify(payload, null, 2)
      );

      await lancamentoService.create(
        payload
      );
      toast.success(
        'Lançamento criado com sucesso!'
      );

      navigate('/lancamentos');

    } catch (error: any) {

      console.error(error);

      toast.error(
        'Erro ao criar lançamento'
      );

    } finally {

      setIsLoading(false);
    }
  };

  return (

    <Layout>

      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate('/lancamentos')
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Novo Lançamento
            </h1>

            <p className="text-gray-600 mt-1">
              Registre uma nova movimentação financeira
            </p>

          </div>

        </div>

        {/* Form */}
        <Card className="p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Tipo */}

            <div>

              <Label>
                Tipo de Lançamento *
              </Label>

              <Select
                value={formData.tipoLancamento}
                onValueChange={(value) =>
                  handleChange(
                    'tipoLancamento',
                    value
                  )
                }
              >

                <SelectTrigger className="mt-1">

                  <SelectValue />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="0">
                    Receita
                  </SelectItem>

                  <SelectItem value="1">
                    Despesa
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

            {/* Descrição */}

            <div>

              <Label>
                Descrição *
              </Label>

              <Input
                value={
                  formData.descricaoLancamento
                }
                onChange={(e) =>
                  handleChange(
                    'descricaoLancamento',
                    e.target.value
                  )
                }
                placeholder="Ex: Netflix"
                required
                className="mt-1"
              />

            </div>

            {/* Valor/Data */}

            <div className="grid grid-cols-2 gap-4">

              <div>

                <Label>
                  Valor *
                </Label>

                <CurrencyInput
                  className="text-gray-600 mt-1"
                  id="valor"
                  name="valor"
                  placeholder="R$ 0,00"
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  prefix="R$ "
                  value={formData.valor}
                  onValueChange={(value) =>
                    handleChange(
                      'valor',
                      value || ''
                    )
                  }
                />
              </div>

              <div>

                <Label>
                  Data *
                </Label>

                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) =>
                    handleChange(
                      'data',
                      e.target.value
                    )
                  }
                  required
                  className="mt-1"
                />

              </div>

            </div>

            {/* Frequência */}

            <div>

              <Label>
                Frequência de Recorrência
              </Label>

              <Select
                value={
                  formData.frequenciaRecorrencia
                }
                onValueChange={(value) =>
                  handleChange(
                    'frequenciaRecorrencia',
                    value
                  )
                }
              >

                <SelectTrigger className="mt-1">

                  <SelectValue />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="0">
                    Nenhuma
                  </SelectItem>

                  <SelectItem value="1">
                    Diária
                  </SelectItem>

                  <SelectItem value="2">
                    Semanal
                  </SelectItem>

                  <SelectItem value="3">
                    Mensal
                  </SelectItem>

                  <SelectItem value="4">
                    Anual
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

            {/* Configurações recorrência */}

            {Number(
              formData.frequenciaRecorrencia
            ) !== 0 && (

                <>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <Label>
                        Quantidade de Ocorrências
                      </Label>

                      <Input
                        type="number"
                        min="1"
                        value={
                          formData.qtdeRecorrencia
                        }
                        onChange={(e) =>
                          handleChange(
                            'qtdeRecorrencia',
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />

                    </div>

                    <div>

                      <Label>
                        Dia da Recorrência
                      </Label>

                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={
                          formData.dataRecorrencia
                        }
                        onChange={(e) =>
                          handleChange(
                            'dataRecorrencia',
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <Label>
                        Modo Mensal
                      </Label>

                      <Select
                        value={
                          formData.modoRecorrenciaMensal
                        }
                        onValueChange={(value) =>
                          handleChange(
                            'modoRecorrenciaMensal',
                            value
                          )
                        }
                      >

                        <SelectTrigger className="mt-1">

                          <SelectValue />

                        </SelectTrigger>

                        <SelectContent>

                          <SelectItem value="0">
                            Dia Fixo
                          </SelectItem>

                          <SelectItem value="1">
                            Último Dia
                          </SelectItem>

                        </SelectContent>

                      </Select>

                    </div>

                    <div>

                      <Label>
                        Intervalo em Dias
                      </Label>

                      <Input
                        type="number"
                        min="1"
                        value={
                          formData.diasIntervalo
                        }
                        onChange={(e) =>
                          handleChange(
                            'diasIntervalo',
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />

                    </div>

                  </div>

                </>

              )}

            {/* Observação */}

            <div>

              <Label>
                Observação
              </Label>

              <Textarea
                value={
                  formData.observacaoLancamento
                }
                onChange={(e) =>
                  handleChange(
                    'observacaoLancamento',
                    e.target.value
                  )
                }
                rows={4}
                className="mt-1"
              />

            </div>

            {/* Botões */}

            <div className="flex gap-3 pt-4">

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#FFC107] hover:bg-[#FFB300] text-black"
              >

                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}

              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate('/lancamentos')
                }
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