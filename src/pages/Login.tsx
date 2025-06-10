
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { KeyRound, AtSign } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      
      // Redireciona baseado no tipo de usuário
      if (email.includes('cliente')) {
        navigate('/cliente/dashboard');
      } else {
        navigate('/staff/dashboard');
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema FiscAI",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
      console.error('Erro de login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Para fins de teste, adicionar botões para diferentes perfis
  const loginAsClient = () => {
    setEmail('cliente@exemplo.com');
    setPassword('senha123');
  };

  const loginAsStaff = () => {
    setEmail('staff@exemplo.com');
    setPassword('senha123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4">
      <div className="max-w-md w-full relative z-10">
        {/* Logo e branding */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">FiscAI</h1>
          <p className="text-blue-200">Inteligência fiscal para sua empresa</p>
        </div>
        
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-800">Bem-vindo</CardTitle>
            <CardDescription className="text-center">
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span className="ml-2">Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t pt-4">
            <div className="text-sm text-center text-gray-500 mb-2">
              Para fins de demonstração:
            </div>
            <div className="flex justify-between w-full gap-2">
              <Button variant="outline" size="sm" className="w-1/2 hover:bg-blue-50" onClick={loginAsClient}>
                Entrar como Cliente
              </Button>
              <Button variant="outline" size="sm" className="w-1/2 hover:bg-blue-50" onClick={loginAsStaff}>
                Entrar como Colaborador
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Decorative elements */}
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-[-30px] right-[-20px] w-28 h-28 bg-indigo-500 rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  );
};

export default Login;
