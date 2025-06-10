
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Send, Search, UserCircle, Phone, Video, MoreVertical, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Conversation {
  id: string;
  name: string;
  company: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'self' | 'other';
  timestamp: Date;
}

const StaffChat = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'conv1': [
      { id: '1', text: 'Olá, estou com dificuldades para enviar os arquivos SPED', sender: 'other', timestamp: new Date(Date.now() - 60000 * 30) },
      { id: '2', text: 'Pode me explicar qual o erro que está acontecendo?', sender: 'self', timestamp: new Date(Date.now() - 60000 * 28) },
      { id: '3', text: 'Quando tento fazer upload, aparece uma mensagem de erro de formato de arquivo', sender: 'other', timestamp: new Date(Date.now() - 60000 * 25) },
      { id: '4', text: 'Entendi. Vamos verificar o formato do seu arquivo. Você precisa garantir que o SPED esteja no formato .txt', sender: 'self', timestamp: new Date(Date.now() - 60000 * 20) },
      { id: '5', text: 'Ah, entendi. Vou verificar aqui', sender: 'other', timestamp: new Date(Date.now() - 60000 * 15) }
    ],
    'conv2': [
      { id: '1', text: 'Boa tarde! Preciso alterar a data de envio dos arquivos', sender: 'other', timestamp: new Date(Date.now() - 60000 * 180) },
      { id: '2', text: 'Boa tarde! Claro, para quando você gostaria de alterar?', sender: 'self', timestamp: new Date(Date.now() - 60000 * 178) }
    ],
    'conv3': [
      { id: '1', text: 'Como faço para acessar meu dashboard financeiro?', sender: 'other', timestamp: new Date(Date.now() - 60000 * 360) },
      { id: '2', text: 'Você pode acessar através do menu lateral, na opção "Financeiro"', sender: 'self', timestamp: new Date(Date.now() - 60000 * 358) },
      { id: '3', text: 'Perfeito, consegui visualizar. Obrigado!', sender: 'other', timestamp: new Date(Date.now() - 60000 * 355) },
      { id: '4', text: 'Estou à disposição! Se precisar de mais alguma ajuda, é só me avisar.', sender: 'self', timestamp: new Date(Date.now() - 60000 * 350) }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Dados fictícios de conversas
  const conversations: Conversation[] = [
    { 
      id: 'conv1', 
      name: 'João da Silva', 
      company: 'Empresa A', 
      lastMessage: 'Ah, entendi. Vou verificar aqui', 
      lastMessageTime: '10:30', 
      unreadCount: 0,
      online: true 
    },
    { 
      id: 'conv2', 
      name: 'Maria Oliveira', 
      company: 'Empresa B', 
      lastMessage: 'Boa tarde! Claro, para quando você gostaria de alterar?', 
      lastMessageTime: '09:45', 
      unreadCount: 1,
      online: false 
    },
    { 
      id: 'conv3', 
      name: 'Pedro Santos', 
      company: 'Empresa C', 
      lastMessage: 'Estou à disposição! Se precisar de mais alguma ajuda, é só me avisar.', 
      lastMessageTime: 'Ontem', 
      unreadCount: 0,
      online: true 
    },
    { 
      id: 'conv4', 
      name: 'Ana Souza', 
      company: 'Empresa D', 
      lastMessage: 'Perfeito, muito obrigado pela ajuda!', 
      lastMessageTime: 'Seg', 
      unreadCount: 0,
      online: false 
    },
    { 
      id: 'conv5', 
      name: 'Carlos Mendes', 
      company: 'Empresa B', 
      lastMessage: 'Vou enviar os arquivos amanhã, pode ser?', 
      lastMessageTime: 'Sex', 
      unreadCount: 2,
      online: false 
    },
  ];

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Rolar para baixo quando novas mensagens chegarem ou quando mudar de conversa
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim() || !activeConversation) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'self',
      timestamp: new Date()
    };
    
    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessage]
    }));
    setMessage('');
    
    // Simular resposta automática após 1-3 segundos
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const responses = [
          "Entendi, vou verificar isso.",
          "Ok, obrigado pela informação.",
          "Perfeito! Isso resolve meu problema.",
          "Vou precisar de um tempo para verificar essas informações.",
          "Poderia me ajudar com mais uma dúvida?",
        ];
        
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'other',
          timestamp: new Date()
        };
        
        setMessages(prev => ({
          ...prev,
          [activeConversation]: [...(prev[activeConversation] || []), responseMessage]
        }));
      }, 1000 + Math.random() * 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getActiveConversation = (): Conversation | undefined => {
    return conversations.find(conv => conv.id === activeConversation);
  };

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-0 overflow-hidden">
        {/* Lista de conversas (Coluna da esquerda) */}
        <div className="lg:col-span-1 border-r h-full flex flex-col bg-white">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold mb-2">Mensagens</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full text-left p-3 border-b hover:bg-gray-50 flex items-start ${
                    activeConversation === conv.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setActiveConversation(conv.id)}
                >
                  <div className="relative mr-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserCircle className="h-10 w-10 text-gray-600" />
                    </div>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.company}</p>
                    <p className="text-xs truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                Nenhuma conversa encontrada.
              </div>
            )}
          </div>
        </div>

        {/* Área de chat (Coluna da direita) */}
        <div className="lg:col-span-3 h-full flex flex-col bg-gray-50">
          {activeConversation ? (
            <>
              {/* Cabeçalho da conversa */}
              <div className="p-4 border-b bg-white flex justify-between items-center">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserCircle className="h-10 w-10 text-gray-600" />
                    </div>
                    {getActiveConversation()?.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{getActiveConversation()?.name}</h3>
                    <p className="text-sm text-gray-500">{getActiveConversation()?.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Área de mensagens */}
              <div className="flex-grow p-4 overflow-y-auto">
                {messages[activeConversation]?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex mb-4 ${
                      msg.sender === 'self' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender === 'self'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70 flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Área de input da mensagem */}
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    type="submit" 
                    disabled={!message.trim()} 
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <UserCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
                <p className="text-gray-500">
                  Escolha uma conversa para iniciar o atendimento
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffChat;
