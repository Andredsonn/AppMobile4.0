import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LancamentosPage } from './pages/LancamentosPage';
import { NovoLancamentoPage } from './pages/NovoLancamentoPage';
import { ProjecoesPage } from './pages/ProjecoesPage';
import { NovaProjecaoPage } from './pages/NovaProjecaoPage';
import { EmprestimosPage } from './pages/EmprestimosPage';
import { NovoEmprestimoPage } from './pages/NovoEmprestimoPage';
import { NovaRecorrenciaPage } from './pages/NovaRecorrenciaPage';
import { EmpresaPage } from './pages/EmpresaPage';
import { RegisterPage } from './pages/RegistrarPage';
import { MidasDemoPage } from '../pages/MidasDemoPage';
import { MidasAssistant } from '../components/MidasAssistant';
import { ModuleGuard } from './components/ModuleGuard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lancamentos" element={<LancamentosPage />} />
          <Route path="/lancamentos/novo" element={<ModuleGuard module="lancamentos"><NovoLancamentoPage /></ModuleGuard>} />
          <Route path="/projecoes" element={<ProjecoesPage />} />
          <Route path="/projecoes/nova" element={<ModuleGuard module="projecoes"><NovaProjecaoPage /></ModuleGuard>} />
          <Route path="/emprestimos" element={<EmprestimosPage />} />
          <Route path="/emprestimos/novo" element={<ModuleGuard module="emprestimos"><NovoEmprestimoPage /></ModuleGuard>} />
          <Route path="/recorrencias/novo" element={<NovaRecorrenciaPage />} />
          <Route path="/empresa" element={<EmpresaPage />} />
          <Route path="/midas-demo" element={<MidasDemoPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <MidasAssistant />
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
