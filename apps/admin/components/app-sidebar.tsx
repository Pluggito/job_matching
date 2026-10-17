"use client"

import * as React from "react"
import { LayoutDashboard, Users, Briefcase, Star, MessageSquare, BriefcaseBusiness, ClipboardList, Sliders, Bike, ShieldCheck } from 'lucide-react';
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import Link from "next/link"
import { usePathname } from "next/navigation"

const adminNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Workers Queue", href: "/workers", icon: Users },
  { name: "Hire Requests", href: "/requests", icon: ClipboardList },
  { name: "Placements", href: "/placements", icon: Briefcase },
  { name: "Employers", href: "/employers", icon: BriefcaseBusiness },
  { name: "Errands Desk", href: "/errands", icon: Bike },
  { name: "Errand Settings", href: "/settings/errands", icon: Sliders },
  { name: "Team & Invites", href: "/settings/team", icon: ShieldCheck },
  { name: "Ratings", href: "/ratings", icon: Star },
  { name: "Messages", href: "/messages", icon: MessageSquare },
]

export interface AppSidebarUser {
  name?: string;
  email: string;
  role?: string;
  adminRole?: string;
  avatar?: string;
}

export function AppSidebar({
  userEmail,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  userEmail: string;
  user?: AppSidebarUser;
}) {
  const pathname = usePathname()
  const { state } = useSidebar()

  const effectiveEmail = user?.email || userEmail;
  const effectiveName = user?.name || effectiveEmail.split("@")[0] || "admin";
  const effectiveRole = user?.adminRole ? user.adminRole.replace("_", " ") : (user?.role || "ADMIN");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-center mt-2">
          <Link href="/" className={`flex items-center gap-2 text-black font-bold tracking-tight overflow-hidden transition-all duration-200 ${state === 'collapsed' ? 'w-8 h-8' : 'w-full px-2 text-xl'}`}>
            <span className="relative flex items-center justify-center w-8 h-8 min-w-8 rounded-full overflow-hidden shrink-0 shadow-sm p-0.5">
              <Image
                src="/logo 4.png"
                alt="Staff Guru logo"
                width={32}
                height={32}
                priority
                className="w-full h-full object-contain"
              />
            </span>
            <div className={`flex items-center font-heading whitespace-nowrap transition-all duration-200 ${state === 'collapsed' ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              staff<span className="text-[var(--ng)]">guru</span><i className="text-[var(--orange)] not-italic">.</i>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 pt-4 space-y-2">
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                render={<Link href={item.href} />} 
                isActive={pathname === item.href} 
                tooltip={item.name}
                className="data-[active=true]:bg-[var(--ng)]/10 data-[active=true]:text-[var(--ng)] data-[active=true]:font-bold hover:text-[var(--ng)] transition-colors"
              >
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: effectiveName, email: effectiveEmail, role: effectiveRole, avatar: user?.avatar || "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
