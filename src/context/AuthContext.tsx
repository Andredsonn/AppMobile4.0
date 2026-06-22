import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario, LoginRequest } from '../types';
import { STORAGE_KEYS } from '../constants';
import { usuarioService } from '../services/usuarioService';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Usuario>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage', error);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await usuarioService.autenticar(credentials);

    const token = response.token || response.Token || '';
    const usuarioData = response.usuario || response.Usuario;

    if (!token || !usuarioData) {
      throw new Error('Resposta de autenticação inválida. Verifique suas credenciais e tente novamente.');
    }

    const usuarioId =
      usuarioData.id ||
      usuarioData.Id ||
      usuarioData.IdUsuario ||
      usuarioData.idUsuario ||
      0;

    const nomeUsuario =
      usuarioData.nomeUsuario ||
      usuarioData.NomeUsuario ||
      usuarioData.emailUsuario ||
      usuarioData.EmailUsuario ||
      '';

    const idEmpresa = usuarioData.idEmpresa || usuarioData.IdEmpresa || 0;
    const perfil = usuarioData.perfil || usuarioData.Perfil || '';

    const authenticatedUser: Usuario = {
      IdUsuario: usuarioId,
      idUsuario: usuarioId,
      nomeUsuario,
      sobrenome: usuarioData.sobrenome || '',
      emailUsuario: usuarioData.emailUsuario || usuarioData.EmailUsuario || '',
      telefone: usuarioData.telefone || '',
      IdEmpresa: idEmpresa,
      idEmpresa,
      Perfil: perfil,
      perfil,
      Token: token,
    };

    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authenticatedUser));

    setUser(authenticatedUser);
  };


  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  const updateUser = (data: Partial<Usuario>) => {
    setUser(prev => {
      if (!prev) return prev;

      const updatedUser = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        login, 
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
