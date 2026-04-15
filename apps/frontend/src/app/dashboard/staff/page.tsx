"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import BottomNav, { BottomNavItem } from "@/components/BottomNav";
import { Order, subscribeToAllOrders, updateOrderStatus } from "@/lib/orders";
import dynamic from "next/dynamic";

const CampusMap = dynamic(() => import("@/components/CampusMap"), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-900/50 rounded-3xl animate-pulse text-indigo-400 font-medium">
      Loading Delivery Map...
    </div>
  )
});

type TabState = "queue" | "map";

export default function StaffDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabState>("queue");

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((allOrders) => {
      setOrders(allOrders);
    });
    return () => unsubscribe();
  }, []);

  const pendingOrders = orders.filter(o => o.status === "Pending");
  const myTransitOrders = orders.filter(o => o.status === "In Transit" && o.staffEmail === user?.email);
  const queue = [...myTransitOrders, ...pendingOrders];

  const handleAccept = (orderId: string) => {
    if (!user?.email) return;
    updateOrderStatus(orderId, "In Transit", user.email);
  };

  const handleDeliver = (orderId: string) => {
    updateOrderStatus(orderId, "Delivered");
  };

  const navItems: BottomNavItem[] = [
    {
      id: "queue",
      label: "Tasks",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      badge: queue.length
    },
    {
      id: "map",
      label: "Map",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
    }
  ];

  return (
    <ProtectedRoute allowedRoles={["staff"]}>
      <AppShell title={activeTab === "queue" ? "Delivery Tasks" : "Campus Radar"}>
        <div className="p-4">
          
          {/* Timeline / Queue List */}
          {activeTab === "queue" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {queue.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-xl font-bold text-slate-300">All caught up!</p>
                  <p className="text-sm mt-2 text-slate-500 max-w-xs">No active delivery requests at the moment. Take a short break.</p>
                </div>
              ) : (
                queue.map(order => (
                  <div key={order.id} className="card overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${
                          order.status === "Pending" ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded">#{order.id.slice(0, 6)}</span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xl mt-2">Room {order.roomNumber}</h4>
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {order.professorName}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-900/30">
                      <ul className="space-y-2">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm text-slate-300 items-center">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md text-xs">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-800/20 border-t border-white/5">
                      {order.status === "Pending" ? (
                        <button 
                          onClick={() => handleAccept(order.id)}
                          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]"
                        >
                          Accept Delivery
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDeliver(order.id)}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                        >
                          Mark Delivered
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Map View */}
          {activeTab === "map" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="w-full h-[calc(100vh-160px)] rounded-[2rem] overflow-hidden relative isolate z-0 border border-slate-800 shadow-2xl">
                <CampusMap />
                
                {/* Overlay instructions */}
                <div className="absolute top-4 left-4 right-4 z-[999] pointer-events-none">
                  <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-xs font-medium text-slate-200 pointer-events-auto">
                      Navigate to the requested buildings using the interactive campus map.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        <BottomNav 
          currentTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabState)}
          items={navItems}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
