import Cookies from 'js-cookie';
import api from './api';
import type { User } from '../types';

export const setToken = (token: string) => {
  Cookies.set('token', token, { expires: 7, sameSite: 'Lax' });
};

export const getToken = () => Cookies.get('token');

export const removeToken = () => Cookies.remove('token');

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await api.get('/auth/me');
    return res.data.user;
  } catch {
    return null;
  }
};
