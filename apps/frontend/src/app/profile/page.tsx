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

  const roleConf = ROLE_CONFIG[userRole || ""] || { color: "text-amaranth-600", bg: "bg-amaranth-50", border: "border-amaranth-100", label: userRole || "User" };

  return (
    <ProtectedRoute>
      <AppShell title="Profile">
        <div className="p-4 space-y-6 animate-fade-in">
          
          <div className="pt-2">
            <Link href={getDashboardRoute()} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amaranth-600 transition-all bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col items-center pt-6 pb-8 border-b border-slate-50">
            <div className={`w-28 h-28 ${roleConf.bg} ${roleConf.color} rounded-[2.5rem] flex items-center justify-center text-4xl font-black mb-5 border border-white shadow-[0_12px_40px_rgba(223,36,77,0.12)] transform rotate-3`}>
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{userName || "User"}</h1>
            <span className={`inline-block text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase border ${roleConf.border} ${roleConf.bg} ${roleConf.color}`}>
              {roleConf.label}
            </span>
          </div>

          <div className="space-y-4 pt-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</p>
              <p className="text-slate-900 font-bold text-lg">{user?.email}</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group active:scale-[0.98] transition-all">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Account Security</p>
                <p className="text-slate-500 text-sm font-medium">Update password & 2FA</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-amaranth-50 group-hover:text-amaranth-600 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-4 pb-safe flex flex-col items-center">
            <button
              onClick={handleLogout}
              className="w-full py-5 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-100 active:scale-95 shadow-sm"
            >
              Sign Out
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>

            <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] pt-4">Campus Assist v2.0-pwa</span>
          </div>

        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
