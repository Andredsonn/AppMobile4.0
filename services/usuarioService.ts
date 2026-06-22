import { apiRequest } from './api';
import type { 
  Usuario, 
  LoginRequest, 
  LoginResponse, 
  RegistrarRequest,
  AlterarSenhaRequest,
  AtualizarPerfilUsuarioRequest,
  CriarUsuarioEmpresaRequest
} from '../types';

export const usuarioService = {
  async autenticar(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/Usuario/Autenticar', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async registrar(data: RegistrarRequest): Promise<Usuario> {
    return apiRequest<Usuario>('/Usuario/Registrar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async alterarSenha(data: AlterarSenhaRequest): Promise<void> {
    return apiRequest<void>('/Usuario/AlterarSenha', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<Usuario[]> {
    return apiRequest<Usuario[]>('/Usuario/GetAll');
  },

  async getUsuariosEmpresa(): Promise<Usuario[]> {
    return apiRequest<Usuario[]>('/Usuario/Empresa');
  },

  async getById(id: number): Promise<Usuario> {
    return apiRequest<Usuario>(`/Usuario/Get/${id}`);
  },

  async create(usuario: Partial<Usuario>): Promise<Usuario> {
    return apiRequest<Usuario>('/Usuario/New', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  },

  async criarUsuarioEmpresa(usuario: CriarUsuarioEmpresaRequest): Promise<Usuario> {
    return apiRequest<Usuario>('/Usuario/Empresa', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  },

  async atualizarPerfilEmpresa(id: number, data: AtualizarPerfilUsuarioRequest): Promise<void> {
    return apiRequest<void>(`/Usuario/Empresa/${id}/Perfil`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/Usuario/${id}`, {
      method: 'DELETE',
    });
  },
};
