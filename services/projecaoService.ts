import { apiRequest } from './api';
import type { Projecao } from '../types';

export const projecaoService = {
  async getAll(): Promise<Projecao[]> {
    return apiRequest<Projecao[]>('/Projecoes/GetAll');
  },

  async getAllEmpresa(): Promise<Projecao[]> {
    return apiRequest<Projecao[]>('/Projecoes/Empresa');
  },

  async getById(id: number): Promise<Projecao> {
    return apiRequest<Projecao>(`/Projecoes/${id}`);
  },

  async create(projecao: Partial<Projecao>): Promise<Projecao> {
    return apiRequest<Projecao>('/Projecoes/New', {
      method: 'POST',
      body: JSON.stringify(projecao),
    });
  },

  async update(id: number, projecao: Partial<Projecao>): Promise<Projecao> {
    return apiRequest<Projecao>(`/Projecoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projecao),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/Projecoes/${id}`, {
      method: 'DELETE',
    });
  },
};
