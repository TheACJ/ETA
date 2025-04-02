import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api'; // Adjust path as per your project structure
import { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Assuming api.auth.getCurrentUser() is added to api.ts
      const { data: { user: authUser }, error } = await api.auth.getCurrentUser();
      if (error) throw error;
      if (authUser) {
        const { data: userProfile, error: profileError } = await api.users.getProfile(authUser.id);
        if (profileError) throw profileError;
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data, error } = await api.auth.signIn(credentials.email, credentials.password);
      if (error) throw error;
      const authUser = data.user;
      if (authUser) {
        const { data: userProfile, error: profileError } = await api.users.getProfile(authUser.id);
        if (profileError) throw profileError;
        setUser(userProfile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await api.auth.signOut();
      if (error) throw error;
      setUser(null);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}