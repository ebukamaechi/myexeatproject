import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, loggedIn, role, children }) => {
  if (!loggedIn || user?.role !== role) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
// This component checks if the user is logged in and has the correct role.
// If not, it redirects them to the login page. If they are logged in and have the correct role, it renders the children components.