"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signupParent, login, AuthResponse, ParentSignupData, LoginData, User } from "@/api";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
  signup: (data: ParentSignupData) => Promise<void>;
  signin: (data: LoginData) => Promise<void>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const signup = async (data: ParentSignupData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signupParent(data);
      setToken(res.access_token);
      setUser(res.user ?? null);
      localStorage.setItem("token", res.access_token);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };
const signin = async (data: LoginData) => {
  setLoading(true);
  setError(null);
  try {
    const res = await login(data);
    setToken(res.access_token);
    setUser(res.user ?? null);
    localStorage.setItem("token", res.access_token);
  } catch (e: any) {
    const errorMsg = e.response?.data?.detail || e.message || 'Ошибка входа';
    setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  } finally {
    setLoading(false);
  }
};

  const signout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, signup, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
