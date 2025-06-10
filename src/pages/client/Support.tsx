
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'support';
  timestamp: Date;
}

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
          message.sender === 'user' ? 'bg-blue-100' :
          message.sender === 'ai' ? 'bg-green-100' : 'bg-purple-100'
        }`}>
          {message.sender === 'user' ? (
            <User className="h-4 w-4 text-blue-600" />
          ) : message.sender === 'ai' ? (
            <Bot className="h-4 w-4 text-green-600" />
          ) : (
            <div className="text-sm font-bold text-purple-600">S</div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          message.sender === 'user' 
            ? 'bg-blue-500 text-white' 
            : message.sender === 'ai'
              ? 'bg-green-100 text-gray-800'
              : 'bg-purple-100 text-gray-800'
        }`}>
          <p>{message.text}</p>
          <p className="text-xs mt-1 opacity-70">
            {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
      </div>
    </div>
  );
};

const ClientSupport = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente de suporte. Como posso ajudar você hoje?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 1000)
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolar para baixo quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Simulação de resposta da IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let response: Message;
      
      if (message.toLowerCase().includes('fatura') || message.toLowerCase().includes('pagamento')) {
        response = {
          id: (Date.now() + 1).toString(),
          text: 'Para assuntos de faturamento, recomendo enviar um e-mail para financeiro@empresa.com ou ligar no (11) 3333-4444. Posso ajudar com mais alguma coisa?',
          sender: 'ai',
          timestamp: new Date()
        };
      } else if (message.toLowerCase().includes('erro') || message.toLowerCase().includes('problema')) {
        response = {
          id: (Date.now() + 1).toString(),
          text: 'Estou transferindo você para um de nossos atendentes. Aguarde um momento, por favor.',
          sender: 'ai',
          timestamp: new Date()
        };
        
        // Simular resposta do suporte humano
        setTimeout(() => {
          const supportMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: `Olá ${user?.name}! Sou o Carlos do suporte. Li que você está enfrentando um problema. Poderia me fornecer mais detalhes para que eu possa ajudar?`,
            sender: 'support',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, supportMessage]);
        }, 3000);
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          text: 'Entendi sua pergunta. Nosso sistema realiza o processamento dos arquivos enviados em até 24 horas úteis. Você pode acompanhar o status no dashboard. Posso ajudar com mais alguma informação?',
          sender: 'ai',
          timestamp: new Date()
        };
      }
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      toast({
        title: "Erro no suporte",
        description: "Não foi possível conectar ao serviço de suporte. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full max-h-[calc(100vh-12rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Suporte
          </CardTitle>
          <CardDescription>
            Tire suas dúvidas ou solicite ajuda para problemas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <form onSubmit={handleSendMessage} className="w-full flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()} 
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClientSupport;
