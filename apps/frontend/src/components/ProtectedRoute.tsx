"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { safeNavigate } from "@/lib/safeNavigate";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        safeNavigate(router, "/login", "replace");
      } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        if (userRole === "professor") safeNavigate(router, "/dashboard/professor", "replace");
        else if (userRole === "staff") safeNavigate(router, "/dashboard/staff", "replace");
        else if (userRole === "admin") safeNavigate(router, "/dashboard/admin", "replace");
        else safeNavigate(router, "/profile", "replace");
      }
    }
  }, [user, userRole, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (!user || (allowedRoles && userRole && !allowedRoles.includes(userRole))) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
