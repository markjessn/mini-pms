import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useApolloClient } from '@apollo/client/react';
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
  const initialized = useRef(false);
  const client = useApolloClient();

  const fetchUser = useCallback(async (email: string) => {
    try {
      const { data } = await client.query<{ me: User | null }>({
        query: GET_ME,
        variables: { email },
        fetchPolicy: 'network-only',
      });
      if (data?.me) {
        setUser(data.me);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (storedEmail) {
      fetchUser(storedEmail);
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, userData.email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refetchUser = useCallback(() => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (storedEmail) {
      fetchUser(storedEmail);
    }
  }, [fetchUser]);

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
