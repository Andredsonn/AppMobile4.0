/**
 * Serviço para processar arquivos Excel e converter em lançamentos
 */

export interface ExcelLancamento {
  DescricaoLancamento: string;
  Valor: number;
  Data: string; // YYYY-MM-DD
  TipoLancamento: 'receita' | 'despesa';
  Categoria?: string;
  Responsavel?: string;
}

export interface ExcelImportResult {
  success: boolean;
  total: number;
  imported: number;
  errors: string[];
  lancamentos: ExcelLancamento[];
}

/**
 * Processa um arquivo Excel e extrai os lançamentos
 * Espera coluna formato: Data | Descrição | Valor | Tipo (receita/despesa)
 */
export async function processExcelFile(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // Dinâmico - importar xlsx quando necessário
        const XLSX = await import('xlsx');
        
        const data = e.target?.result;
        if (!data) {
          resolve({
            success: false,
            total: 0,
            imported: 0,
            errors: ['Não foi possível ler o arquivo'],
            lancamentos: [],
          });
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        
        if (!sheetName) {
          resolve({
            success: false,
            total: 0,
            imported: 0,
            errors: ['Nenhuma aba encontrada no arquivo'],
            lancamentos: [],
          });
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        const lancamentos: ExcelLancamento[] = [];
        const errors: string[] = [];

        rawData.forEach((row: any, index: number) => {
          try {
            // Normalizar nomes de coluna
            const keys = Object.keys(row);
            let data = row;
            
            // Tentar encontrar as colunas corretas (case-insensitive)
            const colMap: Record<string, string> = {};
            keys.forEach(key => {
              const lower = key.toLowerCase().trim();
              if (lower.includes('data') || lower.includes('date')) colMap['Data'] = key;
              if (lower.includes('descrição') || lower.includes('description') || lower.includes('desc')) colMap['Descricao'] = key;
              if (lower.includes('valor') || lower.includes('amount') || lower.includes('value')) colMap['Valor'] = key;
              if (lower.includes('tipo') || lower.includes('type') || lower.includes('categoria')) colMap['Tipo'] = key;
              if (lower.includes('categoria') || lower.includes('category')) colMap['Categoria'] = key;
              if (lower.includes('responsável') || lower.includes('responsible')) colMap['Responsavel'] = key;
            });

            // Se não encontrou Data, Descrição e Valor, ignorar
            if (!colMap['Data'] || !colMap['Descricao'] || !colMap['Valor']) {
              errors.push(`Linha ${index + 1}: Colunas obrigatórias não encontradas (Data, Descrição, Valor)`);
              return;
            }

            // Extrair e validar dados
            const dataStr = String(data[colMap['Data']]).trim();
            const descricao = String(data[colMap['Descricao']]).trim();
            const valor = parseFloat(String(data[colMap['Valor']]).replace(/[^\d,.]/g, '').replace(',', '.'));
            const tipo = String(data[colMap['Tipo']] || 'despesa').toLowerCase().includes('receita') ? 'receita' : 'despesa';

            // Validar data
            const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
            let formattedDate = dataStr;
            
            if (dateRegex.test(dataStr)) {
              // Se já está em formato correto
              if (dataStr.includes('/')) {
                const [day, month, year] = dataStr.split('/');
                formattedDate = `${year}-${month}-${day}`;
              }
            } else {
              // Tentar converter timestamp do Excel
              try {
                const excelDate = parseFloat(dataStr);
                if (excelDate > 0) {
                  const date = new Date((excelDate - 25569) * 86400 * 1000);
                  formattedDate = date.toISOString().split('T')[0];
                } else {
                  throw new Error('Invalid date');
                }
              } catch {
                errors.push(`Linha ${index + 1}: Data inválida "${dataStr}"`);
                return;
              }
            }

            // Validar valor
            if (isNaN(valor) || valor <= 0) {
              errors.push(`Linha ${index + 1}: Valor inválido "${data[colMap['Valor']]}"`);
              return;
            }

            // Validar descrição
            if (!descricao || descricao.length === 0) {
              errors.push(`Linha ${index + 1}: Descrição vazia`);
              return;
            }

            lancamentos.push({
              DescricaoLancamento: descricao,
              Valor: valor,
              Data: formattedDate,
              TipoLancamento: tipo as 'receita' | 'despesa',
              Categoria: data[colMap['Categoria']] ? String(data[colMap['Categoria']]).trim() : undefined,
              Responsavel: data[colMap['Responsavel']] ? String(data[colMap['Responsavel']]).trim() : undefined,
            });
          } catch (err) {
            errors.push(`Linha ${index + 1}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
          }
        });

        resolve({
          success: lancamentos.length > 0,
          total: rawData.length,
          imported: lancamentos.length,
          errors,
          lancamentos,
        });
      } catch (err) {
        resolve({
          success: false,
          total: 0,
          imported: 0,
          errors: [err instanceof Error ? err.message : 'Erro ao processar arquivo'],
          lancamentos: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        total: 0,
        imported: 0,
        errors: ['Erro ao ler o arquivo'],
        lancamentos: [],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exporta lançamentos para Excel
 */
export function exportLancamentosToExcel(lancamentos: any[], nomeArquivo = 'lancamentos.xlsx') {
  try {
    // Dinâmico - importar xlsx quando necessário
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.json_to_sheet(
        lancamentos.map(l => ({
          Data: l.Data,
          Descrição: l.DescricaoLancamento,
          Valor: l.Valor,
          Tipo: l.TipoLancamento === 'receita' ? 'Receita' : 'Despesa',
          Categoria: l.Categoria || '',
          Responsável: l.Responsavel || '',
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lançamentos');
      
      // Ajustar largura das colunas
      worksheet['!cols'] = [
        { wch: 12 }, // Data
        { wch: 25 }, // Descrição
        { wch: 12 }, // Valor
        { wch: 10 }, // Tipo
        { wch: 15 }, // Categoria
        { wch: 15 }, // Responsável
      ];

      XLSX.writeFile(workbook, nomeArquivo);
    });
  } catch (err) {
    console.error('Erro ao exportar:', err);
  }
}
