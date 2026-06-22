import { apiRequest } from './api';
import type { Recorrencia } from '../types';

export const recorrenciaService = {
  async getAll(): Promise<Recorrencia[]> {
    return apiRequest<Recorrencia[]>('/Recorrencia/GetAll');
  },

  async getAllEmpresa(): Promise<Recorrencia[]> {
    return apiRequest<Recorrencia[]>('/Recorrencia/Empresa');
  },

  async getById(id: number): Promise<Recorrencia> {
    return apiRequest<Recorrencia>(`/Recorrencia/${id}`);
  },

  async create(recorrencia: Partial<Recorrencia>): Promise<Recorrencia> {
    return apiRequest<Recorrencia>('/Recorrencia/New', {
      method: 'POST',
      body: JSON.stringify(recorrencia),
    });
  },

  async update(id: number, recorrencia: Partial<Recorrencia>): Promise<Recorrencia> {
    return apiRequest<Recorrencia>(`/Recorrencia/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recorrencia),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/Recorrencia/${id}`, {
      method: 'DELETE',
    });
  },
};
