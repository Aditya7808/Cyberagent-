import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export type UserRoleType = 
  | 'super_admin' 
  | 'admin' 
  | 'developer' 
  | 'operator' 
  | 'auditor' 
  | 'end_user' 
  | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRoleType;
  org_id: string;
  clearance_level: string;
  permissions: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  impersonateRole: (role: UserRoleType) => Promise<void>;
  hasPermission: (perm: string) => boolean;
  isRole: (roles: UserRoleType[]) => boolean;
}

const DEFAULT_ROOT_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'root@sentinelai.dev',
  full_name: 'Aditya Yadav',
  role: 'super_admin',
  org_id: '11111111-1111-1111-1111-111111111111',
  clearance_level: 'LVL-5 [ROOT]',
  permissions: ['*'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sentinel_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('sentinel_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = Boolean(user && token);

  const register = async (email: string, password: string, fullName: string) => {
    const data = await api.register(email, password, fullName);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('sentinel_token', data.access_token);
    localStorage.setItem('sentinel_user', JSON.stringify(data.user));
  };

  const login = async (email: string, password: string) => {
    // Perform real database credential validation
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('sentinel_token', data.access_token);
    localStorage.setItem('sentinel_user', JSON.stringify(data.user));
  };

  const loginWithGoogle = async (credential: string) => {
    // Perform real Google OAuth credential verification
    const data = await api.loginGoogle(credential);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('sentinel_token', data.access_token);
    localStorage.setItem('sentinel_user', JSON.stringify(data.user));
  };

  const impersonateRole = async (targetRole: UserRoleType) => {
    if (user?.role !== 'super_admin' && user?.role !== 'admin') {
      throw new Error('Access Denied: Only Root Security Administrator can perform role auditing.');
    }
    const data = await api.impersonate(targetRole);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('sentinel_token', data.access_token);
    localStorage.setItem('sentinel_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
  };

  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(perm);
  };

  const isRole = (roles: UserRoleType[]) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        loginWithGoogle,
        register,
        logout,
        impersonateRole,
        hasPermission,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

