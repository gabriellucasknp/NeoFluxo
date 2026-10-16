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
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (name: string, email: string, password: string, role?: string, department?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Recupera a sessão salva anteriormente e valida com /auth/me
   */
  useEffect(() => {
    const initAuth = async () => {
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

          // Silent verify with backend
          authService.me().then((me) => {
            const freshUser: User = {
              ...me,
              role: me.role.toLowerCase() as UserRole,
            };
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }).catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          });
        } catch (error) {
          console.error('Erro ao recuperar usuário:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /*
   * Login real através da API.
   */
  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await authService.login(email, password);

      const loggedUser: User = {
        ...response.user,
        role: response.user.role.toLowerCase() as UserRole,
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setUser(loggedUser);
      return { success: true, user: loggedUser };
    } catch (error: any) {
      console.warn('Tentativa de login falhou:', error?.message || error);
      return { success: false, error: error.message || 'E-mail ou senha inválidos.' };
    }
  };

  /*
   * Cadastro real através da API (US-01).
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = 'projetista',
    department: string = 'Projetos Elétricos',
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await authService.register({ name, email, password, role, department });

      const loggedUser: User = {
        ...response.user,
        role: response.user.role.toLowerCase() as UserRole,
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setUser(loggedUser);
      return { success: true, user: loggedUser };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: error.message || 'Erro ao realizar cadastro.' };
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
        register,
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