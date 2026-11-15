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
    return savedUser ? JSON.parse(savedUser) : DEFAULT_ROOT_USER;
  });

  const isAuthenticated = Boolean(user);

  const register = async (email: string, password: string, fullName: string) => {
    const data = await api.register(email, password, fullName);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('sentinel_token', data.access_token);
    localStorage.setItem('sentinel_user', JSON.stringify(data.user));
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('sentinel_token', data.access_token);
      localStorage.setItem('sentinel_user', JSON.stringify(data.user));
    } catch (err) {
      // Offline fallback for demo personas
      if (email.includes('root')) {
        setUser(DEFAULT_ROOT_USER);
        localStorage.setItem('sentinel_user', JSON.stringify(DEFAULT_ROOT_USER));
      } else if (email.includes('dev')) {
        const devUser: UserProfile = {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'dev@sentinelai.dev',
          full_name: 'Alex Vance (AI Dev)',
          role: 'developer',
          org_id: '11111111-1111-1111-1111-111111111111',
          clearance_level: 'LVL-3 [DEV]',
          permissions: ['agents:manage', 'playground:execute', 'rag:manage', 'evaluations:run'],
        };
        setUser(devUser);
        localStorage.setItem('sentinel_user', JSON.stringify(devUser));
      } else if (email.includes('audit')) {
        const auditUser: UserProfile = {
          id: '00000000-0000-0000-0000-000000000003',
          email: 'auditor@sentinelai.dev',
          full_name: 'Elena Rostova (Auditor)',
          role: 'auditor',
          org_id: '11111111-1111-1111-1111-111111111111',
          clearance_level: 'LVL-2 [AUDIT]',
          permissions: ['audit:view_all', 'audit:export', 'evaluations:view'],
        };
        setUser(auditUser);
        localStorage.setItem('sentinel_user', JSON.stringify(auditUser));
      } else {
        const endUser: UserProfile = {
          id: '00000000-0000-0000-0000-000000000004',
          email: 'user@sentinelai.dev',
          full_name: 'Marcus Kane (Analyst)',
          role: 'end_user',
          org_id: '11111111-1111-1111-1111-111111111111',
          clearance_level: 'LVL-1 [USER]',
          permissions: ['playground:chat', 'documents:search'],
        };
        setUser(endUser);
        localStorage.setItem('sentinel_user', JSON.stringify(endUser));
      }
    }
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

