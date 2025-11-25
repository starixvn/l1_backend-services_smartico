import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RequirePermissionProps {
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check any of the permissions
  if (anyPermission && !hasAnyPermission(anyPermission)) {
    return <>{fallback}</>;
  }

  // Check all permissions
  if (allPermissions && !hasAllPermissions(allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
