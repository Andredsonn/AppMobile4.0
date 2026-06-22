// Models da API Midas

export interface Usuario {
  IdUsuario: number;
  idUsuario?: number;
  nomeUsuario: string;
  sobrenome: string;
  emailUsuario: string;
  telefone: string;
  PasswordString?: string;
  IdEmpresa: number;
  idEmpresa?: number;
  perfil?: string;
  Perfil?: string;
  Token?: string;
}

export interface Empresa {
  IdEmpresa: number;
  idEmpresa?: number;
  idResponsavel: number;
  razaoSocial: string;
  nomeFantasia: string;
  telefoneEmp: string;
  cnpjEmpresa: string;
  emailEmpresa: string;
}

export interface Lancamento {

  idLancamento: number;

  idUsuario: number;

  idProjecao?: number | null;

  idSimEmprestimo?: number | null;

  idRecorrencia?: number | null;

  tipoLancamento: number;

  descricaoLancamento: string;

  observacaoLancamento?: string | null;

  valor: number;

  data: string;

  dataCriacao?: string;

  recorrencia?: RecorrenciaDTO | null;
}

export interface RecorrenciaDTO {

  frequenciaRecorrencia: number;

  qtdeRecorrencia: number;

  modoRecorrenciaMensal?: number | null;

  dataRecorrencia?: number | null;

  diasIntervalo?: number | null;
}

export interface Emprestimo {
  idSimEmprestimo: number;
  nomeEmprestimo: string;
  descricaoEmprestimo: string;
  provedorEmprestimo: string;
  valorEmprestimo: number;
  parcelasEmprestimo: number;
  valorParcelas: number;
  ioFemprestimo: number;
  despesasEmprestimo: number;
  tarifasEmprestimo: number;
  data: string; // ISO date string
}

export interface Projecao {
  idProjecao: number;
  titulo: string;
  dsProjecao: string;
  valorPrevisto: number;
  dataReferencia: string; // ISO date string
  dataCriacao: string; // ISO date string
}

export interface Recorrencia {

  idRecorrente: number;

  idProjecao: number;

  tipoLancamento: number;

  dsRecorrente: string;

  valor: number;

  dataInicio: string;

  qtdeRecorrente: number;

  obRecorrente?: string;

  idTipoRecorrencia: number;

  tipoRecorrencia?: {
    id: number;
    nome: string;
  };
}

export interface Responsavel {
  idResponsavel: number;
  nomeResponsavel: string;
  cpfResponsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;
}

// DTOs para requisições
export interface LoginRequest {
  nomeUsuario: string;
  PasswordString: string;
}

export interface UsuarioAuth {
  id: number;
  Id?: number;
  nomeUsuario: string;
  NomeUsuario?: string;
  idEmpresa: number;
  IdEmpresa?: number;
  perfil: string;
  Perfil?: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAuth;
}

export interface CriarUsuarioEmpresaRequest {
  nomeUsuario: string;
  passwordString: string;
  perfil: string;
  sobrenome?: string;
  emailUsuario?: string;
  telefone?: string;
}

export interface AtualizarPerfilUsuarioRequest {
  perfil: string;
}

export interface RegistrarRequest {
  nomeUsuario: string;
  PasswordString: string;
}

export interface AlterarSenhaRequest {
  IdUsuario: number;
  SenhaAtual: string;
  NovaSenha: string;
}

export interface SomatoriaResponse {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface TipoRecorrencia {
  id: number;
  nome: string;
  padraoSistema: boolean;
  descricao: string;
}
