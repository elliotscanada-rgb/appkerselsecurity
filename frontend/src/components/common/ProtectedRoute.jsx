import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading, isAuthenticated, getToken } = useAuth();
  
  // Debug logging
  React.useEffect(() => {
    console.log('ProtectedRoute Check:', {
      loading,
      hasUser: !!user,
      hasToken: !!getToken(),
      userRole: user?.role,
      requiredRole: role,
      isAuthenticated: isAuthenticated()
    });
  }, [user, loading, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading..." />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user || !getToken()) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (role && user.role !== role) {
    console.log('ProtectedRoute: Wrong role, redirecting to', `/${user.role}/dashboard`);
    const redirectPath = `/${user.role}/dashboard`;
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
