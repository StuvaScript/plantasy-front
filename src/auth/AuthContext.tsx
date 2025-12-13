import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api, {
  setToken as setApiToken,
  getStoredToken,
  clearToken as clearApiToken,
} from "../lib/apiClient";

type Params = {
  name: string;
  email: string;
  password: string;
};

type User = {
  name: string;
  userId: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (params: Omit<Params, "name">) => Promise<boolean>;
  signup: (params: Params) => Promise<boolean>;
  logout: () => void;
};

type LoginResponse = {
  token: string;
  user: User;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = getStoredToken();
    if (saved) {
      setApiToken(saved);
      setToken(saved);
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser) as User);
      } catch {}
    }
    setLoading(false);
  }, []);

  type LoginBody = {
    email: string;
    password: string;
  };

  type LoginResponse = { stuff: changeMe!! };

  const login = useCallback(
    async ({ email, password }: Omit<Params, "name">): Promise<boolean> => {
      try {
        const data = await api.post<LoginBody, LoginResponse>("/auth/login", {
          email,
          password,
        });

        console.log("login data:", data);
        if (!data?.token) {
          throw new Error("Login did not return a token");
        }

        setApiToken(data.token);
        setToken(data.token);

        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        return true;
      } catch (err) {
        console.error("Login error:", err);
        return false;
      }
    },
    []
  );

  const signup = useCallback(
    async ({ name, email, password }: Params): Promise<boolean> => {
      try {
        const data = await api.post<SignupBody, SignupResponse>(
          "/auth/register",
          {
            name,
            email,
            password,
          }
        );
        console.log("signup data:", data);

        if (!data?.token) {
          throw new Error("Signup did not return a token");
        }

        setApiToken(data.token);
        setToken(data.token);

        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        return true;
      } catch (err) {
        console.error("Signup error:", err);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearApiToken();
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("user");
    } catch {}
    navigate("/");
  }, [navigate]);

  const value: AuthContextType = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: !!token,
      login,
      signup,
      logout,
    }),
    [token, user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
