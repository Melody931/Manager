import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentSession,
  loginRequest,
  registerRequest,
  type AuthSession,
  type LoginInput,
  type RegisterInput,
} from "../api/auth";

const TOKEN_KEY = "manager_token";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la aplicación, comprobamos si el token guardado sigue siendo válido.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentSession()
      .then(setSession)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setSession(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveTokenAndLoadSession = useCallback(async (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);

    try {
      const currentSession = await getCurrentSession();
      setSession(currentSession);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setSession(null);
      throw error;
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const token = await loginRequest(input);
    await saveTokenAndLoadSession(token);
  }, [saveTokenAndLoadSession]);

  const register = useCallback(async (input: RegisterInput) => {
    const token = await registerRequest(input);
    await saveTokenAndLoadSession(token);
  }, [saveTokenAndLoadSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir la sesión desde cualquier componente.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}
