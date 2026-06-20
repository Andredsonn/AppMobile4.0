import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Sparkles,
  Brain,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { analiseIAService, type AnaliseIAResponse } from '../../services/analiseIAService';
import { toast } from 'sonner';

interface AnaliseIAProjecaoProps {
  projecaoId: number;
  titulo: string;
  valorPrevisto: number;
}

export function AnaliseIAProjecao({ projecaoId, titulo, valorPrevisto }: AnaliseIAProjecaoProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState<AnaliseIAResponse | null>(null);

  const handleAnalisar = async () => {
    try {
      setLoading(true);
      setAnalise(null);
      const contexto = `Título: ${titulo}. Valor Previsto: R$ ${valorPrevisto.toFixed(2)}.`;
      const resultado = await analiseIAService.analisarProjecao(projecaoId, contexto);
      setAnalise(resultado);
    } catch (error: any) {
      toast.error('Erro ao analisar projeção com IA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRecomendacaoIcon = () => {
    if (!analise) return null;
    switch (analise.recomendacao) {
      case 'favoravel':
        return <ThumbsUp className="w-8 h-8 text-emerald-500" />;
      case 'desfavoravel':
        return <ThumbsDown className="w-8 h-8 text-red-500" />;
      case 'neutra':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getRecomendacaoColor = () => {
    if (!analise) return '';
    switch (analise.recomendacao) {
      case 'favoravel': return 'border-emerald-500 bg-emerald-50';
      case 'desfavoravel': return 'border-red-500 bg-red-50';
      case 'neutra': return 'border-yellow-500 bg-yellow-50';
    }
  };

  const getRecomendacaoTexto = () => {
    if (!analise) return '';
    switch (analise.recomendacao) {
      case 'favoravel': return 'Projeção Favorável';
      case 'desfavoravel': return 'Projeção Desfavorável';
      case 'neutra': return 'Análise Neutra';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
          if (!analise && !loading) handleAnalisar();
        }}
        className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
      >
        <Sparkles className="w-4 h-4 mr-1.5" />
        Analisar com Midas
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Brain className="w-6 h-6 text-purple-600" />
              Análise Midas — {titulo}
            </DialogTitle>
            <DialogDescription>
              Análise gerada pelo Midas com base no seu histórico financeiro
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
              <p className="text-gray-600 font-medium">Analisando projeção...</p>
              <p className="text-sm text-gray-400">Midas está examinando seu histórico financeiro</p>
            </div>
          )}

          {analise && !loading && (
            <div className="space-y-6">
              {/* Recomendação */}
              <div className={`p-4 rounded-lg border-2 ${getRecomendacaoColor()} flex items-center gap-4`}>
                {getRecomendacaoIcon()}
                <div>
                  <p className="font-bold text-lg">{getRecomendacaoTexto()}</p>
                  <p className="text-sm text-gray-600">
                    Baseada na análise do seu histórico de lançamentos
                  </p>
                </div>
              </div>

              {/* Análise textual */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Análise Detalhada
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {analise.analise}
                </div>
              </div>

              {/* Pontos Fortes */}
              {analise.pontosFortes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-1.5">
                    {analise.pontosFortes.map((ponto, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{ponto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pontos de Atenção */}
              {analise.pontosAtencao.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Pontos de Atenção
                  </h4>
                  <ul className="space-y-1.5">
                    {analise.pontosAtencao.map((ponto, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <XCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <span>{ponto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data e disclaimer */}
              <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-400">
                <p>Analisado em: {new Date(analise.dataAnalise).toLocaleString('pt-BR')}</p>
                <p className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Midas pode cometer erros. Use como referência.
                </p>
              </div>
            </div>
          )}

          {!analise && !loading && (
            <div className="flex justify-center py-8">
              <Button
                onClick={handleAnalisar}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Iniciar Análise
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
