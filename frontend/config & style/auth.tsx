'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
interface User { id: string; email: string; }
interface Profile { role: string; full_name?: string; }
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<{ message: string }>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.getMe();
      setUser(res.user);
      setProfile(res.profile);
    } catch {
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchMe(); }, [fetchMe]);
  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('access_token', res.access_token);
    setUser(res.user);
    await fetchMe();
  };
  const signup = async (email: string, password: string, fullName: string) => {
    return api.signup(email, password, fullName);
  };
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setProfile(null);
  };
  const isAdmin = profile?.role === 'admin';
  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
