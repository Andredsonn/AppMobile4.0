// Constantes da aplicação Projeto Midas

// Cores do tema
export const COLORS = {
  WINE: '#4B0012',
  WINE_LIGHT: '#6B0018',
  WINE_DARK: '#2D0009',
  YELLOW: '#FFC107',
  YELLOW_DARK: '#FFB300',
  YELLOW_LIGHT: '#FFCA28',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
  GREEN: '#10B981',
  RED: '#EF4444',
} as const;

// Tipos de lançamento
export const TIPO_LANCAMENTO = {
  RECEITA: 'RECEITA',
  DESPESA: 'DESPESA',
} as const;

// Status
export const STATUS = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  PENDENTE: 'PENDENTE',
  PAGO: 'PAGO',
} as const;

// Rotas da aplicação
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LANCAMENTOS: '/lancamentos',
  LANCAMENTOS_NOVO: '/lancamentos/novo',
  PROJECOES: '/projecoes',
  EMPRESTIMOS: '/emprestimos',
  RECORRENCIAS: '/recorrencias',
  EMPRESA: '/empresa',
} as const;

// Mensagens
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    CREATED: 'Registro criado com sucesso!',
    UPDATED: 'Registro atualizado com sucesso!',
    DELETED: 'Registro excluído com sucesso!',
  },
  ERROR: {
    LOGIN: 'Erro ao fazer login. Verifique suas credenciais.',
    LOAD: 'Erro ao carregar dados.',
    CREATE: 'Erro ao criar registro.',
    UPDATE: 'Erro ao atualizar registro.',
    DELETE: 'Erro ao excluir registro.',
    NETWORK: 'Erro de conexão com a API.',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso.',
    NOT_FOUND: 'Recurso não encontrado.',
  },
  CONFIRM: {
    DELETE: 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
  },
} as const;

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Configurações de localStorage
export const STORAGE_KEYS = {
  TOKEN: 'midas_token',
  USER: 'midas_user',
  THEME: 'midas_theme',
} as const;

// Validações
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  CNPJ_LENGTH: 14,
  CPF_LENGTH: 11,
} as const;

// Formatos
export const FORMATS = {
  DATE: 'DD/MM/YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
  CURRENCY: 'pt-BR',
} as const;

// Meses do ano
export const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
] as const;

// Periodicidade de recorrências
export const PERIODICIDADE = {
  DIARIA: 'DIARIA',
  SEMANAL: 'SEMANAL',
  QUINZENAL: 'QUINZENAL',
  MENSAL: 'MENSAL',
  BIMESTRAL: 'BIMESTRAL',
  TRIMESTRAL: 'TRIMESTRAL',
  SEMESTRAL: 'SEMESTRAL',
  ANUAL: 'ANUAL',
} as const;
