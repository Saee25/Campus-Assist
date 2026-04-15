export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  inStock: number;
}

export interface CartItem extends InventoryItem {
  quantity: number;
}

export interface Order {
  id: string;
  professorEmail: string;
  professorName: string;
  roomNumber: string;
  items: CartItem[];
  status: "Pending" | "In Transit" | "Delivered";
  timestamp: any;
  staffEmail?: string;
}

const DUMMY_ITEMS: InventoryItem[] = [
  { id: "1", name: "Whiteboard Markers (Pack of 4)", category: "Stationery", description: "Blue, Black, Red, Green", inStock: 50 },
  { id: "2", name: "A4 Printing Paper (Ream)", category: "Stationery", description: "500 sheets of A4 paper", inStock: 100 },
  { id: "3", name: "HDMI Cable (2m)", category: "IT Accessories", description: "Standard HDMI connection cable", inStock: 15 },
  { id: "4", name: "Projector Remote", category: "IT Accessories", description: "Universal projector remote", inStock: 10 },
  { id: "5", name: "Duster", category: "Stationery", description: "Standard whiteboard duster", inStock: 30 },
];

const getLocalInventory = (): InventoryItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_inventory");
  if (!stored) {
    localStorage.setItem("mock_inventory", JSON.stringify(DUMMY_ITEMS));
    return DUMMY_ITEMS;
  }
  return JSON.parse(stored);
};

const saveLocalInventory = (items: InventoryItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_inventory", JSON.stringify(items));
  window.dispatchEvent(new Event("mock_inventory_updated"));
};

export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  return getLocalInventory();
};

export const subscribeToInventory = (callback: (items: InventoryItem[]) => void) => {
  const notify = () => callback(getLocalInventory());
  notify();

  if (typeof window === "undefined") return () => {};

  const localListener = () => notify();
  const storageListener = (e: StorageEvent) => {
    if (e.key === "mock_inventory") notify();
  };

  window.addEventListener("mock_inventory_updated", localListener);
  window.addEventListener("storage", storageListener);

  return () => {
    window.removeEventListener("mock_inventory_updated", localListener);
    window.removeEventListener("storage", storageListener);
  };
};

export const addInventoryItem = (item: Omit<InventoryItem, "id">) => {
  const newItems = [...getLocalInventory(), { ...item, id: "item_" + Date.now() }];
  saveLocalInventory(newItems);
};

export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
  const items = getLocalInventory().map(item => item.id === id ? { ...item, ...updates } : item);
  saveLocalInventory(items);
};

export const deleteInventoryItem = (id: string) => {
  const items = getLocalInventory().filter(item => item.id !== id);
  saveLocalInventory(items);
};

const getLocalOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("mock_orders");
  return data ? JSON.parse(data) : [];
};

const saveLocalOrders = (orders: Order[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_orders", JSON.stringify(orders));
  window.dispatchEvent(new Event("mock_orders_updated"));
};

export const createOrder = async (orderData: Omit<Order, "id" | "timestamp">) => {
  const newOrder: Order = {
    ...orderData,
    id: "mock_order_" + Date.now(),
    timestamp: Date.now()
  };
  
  const currentOrders = getLocalOrders();
  saveLocalOrders([newOrder, ...currentOrders]);
  
  return newOrder.id;
};

export const subscribeToProfessorOrders = (
  email: string, 
  callback: (orders: Order[]) => void
) => {
  const updateOrders = () => {
    const orders = getLocalOrders().filter(o => o.professorEmail === email);
    callback(orders);
  };

  updateOrders();

  if (typeof window === "undefined") return () => {};

  const listener = () => updateOrders();
  window.addEventListener("mock_orders_updated", listener);

  const storageListener = (e: StorageEvent) => {
    if (e.key === "mock_orders") updateOrders();
  };
  window.addEventListener("storage", storageListener);

  return () => {
    window.removeEventListener("mock_orders_updated", listener);
    window.removeEventListener("storage", storageListener);
  };
};

export const updateOrderStatus = (orderId: string, status: Order["status"], staffEmail?: string) => {
  const currentOrders = getLocalOrders();
  const updatedOrders = currentOrders.map(o => {
    if (o.id === orderId) {
      if (staffEmail) {
        return { ...o, status, staffEmail }; // Adding pseudo staffEmail prop
      }
      return { ...o, status };
    }
    return o;
  });
  saveLocalOrders(updatedOrders);
};

export const subscribeToAllOrders = (
  callback: (orders: Order[]) => void
) => {
  const updateOrders = () => {
    callback(getLocalOrders());
  };

  updateOrders();

  if (typeof window === "undefined") return () => {};

  const listener = () => updateOrders();
  window.addEventListener("mock_orders_updated", listener);

  const storageListener = (e: StorageEvent) => {
    if (e.key === "mock_orders") updateOrders();
  };
  window.addEventListener("storage", storageListener);

  return () => {
    window.removeEventListener("mock_orders_updated", listener);
    window.removeEventListener("storage", storageListener);
  };
};

export const seedDummyItems = async () => {
  console.log("Mock data already seeded locally");
};
