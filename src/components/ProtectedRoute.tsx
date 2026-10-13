import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const location = useLocation();

  if (!token || !userJson) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = JSON.parse(userJson);

  if (adminOnly && user.role !== 'ADMIN') {
    // If user is not admin but trying to access admin page, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
