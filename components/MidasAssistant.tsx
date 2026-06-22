import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UserCircle2, Send, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'midas-assistant-profile';

type LoginData = {
  nomeUsuario: string;
  PasswordString: string;
};

type RegisterData = {
  nomeUsuario: string;
  email: string;
  PasswordString: string;
  confirmPassword: string;
};

type ResetPasswordData = {
  email: string;
};

type ProfileSettings = {
  name: string;
  pronoun: string;
  goal?: string;
};

type AssistMessage = {
  id: number;
  author: 'user' | 'midas';
  text: string;
};

const defaultProfile: ProfileSettings = {
  name: '',
  pronoun: '',
};

function loadProfile(): ProfileSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(data) };
  } catch {
    return defaultProfile;
  }
}

function saveProfile(profile: ProfileSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function MidasAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loginData, setLoginData] = useState<LoginData>({ nomeUsuario: '', PasswordString: '' });
  const [registerData, setRegisterData] = useState<RegisterData>({ nomeUsuario: '', email: '', PasswordString: '', confirmPassword: '' });
  const [resetData, setResetData] = useState<ResetPasswordData>({ email: '' });
  const [loginConfirmed, setLoginConfirmed] = useState<{ nomeUsuario: boolean; PasswordString: boolean }>({
    nomeUsuario: false,
    PasswordString: false,
  });
  const [messages, setMessages] = useState<AssistMessage[]>([
    {
      id: 1,
      author: 'midas',
      text: 'Olá! Eu sou Midas, seu assistente financeiro. Bem-vindo!',
    },
  ]);
  const [profile, setProfile] = useState<ProfileSettings>(defaultProfile);
  const [loading, setLoading] = useState(false);
  const [invalidKeyWarning, setInvalidKeyWarning] = useState(false);
  const [stage, setStage] = useState<'nome' | 'genero' | 'menu' | 'login' | 'register' | 'reset' | 'profile' | 'goal' | 'chat'>(user ? 'profile' : 'nome');
  const [tempName, setTempName] = useState('');
  const [tempGender, setTempGender] = useState<'masculino' | 'feminino' | ''>('');
  const [permissions, setPermissions] = useState<{
    location?: { lat: number; lng: number };
    time?: string;
    temperature?: number;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o final da conversa
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRetryAI = () => {
    setInvalidKeyWarning(false);
    addMessage({
      id: Date.now(),
      author: 'midas',
      text: 'Vou testar a conexão com o assistente novamente. Você pode enviar outra pergunta ou usar as opções abaixo.',
    });
  };

  const requestPermissions = async () => {
    const newPermissions = { ...permissions };

    // Solicitar localização
    if (!permissions.location) {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              newPermissions.location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setPermissions((prev) => ({ ...prev, location: newPermissions.location }));
            },
            (error) => {
              console.log('Localização não permitida:', error.message);
            }
          );
        }
      } catch (error) {
        console.log('Erro ao solicitar localização:', error);
      }
    }

    // Coletar hora do dispositivo
    const now = new Date();
    newPermissions.time = now.toLocaleString('pt-BR');
    setPermissions((prev) => ({ ...prev, time: newPermissions.time }));

    // Tentar obter temperatura (simulado ou via API)
    try {
      // Se quiser integrar com API de clima, pode fazer aqui
      // Por enquanto, deixaremos como opcional
      if (permissions.location) {
        // Aqui você poderia chamar uma API de clima
      }
    } catch (error) {
      console.log('Erro ao obter temperatura:', error);
    }
  };

  const handleOpenMainMenu = () => {
    setInvalidKeyWarning(false);
    setStage('menu');
    addMessage({
      id: Date.now(),
      author: 'midas',
      text: 'Abrindo o menu principal para você escolher outra opção de uso.',
    });
  };

  const handleContinueWithoutAI = () => {
    setInvalidKeyWarning(false);
    addMessage({
      id: Date.now(),
      author: 'midas',
      text: 'Tudo bem. Continuaremos usando o sistema normalmente sem o assistente de IA por enquanto.',
    });
    setStage('menu');
  };

  const getPredefinedReply = (question: string) => {
    const text = question.toLowerCase();
    const greeting = `Olá ${profile.pronoun} ${profile.name}, `;

    if (text.includes('aumentar receitas') || text.includes('mais receitas') || text.includes('ganhar mais')) {
      return (
        greeting +
        'para aumentar receitas, revise seus produtos e serviços, negocie com clientes, ofereça pacotes promocionais e acompanhe o fluxo de caixa para identificar oportunidades de entrada extra.'
      );
    }

    if (text.includes('reduzir despesas') || text.includes('cortar despesas') || text.includes('diminuir custos')) {
      return (
        greeting +
        'reduza despesas identificando gastos não essenciais, renegocie contratos, controle assinaturas e use o módulo de lançamentos para acompanhar cada saída.'
      );
    }

    if (text.includes('resultado positivo') || text.includes('lucro') || text.includes('saldo positivo')) {
      return (
        greeting +
        'para alcançar resultado positivo, mantenha o controle de receitas e despesas, priorize receitas recorrentes e utilize projeções para tomar decisões de curto e médio prazo.'
      );
    }

    if (text.includes('planejamento financeiro') || text.includes('planejar') || text.includes('planejamento')) {
      return (
        greeting +
        'melhore o planejamento financeiro usando projeções, definindo metas claras e revisando seus lançamentos regularmente para ajustar o orçamento quando necessário.'
      );
    }

    if (text.includes('lançamento') || text.includes('lancamento')) {
      return (
        greeting +
        'para criar um lançamento, acesse a tela de Lançamentos e clique em Novo Lançamento. Informe o valor, a categoria e a data para manter seu fluxo atualizado.'
      );
    }

    if (text.includes('emprestimo') || text.includes('empréstimo')) {
      return (
        greeting +
        'para cadastrar um empréstimo, vá em Empréstimos e clique em Novo Empréstimo. Preencha os valores, parcelas e taxas para ver o impacto financeiro.'
      );
    }

    if (text.includes('projeção') || text.includes('projecao') || text.includes('análise de ia') || text.includes('analise ia')) {
      return (
        greeting +
        'use a tela de Projeções para revisar seus cenários. Clique em Analisar com Midas para obter recomendação, pontos fortes e pontos de atenção sobre a projeção.'
      );
    }

    if (text.includes('ia não está disponível') || text.includes('erro ao consultar')) {
      return 'O Midas está temporariamente indisponível, mas você pode continuar usando o sistema e acessar as análises nas telas de Projeções, Lançamentos e Empréstimos.';
    }

    return null;
  };

  const quickSuggestions = [
    'Quero analisar minhas projeções mais recentes',
    'Como posso reduzir despesas este mês?',
    'Dê uma recomendação para melhorar meu fluxo de caixa',
  ];

  const goalOptions = [
    { value: 'aumentar_receitas', label: 'Aumentar receitas' },
    { value: 'reduzir_despesas', label: 'Reduzir despesas' },
    { value: 'resultado_positivo', label: 'Alcançar resultado positivo' },
    { value: 'planejamento', label: 'Melhorar planejamento financeiro' },
  ];

  useEffect(() => {
    const storedProfile = loadProfile();
    setProfile(storedProfile);
    
    if (user) {
      if (storedProfile.name && storedProfile.pronoun) {
        if (storedProfile.goal) {
          setStage('chat');
        } else {
          setStage('goal');
        }
      } else {
        setStage('profile');
      }
    } else {
      setStage('nome');
      setMessages([
        {
          id: 1,
          author: 'midas',
          text: 'Olá! Eu sou Midas, seu assistente financeiro. Bem-vindo! Qual é seu nome?',
        },
      ]);
    }
  }, [user]);

  const addMessage = (message: AssistMessage) => {
    setMessages((current) => [...current, message]);
  };

  const handleSend = async (text?: string) => {
    const userText = text?.trim() ?? input.trim();
    if (!userText) return;

    addMessage({ id: Date.now(), author: 'user', text: userText });
    if (!text) {
      setInput('');
    }
    setLoading(true);

    try {
      const predefined = getPredefinedReply(userText);
      if (predefined) {
        addMessage({ id: Date.now() + 1, author: 'midas', text: predefined });
        if (invalidKeyWarning) setInvalidKeyWarning(false);
        return;
      }

      // Solicitar permissões antes de enviar
      await requestPermissions();

      const assistantBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const res = await fetch(`${assistantBase}/assistente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pergunta: userText,
          nome: profile.name,
          pronome: profile.pronoun,
          objetivo: profile.goal,
          permissoes: permissions,
        }),
      });

      // If remote returns non-JSON or empty body, handle gracefully
      let data
      try { data = await res.json() } catch { data = null }

      const reply = data?.reply || data?.text || 'Não consegui gerar uma resposta. Tente novamente.'
      const fallback = data?.fallback || false
      const invalidKey = data?.invalidKey || false

      if (invalidKey) {
        setInvalidKeyWarning(true)
        addMessage({
          id: Date.now() + 1,
          author: 'midas',
          text: 'O assistente de IA não está disponível no momento porque a chave de API é inválida. Você ainda pode usar o sistema normalmente. Veja as opções abaixo.',
        })
      } else {
        if (fallback) {
          addMessage({
            id: Date.now() + 1,
            author: 'midas',
            text: `${reply} Você pode continuar usando o sistema normalmente, acessando as outras funcionalidades do app.`,
          })
        } else {
          addMessage({ id: Date.now() + 1, author: 'midas', text: reply })
        }
        if (invalidKeyWarning) {
          setInvalidKeyWarning(false)
        }
      }
    } catch (error) {
      addMessage({
        id: Date.now() + 1,
        author: 'midas',
        text: `Erro de conexão com o assistente. Aguarde alguns instantes e tente novamente, ${profile.pronoun} ${profile.name}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = Boolean(profile.name.trim() && profile.pronoun.trim());

  const handleProfileSave = () => {
    saveProfile(profile);
    addMessage({
      id: Date.now() + 2,
      author: 'midas',
      text: `Perfeito, ${profile.name}! Vou chamar você de ${profile.pronoun}. Qual é seu principal objetivo financeiro?`,
    });
    setStage('goal');
  };

  const handleGoalSelect = (goal: string) => {
    setProfile((prev) => ({ ...prev, goal }));
    const selectedLabel = goalOptions.find(opt => opt.value === goal)?.label;
    addMessage({
      id: Date.now() + 3,
      author: 'user',
      text: selectedLabel || goal,
    });
    addMessage({
      id: Date.now() + 4,
      author: 'midas',
      text: `Ótimo, ${profile.pronoun} ${profile.name}! Vou ajudá-lo a ${selectedLabel?.toLowerCase()}. Agora você pode me fazer perguntas sobre finanças, e usarei seu objetivo para orientar as sugestões.`,
    });
    setStage('chat');
  };

  const handleLoginFieldConfirm = (field: 'nomeUsuario' | 'PasswordString') => {
    const value = field === 'nomeUsuario' ? loginData.nomeUsuario : loginData.PasswordString;
    if (!value.trim()) return;

    addMessage({
      id: Date.now(),
      author: 'user',
      text: field === 'nomeUsuario' ? value : '••••••••',
    });

    if (field === 'nomeUsuario') {
      setLoginConfirmed((prev) => ({ ...prev, nomeUsuario: true }));
      addMessage({
        id: Date.now() + 1,
        author: 'midas',
        text: `Perfeito! Seu usuário "${loginData.nomeUsuario}" foi confirmado. Agora digite sua senha.`,
      });
    } else {
      setLoginConfirmed((prev) => ({ ...prev, PasswordString: true }));
      addMessage({
        id: Date.now() + 1,
        author: 'midas',
        text: `Sua senha foi confirmada. Deixa eu fazer seu login...`,
      });
      setTimeout(() => handleLoginSubmit(), 1000);
    }
  };

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async () => {
    setLoading(true);
    try {
      await login(loginData);
      addMessage({
        id: Date.now() + 2,
        author: 'midas',
        text: `Login realizado com sucesso, ${profile.pronoun} ${profile.name}! Você será redirecionado para seu dashboard em alguns segundos.`,
      });
      setLoginData({ nomeUsuario: '', PasswordString: '' });
      setLoginConfirmed({ nomeUsuario: false, PasswordString: false });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      addMessage({
        id: Date.now() + 2,
        author: 'midas',
        text: `Hmm, parece que esse usuário não existe ou a senha está incorreta, ${profile.pronoun} ${profile.name}. Gostaria de criar uma nova conta?`,
      });
      setLoginConfirmed({ nomeUsuario: false, PasswordString: false });
      setLoginData({ nomeUsuario: '', PasswordString: '' });
      setStage('menu');
      
      setTimeout(() => {
        addMessage({
          id: Date.now() + 3,
          author: 'midas',
          text: 'O que deseja fazer?',
        });
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (registerData.PasswordString !== registerData.confirmPassword) {
      addMessage({
        id: Date.now(),
        author: 'midas',
        text: 'As senhas não correspondem. Tente novamente.',
      });
      return;
    }



    setLoading(true);
    try {
      // Call registration endpoint
      const res = await fetch('/api/Usuario/Registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeUsuario: registerData.nomeUsuario,
          email: registerData.email,
          PasswordString: registerData.PasswordString,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        addMessage({
          id: Date.now(),
          author: 'midas',
          text: `Erro ao criar a conta: ${data.error || 'Tente novamente.'}`,
        });
        setLoading(false);
        return;
      }

      addMessage({
        id: Date.now(),
        author: 'midas',
        text: `Conta criada com sucesso, ${profile.pronoun} ${profile.name}! Agora vou fazer seu login automaticamente...`,
      });

      // Auto-login after registration
      await login({
        nomeUsuario: registerData.nomeUsuario,
        PasswordString: registerData.PasswordString,
      });

      addMessage({
        id: Date.now() + 1,
        author: 'midas',
        text: `Bem-vindo ao Projeto Midas, ${profile.pronoun} ${profile.name}! Você será redirecionado para seu dashboard em alguns segundos.`,
      });

      setRegisterData({ nomeUsuario: '', email: '', PasswordString: '', confirmPassword: '' });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      addMessage({
        id: Date.now() + 2,
        author: 'midas',
        text: `Erro ao criar a conta. Tente novamente.`,
      });
      setRegisterData({ nomeUsuario: '', email: '', PasswordString: '', confirmPassword: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = () => {
    addMessage({
      id: Date.now(),
      author: 'midas',
      text: `Um email para resetar sua senha foi enviado para ${resetData.email}. Verifique sua caixa de entrada.`,
    });
    setResetData({ email: '' });
    setStage('menu');
    addMessage({
      id: Date.now() + 1,
      author: 'midas',
      text: 'O que deseja fazer?',
    });
  };

  const handleMenuOption = (option: string) => {
    if (option === 'login') {
      setStage('login');
      addMessage({
        id: Date.now(),
        author: 'user',
        text: 'Fazer login',
      });
      addMessage({
        id: Date.now() + 1,
        author: 'midas',
        text: 'Ótimo! Vamos fazer seu login. Digite seu usuário.',
      });
    } else if (option === 'register') {
      setStage('register');
      addMessage({
        id: Date.now(),
        author: 'user',
        text: 'Criar uma conta',
      });
      addMessage({
        id: Date.now() + 1,
        author: 'midas',
        text: 'Vamos criar uma nova conta. Comece digitando um nome de usuário.',
      });
    } else if (option === 'reset') {
      setStage('reset');
      addMessage({
        id: Date.now(),
        author: 'user',
        text: 'Recuperar senha',
      });
      addMessage({
        id: Date.now() + 1,
        author: 'midas',
        text: 'Vamos recuperar sua senha. Digite seu email.',
      });
    }
  };

  const getGenderFromPronoun = (pronoun: string): 'masculino' | 'feminino' => {
    const feminine = ['Sra.', 'Srta.', 'Dra.'];
    return feminine.includes(pronoun) ? 'feminino' : 'masculino';
  };

  const getPronounFromGender = (gender: 'masculino' | 'feminino'): string => {
    return gender === 'feminino' ? 'Sra.' : 'Sr.';
  };

  const handleNameConfirm = () => {
    if (!tempName.trim()) return;
    addMessage({
      id: Date.now(),
      author: 'user',
      text: tempName,
    });
    addMessage({
      id: Date.now() + 1,
      author: 'midas',
      text: `Prazer, ${tempName}! Você é masculino ou feminino?`,
    });
    setStage('genero');
  };

  const handleGenderSelect = (gender: 'masculino' | 'feminino') => {
    const pronoun = getPronounFromGender(gender);
    const newProfile = {
      name: tempName,
      pronoun: pronoun,
    };
    setProfile(newProfile);
    saveProfile(newProfile);
    
    addMessage({
      id: Date.now(),
      author: 'user',
      text: gender === 'masculino' ? 'Masculino' : 'Feminino',
    });
    addMessage({
      id: Date.now() + 1,
      author: 'midas',
      text: `Perfeito, ${pronoun} ${tempName}! Vou chamar você assim daqui em diante.`,
    });
    
    setTempName('');
    setTempGender('');
    setStage('menu');
    
    setTimeout(() => {
      addMessage({
        id: Date.now() + 2,
        author: 'midas',
        text: 'O que deseja fazer?',
      });
    }, 500);
  };



  const userGender = profile.pronoun ? getGenderFromPronoun(profile.pronoun) : 'masculino';

  return (
    <div>
      <button
        type="button"
        aria-label="Abrir assistente Midas"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-xl shadow-yellow-500/20 hover:scale-105 transition-transform"
      >
        <Sparkles className="h-8 w-8" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex w-[320px] max-w-[92vw] flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
          >
            <div className="flex items-center justify-between rounded-t-3xl bg-[#4B0012] px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300 text-black">
                  {userGender === 'feminino' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <UserCircle2 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">Midas Assistant</p>
                  <p className="text-[11px] text-slate-200">Seu assistente financeiro</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-white/10 p-2 hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 py-3">
              {invalidKeyWarning && (
                <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                  <p className="font-semibold">Atenção:</p>
                  <p className="mt-1">O assistente de IA não está disponível porque a chave de API é inválida. Você pode continuar usando o sistema normalmente.</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleRetryAI}
                      className="w-full rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-100"
                    >
                      Tentar novamente a conexão
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenMainMenu}
                      className="w-full rounded-2xl bg-[#4B0012] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5d0825]"
                    >
                      Ir para as opções do assistente
                    </button>
                    <button
                      type="button"
                      onClick={handleContinueWithoutAI}
                      className="w-full rounded-2xl bg-yellow-200 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-yellow-300"
                    >
                      Continuar sem o assistente de IA
                    </button>
                  </div>
                </div>
              )}
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-3xl p-3 max-w-xs break-words shadow-sm ${
                        message.author === 'user'
                          ? 'bg-slate-100 text-slate-900 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none'
                          : 'bg-[#FEF3C7] text-slate-900 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-none border border-[#FDE68A]'
                      }`}
                    >
                      <p className="text-sm leading-6">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {stage === 'nome' ? (
                <div className="mt-3 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <input
                    value={tempName}
                    onChange={(event) => setTempName(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleNameConfirm()}
                    placeholder="Digite seu nome"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleNameConfirm}
                    disabled={!tempName.trim()}
                    className="w-full rounded-2xl bg-[#4B0012] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5d0825] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
              ) : stage === 'genero' ? (
                <div className="mt-3 space-y-2 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-sm text-slate-600 mb-3">Escolha sua opção:</p>
                  <button
                    type="button"
                    onClick={() => handleGenderSelect('masculino')}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-left font-medium text-slate-700 hover:border-[#4B0012] hover:bg-[#4B0012]/5 transition-all"
                  >
                    👨 Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderSelect('feminino')}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-left font-medium text-slate-700 hover:border-[#4B0012] hover:bg-[#4B0012]/5 transition-all"
                  >
                    👩 Feminino
                  </button>
                </div>
              ) : stage === 'menu' ? (
                <div className="mt-3 space-y-2 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-sm text-slate-600 mb-3">O que deseja fazer?</p>
                  <button
                    type="button"
                    onClick={() => handleMenuOption('login')}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-left font-medium text-slate-700 hover:border-[#4B0012] hover:bg-[#4B0012]/5 transition-all"
                  >
                    🔐 Fazer login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMenuOption('register')}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-left font-medium text-slate-700 hover:border-[#4B0012] hover:bg-[#4B0012]/5 transition-all"
                  >
                    ✨ Criar uma conta
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMenuOption('reset')}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-left font-medium text-slate-700 hover:border-[#4B0012] hover:bg-[#4B0012]/5 transition-all"
                  >
                    🔑 Recuperar senha
                  </button>
                </div>
              ) : stage === 'register' ? (
                <div className="mt-3 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <input
                    value={registerData.nomeUsuario}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, nomeUsuario: event.target.value }))}
                    placeholder="Nome de usuário"
                    disabled={registerData.email !== ''}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012] disabled:bg-slate-200"
                  />
                  <input
                    value={registerData.email}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Email"
                    type="email"
                    disabled={registerData.PasswordString !== ''}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012] disabled:bg-slate-200"
                  />
                  <input
                    type="password"
                    value={registerData.PasswordString}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, PasswordString: event.target.value }))}
                    placeholder="Senha"
                    disabled={registerData.confirmPassword !== ''}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012] disabled:bg-slate-200"
                  />
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(event) => setRegisterData((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    placeholder="Confirmar senha"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012]"
                  />
                  <button
                    type="button"
                    onClick={handleRegisterSubmit}
                    disabled={!registerData.nomeUsuario.trim() || !registerData.email.trim() || !registerData.PasswordString.trim() || !registerData.confirmPassword.trim() || loading}
                    className="w-full rounded-2xl bg-[#4B0012] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5d0825] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Criando conta...' : 'Criar conta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStage('menu');
                      setRegisterData({ nomeUsuario: '', email: '', PasswordString: '', confirmPassword: '' });
                      addMessage({
                        id: Date.now(),
                        author: 'midas',
                        text: 'O que deseja fazer?',
                      });
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Voltar
                  </button>
                </div>
              ) : stage === 'reset' ? (
                <div className="mt-3 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <input
                    value={resetData.email}
                    onChange={(event) => setResetData((prev) => ({ ...prev, email: event.target.value }))}
                    onKeyDown={(event) => event.key === 'Enter' && handleResetSubmit()}
                    placeholder="Seu email"
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012]"
                  />
                  <button
                    type="button"
                    onClick={handleResetSubmit}
                    disabled={!resetData.email.trim()}
                    className="w-full rounded-2xl bg-[#4B0012] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5d0825] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Recuperar senha
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStage('menu');
                      setResetData({ email: '' });
                      addMessage({
                        id: Date.now(),
                        author: 'midas',
                        text: 'O que deseja fazer?',
                      });
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Voltar
                  </button>
                </div>
              ) : stage === 'login' ? (
                <div className="mt-3 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-sm text-slate-600">Digite seu usuário:</p>
                  <input
                    value={loginData.nomeUsuario}
                    onChange={(event) => setLoginData((prev) => ({ ...prev, nomeUsuario: event.target.value }))}
                    onKeyDown={(event) => event.key === 'Enter' && handleLoginFieldConfirm('nomeUsuario')}
                    placeholder="Seu usuário"
                    disabled={loginConfirmed.nomeUsuario}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012] disabled:bg-slate-200"
                  />
                  {!loginConfirmed.nomeUsuario ? (
                    <button
                      type="button"
                      onClick={() => handleLoginFieldConfirm('nomeUsuario')}
                      disabled={!loginData.nomeUsuario.trim()}
                      className="w-full rounded-2xl bg-[#4B0012] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5d0825] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Confirmar usuário
                    </button>
                  ) : (
                    <>
                      <p className="text-sm text-slate-600">Digite sua senha:</p>
                      <input
                        type="password"
                        value={loginData.PasswordString}
                        onChange={(event) => setLoginData((prev) => ({ ...prev, PasswordString: event.target.value }))}
                        onKeyDown={(event) => event.key === 'Enter' && handleLoginFieldConfirm('PasswordString')}
                        placeholder="Sua senha"
                        disabled={loginConfirmed.PasswordString || loading}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012] disabled:bg-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleLoginFieldConfirm('PasswordString')}
                        disabled={!loginData.PasswordString.trim() || loading}
                        className="w-full rounded-2xl bg-[#4B0012] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5d0825] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? 'Fazendo login...' : 'Confirmar senha'}
                      </button>
                    </>
                  )}
                </div>
              ) : stage === 'profile' && !isProfileComplete ? (
                <div className="mt-3 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-sm text-slate-600">Antes de conversarmos, informe seu nome e pronome de tratamento:</p>
                  <input
                    value={profile.name}
                    onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Seu nome"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012]"
                  />
                  <select
                    value={profile.pronoun}
                    onChange={(event) => setProfile((prev) => ({ ...prev, pronoun: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4B0012]"
                  >
                    <option value="">Selecione um pronome...</option>
                    <option value="Sr.">Sr.</option>
                    <option value="Sra.">Sra.</option>
                    <option value="Srta.">Srta.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Dra.">Dra.</option>
                    <option value="Mx.">Mx.</option>
                    <option value="Você">Você</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={!profile.name.trim() || !profile.pronoun.trim()}
                    className="w-full rounded-2xl bg-[#4B0012] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5d0825] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Salvar e iniciar
                  </button>
                </div>
              ) : stage === 'goal' ? (
                <div className="mt-3 space-y-2 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-sm text-slate-600 mb-3">Qual é seu objetivo financeiro principal?</p>
                  {goalOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleGoalSelect(option.value)}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-left font-medium text-slate-700 hover:border-[#4B0012] hover:bg-[#4B0012]/5 transition-all"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && handleSend()}
                      placeholder="Pergunte ao Midas..."
                      className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#4B0012]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      disabled={loading}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4B0012] text-white hover:bg-[#5d0825] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickSuggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">O Midas está pronto para ajudar com finanças e planejamento financeiro.</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MidasAssistant;
