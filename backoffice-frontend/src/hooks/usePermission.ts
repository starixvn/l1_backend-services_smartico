import { useAuth } from '../contexts/AuthContext';

export const usePermission = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions } = useAuth();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
  };
};
