import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Upload, DollarSign, MessageSquare,
  Database, Users, Settings, LogOut, Menu, X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userType: 'client' | 'staff';
}

const Layout: React.FC<LayoutProps> = ({ children, userType }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    console.log('Layout mounted:', {
      userType,
      currentPath: location.pathname,
      hasChildren: !!children,
      childrenType: children ? typeof children : 'undefined'
    });
  }, [userType, location.pathname, children]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clientLinks = [
    { to: '/cliente/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/cliente/upload', label: 'Upload de Arquivos', icon: <Upload className="h-5 w-5" /> },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { 
      to: '/staff/importacoes', 
      label: 'Importações', 
      icon: <Database className="h-5 w-5" />,
      subItems: [
        { to: '/staff/importacoes', label: 'Lista de Importações' },
        { to: '/staff/importacoes/nova', label: 'Nova Importação' }
      ]
    },
    { to: '/staff/chat', label: 'Conversas', icon: <MessageSquare className="h-5 w-5" /> },
    { to: '/staff/configuracoes', label: 'Configurações', icon: <Settings className="h-5 w-5" /> },
  ];

  const links = userType === 'client' ? clientLinks : staffLinks;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (móvel) */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed z-50 top-4 left-4 p-2 bg-white rounded-md shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div 
              className="fixed inset-y-0 left-0 max-w-[250px] w-full bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent 
                user={user} 
                links={links} 
                location={location} 
                handleLogout={handleLogout} 
                userType={userType}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sidebar (desktop) */}
      <div className="hidden lg:block lg:w-64 bg-white shadow-lg">
        <SidebarContent 
          user={user} 
          links={links} 
          location={location} 
          handleLogout={handleLogout} 
          userType={userType}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {links.find(link => link.to === location.pathname)?.label || 'Página não encontrada'}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {console.log('Layout rendering children:', children)}
          {children}
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  user: any;
  links: Array<{ to: string; label: string; icon: JSX.Element; subItems?: Array<{ to: string; label: string }> }>;
  location: ReturnType<typeof useLocation>;
  handleLogout: () => void;
  userType: 'client' | 'staff';
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  user, links, location, handleLogout, userType 
}) => {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center px-6">
        <Link to={`/${userType === 'client' ? 'cliente' : 'staff'}/dashboard`} className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="font-semibold">FileFlow Nexus</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="grid gap-1 px-2">
          {links.map((link, index) => (
            <div key={index}>
              {link.subItems ? (
                <div className="space-y-1">
                  <Link
                    to={link.to}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent ${
                      location.pathname.startsWith(link.to) ? 'bg-accent' : ''
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                  <div className="ml-4 space-y-1">
                    {link.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.to}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent ${
                          location.pathname === subItem.to ? 'bg-accent' : ''
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent ${
                    location.pathname === link.to ? 'bg-accent' : ''
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="flex items-center gap-4 rounded-lg border p-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Layout;
