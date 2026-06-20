import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { processExcelFile, ExcelImportResult, ExcelLancamento } from '../services/excelService';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (lancamentos: ExcelLancamento[]) => Promise<void>;
}

export function ExcelImportModal({ isOpen, onClose, onImport }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExcelImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de arquivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setResult({
        success: false,
        total: 0,
        imported: 0,
        errors: ['Apenas arquivos Excel (.xlsx ou .xls) são permitidos'],
        lancamentos: [],
      });
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const processedResult = await processExcelFile(selectedFile);
      setResult(processedResult);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!result?.lancamentos || result.lancamentos.length === 0) return;

    setImporting(true);
    try {
      await onImport(result.lancamentos);
      setImportSuccess(true);
      
      // Fechar após 2 segundos
      setTimeout(() => {
        onClose();
        setFile(null);
        setResult(null);
        setImportSuccess(false);
      }, 2000);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing && !importSuccess) {
      onClose();
      setFile(null);
      setResult(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-[#4B0012]" />
                <h2 className="text-xl font-bold text-slate-900">Importar Lançamentos</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={importing}
                className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success State */}
            {importSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-lg font-semibold text-slate-900">
                  {result?.imported} lançamentos importados com sucesso!
                </p>
              </motion.div>
            )}

            {!importSuccess && (
              <>
                {/* File Upload */}
                {!result && (
                  <div className="mb-6">
                    <label className="block">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        disabled={loading}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 p-8 cursor-pointer hover:border-[#4B0012] hover:bg-slate-50 transition-colors">
                        <Upload className="h-8 w-8 text-slate-400" />
                        <div className="text-center">
                          <p className="font-semibold text-slate-900">
                            Selecione um arquivo Excel
                          </p>
                          <p className="text-sm text-slate-600">
                            Formato: .xlsx ou .xls
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {/* Instructions */}
                {!result && (
                  <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900 mb-2">Formato esperado:</p>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• <strong>Data</strong> (obrigatório): YYYY-MM-DD ou DD/MM/YYYY</li>
                      <li>• <strong>Descrição</strong> (obrigatório): Nome do lançamento</li>
                      <li>• <strong>Valor</strong> (obrigatório): Número (1000 ou 1000,50)</li>
                      <li>• <strong>Tipo</strong>: "receita" ou "despesa"</li>
                      <li>• <strong>Categoria</strong> (opcional): Categoria do lançamento</li>
                      <li>• <strong>Responsável</strong> (opcional): Pessoa responsável</li>
                    </ul>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B0012]"></div>
                  </div>
                )}

                {/* Results */}
                {result && !loading && (
                  <div className="mb-6 space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-xs text-blue-600 font-semibold">Total</p>
                        <p className="text-2xl font-bold text-blue-900">{result.total}</p>
                      </div>
                      <div className="rounded-xl bg-green-50 p-3">
                        <p className="text-xs text-green-600 font-semibold">Válidos</p>
                        <p className="text-2xl font-bold text-green-900">{result.imported}</p>
                      </div>
                      <div className="rounded-xl bg-red-50 p-3">
                        <p className="text-xs text-red-600 font-semibold">Erros</p>
                        <p className="text-2xl font-bold text-red-900">{result.errors.length}</p>
                      </div>
                    </div>

                    {/* Errors */}
                    {result.errors.length > 0 && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <div className="flex gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          <p className="font-semibold text-red-900">Erros encontrados:</p>
                        </div>
                        <ul className="text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                          {result.errors.map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Preview */}
                    {result.lancamentos.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-semibold text-slate-900 mb-3">Prévia dos dados (mostrando até 10 registros):</p>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-slate-200">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-slate-900">Data</th>
                                <th className="px-3 py-2 text-left font-semibold text-slate-900">Descrição</th>
                                <th className="px-3 py-2 text-right font-semibold text-slate-900">Valor</th>
                                <th className="px-3 py-2 text-left font-semibold text-slate-900">Tipo</th>
                                <th className="px-3 py-2 text-left font-semibold text-slate-900">Categoria</th>
                                <th className="px-3 py-2 text-left font-semibold text-slate-900">Responsável</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {result.lancamentos.slice(0, 10).map((l, i) => (
                                <tr key={i} className="hover:bg-white transition-colors">
                                  <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{l.Data}</td>
                                  <td className="px-3 py-2 text-slate-700">{l.DescricaoLancamento}</td>
                                  <td className="px-3 py-2 text-right font-semibold text-slate-900">R$ {l.Valor.toFixed(2)}</td>
                                  <td className="px-3 py-2">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      l.TipoLancamento === 'receita' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {l.TipoLancamento === 'receita' ? '📈 Receita' : '📉 Despesa'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-slate-700">{l.Categoria || '-'}</td>
                                  <td className="px-3 py-2 text-slate-700">{l.Responsavel || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {result.lancamentos.length > 10 && (
                          <p className="text-xs text-slate-600 text-center py-2 mt-2">
                            ... e mais {result.lancamentos.length - 10} registros
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={importing}
                    className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {result ? 'Cancelar' : 'Fechar'}
                  </button>
                  {result && result.imported > 0 && (
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="flex-1 rounded-2xl bg-[#4B0012] px-4 py-3 font-semibold text-white hover:bg-[#5d0825] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {importing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Importando...
                        </>
                      ) : (
                        `Importar ${result.imported} lançamentos`
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
