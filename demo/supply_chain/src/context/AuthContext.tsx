import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api.js';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  loginAsUser: () => Promise<void>;
  logout: () => void;
  switchRole: (role: string) => Promise<void>;
  isAdmin: boolean;
  isWarehouseManager: boolean;
  isProcurementManager: boolean;
  isQualityInspector: boolean;
  isManufacturingManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('flowstock_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await apiRequest<{ user: User }>('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired, logging out');
          logout();
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('flowstock_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const loginAsAdmin = async () => {
    return login('admin@flowstock.io', 'admin123');
  };

  const loginAsUser = async () => {
    return login('user@flowstock.io', 'user123');
  };

  const logout = () => {
    localStorage.removeItem('flowstock_token');
    setToken(null);
    setUser(null);
  };

  const switchRole = async (role: string) => {
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      localStorage.setItem('flowstock_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Switch role error:', err);
    }
  };

  const isAdmin = user?.role === 'SYSTEM_ADMIN';
  const isWarehouseManager = user?.role === 'WAREHOUSE_MANAGER' || isAdmin;
  const isProcurementManager = user?.role === 'PROCUREMENT_MANAGER' || isAdmin;
  const isQualityInspector = user?.role === 'QUALITY_INSPECTOR' || isAdmin;
  const isManufacturingManager = user?.role === 'MANUFACTURING_MANAGER' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginAsAdmin,
        loginAsUser,
        logout,
        switchRole,
        isAdmin,
        isWarehouseManager,
        isProcurementManager,
        isQualityInspector,
        isManufacturingManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
