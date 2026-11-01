import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Compress and square-crop avatar to max 320x320 JPEG (< 35KB) for permanent cloud DB persistence
export const compressAvatarImage = (file) => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof File)) {
      return resolve('');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 320;
          const width = img.width;
          const height = img.height;

          // Crop square from center
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          const targetDim = Math.min(minDim, MAX_DIM);
          canvas.width = targetDim;
          canvas.height = targetDim;

          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetDim, targetDim);

          // High-quality lightweight JPEG Data URI
          const compressedDataUri = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUri);
        } catch (err) {
          console.warn('Canvas processing error:', err);
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

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
  const normalizeUser = (u) => {
    if (!u) return null;
    const resolvedId = u._id || u.id;
    return {
      ...u,
      _id: resolvedId,
      id: resolvedId,
    };
  };

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('accessloop_user');
    return saved ? normalizeUser(JSON.parse(saved)) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessloop_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('accessloop_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          const normalized = normalizeUser(res.data.user);
          setUser(normalized);
          localStorage.setItem('accessloop_user', JSON.stringify(normalized));
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
    const { token: newToken, user: rawUser } = res.data;
    const normalized = normalizeUser(rawUser);
    localStorage.setItem('accessloop_token', newToken);
    localStorage.setItem('accessloop_user', JSON.stringify(normalized));
    setToken(newToken);
    setUser(normalized);
    return normalized;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: rawUser } = res.data;
    const normalized = normalizeUser(rawUser);
    localStorage.setItem('accessloop_token', newToken);
    localStorage.setItem('accessloop_user', JSON.stringify(normalized));
    setToken(newToken);
    setUser(normalized);
    return normalized;
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
      const normalized = normalizeUser(res.data.user);
      setUser(normalized);
      localStorage.setItem('accessloop_user', JSON.stringify(normalized));
      return normalized;
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const updateAvatar = async (fileOrUrl) => {
    let payload = fileOrUrl;
    if (fileOrUrl instanceof File) {
      try {
        const compressed = await compressAvatarImage(fileOrUrl);
        if (compressed) {
          payload = compressed;
        }
      } catch (err) {
        console.warn('Avatar compression failed, falling back to raw file:', err);
      }
    }

    let res;
    if (typeof payload === 'string') {
      res = await api.put('/auth/avatar', { avatar: payload });
    } else {
      const formData = new FormData();
      formData.append('avatar', payload);
      res = await api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    const updatedUser = normalizeUser(res.data.user);
    setUser(updatedUser);
    localStorage.setItem('accessloop_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const updateProfile = async (profileData) => {
    let res;
    if (profileData instanceof FormData) {
      res = await api.put('/auth/profile', profileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      res = await api.put('/auth/profile', profileData);
    }
    const updatedUser = normalizeUser(res.data.user);
    setUser(updatedUser);
    localStorage.setItem('accessloop_user', JSON.stringify(updatedUser));
    return updatedUser;
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
        updateAvatar,
        updateProfile,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
