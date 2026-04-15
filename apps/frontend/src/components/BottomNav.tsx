"use client";

import React from "react";

export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface BottomNavProps {
  currentTab: string;
  onTabChange: (id: string) => void;
  items: BottomNavItem[];
}

export default function BottomNav({ currentTab, onTabChange, items }: BottomNavProps) {
  return (
    <nav className="nav-glass fixed bottom-0 left-0 w-full z-50 px-2 py-2 pb-safe border-t border-slate-800">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {items.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center w-full py-2 space-y-1 transition-all duration-200 ${
                isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className={`relative transition-transform duration-200 ${isActive ? "scale-110" : "scale-100"}`}>
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-slate-900">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "text-indigo-400 font-bold" : ""}`}>
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
