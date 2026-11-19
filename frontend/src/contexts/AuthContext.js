
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authService.getProfile();
        setCurrentUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem('token')) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);

      const response = await authService.login(credentials);
      const { token, user } = response.data;

      if (!token) {
        throw new Error('Сервер не вернул токен авторизации.');
      }

      localStorage.setItem('token', token);
      setCurrentUser(user);
      setError(null);

      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Ошибка входа. Проверьте учетные данные.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);

      const response = await authService.register(userData);
      const { token, user } = response.data;

      if (!token) {
        throw new Error('Сервер не вернул токен авторизации.');
      }

      localStorage.setItem('token', token);
      setCurrentUser(user);
      setError(null);

      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Ошибка регистрации. Попробуйте другие данные.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);

      const response = await authService.updateProfile(profileData);
      setCurrentUser({
        ...currentUser,
        profile: response.data
      });

      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Ошибка обновления профиля.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
