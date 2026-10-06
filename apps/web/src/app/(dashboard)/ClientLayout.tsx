"use client";

import { Role } from "@repo/shared";
import { Bell } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function ClientLayout({ 
  children, 
  role,
  userEmail
}: { 
  children: React.ReactNode;
  role: Role;
  userEmail: string;
}) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} userEmail={userEmail} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 bg-white border-b border-black/10 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-black" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="font-semibold text-lg text-black hidden sm:block">
              {role === "EMPLOYER" ? "Employer Portal" : "Worker Dashboard"}
            </div>
            <div className="font-semibold text-lg text-black sm:hidden">
              staffguru
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-black transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--ng)] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-black/10">
              <div className="w-8 h-8 rounded-full bg-[var(--ng)] text-white font-bold flex items-center justify-center text-sm uppercase shrink-0 shadow-sm shadow-[var(--ng)]/20">
                {userEmail.substring(0, 2)}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-black">{userEmail}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7f5]">
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto h-full">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
