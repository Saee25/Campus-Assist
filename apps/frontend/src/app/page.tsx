'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { safeNavigate } from "@/lib/safeNavigate";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === "client") safeNavigate(router, "/dashboard/client", "replace");
      else if (user.role === "helper") safeNavigate(router, "/dashboard/helper", "replace");
    }
  }, [user, router]);

  return (
    <main className="landing-bg fixed inset-0 flex flex-col items-center justify-center p-6 text-slate-900 overflow-hidden isolate relative">
      <div className="absolute top-[-12%] right-[-8%] w-[26rem] h-[26rem] bg-amber-200/45 rounded-full blur-[110px] pointer-events-none ambient-blob"></div>
      <div className="absolute bottom-[-14%] left-[-12%] w-[24rem] h-[24rem] bg-yellow-100/55 rounded-full blur-[110px] pointer-events-none ambient-blob" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-sm flex flex-col h-full relative z-10 py-12">
        {/* Top spacing */}
        <div className="flex-1 flex flex-col justify-center animate-fade-in">
          {/* Logo + Brand */}
          <div className="text-center space-y-6">
            <div className="mx-auto w-28 h-28 bg-white/95 border border-amber-100 rounded-[2.5rem] flex flex-col items-center justify-center shadow-[0_14px_38px_rgba(146,64,14,0.14)] transition-transform duration-500 scale-110 animate-logo-float">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-black tracking-tight">CA</span>
              </div>
              <span className="mt-1.5 text-[10px] font-semibold text-amber-700 tracking-[0.14em]">ASSIST</span>
            </div>
            <div className="pt-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Campus Assist</h1>
              <p className="text-slate-600 text-base font-semibold">Instant communication between<br />staff and support.</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full space-y-4 pb-safe pt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link href="/login" className="block">
            <button className="w-full py-4 bg-gradient-to-r from-rose-600 to-amber-500 text-white rounded-2xl font-bold shadow-[0_10px_20px_rgba(180,83,9,0.25)] flex items-center justify-center gap-2 hover:from-rose-700 hover:to-amber-600 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
              Log In
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </Link>
          <Link href="/register" className="block text-center">
            <span className="font-bold text-slate-600 hover:text-rose-600 transition-colors py-2 block">
              Create an Account
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
