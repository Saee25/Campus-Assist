export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "professor" | "staff" | "admin";
  status: "Pending" | "Verified";
  createdAt: number;
}

const DUMMY_USERS: AppUser[] = [
  { id: "u1", name: "Prof. John Doe", email: "johndoe@tsec.edu", role: "professor", status: "Verified", createdAt: Date.now() - 86400000 },
  { id: "u2", name: "Support Bob", email: "bob.staff@tsec.edu", role: "staff", status: "Verified", createdAt: Date.now() - 172800000 },
  { id: "u3", name: "Alice Admin", email: "alice.admin@tsec.edu", role: "admin", status: "Verified", createdAt: Date.now() - 259200000 },
  { id: "u4", name: "Prof. Jane Smith", email: "janesmith@tsec.edu", role: "professor", status: "Pending", createdAt: Date.now() - 3600000 },
];

const getLocalUsers = (): AppUser[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("mock_users");
  if (!stored) {
    localStorage.setItem("mock_users", JSON.stringify(DUMMY_USERS));
    return DUMMY_USERS;
  }
  return JSON.parse(stored);
};

const saveLocalUsers = (users: AppUser[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("mock_users", JSON.stringify(users));
  window.dispatchEvent(new Event("mock_users_updated"));
};

export const subscribeToUsers = (callback: (users: AppUser[]) => void) => {
  const notify = () => callback(getLocalUsers());
  notify();

  if (typeof window === "undefined") return () => {};

  const localListener = () => notify();
  const storageListener = (e: StorageEvent) => {
    if (e.key === "mock_users") notify();
  };

  window.addEventListener("mock_users_updated", localListener);
  window.addEventListener("storage", storageListener);

  return () => {
    window.removeEventListener("mock_users_updated", localListener);
    window.removeEventListener("storage", storageListener);
  };
};

export const approveUser = (id: string) => {
  const users = getLocalUsers();
  const updated = users.map(u => u.id === id ? { ...u, status: "Verified" as const } : u);
  saveLocalUsers(updated);
};
