import axios from 'axios';

// Dynamically resolve the API base URL
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized/token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only clear storage and redirect if not on public auth pages
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('accessloop_token');
        localStorage.removeItem('accessloop_user');
      }
    }
    return Promise.reject(error);
  }
);

// Resolve image URL (supports relative /uploads paths, Vite dev proxy, and cloud backend origins)
export const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Ignore stock/random Unsplash portrait & default resource URLs so unuploaded accounts/resources remain clean and empty
  if (
    trimmed.includes('images.unsplash.com/photo-') &&
    (trimmed.includes('1534528741775') ||
      trimmed.includes('1507003211169') ||
      trimmed.includes('1580489944761') ||
      trimmed.includes('1573496359142') ||
      trimmed.includes('1500648767791') ||
      trimmed.includes('1539571696357') ||
      trimmed.includes('1494790108377') ||
      trimmed.includes('1517841905240') ||
      trimmed.includes('1522075469751') ||
      trimmed.includes('1544005313-94d') ||
      trimmed.includes('1516035069371') ||
      trimmed.includes('1544717305') ||
      trimmed.includes('1581092160607') ||
      trimmed.includes('1502982720700'))
  ) {
    return '';
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.startsWith('/')) {
    const base = envUrl.trim().replace(/\/api\/?$/, '');
    return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }
  return trimmed;
};

// Default empty avatar fallback
export const DEFAULT_AVATAR = '';

export default api;
