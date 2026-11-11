import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('smartmail_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartmail_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('smartmail_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('smartmail_token', data.token);
    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('smartmail_user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    localStorage.setItem('smartmail_token', data.token);
    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('smartmail_user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('smartmail_token');
    localStorage.removeItem('smartmail_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedProfile) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedProfile };
      localStorage.setItem('smartmail_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
