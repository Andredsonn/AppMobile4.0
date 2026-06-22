import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  CreditCard, 
  RefreshCw, 
  Building2,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Receipt, label: 'Lançamentos', path: '/lancamentos' },
  { icon: TrendingUp, label: 'Projeções', path: '/projecoes' },
  { icon: CreditCard, label: 'Empréstimos', path: '/emprestimos' },
  { icon: RefreshCw, label: 'Recorrências', path: '/recorrencias' },
  { icon: Building2, label: 'Empresa', path: '/empresa' },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 bg-[#4B0012] text-white h-screen fixed left-0 top-0 flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold">Projeto Midas</h1>
        <p className="text-sm text-white/70 mt-1">Gestão Financeira</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-white/70 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
