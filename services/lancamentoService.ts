import { apiRequest } from './api';
import type { Lancamento, SomatoriaResponse } from '../types';

export const lancamentoService = {
  async getAll(): Promise<Lancamento[]> {
    return apiRequest<Lancamento[]>('/Lancamentos/GetAll');
  },

  async getById(id: number): Promise<Lancamento> {
    return apiRequest<Lancamento>(`/Lancamentos/${id}`);
  },

  async create(lancamento: Partial<Lancamento>): Promise<Lancamento> {
    return apiRequest<Lancamento>('/Lancamentos/New', {
      method: 'POST',
      body: JSON.stringify(lancamento),
    });
  },

  async update(id: number, lancamento: Partial<Lancamento>): Promise<Lancamento> {
    return apiRequest<Lancamento>(`/Lancamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lancamento),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/Lancamentos/${id}`, {
      method: 'DELETE',
    });
  },

  async getByAno(ano: number): Promise<Lancamento[]> {
    return apiRequest<Lancamento[]>(`/Lancamentos/ano/${ano}`);
  },

  async getByMes(ano: number, mes: number): Promise<Lancamento[]> {
    return apiRequest<Lancamento[]>(`/Lancamentos/mes/${ano}/${mes}`);
  },

  async getByDia(ano: number, mes: number, dia: number): Promise<Lancamento[]> {
    return apiRequest<Lancamento[]>(`/Lancamentos/dia/${ano}/${mes}/${dia}`);
  },

  async getSomatoria(): Promise<SomatoriaResponse> {
    return apiRequest<SomatoriaResponse>('/Lancamentos/somatoria');
  },

  async getAllEmpresa(): Promise<Lancamento[]> {
    return apiRequest<Lancamento[]>('/Lancamentos/Empresa');
  },

  async getSomatoriaEmpresa(): Promise<SomatoriaResponse> {
    return apiRequest<SomatoriaResponse>('/Lancamentos/Empresa/Somatoria');
  },
};
