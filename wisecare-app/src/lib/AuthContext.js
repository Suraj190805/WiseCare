'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_USERS } from '@/lib/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithPin = useCallback(async (pin) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    if (pin === MOCK_USERS.patient.pin) {
      setUser(MOCK_USERS.patient);
      setIsLoading(false);
      return { success: true, user: MOCK_USERS.patient };
    }
    setIsLoading(false);
    return { success: false, error: 'Invalid PIN' };
  }, []);

  const loginWithEmail = useCallback(async (email, password, role) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (role === 'doctor') {
      setUser(MOCK_USERS.doctor);
      setIsLoading(false);
      return { success: true, user: MOCK_USERS.doctor };
    }
    if (role === 'caregiver') {
      setUser(MOCK_USERS.caregiver);
      setIsLoading(false);
      return { success: true, user: MOCK_USERS.caregiver };
    }
    setIsLoading(false);
    return { success: false, error: 'Invalid credentials' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithPin,
    loginWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
