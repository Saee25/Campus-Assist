"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ title, children }: { title: string, children: React.ReactNode }) {
  const { user } = useAuth();
  const profileInitial = user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex flex-col h-full w-full bg-white text-slate-900 overflow-hidden relative isolate page-bg app-shell-enter">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amaranth-100/20 rounded-full blur-[90px] -z-10 pointer-events-none ambient-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amaranth-50/15 rounded-full blur-[90px] -z-10 pointer-events-none ambient-blob" style={{ animationDelay: "1.5s" }}></div>

      {/* Top App Bar */}
      <header className="glass-panel z-40 sticky top-0 px-4 py-3.5 flex justify-between items-center border-b border-slate-100/70">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">{title}</h1>
        <Link href="/profile" className="flex items-center justify-center w-9 h-9 rounded-xl bg-amaranth-600 text-white font-semibold hover:bg-amaranth-700 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
          {profileInitial}
        </Link>
      </header>

      {/* Scrollable Content Area. pb-24 leaves room for BottomNav */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-0">
        {children}
      </main>
    </div>
  );
}
