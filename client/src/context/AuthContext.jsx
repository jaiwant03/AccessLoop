import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@accessloop.edu',
    password: 'Password123!',
    label: 'Platform Administrator',
    role: 'admin',
  },
  manager: {
    email: 'manager@accessloop.edu',
    password: 'Password123!',
    label: 'Institution Manager',
    role: 'manager',
  },
  owner: {
    email: 'dr.sharma@accessloop.edu',
    password: 'Password123!',
    label: 'Resource Owner (Robotics Lab)',
    role: 'owner',
  },
  media_owner: {
    email: 'media.prof@accessloop.edu',
    password: 'Password123!',
    label: 'Resource Owner (Media Studio)',
    role: 'owner',
  },
  borrower: {
    email: 'arun.student@accessloop.edu',
    password: 'Password123!',
    label: 'Borrower (Student)',
    role: 'borrower',
  },
  researcher: {
    email: 'priya.researcher@accessloop.edu',
    password: 'Password123!',
    label: 'Borrower (Researcher)',
    role: 'borrower',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('accessloop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessloop_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('accessloop_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('accessloop_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('accessloop_token', newToken);
    localStorage.setItem('accessloop_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('accessloop_token', newToken);
    localStorage.setItem('accessloop_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const demoLogin = async (accountKey) => {
    const acc = DEMO_ACCOUNTS[accountKey];
    if (!acc) throw new Error('Demo account not found');
    return await login(acc.email, acc.password);
  };

  const logout = () => {
    localStorage.removeItem('accessloop_token');
    localStorage.removeItem('accessloop_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('accessloop_user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
