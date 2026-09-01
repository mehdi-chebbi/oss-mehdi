import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "../api/auth";
import { fetchMe, tryRefresh, setAccessToken, clearAccessToken, logoutApi, logoutEverywhereApi } from "../api/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  logoutReason: string | null; // "reuse_detected" | "expired" | null
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutReason, setLogoutReason] = useState<string | null>(null);

  // On mount: try to get a fresh access token via the refresh cookie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const freshToken = await tryRefresh();
      if (cancelled) return;

      if (freshToken) {
        setAccessToken(freshToken);
        setToken(freshToken);
        try {
          const u = await fetchMe(freshToken);
          if (!cancelled) setUser(u);
        } catch {
          // Access token from refresh is bad — clear everything
          clearAccessToken();
          setToken(null);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Listen for token refresh events (from the 401 interceptor)
  useEffect(() => {
    const onRefreshed = (e: Event) => {
      const newToken = (e as CustomEvent).detail as string;
      setAccessToken(newToken);
      setToken(newToken);
    };
    const onSessionExpired = () => {
      clearAccessToken();
      setToken(null);
      setUser(null);
      setLogoutReason("expired");
    };
    const onSessionRevoked = () => {
      clearAccessToken();
      setToken(null);
      setUser(null);
      setLogoutReason("reuse_detected");
    };
    window.addEventListener("token-refreshed", onRefreshed);
    window.addEventListener("session-expired", onSessionExpired);
    window.addEventListener("session-revoked", onSessionRevoked);
    return () => {
      window.removeEventListener("token-refreshed", onRefreshed);
      window.removeEventListener("session-expired", onSessionExpired);
      window.removeEventListener("session-revoked", onSessionRevoked);
    };
  }, []);

  const loginFn = useCallback((accessToken: string, authenticatedUser: User) => {
    setAccessToken(accessToken);
    setToken(accessToken);
    setUser(authenticatedUser);
    setLogoutReason(null);
  }, []);

  const logoutFn = useCallback(async () => {
    await logoutApi(); // clears httpOnly cookie server-side
    clearAccessToken();
    setToken(null);
    setUser(null);
    setLogoutReason(null);
  }, []);

  const logoutEverywhereFn = useCallback(async () => {
    if (token) {
      try {
        await logoutEverywhereApi(token); // server revokes all tokens + clears cookie
      } catch {
        // Best effort — clear client state regardless
      }
    }
    clearAccessToken();
    setToken(null);
    setUser(null);
    setLogoutReason(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, loading, login: loginFn, logout: logoutFn, logoutEverywhere: logoutEverywhereFn, logoutReason }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
