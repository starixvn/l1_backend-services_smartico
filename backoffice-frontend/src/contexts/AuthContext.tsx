import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  fullName: string;
  operatorId: string;
}

interface AuthContextType {
  user: User | null;
  permissions: string[];
  token: string | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedPermissions = localStorage.getItem('permissions');

      if (storedToken && storedUser && storedPermissions) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setPermissions(JSON.parse(storedPermissions));

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      // Clear invalid localStorage data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      console.error('Failed to load auth data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post('http://localhost:5120/api/auth/login', {
        email,
        password,
      });

      const { token: authToken, user: userData, permissions: userPermissions } = response.data;

      // Store in state
      setToken(authToken);
      setUser(userData);
      setPermissions(userPermissions);

      // Store in localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('permissions', JSON.stringify(userPermissions));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPermissions([]);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');

    delete axios.defaults.headers.common['Authorization'];
  };

  const hasPermission = (permission: string): boolean => {
    if (!permissions || permissions.length === 0) return false;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return false;
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!permissions || permissions.length === 0) return false;
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  const value: AuthContextType = {
    user,
    permissions,
    token,
    isAuthenticated: !!token && !!user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
