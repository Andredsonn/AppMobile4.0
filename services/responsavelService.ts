import { apiRequest } from './api';
import type { Responsavel } from '../types';

export const responsavelService = {
  async getAll(): Promise<Responsavel[]> {
    return apiRequest<Responsavel[]>('/Responsavel/GetAll');
  },

  async getById(id: number): Promise<Responsavel> {
    return apiRequest<Responsavel>(`/Responsavel/${id}`);
  },

  async create(responsavel: Partial<Responsavel>): Promise<Responsavel> {
    return apiRequest<Responsavel>('/Responsavel/New', {
      method: 'POST',
      body: JSON.stringify(responsavel),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/Responsavel/${id}`, {
      method: 'DELETE',
    });
  },
};
