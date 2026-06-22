import { apiRequest } from './api';
import type { TipoRecorrencia } from "../types";

export const tipoRecorrenciaService = {
    async getAll(): Promise<TipoRecorrencia[]> {
        return apiRequest<TipoRecorrencia[]>('/TipoRecorrencia/GetAll');
    },

    async getById(id: number): Promise<TipoRecorrencia> {
        return apiRequest<TipoRecorrencia>(`/TipoRecorrencia/${id}`);
    },

    async create(tipoRecorrencia: Partial<TipoRecorrencia>): Promise<TipoRecorrencia> {
        return apiRequest<TipoRecorrencia>('/TipoRecorrencia/New', {
            method: 'POST',
            body: JSON.stringify({
                nome: tipoRecorrencia.nome,
                descricao: tipoRecorrencia.descricao,
                padraoSistema: tipoRecorrencia.padraoSistema,
            })
        });
    },

    async delete(id: number) : Promise<void> {
        return apiRequest<void>(`/TipoRecorrencia/${id}`, {
            method : 'DELETE',
        });
    },
};