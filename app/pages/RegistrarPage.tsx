import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usuarioService } from '../../services/usuarioService';

export function RegisterPage() {
  const navigate = useNavigate();

  const [nomeUsuario, setNomeUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (success) {
      timer = setTimeout(() => {
        navigate('/');
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await usuarioService.registrar({
        nomeUsuario,
        PasswordString: password
      });

      toast.success(
        'Cadastro realizado com sucesso! Redirecionando para login...'
      );

      setSuccess(true);

    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4B0012] to-[#2d0009] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#4B0012]">
              Criar Conta
            </h1>
            <p className="text-gray-600 mt-2">
              Cadastro de usuário
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Usuário</Label>
              <Input
                value={nomeUsuario}
                onChange={(e) => setNomeUsuario(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-black font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Voltar para login
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}