import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, LogOut, Building2, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

const mobileNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/lancamentos', label: 'Lançamentos' },
  { href: '/projecoes', label: 'Projeções' },
  { href: '/emprestimos', label: 'Empréstimos' },
  { href: '/recorrencias', label: 'Recorrências' },
  { href: '/empresa', label: 'Empresa' },
];

export function Topbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-20 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-semibold text-gray-900">Menu</span>
      </div>

      <div className="hidden md:flex items-center justify-end flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nomeUsuario} {user?.sobrenome}
                </p>
                <p className="text-xs text-gray-500">{user?.emailUsuario}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#4B0012] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/empresa')}>
              <Building2 className="w-4 h-4 mr-2" />
              <span>Empresa</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-x-4 top-16 z-30 rounded-3xl border border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl md:hidden">
          <nav className="space-y-2">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
