import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, Sparkles } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { headers } from "next/headers";
import { getAdminUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Portal | Staff Guru",
};

export const viewport: Viewport = {
  themeColor: "#008751",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAuthPage = pathname.startsWith("/login");

  // Render isolated full-page auth layout without sidebar shell
  if (isAuthPage) {
    return (
      <html lang="en" className="h-full antialiased font-sans">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full flex flex-col font-sans bg-[#f8faf9] text-[var(--ink)]">
          <TooltipProvider>{children}</TooltipProvider>
        </body>
      </html>
    );
  }

  // Authenticated Admin Dashboard Layout
  const admin = await getAdminUser().catch(() => null);
  const userEmail = admin?.email || "admin@staffguru.com";
  const userName = admin?.fullName || userEmail.split("@")[0] || "admin";
  const isSuperAdmin = admin?.adminRole === "SUPER_ADMIN";
  const adminRoleLabel = isSuperAdmin ? "SUPER ADMIN" : "ADMIN";
  const initials = (userName || "AD").slice(0, 2).toUpperCase();

  return (
    <html lang="en" className="h-full antialiased font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar
              userEmail={userEmail}
              user={{
                name: userName,
                email: userEmail,
                role: "ADMIN",
                adminRole: admin?.adminRole || "ADMIN",
              }}
            />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 bg-white border-b border-black/10 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1 text-black" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <div className="font-semibold text-lg text-black hidden sm:block">
                    Admin Portal
                  </div>
                  <div className="font-semibold text-lg text-black sm:hidden">
                    admin
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button className="relative p-2 text-muted-foreground hover:text-black transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--ng)] rounded-full"></span>
                  </button>
                  <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-black/10">
                    <div className="w-8 h-8 rounded-full bg-[var(--ng)] text-white font-bold flex items-center justify-center text-sm uppercase shrink-0 shadow-sm shadow-[var(--ng)]/20">
                      {initials}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-black leading-tight">{userName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`text-[10px] font-bold tracking-wider px-1.5 py-0.2 rounded-md ${
                            isSuperAdmin
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          {isSuperAdmin && <Sparkles size={10} className="inline mr-0.5 -mt-0.5" />}
                          {adminRoleLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7f5]">
                <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
                  <div className="max-w-6xl mx-auto h-full">
                    {children}
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
