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
    <nav className="nav-glass fixed bottom-0 left-0 w-full z-50 px-2 py-2 pb-safe">
      <div className="flex justify-around items-center max-w-md mx-auto gap-1">
        {items.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center w-full py-2 space-y-1 transition-all duration-300 rounded-xl ${
                isActive ? "text-amaranth-600 bg-amaranth-50/70" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`relative transition-transform duration-300 ${isActive ? "scale-105 -translate-y-0.5" : "scale-100"}`}>
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amaranth-600 text-white text-[10px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full border border-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-tight uppercase ${isActive ? "text-amaranth-600" : ""}`}>
                {item.label}
              </span>
              
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute -bottom-1 w-7 h-0.5 bg-amaranth-600 rounded-full animate-fade-in"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
