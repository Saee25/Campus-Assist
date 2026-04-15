"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import BottomNav, { BottomNavItem } from "@/components/BottomNav";
import { 
  InventoryItem, 
  CartItem, 
  Order, 
  fetchInventoryItems, 
  createOrder, 
  subscribeToProfessorOrders
} from "@/lib/orders";

type TabState = "request" | "orders";

export default function ProfessorDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabState>("request");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  
  const [roomNumber, setRoomNumber] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const loadInventory = async () => {
    try {
      const items = await fetchInventoryItems();
      setInventory(items);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = subscribeToProfessorOrders(user.email, (orders) => {
      setActiveOrders(orders);
    });
    return () => unsubscribe();
  }, [user]);

  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(prev => prev.map(c => {
      if (c.id === itemId) {
        const newQ = c.quantity + change;
        return { ...c, quantity: newQ > 0 ? newQ : 0 };
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      await createOrder({
        professorEmail: user.email,
        professorName: user.email.split('@')[0], 
        roomNumber,
        items: cart,
        status: "Pending",
      });
      
      setCart([]);
      setRoomNumber("");
      setIsCartOpen(false);
      setActiveTab("orders"); 
    } catch (err) {
      console.error("Failed to checkout:", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems: BottomNavItem[] = [
    {
      id: "request",
      label: "Request",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
    },
    {
      id: "orders",
      label: "Orders",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      badge: activeOrders.filter(o => o.status !== "Delivered").length
    }
  ];

  return (
    <ProtectedRoute allowedRoles={["professor"]}>
      <AppShell title={activeTab === "request" ? "Request Supplies" : "Active Orders"}>
        
        <div className="p-4 space-y-6">
          {/* Request Tab */}
          {activeTab === "request" && (
            <div className="space-y-4 animate-fade-in">
              {/* Search Bar */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-11 shadow-sm border-slate-100"
                />
                <svg className="w-5 h-5 text-slate-300 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-3">
                {filteredInventory.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    No items found.
                  </div>
                ) : (
                  filteredInventory.map(item => (
                    <div key={item.id} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex justify-between items-center group active:scale-[0.98] transition-all">
                      <div className="flex-1 pr-4">
                        <span className="text-[10px] font-black text-amaranth-600 uppercase tracking-widest">{item.category}</span>
                        <h3 className="text-base font-black text-slate-900 leading-tight">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">{item.description}</p>
                      </div>
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-10 h-10 rounded-2xl bg-amaranth-50 text-amaranth-600 flex items-center justify-center hover:bg-amaranth-600 hover:text-white active:scale-95 transition-all border border-amaranth-100 shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  ))
                )}
                {/* Spacer for Floating Action Button area */}
                <div className="h-24"></div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4 animate-fade-in">
              {activeOrders.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center text-slate-400 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <svg className="w-16 h-16 text-amaranth-600 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-lg font-bold text-slate-500">No active orders</p>
                  <p className="text-xs mt-1 font-medium">Your supply requests will appear here.</p>
                </div>
              ) : (
                activeOrders.map(order => (
                  <div key={order.id} className="bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden animate-fade-in">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-start">
                      <div>
                        <p className="text-[9px] text-amaranth-600 font-black uppercase tracking-widest bg-amaranth-50 px-2 py-1 rounded inline-block mb-2">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <h3 className="font-black text-slate-900 text-xl leading-tight">Room {order.roomNumber}</h3>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                        order.status === "Pending" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                        order.status === "In Transit" ? "bg-amaranth-100 text-amaranth-700 border border-amaranth-200" :
                        order.status === "Delivered" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="p-5 bg-slate-50/50">
                      <ul className="space-y-2">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm items-center">
                            <span className="font-bold text-slate-700">{item.name}</span>
                            <span className="font-black text-[10px] bg-white border border-slate-100 px-2.5 py-1 rounded-lg text-slate-400 shadow-sm">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Floating Cart Button */}
        {cart.length > 0 && activeTab === "request" && (
          <div className="fixed bottom-24 right-4 left-4 z-40 flex justify-center animate-fade-in">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="bg-amaranth-600 hover:bg-amaranth-700 text-white rounded-[1.5rem] py-4 px-6 font-black shadow-[0_12px_40px_rgba(223,36,77,0.3)] flex items-center gap-4 w-full max-w-sm transition-transform active:scale-95"
            >
              <span className="bg-white text-amaranth-600 w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm">{totalItemsInCart}</span>
              <span className="flex-1 text-left uppercase tracking-tight">View Request</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {/* Cart Bottom Sheet */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex justify-center items-end bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            {/* Click away dismiss */}
            <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>
            
            <div className="relative bg-white border border-slate-50 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl flex flex-col max-h-[85vh] animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Summary
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-amaranth-600 transition-all active:scale-90 shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="flex-1 pr-3">
                      <p className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-inner border border-slate-100">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amaranth-600 bg-slate-50 rounded-xl transition-all active:scale-90">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" /></svg>
                      </button>
                      <span className="font-black text-sm text-slate-900 w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amaranth-600 bg-slate-50 rounded-xl transition-all active:scale-90">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-slate-50">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 mb-2 block">Delivery Room</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter Room Number..."
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="form-input text-lg font-black py-4 uppercase"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isCheckingOut || !roomNumber}
                  className="btn-primary"
                >
                  {isCheckingOut ? "Sending..." : "Confirm Request"}
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
