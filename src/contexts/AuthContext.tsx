import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthResponse, AuthUser, fetchCurrentUser } from "@/lib/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: AuthResponse) => void;
  logout: () => void;
}

const AUTH_TOKEN_STORAGE_KEY = "xops_auth_token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const restoreSession = async () => {
      try {
        const response = await fetchCurrentUser(storedToken);

        if (isCancelled) {
          return;
        }

        setToken(storedToken);
        setUser(response.user);
      } catch {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);

        if (!isCancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  const setSession = (session: AuthResponse) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      setSession,
      logout,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
