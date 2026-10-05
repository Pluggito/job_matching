"use client";

import { Role } from "@repo/shared";
import Sidebar from "./Sidebar";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ClientLayout({ 
  children, 
  role,
  userEmail
}: { 
  children: React.ReactNode;
  role: Role;
  userEmail: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--paper)] flex overflow-hidden">
      
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar role={role} onLinkClick={() => setIsSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[var(--line)] flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-[var(--ink)] hover:bg-[var(--canvas)] rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="font-semibold text-lg text-[var(--ink)] hidden sm:block">
              {role === "EMPLOYER" ? "Employer Portal" : "Worker Dashboard"}
            </div>
            <div className="font-semibold text-lg text-[var(--ink)] sm:hidden">
              staffguru
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-[var(--ink)] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-[var(--line)]">
              <div className="w-8 h-8 rounded-full bg-[var(--lime)] text-[var(--ink)] font-bold flex items-center justify-center text-sm uppercase shrink-0">
                {userEmail.substring(0, 2)}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-[var(--ink)]">{userEmail}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
