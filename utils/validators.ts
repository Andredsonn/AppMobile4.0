// Validadores de dados

/**
 * Valida se o email tem formato válido
 */
  export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se o CNPJ é válido (formato e dígitos verificadores)
 */
export function isValidCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '');

  if (numbers.length !== 14) {
    return false;
  }

  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1+$/.test(numbers)) {
    return false;
  }

  // Valida DVs
  let tamanho = numbers.length - 2;
  let numeros = numbers.substring(0, tamanho);
  const digitos = numbers.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) {
    return false;
  }

  tamanho = tamanho + 1;
  numeros = numbers.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Valida se o CPF é válido (formato e dígitos verificadores)
 */
export function isValidCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');

  if (numbers.length !== 11) {
    return false;
  }

  // Elimina CPFs invalidos conhecidos
  if (/^(\d)\1+$/.test(numbers)) {
    return false;
  }

  // Valida 1o digito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numbers.charAt(9))) return false;

  // Valida 2o digito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numbers.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numbers.charAt(10))) return false;

  return true;
}

/**
 * Valida se o telefone tem formato válido (10 ou 11 dígitos)
 */
export function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
}

/**
 * Valida se a senha tem comprimento mínimo
 */
export function isValidPassword(password: string, minLength: number = 6): boolean {
return password.length >= minLength;
}

/**
 * Valida se o valor é um número positivo
 */
export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && value > 0;
}

/**
 * Valida se o valor está dentro do range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Valida se a string não está vazia
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida se a string tem comprimento mínimo
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Valida se a string tem comprimento máximo
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Valida se a data é válida e não é futura
 */
export function isValidPastDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return !isNaN(date.getTime()) && date <= now;
}

/**
 * Valida se a data é válida e não é passada
 */
export function isValidFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return !isNaN(date.getTime()) && date >= now;
}

/**
 * Valida formulário com múltiplos campos
 */
export interface ValidationRule {
  field: string;
  value: any;
  rules: Array<{
    validate: (value: any) => boolean;
    message: string;
  }>;
}

export function validateForm(rules: ValidationRule[]): { 
  isValid: boolean; 
  errors: Record<string, string> 
} {
  const errors: Record<string, string> = {};

  for (const rule of rules) {
    for (const validation of rule.rules) {
      if (!validation.validate(rule.value)) {
        errors[rule.field] = validation.message;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
