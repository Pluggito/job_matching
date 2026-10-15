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
import { Logo } from "@/components/Logo"

export function AppSidebar({ 
  role, 
  userEmail, 
  avatarUrl,
  ...props 
}: React.ComponentProps<typeof Sidebar> & { role: Role; userEmail: string; avatarUrl?: string }) {
  const navItems = getNavItems(role)
  const pathname = usePathname()
  const { state } = useSidebar()
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center justify-center mt-2 px-2">
          <Link href="/" className="flex items-center overflow-hidden transition-all duration-200 hover:opacity-85">
            <Logo size="sm" showText={state !== 'collapsed'} />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 pt-4 space-y-2">
          {navItems.map((item) => (
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
        <NavUser user={{ name: role, email: userEmail, avatar: avatarUrl || "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
