import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, saveToken, clearToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const setSession = useCallback(({ token, user: u }, remember) => {
    if (token) saveToken(token, remember);
    if (u) setUser(u);
  }, []);

  const login = useCallback(async (email, password, remember = true) => {
    const { data } = await api.post('/auth/login', { email, password, remember });
    setSession(data, remember);
    return data.user;
  }, [setSession]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  /** Revokes every session of this account (all devices) but keeps this one signed in. */
  const logoutEverywhere = useCallback(async () => {
    const { data } = await api.post('/auth/logout-all');
    saveToken(data.token);
    return data.message;
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, login, logout, logoutEverywhere, setSession }),
    [user, loading, login, logout, logoutEverywhere, setSession]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
