import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check auth profile on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/users/me', { withCredentials: true });
        if (res.data && res.data.success) {
          setUser(res.data.data);
          localStorage.setItem('chat_user', JSON.stringify(res.data.data));
        } else {
          setUser(null);
          localStorage.removeItem('chat_user');
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('chat_user');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password }, { withCredentials: true });
      if (res.data && res.data.success) {
        const userData = res.data.data.user;
        setUser(userData);
        localStorage.setItem('chat_user', JSON.stringify(userData));
        return { success: true, data: res.data };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid login credentials';
      return { success: false, message: msg };
    }
  };

  const register = async (fullName, username, email, password) => {
    try {
      const res = await axios.post('/api/users/register', {
        fullName,
        username,
        email,
        password,
      }, { withCredentials: true });
      if (res.data && res.data.success) {
        return { success: true, data: res.data };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/users/logout', { withCredentials: true });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem('chat_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
