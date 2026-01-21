import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { GET_ME } from '../graphql/operations';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mini_pms_user_email';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fetchMe] = useLazyQuery(GET_ME, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      }
      setIsLoading(false);
    },
    onError: () => {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (storedEmail) {
      fetchMe({ variables: { email: storedEmail } });
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, userData.email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refetchUser = () => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (storedEmail) {
      fetchMe({ variables: { email: storedEmail } });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refetchUser,
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
