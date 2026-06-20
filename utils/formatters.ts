// Utilitários de formatação

/**
 * Formata um valor numérico como moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data ISO para formato brasileiro
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata uma data ISO para formato brasileiro com hora
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR');
}

/**
 * Formata um CNPJ (apenas números para formato XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj: string): string {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) {
    return cnpj;
  }
  
  return numbers.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Formata um telefone (apenas números para formato (XX) XXXXX-XXXX)
 */
export function formatPhone(phone: string): string {
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  
  if (numbers.length === 10) {
    return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Formata um CPF (apenas números para formato XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) {
    return cpf;
  }
  
  return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Remove formatação de um valor
 */
export function unformatValue(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Converte uma data no formato YYYY-MM-DD para o formato aceito pelo input[type="date"]
 */
export function toDateInputFormat(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtém o mês/ano atual no formato "Fevereiro 2026"
 */
export function getCurrentMonthYear(): string {
  const date = new Date();
  return date.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Valida se uma string é uma data válida
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Trunca um texto longo adicionando reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}
