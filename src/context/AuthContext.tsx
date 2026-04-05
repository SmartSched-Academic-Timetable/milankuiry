import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthType, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authType, setAuthType] = useState<AuthType>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);

  const login = (type: AuthType, data: any) => {
    setAuthType(type);
    if (type === 'organization') {
      setOrganizationId(data.id);
      setOrganizationName(data.name);
      setUniqueCode(data.unique_code);
    } else if (type === 'user') {
      setUserName(data.name);
      setUniqueCode(data.unique_code);
      setOrganizationId(data.organization_id);
    }
  };

  const logout = () => {
    setAuthType(null);
    setOrganizationId(null);
    setOrganizationName(null);
    setUserName(null);
    setUniqueCode(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authType,
        organizationId,
        organizationName,
        userName,
        uniqueCode,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
