"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeNavigate } from "@/lib/safeNavigate";

interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userRole: string | null;
  loading: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Redirect based on role
    if (userData.role === 'client') {
      safeNavigate(router, "/dashboard/client");
    } else {
      safeNavigate(router, "/dashboard/helper");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    safeNavigate(router, "/login");
  };

  return (
    <AuthContext.Provider value={{ user, userRole: user?.role || null, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
