"use client"

import * as React from "react"
import { Role } from "@repo/shared"
import { getNavItems } from "@/app/(dashboard)/data"
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

export function AppSidebar({ role, userEmail, ...props }: React.ComponentProps<typeof Sidebar> & { role: Role, userEmail: string }) {
  const navItems = getNavItems(role)
  const pathname = usePathname()
  const { state } = useSidebar()
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-center mt-2">
          <Link href="/" className={`flex items-center gap-2 text-black font-bold tracking-tight overflow-hidden transition-all duration-200 ${state === 'collapsed' ? 'w-8 h-8' : 'w-full px-2 text-xl'}`}>
            <span className="flex items-center justify-center w-8 h-8 min-w-8 rounded-lg bg-[var(--ng)] text-white font-bold text-sm tracking-tighter shrink-0 shadow-sm shadow-[var(--ng)]/20">sg</span>
            <div className={`flex whitespace-nowrap transition-all duration-200 ${state === 'collapsed' ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              staff<span className="text-[var(--ng-bright)]">guru</span><i className="text-[var(--ng-bright)] not-italic">.</i>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 pt-4 space-y-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton render={<Link href={item.href} />} isActive={pathname === item.href} tooltip={item.name}>
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: role, email: userEmail, avatar: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
