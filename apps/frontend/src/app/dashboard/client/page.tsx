'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RequestAPI } from '@/lib/firebaseApi';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { ClipboardList, MapPin, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { safeNavigate } from '@/lib/safeNavigate';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [task, setTask] = useState('');
  const [location, setLocation] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const socket = useSocket();

  useEffect(() => {
    if (!user || user.role !== 'client') {
      safeNavigate(router, "/login", "replace");
      return;
    }
    fetchHistory();

    if (socket) {
      socket.on('requestUpdated', (updatedRequest: any) => {
        setRequests(prev => {
          if (!Array.isArray(prev)) return [updatedRequest];
          return prev.map(req =>
            req.id === updatedRequest.id ? { ...req, ...updatedRequest } : req
          );
        });
      });

      return () => {
        socket.off('requestUpdated');
      };
    }
  }, [user, socket, router]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const data = await RequestAPI.getRequests({ role: 'client', userId: user.id });
      setRequests(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch requests', err);
      setError('Could not load history. Please refresh.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !location || !user) return;

    setIsSubmitting(true);
    try {
      await RequestAPI.createRequest({
        senderId: user.id,
        senderName: user.name,
        task,
        location
      });
      setTask('');
      setLocation('');
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error('Failed to create request', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 pb-20 overflow-y-auto no-scrollbar page-bg">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amaranth-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-amaranth-600/20">
            {user?.name?.[0].toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none mb-1">{user?.name}</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Professor / Staff</p>
          </div>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-amaranth-600 hover:bg-amaranth-50 transition-all active:scale-95 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </header>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xs p-8 rounded-[2.5rem] shadow-2xl text-center border border-slate-50">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Logout?</h3>
            <p className="text-slate-500 text-sm mb-8">Are you sure you want to end your session?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl active:scale-95 transition-all"
              >
                No
              </button>
              <button
                onClick={logout}
                className="flex-1 py-4 bg-amaranth-600 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-amaranth-600/20"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-amaranth-50/50 border border-amaranth-100 p-4 rounded-3xl">
          <p className="text-[10px] uppercase font-bold text-amaranth-700 tracking-wider mb-1">Total Requests</p>
          <p className="text-2xl font-black text-slate-900">{Array.isArray(requests) ? requests.length : 0}</p>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-black text-amaranth-600">
            {Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0}
          </p>
        </div>
      </div>

      {/* Request Form */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amaranth-100/30 blur-3xl rounded-full -mr-10 -mt-10"></div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
            <span className="w-8 h-8 bg-amaranth-600 rounded-lg flex items-center justify-center text-xs">🚀</span>
            New Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">What do you need?</label>
              <input
                type="text"
                placeholder="e.g. Need Printouts, Clear Whiteboard..."
                className="form-input"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Where are you?</label>
              <input
                type="text"
                placeholder="e.g. Lab 1006, Cabin 402..."
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Sending...' : 'Post Request'}
            </button>
          </form>
        </div>
      </section>

      {/* History */}
      <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Request History</h2>
          <button onClick={fetchHistory} className="text-amaranth-600 text-sm font-semibold">Refresh</button>
        </div>

        <div className="space-y-4 pb-10">
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchHistory} className="text-white bg-red-600 px-3 py-1 rounded-lg">Retry</button>
            </div>
          )}

          {(!requests || !Array.isArray(requests) || requests.length === 0) ? (
            <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20 text-amaranth-600" />
              <p className="font-medium">No requests in your history yet.</p>
            </div>
          ) : (
            requests.map((req: any) => (
              <div key={req.id} className="bg-white border border-slate-100 p-4 sm:p-5 rounded-3xl transition-all hover:border-amaranth-100 group shadow-sm">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${req.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      req.status === 'accepted' ? 'bg-amber-50 text-amber-600' : 'bg-amaranth-50 text-amaranth-600'
                    }`}>
                    {req.status === 'completed' ? <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" /> :
                      req.status === 'accepted' ? <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" /> : <Clock className="w-6 h-6 sm:w-7 sm:h-7" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight break-words">{req.task}</h3>
                      <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl shrink-0 ${req.status === 'completed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' :
                          req.status === 'accepted' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {req.status}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1 max-w-full truncate"><MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{req.location}</span></span>
                      <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                      <span>{formatDistanceToNow(new Date(req.createdAt))} ago</span>
                    </div>
                    {req.helperName && (
                      <p className="text-[10px] text-slate-500 font-semibold mt-2 flex items-center gap-1">
                        <span>Serving:</span>
                        <span className="text-amaranth-600 truncate">{req.helperName}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
