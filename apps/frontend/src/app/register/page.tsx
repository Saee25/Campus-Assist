"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthAPI } from "@/lib/firebaseApi";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client"); // 'client' or 'helper'
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await AuthAPI.signup({ name, username, password, role });
      setSuccess(true);
      setTimeout(() => {
        login(user);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-bg fixed inset-0 flex items-center justify-center p-6 text-slate-900 overflow-y-auto no-scrollbar relative isolate">
      <div className="absolute top-0 left-0 w-80 h-80 bg-amaranth-100/30 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-sm py-12 flex flex-col h-full min-h-[700px] justify-between relative z-10 animate-fade-in">

        <div className="space-y-6">
          <Link href="/" className="inline-flex w-10 h-10 bg-white rounded-full items-center justify-center text-slate-500 hover:text-amaranth-600 transition-all border border-slate-100 shadow-sm mb-2">
            <svg className="w-5 h-5 pr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </Link>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
            <p className="text-slate-500 text-sm mt-2">Join the communication platform.</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-600 text-sm p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Account created! Redirecting...
              </div>
            )}

            <form className="space-y-4 pt-2" onSubmit={handleRegister}>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Dr. John"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="john_doe"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block ml-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input appearance-none bg-slate-50 border-slate-200 text-slate-900"
                >
                  <option value="client">Main Person (Professor/Employee)</option>
                  <option value="helper">Helper (Peon/Assistance)</option>
                </select>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="btn-primary"
                >
                  {loading ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Creating...</>
                  ) : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pb-safe pt-6">
          <p className="text-center text-sm font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-amaranth-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>

      </div>
    </main>
  );
}
