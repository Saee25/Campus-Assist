'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'client') router.push('/dashboard/client');
      else if (user.role === 'helper') router.push('/dashboard/helper');
    }
  }, [user]);

  return (
    <main className="page-bg fixed inset-0 flex flex-col items-center justify-center p-6 text-slate-100 overflow-hidden isolate relative">
      <div className="splash-orb w-96 h-96 bg-indigo-600/30 -top-20 -right-20"></div>
      <div className="splash-orb w-80 h-80 bg-purple-600/20 bottom-10 -left-10" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-sm flex flex-col h-full relative z-10 py-12">
        {/* Top spacing */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Logo + Brand */}
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.5)] transform -rotate-6 transition-transform hover:rotate-0 duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white mb-2">Campus Assist</h1>
              <p className="text-slate-400 text-base font-medium">Instant communication between<br/>staff and support.</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full space-y-4 pb-safe pt-8">
          <Link href="/login" className="block">
            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95">
              Log In
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </Link>
          <Link href="/register" className="block">
            <button className="w-full py-4 text-center font-bold text-slate-300 hover:text-white transition-colors">
              Create an Account
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
