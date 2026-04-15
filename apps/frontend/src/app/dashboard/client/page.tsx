'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RequestAPI } from '@/lib/firebaseApi';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { ClipboardList, MapPin, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

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
      router.push('/login');
      return;
    }
    fetchHistory();

    if (socket) {
      socket.on('requestUpdated', (updatedRequest) => {
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
  }, [user, socket]);

  const fetchHistory = async () => {
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
    if (!task || !location) return;

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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/20">
            {user?.name?.[0].toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none mb-1">{user?.name}</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Professor / Staff</p>
          </div>
        </div>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </header>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-xs p-8 rounded-[2.5rem] shadow-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">Logout?</h3>
            <p className="text-slate-400 text-sm mb-8">Are you sure you want to end your session?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 bg-slate-800 text-slate-300 font-bold rounded-2xl active:scale-95 transition-all"
              >
                No
              </button>
              <button 
                onClick={logout}
                className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-3xl">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Total Requests</p>
          <p className="text-2xl font-black text-white">{Array.isArray(requests) ? requests.length : 0}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-4 rounded-3xl">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-black text-indigo-400">
            {Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0}
          </p>
        </div>
      </div>

      {/* Request Form */}
      <section className="mb-10">
        <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-xs">🚀</span>
            New Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">What do you need?</label>
              <input 
                type="text" 
                placeholder="e.g. Need Printouts, Clear Whiteboard..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Where are you?</label>
              <input 
                type="text" 
                placeholder="e.g. Lab 1006, Cabin 402..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Sending...' : 'Post Request'}
            </button>
          </form>
        </div>
      </section>

      {/* History */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Request History</h2>
          <button onClick={fetchHistory} className="text-indigo-400 text-sm font-medium">Refresh</button>
        </div>
        
        <div className="space-y-4 pb-10">
          {error && (
             <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-bold flex items-center justify-between">
                <span>{error}</span>
                <button onClick={fetchHistory} className="text-white bg-red-500 px-3 py-1 rounded-lg">Retry</button>
             </div>
          )}

          {(!requests || !Array.isArray(requests) || requests.length === 0) ? (
            <div className="text-center py-20 text-slate-500 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No requests in your history yet.</p>
            </div>
          ) : (
            requests.map((req: any) => (
              <div key={req.id} className="bg-slate-900/50 border border-slate-800/50 p-5 rounded-3xl flex items-center justify-between transition-all hover:bg-slate-900 group">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                    req.status === 'accepted' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {req.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : 
                     req.status === 'accepted' ? <PlayCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg leading-tight mb-1">{req.task}</h3>
                    <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span>{formatDistanceToNow(new Date(req.createdAt))} ago</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl inline-block ${
                    req.status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                    req.status === 'accepted' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {req.status}
                  </div>
                  {req.helperName && (
                    <p className="text-[10px] text-slate-500 font-bold mt-2 flex items-center justify-end gap-1">
                      Serving: <span className="text-slate-300">{req.helperName}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
