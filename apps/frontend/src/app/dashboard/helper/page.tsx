'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RequestAPI } from '@/lib/firebaseApi';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { Package, User, MapPin, CheckCircle, ArrowRight, Activity } from 'lucide-react';

export default function HelperDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('available'); // available, tracking, history
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const socket = useSocket();

  useEffect(() => {
    if (!user || user.role !== 'helper') {
      router.push('/login');
      return;
    }
    fetchData();

    if (socket) {
      socket.on('newRequest', (newReq) => {
        if (activeTab === 'available') {
          setRequests(prev => Array.isArray(prev) ? [newReq, ...prev] : [newReq]);
        }
      });

      socket.on('requestUpdated', (updatedReq) => {
        // If it's accepted by someone else and we are in available, remove it
        if (updatedReq.status === 'accepted' && updatedReq.helperId !== user.id) {
            setRequests(prev => Array.isArray(prev) ? prev.filter(r => r.id !== updatedReq.id) : []);
        }
        // If we accepted/completed it, it's already handled by handleAccept/handleComplete (state transition)
        // But for others, status might change
      });

      return () => {
        socket.off('newRequest');
        socket.off('requestUpdated');
      };
    }
  }, [user, activeTab, socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === 'available') {
        data = await RequestAPI.getRequests({ role: 'helper', status: 'pending' });
      } else if (activeTab === 'tracking') {
        data = await RequestAPI.getRequests({ role: 'helper', status: 'accepted', userId: user.id });
      } else if (activeTab === 'history') {
        data = await RequestAPI.getRequests({ role: 'helper', status: 'completed', userId: user.id });
      }
      setRequests(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch data', err);
      setError('Could not load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await RequestAPI.acceptRequest(id, { helperId: user.id, helperName: user.name });
      setActiveTab('tracking');
    } catch (err) {
      console.error('Failed to accept request', err);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await RequestAPI.completeRequest(id);
      setActiveTab('history');
    } catch (err) {
      console.error('Failed to complete request', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/20">
            {user?.name?.[0].toUpperCase() || 'H'}
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none mb-1">{user?.name}</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Support Team / Helper</p>
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
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Available</p>
          <p className="text-xl font-black text-white">{Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Active</p>
          <p className="text-xl font-black text-indigo-400">
            {Array.isArray(requests) ? requests.filter((r: any) => r.status === 'accepted').length : 0}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Done</p>
          <p className="text-xl font-black text-emerald-400">
            {Array.isArray(requests) ? requests.filter((r: any) => r.status === 'completed').length : 0}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-6 border border-white/5">
        <button 
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'available' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          Available
        </button>
        <button 
          onClick={() => setActiveTab('tracking')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'tracking' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          In Progress
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
        >
          History
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar space-y-4">
        {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-bold flex items-center justify-between mx-1">
                <span>{error}</span>
                <button onClick={fetchData} className="text-white bg-red-500 px-3 py-1 rounded-lg">Retry</button>
            </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold text-sm">Loading tasks...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50 shadow-inner">
              <Package className="w-10 h-10" />
            </div>
            <p className="text-lg font-bold text-slate-400">No {activeTab} requests</p>
            <p className="text-sm">New tasks will appear here in real-time.</p>
          </div>
        ) : (
          requests.map((req: any) => (
            <div key={req.id} className="bg-slate-900/80 border border-white/5 rounded-[2rem] p-6 shadow-2xl animate-fade-in group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase px-2 py-1 rounded-md">
                      #{req.id.slice(-4).toUpperCase()}
                    </span>
                    <span className="text-slate-500 text-[10px] font-bold">
                        {formatDistanceToNow(new Date(req.createdAt))} ago
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{req.task}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${
                  activeTab === 'available' ? 'bg-indigo-500/10 text-indigo-500' : 
                  activeTab === 'tracking' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {activeTab === 'available' ? <Activity className="w-6 h-6" /> : 
                   activeTab === 'tracking' ? <ArrowRight className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">{req.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">{req.senderName}</span>
                </div>
              </div>

              {activeTab === 'available' && (
                <button 
                  onClick={() => handleAccept(req.id)}
                  className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-100 uppercase tracking-tighter text-lg"
                >
                  Accept & Start
                  <ArrowRight className="w-6 h-6" />
                </button>
              )}

              {activeTab === 'tracking' && (
                <button 
                  onClick={() => handleComplete(req.id)}
                  className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tighter text-lg"
                >
                  Mark as Completed
                  <CheckCircle className="w-6 h-6" />
                </button>
              )}

              {activeTab === 'history' && (
                <div className="w-full py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Task Successfully Completed
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
