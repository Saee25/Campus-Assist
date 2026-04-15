"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import BottomNav, { BottomNavItem } from "@/components/BottomNav";
import { 
  InventoryItem, 
  Order, 
  subscribeToAllOrders, 
  subscribeToInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem 
} from "@/lib/orders";
import { AppUser, subscribeToUsers, approveUser } from "@/lib/users";

type TabState = "inventory" | "analytics" | "users";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabState>("inventory");
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<AppUser[]>([]);

  const [newItem, setNewItem] = useState({ name: "", category: "Stationery", description: "", inStock: 0 });
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    const unsubInv = subscribeToInventory(setInventory);
    const unsubOrd = subscribeToAllOrders(setOrders);
    const unsubUsr = subscribeToUsers(setUsersList);
    return () => { unsubInv(); unsubOrd(); unsubUsr(); };
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category) return;
    addInventoryItem(newItem);
    setNewItem({ name: "", category: "Stationery", description: "", inStock: 0 });
    setIsAddOpen(false);
  };

  const handleUpdateStock = (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    updateInventoryItem(id, { inStock: newStock });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Delete this catalog item?")) {
      deleteInventoryItem(id);
    }
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaysDelivered = orders.filter(
    o => o.status === "Delivered" && o.timestamp >= todayStart.getTime()
  );

  const staffDeliveries: Record<string, number> = {};
  todaysDelivered.forEach(o => {
    if (o.staffEmail) {
      staffDeliveries[o.staffEmail] = (staffDeliveries[o.staffEmail] || 0) + 1;
    }
  });

  const pendingUsersCount = usersList.filter(u => u.status === "Pending").length;

  const navItems: BottomNavItem[] = [
    {
      id: "inventory",
      label: "Stock",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    },
    {
      id: "analytics",
      label: "Stats",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
    {
      id: "users",
      label: "Users",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      badge: pendingUsersCount
    }
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AppShell title={activeTab === "inventory" ? "Inventory" : activeTab === "analytics" ? "Analytics" : "Manage Users"}>
        
        <div className="p-4 space-y-6">
          
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-4 animate-fade-in">
              
              <button 
                onClick={() => setIsAddOpen(true)}
                className="w-full py-5 bg-amaranth-50 text-amaranth-600 font-black rounded-3xl border border-amaranth-100 flex justify-center items-center gap-3 hover:bg-amaranth-100 active:scale-95 transition-all shadow-sm uppercase tracking-tight text-base"
              >
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                New Catalog Item
              </button>

              {inventory.length === 0 ? (
                <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="font-bold text-slate-500">Inventory is empty.</p>
                  <p className="text-xs mt-1">Tap above to add items to the radar.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-8">
                  {inventory.map(item => (
                    <div key={item.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-lg flex flex-col gap-4 group active:scale-[0.99] transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <span className="text-[9px] font-black text-amaranth-600 bg-amaranth-50 border border-amaranth-100 px-2.5 py-1 rounded-md uppercase tracking-widest">{item.category}</span>
                          <h3 className="text-lg font-black text-slate-900 mt-3 leading-tight uppercase tracking-tight">{item.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{item.description}</p>
                        </div>
                        <button onClick={() => handleDeleteItem(item.id)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90 border border-transparent hover:border-red-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Management</span>
                        <div className="flex items-center gap-4 bg-white px-2 py-1.5 rounded-xl shadow-sm border border-slate-50">
                          <button onClick={() => handleUpdateStock(item.id, item.inStock, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amaranth-600 transition-all active:scale-90 hover:bg-slate-50">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" /></svg>
                          </button>
                          <span className="w-8 text-center text-base font-black text-slate-900">{item.inStock}</span>
                          <button onClick={() => handleUpdateStock(item.id, item.inStock, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all active:scale-90 hover:bg-slate-50">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-amaranth-100 p-5 rounded-3xl shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amaranth-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Missions Today</p>
                  <p className="text-4xl font-black text-amaranth-600 mt-2 relative z-10">{todaysDelivered.length}</p>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-lg relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Active Staff</p>
                  <p className="text-4xl font-black text-slate-900 mt-2 relative z-10">{Object.keys(staffDeliveries).length}</p>
                </div>
                <div className="col-span-2 bg-amaranth-600 p-6 rounded-[2.5rem] shadow-xl shadow-amaranth-600/20 relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-widest relative z-10">Total Network Requests</p>
                  <div className="flex items-baseline gap-3 mt-2 relative z-10">
                    <p className="text-5xl font-black text-white">{orders.length}</p>
                    <span className="text-xs text-white/80 font-bold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md">+ {orders.filter(o => o.status === "Pending").length} waiting</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl overflow-hidden mt-6 animate-fade-in">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                      <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                    Leaderboard
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Last 24h</span>
                </div>
                <div className="p-2 space-y-2">
                  {Object.keys(staffDeliveries).length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-sm font-medium">
                      Static data available. Real-time updates active.
                    </div>
                  ) : (
                    Object.entries(staffDeliveries).sort((a,b) => b[1] - a[1]).map(([email, count], idx) => (
                      <div key={email} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 group hover:bg-amaranth-50 transition-all border border-transparent hover:border-amaranth-100">
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shadow-black/5 ${
                            idx === 0 ? "bg-amber-100 text-amber-700 border border-amber-200" : 
                            idx === 1 ? "bg-slate-200 text-slate-600 border border-slate-300" :
                            "bg-white text-slate-400 border border-slate-100"
                          }`}>
                            {idx + 1}
                          </span>
                          <p className="font-bold text-slate-700 text-sm">{email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-amaranth-600">{count}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4 animate-fade-in">
              {usersList.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-amaranth-100 border-t-amaranth-600 rounded-full animate-spin"></div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Syncing User Vault...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-8">
                  {usersList.sort((a,b) => b.createdAt - a.createdAt).map(u => (
                    <div key={u.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-lg group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-50 group-hover:bg-amaranth-50 group-hover:text-amaranth-600 transition-all uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-tight uppercase tracking-tight">{u.name}</p>
                            <p className="text-xs text-slate-400 mt-1 font-medium">{u.email}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border shadow-sm ${
                          u.role === 'admin' ? 'bg-amaranth-600 text-white border-amaranth-600' :
                          u.role === 'staff' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          'bg-amaranth-50 text-amaranth-600 border-amaranth-100'
                        }`}>
                          {u.role}
                        </span>
                      </div>

                      {u.status === "Pending" ? (
                        <button 
                          onClick={() => approveUser(u.id)}
                          className="w-full py-4 bg-amber-100 text-amber-700 font-black rounded-2xl active:scale-95 transition-all text-sm flex items-center justify-center gap-3 border border-amber-200 shadow-sm hover:bg-amber-200"
                        >
                          Approve Registration
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </button>
                      ) : (
                        <div className="w-full py-3 bg-slate-50 text-emerald-600 font-black rounded-2xl text-[10px] flex items-center justify-center gap-2 border border-emerald-100 uppercase tracking-widest">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          Verified Identity
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Add Item Bottom Sheet */}
        {isAddOpen && (
          <div className="fixed inset-0 z-[60] flex justify-center items-end bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="absolute inset-0" onClick={() => setIsAddOpen(false)}></div>
            <div className="relative bg-white border border-slate-50 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Catalog Entry</h2>
                <button onClick={() => setIsAddOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-amaranth-600 transition-all active:scale-90 shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleAddItem} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 mb-2 block">Item Name</label>
                  <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="form-input py-4 text-slate-900 font-bold" placeholder="e.g. Projector" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 mb-2 block">Category</label>
                    <select required value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="form-input h-[54px] bg-slate-50 pr-8 custom-select font-bold">
                      <option value="Stationery">Stationery</option>
                      <option value="IT Accessories">IT Accs</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Misc">Misc</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 mb-2 block">Init Stock</label>
                    <input required type="number" min="0" value={newItem.inStock} onChange={e => setNewItem({...newItem, inStock: parseInt(e.target.value) || 0})} className="form-input py-4 text-slate-900 font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 mb-2 block">Description</label>
                  <input type="text" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="form-input py-4 text-slate-900 font-medium" placeholder="Brief info..." />
                </div>
                <button type="submit" className="btn-primary mt-4">
                  Add to Radar
                </button>
              </form>
            </div>
          </div>
        )}

        <BottomNav 
          currentTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabState)}
          items={navItems}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
