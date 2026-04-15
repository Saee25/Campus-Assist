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
        
        <div className="p-4">
          
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setIsAddOpen(true)}
                className="w-full py-4 bg-indigo-600/20 text-indigo-300 font-bold rounded-2xl border border-indigo-500/30 flex justify-center items-center gap-2 hover:bg-indigo-600/30 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add New Item
              </button>

              {inventory.length === 0 ? (
                <div className="py-20 text-center text-slate-500">
                  Inventory is empty. Tap above to add items.
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-8">
                  {inventory.map(item => (
                    <div key={item.id} className="card p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{item.category}</span>
                          <h3 className="text-base font-bold text-slate-100 mt-2">{item.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                        </div>
                        <button onClick={() => handleDeleteItem(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">Stock Level</span>
                        <div className="flex items-center gap-4 bg-slate-900/50 p-1 rounded-xl">
                          <button onClick={() => handleUpdateStock(item.id, item.inStock, -1)} className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 active:scale-95">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" /></svg>
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-white">{item.inStock}</span>
                          <button onClick={() => handleUpdateStock(item.id, item.inStock, 1)} className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 hover:text-emerald-400 active:scale-95">
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
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 border border-indigo-500/20 bg-indigo-500/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Missions Today</p>
                  <p className="text-3xl font-black text-indigo-400 mt-1">{todaysDelivered.length}</p>
                </div>
                <div className="card p-4 border border-purple-500/20 bg-purple-500/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
                  <p className="text-3xl font-black text-purple-400 mt-1">{Object.keys(staffDeliveries).length}</p>
                </div>
                <div className="col-span-2 card p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All-Time Requests</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-4xl font-black text-white">{orders.length}</p>
                    <span className="text-sm text-emerald-400 font-bold">+ {orders.filter(o => o.status === "Pending").length} waiting</span>
                  </div>
                </div>
              </div>

              <div className="card overflow-hidden mt-6">
                <div className="p-4 border-b border-white/5">
                  <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Top Staff Today
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                  {Object.keys(staffDeliveries).length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No deliveries completed today yet.
                    </div>
                  ) : (
                    Object.entries(staffDeliveries).sort((a,b) => b[1] - a[1]).map(([email, count], idx) => (
                      <div key={email} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-white/5">
                            {idx + 1}
                          </span>
                          <p className="font-semibold text-slate-200 text-sm">{email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-indigo-400">{count}</p>
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
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {usersList.length === 0 ? (
                <div className="py-20 flex justify-center"><span className="animate-pulse">Loading users...</span></div>
              ) : (
                <div className="flex flex-col gap-3 pb-8">
                  {usersList.sort((a,b) => b.createdAt - a.createdAt).map(u => (
                    <div key={u.id} className="card p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-100">{u.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-mono tracking-widest uppercase ${
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                          u.role === 'staff' ? 'bg-indigo-500/20 text-indigo-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {u.role}
                        </span>
                      </div>

                      {u.status === "Pending" ? (
                        <button 
                          onClick={() => approveUser(u.id)}
                          className="w-full py-2.5 bg-amber-500 text-slate-900 font-bold rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          Approve Registration
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                      ) : (
                        <div className="w-full py-2 bg-slate-900/50 text-emerald-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-500/10">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
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
          <div className="fixed inset-0 z-50 flex justify-center items-end bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="absolute inset-0" onClick={() => setIsAddOpen(false)}></div>
            <div className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Add Item</h2>
                <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="form-label">Item Name</label>
                  <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="form-input" placeholder="e.g. Projector" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Category</label>
                    <select required value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="form-input bg-slate-900 pr-8 custom-select">
                      <option value="Stationery">Stationery</option>
                      <option value="IT Accessories">IT Accs</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Misc">Misc</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Init Stock</label>
                    <input required type="number" min="0" value={newItem.inStock} onChange={e => setNewItem({...newItem, inStock: parseInt(e.target.value) || 0})} className="form-input" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <input type="text" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="form-input" placeholder="Brief info..." />
                </div>
                <button type="submit" className="btn-primary bg-indigo-600 hover:bg-indigo-500 text-white mt-4">
                  Create Item
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
