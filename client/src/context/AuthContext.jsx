import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('medijourney_token');
      const savedUser = authService.getCurrentUser();
      
      if (token && savedUser) {
        setUser(savedUser);
        try {
          const res = await authService.getMe();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('medijourney_user', JSON.stringify(res.user));
          }
        } catch (e) {
          console.warn('Session expired or invalid:', e.message);
          // Don't wipe immediately if offline demo, keep savedUser
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Demo helper: quickly switch between pre-seeded roles for demonstration
  const switchDemoRole = async (roleType) => {
    if (roleType === 'admin') {
      return await login('admin@medijourney.in', 'Admin@123456');
    } else if (roleType === 'doctor') {
      return await login('dr.naresh@medanta.org', 'Doctor@123456');
    } else if (roleType === 'patient') {
      return await login('sarah.jenkins@gmail.com', 'Patient@123456');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        isAuthenticated: !!user,
        isPatient: user?.role === 'patient',
        isDoctor: user?.role === 'doctor',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
