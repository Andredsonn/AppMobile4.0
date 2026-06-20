import { apiRequest } from './api';
import type { Emprestimo } from '../types';

export const emprestimoService = {
  async getAll(): Promise<Emprestimo[]> {
    return apiRequest<Emprestimo[]>('/Emprestimos/GetAll');
  },

  async getAllEmpresa(): Promise<Emprestimo[]> {
    return apiRequest<Emprestimo[]>('/Emprestimos/Empresa');
  },

  async getById(id: number): Promise<Emprestimo> {
    return apiRequest<Emprestimo>(`/Emprestimos/${id}`);
  },

  async create(emprestimo: Partial<Emprestimo>): Promise<Emprestimo> {
    return apiRequest<Emprestimo>('/Emprestimos/New', {
      method: 'POST',
      body: JSON.stringify(emprestimo),
    });
  },

  async update(id: number, emprestimo: Partial<Emprestimo>): Promise<Emprestimo> {
    return apiRequest<Emprestimo>(`/Emprestimos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(emprestimo),
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/Emprestimos/${id}`, {
      method: 'DELETE',
    });
  },
};
