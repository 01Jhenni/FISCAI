import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  userType: 'client' | 'staff';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ userType }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('ProtectedRoute state:', {
      userType,
      user,
      isAuthenticated,
      isLoading,
      currentPath: window.location.pathname
    });
  }, [userType, user, isAuthenticated, isLoading]);

  if (isLoading) {
    console.log('ProtectedRoute: Loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (user?.type !== userType) {
    console.log('ProtectedRoute: Wrong user type, redirecting to dashboard');
    return <Navigate to={`/${user?.type === 'client' ? 'cliente/upload' : 'staff/dashboard'}`} />;
  }

  console.log('ProtectedRoute: Rendering protected content');
  return (
    <Layout userType={userType}>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
