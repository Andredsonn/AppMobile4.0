import { STORAGE_KEYS } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const ERROR_STATUS_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos. Verifique e tente novamente.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Acesso negado. Você não tem permissão para acessar este recurso.',
  404: 'Recurso não encontrado.',
  500: 'Erro interno no servidor. Tente novamente mais tarde.',
};

const parseErrorText = async (response: Response) => {
  const text = await response.text();

  try {
    const json = JSON.parse(text);
    if (json?.message) return String(json.message);
    if (typeof json === 'string') return json;
  } catch {
    // ignore invalid JSON
  }

  return text || response.statusText;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (
    token &&
    !endpoint.includes('/Autenticar') &&
    !endpoint.includes('/Registrar')
  ) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await parseErrorText(response);
      const message =
        errorText || ERROR_STATUS_MESSAGES[response.status] || response.statusText;
      throw new ApiError(response.status, message);
    }

    if (response.status === 204 || options.method === 'DELETE') {
      return {} as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, 'Não foi possível conectar com a API. Verifique sua rede.');
  }
}
