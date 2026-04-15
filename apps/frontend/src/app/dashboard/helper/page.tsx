'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RequestAPI } from '@/lib/firebaseApi';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { Package, User, MapPin, CheckCircle, ArrowRight, Activity } from 'lucide-react';
import { safeNavigate } from '@/lib/safeNavigate';

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
      safeNavigate(router, "/login", "replace");
      return;
    }
    fetchData();

    if (socket) {
      socket.on('newRequest', (newReq: any) => {
        if (activeTab === 'available') {
          setRequests(prev => Array.isArray(prev) ? [newReq, ...prev] : [newReq]);
        }
      });

      socket.on('requestUpdated', (updatedReq: any) => {
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
  }, [user, activeTab, socket, router]);

  const fetchData = async () => {
    if (!user) return;
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
    if (!user) return;
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
    <div className="min-h-screen bg-white text-slate-900 p-4 pb-20 flex flex-col page-bg overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-emerald-600/20">
            {user?.name?.[0].toUpperCase() || 'H'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none mb-1">{user?.name}</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Support Team / Helper</p>
          </div>
        </div>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95 shadow-sm"
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
                className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Available</p>
          <p className="text-lg font-black text-slate-900">{Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider mb-1">Active</p>
          <p className="text-lg font-black text-emerald-700">
            {Array.isArray(requests) ? requests.filter((r: any) => r.status === 'accepted').length : 0}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
          <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider mb-1">Done</p>
          <p className="text-lg font-black text-emerald-700">
            {Array.isArray(requests) ? requests.filter((r: any) => r.status === 'completed').length : 0}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100/60 p-1 rounded-2xl mb-5 shadow-inner animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <button 
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'available' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          Available
        </button>
        <button 
          onClick={() => setActiveTab('tracking')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'tracking' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          In Progress
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          History
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 space-y-3.5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold flex items-center justify-between mx-1">
                <span>{error}</span>
                <button onClick={fetchData} className="text-white bg-red-600 px-3 py-1 rounded-lg">Retry</button>
            </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading tasks...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50">
              <Package className="w-10 h-10 text-emerald-600 opacity-20" />
            </div>
            <p className="text-lg font-bold text-slate-500">No {activeTab} requests</p>
            <p className="text-xs">New tasks will appear here in real-time.</p>
          </div>
        ) : (
          requests.map((req: any) => (
            <div key={req.id} className="bg-white border border-slate-100 rounded-[1.75rem] p-4.5 shadow-sm animate-fade-in group hover:border-emerald-100 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase px-2 py-1 rounded-md">
                      #{req.id.slice(-4).toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold">
                        {formatDistanceToNow(new Date(req.createdAt))} ago
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors break-words">{req.task}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${
                  activeTab === 'available' ? 'bg-emerald-50 text-emerald-600' : 
                  activeTab === 'tracking' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {activeTab === 'available' ? <Activity className="w-5 h-5" /> : 
                   activeTab === 'tracking' ? <ArrowRight className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600/60" />
                  </div>
                  <span className="font-semibold text-sm tracking-wide break-words">{req.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <User className="w-4 h-4 text-emerald-600/60" />
                  </div>
                  <span className="font-semibold text-sm tracking-wide break-words">{req.senderName}</span>
                </div>
              </div>

              {activeTab === 'available' && (
                <button 
                  onClick={() => handleAccept(req.id)}
                  className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-emerald-700 text-base"
                >
                  Accept Request
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              {activeTab === 'tracking' && (
                <button 
                  onClick={() => handleComplete(req.id)}
                  className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-base"
                >
                  Mark Completed
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}

              {activeTab === 'history' && (
                <div className="w-full py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center text-emerald-600 font-bold flex items-center justify-center gap-2">
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
