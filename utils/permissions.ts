import type { Usuario } from '../types';

export const USER_PROFILES = [
  'Administrador',
  'Responsável por Lançamentos',
  'Responsável por Projeções',
  'Responsável por Empréstimos',
  'Somente leitura',
] as const;

export type UserProfile = typeof USER_PROFILES[number];
export type PermissionModule = 'lancamentos' | 'projecoes' | 'emprestimos' | 'recorrencias' | 'empresa';

export function getUserProfile(user: Usuario | null): string {
  return user?.Perfil || user?.perfil || '';
}

export function isCompanyAdmin(user: Usuario | null): boolean {
  return getUserProfile(user) === 'Administrador';
}

export function canManageModule(user: Usuario | null, module: PermissionModule): boolean {
  const profile = getUserProfile(user);

  if (profile === 'Administrador') return true;
  if (module === 'lancamentos') return profile === 'Responsável por Lançamentos';
  if (module === 'projecoes') return profile === 'Responsável por Projeções';
  if (module === 'emprestimos') return profile === 'Responsável por Empréstimos';

  return false;
}

export function canCreateCompany(user: Usuario | null): boolean {
  const companyId = user?.IdEmpresa || user?.idEmpresa || 0;
  return companyId <= 0 || isCompanyAdmin(user);
}
