import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <img src="/logo.png" alt="Logo FiscAI" className="mx-auto mb-4 h-20 w-auto" />
        <h1 className="text-4xl font-bold mb-4">FileFlow</h1>
        <p className="text-xl text-gray-600">Redirecionando para a página de login...</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
