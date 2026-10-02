import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { User, UserRole } from '@/types';
import { authService } from '@/services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Recupera a sessão salva anteriormente.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        const normalizedUser: User = {
          ...parsedUser,
          role: parsedUser.role.toLowerCase() as UserRole,
        };

        setUser(normalizedUser);
      } catch (error) {
        console.error('Erro ao recuperar usuário:', error);

        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  /*
   * Login real através do Spring Boot.
   */
      const login = async (
        email: string,
        password: string,
  ): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);

     const loggedUser: User = {
       ...response.user,
       role: response.user.role.toLowerCase() as UserRole,
     };

     localStorage.setItem('token', response.token);
     localStorage.setItem('user', JSON.stringify(loggedUser));

     setUser(loggedUser);

      return true;
    } catch (error) {
      console.error('Erro no login:', error);

      return false;
    }
  };

  /*
   * Encerra a sessão local.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
  };

  /*
   * Verifica se o usuário possui uma das roles informadas.
   */
  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;

    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}