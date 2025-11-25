import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePermission?: string;
  requireAnyPermission?: string[];
  requireAllPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
}) => {
  const { isAuthenticated, hasPermission, hasAnyPermission, hasAllPermissions, isLoading } =
    useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check single permission
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-xl text-gray-600 mb-2">Access Denied</p>
          <p className="text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check any of the permissions
  if (requireAnyPermission && !hasAnyPermission(requireAnyPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-xl text-gray-600 mb-2">Access Denied</p>
          <p className="text-gray-500">
            You don't have the required permissions to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check all permissions
  if (requireAllPermissions && !hasAllPermissions(requireAllPermissions)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-xl text-gray-600 mb-2">Access Denied</p>
          <p className="text-gray-500">
            You don't have all the required permissions to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
