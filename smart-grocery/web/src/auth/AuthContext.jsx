import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

const LS_TOKEN = "sg_token";
const LS_USER = "sg_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(LS_TOKEN) || "";
    const uRaw = localStorage.getItem(LS_USER);
    const u = uRaw ? safeJsonParse(uRaw) : null;

    if (t) setToken(t);
    if (u) setUser(u);

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (token) localStorage.setItem(LS_TOKEN, token);
    else localStorage.removeItem(LS_TOKEN);

    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [token, user, isReady]);

  async function register({ name, email, password }) {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
    });

    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login({ email, password }) {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    setToken(data.token);
    setUser(data.user || null);

    try {
      const me = await apiRequest("/api/auth/me", { token: data.token });
      if (me?.user) setUser(me.user);
    } catch {
      // ignore
    }

    return data;
  }

  async function refreshMe(passedToken) {
    const t = passedToken || token;
    if (!t) return null;

    const me = await apiRequest("/api/auth/me", { token: t });
    if (me?.user) setUser(me.user);

    return me;
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isReady,
      isAuthed: Boolean(token),
      register,
      login,
      logout,
      refreshMe
    }),
    [token, user, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
