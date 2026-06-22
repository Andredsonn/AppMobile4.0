import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LineChart, PiggyBank } from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#2B000A] text-white">
      <div className="absolute top-[-180px] left-[-100px] h-[420px] w-[420px] rounded-full bg-[#7A001C]/30 blur-3xl" />
      <div className="absolute bottom-[-220px] right-[-70px] h-[420px] w-[420px] rounded-full bg-[#FFC107]/10 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <LineChart className="absolute left-[10%] top-[15%] h-10 w-10 animate-bounce text-[#FFC107]/40" />
        <PiggyBank className="absolute left-[15%] top-[75%] h-14 w-14 animate-pulse text-[#FFC107]/20" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
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

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-12 sm:px-10">
        <section className="w-full">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FFC107]/20 bg-[#FFC107]/10 px-5 py-2 text-sm text-[#FFC107] backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            Controle financeiro moderno e inteligente
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Transforme sua
            <span className="bg-gradient-to-r from-[#FFC107] to-yellow-300 bg-clip-text text-transparent">
              {' '}
              vida financeira
            </span>
            {' '}com o Projeto Midas
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            Use o assistente Midas para entrar no sistema. Ele é o único acesso
            permitido nesta tela e traz insights financeiros úteis.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="font-semibold text-white">Acesso inteligente</p>
              <p className="mt-3 text-sm text-gray-300">
                Solicite login ao assistente e acesse o painel sem interface manual.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="font-semibold text-white">Insights da aplicação</p>
              <p className="mt-3 text-sm text-gray-300">
                Veja receitas, despesas e projeções com ajuda do assistente.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="font-semibold text-white">Navegação guiada</p>
              <p className="mt-3 text-sm text-gray-300">
                O assistente orienta você nas principais funcionalidades.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="font-semibold text-white">Visão completa</p>
              <p className="mt-3 text-sm text-gray-300">
                Controle seu fluxo financeiro e alcance metas com mais clareza.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
