import { apiRequest } from './api';
import type { Empresa } from '../types';

export const empresaService = {
  async getMinha(): Promise<Empresa | null> {
    const empresa = await apiRequest<Empresa>('/Empresa/Minha');
    return empresa?.IdEmpresa || empresa?.idEmpresa ? empresa : null;
  },

  async getAll(): Promise<Empresa[]> {
    return apiRequest<Empresa[]>('/Empresa/GetAll');
  },

  async getById(id: number): Promise<Empresa> {
    return apiRequest<Empresa>(`/Empresa/${id}`);
  },

  async create(empresa: Partial<Empresa>): Promise<Empresa> {
    return apiRequest<Empresa>('/Empresa/Minha', {
      method: 'POST',
      body: JSON.stringify(empresa),
    });
  },

  async update(id: number, empresa: Partial<Empresa>): Promise<Empresa> {
    return apiRequest<Empresa>(`/Empresa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(empresa),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/Empresa/${id}`, {
      method: 'DELETE',
    });
  },
};
