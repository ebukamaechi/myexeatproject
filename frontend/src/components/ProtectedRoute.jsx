import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, loggedIn, role, children }) => {
  if (!loggedIn || user?.role !== role) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
