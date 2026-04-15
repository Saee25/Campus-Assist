"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthAPI } from "@/lib/firebaseApi";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await AuthAPI.login({ username, password });
      login(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-bg fixed inset-0 flex items-center justify-center p-6 text-slate-100 overflow-y-auto no-scrollbar relative isolate">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-sm py-12 flex flex-col h-full min-h-[600px] justify-between">

        <div className="space-y-8">
          <Link href="/" className="inline-flex w-10 h-10 bg-slate-800/80 rounded-full items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/10 mb-2">
            <svg className="w-5 h-5 pr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </Link>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-2">Enter your credentials to access your account.</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 text-red-300 text-sm p-4 rounded-2xl border border-red-500/30 flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="form-label text-xs">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input text-lg py-3"
                  placeholder="Your username"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <label className="form-label text-xs" style={{marginBottom: 0}}>Password</label>
                  <a href="#" className="text-xs text-indigo-400 font-bold">Recovery</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input text-lg py-3"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary bg-indigo-600 text-white disabled:opacity-50"
                >
                  {loading ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Signing in...</>
                  ) : "Log In"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pb-safe">
          <p className="text-center text-sm font-medium text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-white font-bold hover:underline">Sign up</Link>
          </p>
        </div>

      </div>
    </main>
  );
}
