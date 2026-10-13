"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, UserIcon, SettingsIcon, BellIcon, LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    role?: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const basePath = user.name === "EMPLOYER" ? "/employer" : user.name === "ADMIN" ? "/admin" : "/worker"

  const localPart = user.email ? user.email.split("@")[0] : "admin"
  const displayName = user.name && user.name !== "ADMIN" && user.name !== "EMPLOYER" ? user.name : localPart
  const initials = (displayName || "AD").slice(0, 2).toUpperCase()
  const roleLabel = user.role || "ADMIN"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback className="rounded-full bg-[var(--ng)] text-white font-bold text-xs uppercase">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-black">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground uppercase tracking-wider">{roleLabel}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit min-w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={user.avatar} alt={displayName} />
                    <AvatarFallback className="rounded-full bg-[var(--ng)] text-white font-bold text-xs uppercase">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-black">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push(`${basePath}/profile`)} className="py-2.5 cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`${basePath}/settings`)} className="py-2.5 cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`${basePath}/notifications`)} className="py-2.5 cursor-pointer">
                <BellIcon className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={async () => { 
                const { logoutAdminAction } = await import("@/lib/auth-actions");
                await logoutAdminAction();
                window.location.href = "/login";
              }} 
              className="py-2.5 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
