// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => {
      setUser(authService.getCurrentUser());
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const session = await authService.login(email, password);
      setUser(session);
      return session;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  };
}
