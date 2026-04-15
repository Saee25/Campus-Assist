"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ title, children }: { title: string, children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-50 overflow-hidden relative isolate">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Top App Bar */}
      <header className="glass-panel z-40 sticky top-0 px-5 py-4 flex justify-between items-center border-b-0">
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        <Link href="/profile" className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-bold hover:bg-indigo-500/30 transition-colors">
          {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
        </Link>
      </header>

      {/* Scrollable Content Area. pb-24 leaves room for BottomNav */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-0">
        {children}
      </main>
    </div>
  );
}
