import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { projecaoService } from '../../services/projecaoService';
import { toast } from 'sonner';

export function NovaProjecaoPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    dsProjecao: '',
    valorPrevisto: '',
    dataReferencia: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.valorPrevisto || !formData.dataReferencia) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      await projecaoService.create({
        titulo: formData.titulo,
        dsProjecao: formData.dsProjecao,
        valorPrevisto: parseFloat(formData.valorPrevisto),
        dataReferencia: new Date(formData.dataReferencia).toISOString(),
      });

      toast.success('Projeção criada com sucesso!');
      navigate('/projecoes');
    } catch (error: any) {
      toast.error('Erro ao criar projeção');
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projecoes')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Projeção</h1>
            <p className="text-gray-600 mt-1">Registre uma nova projeção financeira</p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Receita Mensal, Venda futura..."
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.dsProjecao}
                onChange={(e) => handleChange('dsProjecao', e.target.value)}
                placeholder="Informações adicionais sobre a projeção..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valorPrevisto">Valor Previsto *</Label>
                <Input
                  id="valorPrevisto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorPrevisto}
                  onChange={(e) => handleChange('valorPrevisto', e.target.value)}
                  placeholder="0,00"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dataReferencia">Data de Referência *</Label>
                <Input
                  id="dataReferencia"
                  type="date"
                  value={formData.dataReferencia}
                  onChange={(e) => handleChange('dataReferencia', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
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
                    Salvar Projeção
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projecoes')}
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