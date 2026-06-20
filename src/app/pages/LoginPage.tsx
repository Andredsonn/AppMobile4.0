import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  Coins,
  CreditCard,
  DollarSign,
  LineChart,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Empty effect
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#2B000A] text-white">
      {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-150px] h-[500px] w-[500px] rounded-full bg-[#7A001C]/30 blur-3xl" />
      <div className="absolute bottom-[-250px] right-[-100px] h-[500px] w-[500px] rounded-full bg-[#FFC107]/10 blur-3xl" />

      {/* Floating Icons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Coins className="absolute left-[10%] top-[20%] h-10 w-10 animate-bounce text-[#FFC107]/40" />
        <Wallet className="absolute left-[80%] top-[25%] h-12 w-12 animate-pulse text-[#FFC107]/30" />
        <TrendingUp className="absolute left-[65%] top-[60%] h-14 w-14 animate-bounce text-[#FFC107]/20" />
        <PiggyBank className="absolute left-[20%] top-[70%] h-14 w-14 animate-pulse text-[#FFC107]/20" />
        <CreditCard className="absolute left-[45%] top-[15%] h-10 w-10 animate-bounce text-[#FFC107]/20" />
        <DollarSign className="absolute left-[90%] top-[80%] h-14 w-14 animate-pulse text-[#FFC107]/10" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <img src="/image.png" alt="Logo" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide">Projeto Midas</h1>
            <p className="text-sm text-gray-300">Gestão Financeira Inteligente</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex min-h-[85vh] flex-col gap-8 px-4 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        {/* Left */}
        <section className="max-w-3xl lg:max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FFC107]/20 bg-[#FFC107]/10 px-4 py-2 text-sm text-[#FFC107] backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            Controle financeiro moderno e inteligente
          </div>

          <h1 className="mb-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Transforme sua
            <span className="bg-gradient-to-r from-[#FFC107] to-yellow-300 bg-clip-text text-transparent">
              {' '}
              vida financeira
            </span>{' '}
            com o Projeto Midas
          </h1>

          <p className="text-base leading-relaxed text-gray-300 sm:text-lg">
            Gerencie gastos, acompanhe metas, visualize projeções e tome decisões financeiras com uma plataforma moderna inspirada nas melhores experiências do mercado.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
              <LineChart className="mt-1 h-7 w-7 text-[#FFC107]" />
              <div>
                <p className="font-semibold">Análises Inteligentes</p>
                <span className="text-sm text-gray-400">
                  Insights financeiros em tempo real
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
              <PiggyBank className="mt-1 h-7 w-7 text-[#FFC107]" />
              <div>
                <p className="font-semibold">Metas Financeiras</p>
                <span className="text-sm text-gray-400">
                  Planejamento e crescimento
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right - Assistente como único login */}
        <section className="w-full max-w-lg">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-[#FFC107]" />
              <div>
                <h2 className="text-2xl font-bold">Bem-vindo!</h2>
                <p className="text-sm text-gray-300">Use o Midas Assistant para começar</p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <p className="text-sm leading-relaxed">
                🤖 Clique no botão flutuante amarelo para abrir o assistente Midas e:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[#FFC107]">→</span> Fazer login com suas credenciais
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FFC107]">→</span> Criar uma nova conta
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FFC107]">→</span> Recuperar sua senha
                </li>
              </ul>
            </div>

            <div className="mt-8 border-t border-white/20 pt-6 text-center">
              <p className="text-xs text-gray-400">
                O Assistente Midas oferece segurança, inteligência e facilidade de uso.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
