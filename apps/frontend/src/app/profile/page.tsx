"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";

const ROLE_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  professor: { color: "text-blue-300", bg: "bg-blue-500/20", border: "border-blue-500/30", label: "Professor" },
  staff:     { color: "text-indigo-300", bg: "bg-indigo-500/20", border: "border-indigo-500/30", label: "Support Staff" },
  admin:     { color: "text-purple-300", bg: "bg-purple-500/20", border: "border-purple-500/30", label: "Administrator" },
};

export default function Profile() {
  const { user, userRole, mockLogout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (user) {
      setUserName(user.email?.split('@')[0] || "Unknown");
    }
  }, [user]);

  const handleLogout = async () => {
    mockLogout();
    router.push("/login");
  };

  const getDashboardRoute = () => {
    if (userRole === "professor") return "/dashboard/professor";
    if (userRole === "staff") return "/dashboard/staff";
    if (userRole === "admin") return "/dashboard/admin";
    return "/";
  };

  const roleConf = ROLE_CONFIG[userRole || ""] || { color: "text-slate-300", bg: "bg-slate-500/20", border: "border-slate-500/30", label: userRole || "Unknown" };

  return (
    <ProtectedRoute>
      <AppShell title="Profile">
        <div className="p-4 space-y-6">
          
          <div className="pt-2">
            <Link href={getDashboardRoute()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              Back to App
            </Link>
          </div>

          <div className="flex flex-col items-center pt-6 pb-6 border-b border-white/5">
            <div className={`w-28 h-28 ${roleConf.bg} ${roleConf.color} rounded-[2rem] flex items-center justify-center text-4xl font-black mb-5 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]`}>
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{userName || "User"}</h1>
            <span className={`inline-block mt-3 text-[10px] font-bold px-3 py-1 rounded tracking-widest uppercase border ${roleConf.border} ${roleConf.bg} ${roleConf.color}`}>
              {roleConf.label}
            </span>
          </div>

          <div className="space-y-4">
            <div className="card p-4">
              <p className="form-label">Email Address</p>
              <p className="text-white font-semibold text-lg">{user?.email}</p>
            </div>
            
            <div className="card p-4 flex justify-between items-center bg-slate-900/50">
              <div>
                <p className="form-label">Account Security</p>
                <p className="text-slate-400 text-sm">Update password & 2FA</p>
              </div>
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
          </div>

          <div className="pt-8 space-y-3 pb-safe">
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-500/20 active:scale-95"
            >
              Sign Out
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>

            <p className="text-center text-xs text-slate-600 mt-6 font-mono">TSEC Express v2.0-pwa</p>
          </div>

        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
