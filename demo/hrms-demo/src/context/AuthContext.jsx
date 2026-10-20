import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page refresh
  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        setEmployee(data.employee);
      })
      .catch(() => localStorage.removeItem('pp_token'))
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (form) => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('pp_token', data.token);
    setUser(data.user);
    setEmployee(data.employee);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('pp_token', data.token);
    setUser(data.user);
    setEmployee(data.employee);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_current_user');
    localStorage.removeItem('pp_current_emp');
    setUser(null);
    setEmployee(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, employee, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext) || {};