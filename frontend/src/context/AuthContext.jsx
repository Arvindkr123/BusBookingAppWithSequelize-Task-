import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshUser() {
    setError("");
    try {
      const result = await api.auth.me();
      setUser(result.user);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        setUser(null);
      } else {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login(credentials) {
    const result = await api.auth.login(credentials);
    setUser(result.user);
    setError("");
    return result.user;
  }

  async function signup(details) {
    const result = await api.auth.signup(details);
    setUser(result.user);
    setError("");
    return result.user;
  }

  async function logout() {
    await api.auth.logout();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, error, login, signup, logout, refreshUser }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
