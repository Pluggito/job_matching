import { Briefcase, Building, FileText, Heart, Home, MessageSquare, Search, User, Users } from "lucide-react";
import { Role } from "@repo/shared";

export type NavItem = {
  name: string;
  href: string;
  icon: any;
};

export function getNavItems(role: Role): NavItem[] {
  if (role === "EMPLOYER") {
    return [
      { name: "Overview", href: "/employer", icon: Home },
      { name: "Employed Workers", href: "/employer/workers", icon: Users },
      { name: "Find Workers", href: "/employer/search", icon: Search },
      { name: "Messages", href: "/employer/messages", icon: MessageSquare },
      { name: "Company Profile", href: "/employer/profile", icon: Building },
    ];
  } else {
    // Worker
    return [
      { name: "Discover Work", href: "/dashboard/discover", icon: Search },
      { name: "My Applications", href: "/dashboard", icon: FileText },
      { name: "Saved Jobs", href: "/dashboard/saved", icon: Heart },
      { name: "My Profile", href: "/dashboard/profile", icon: User },
    ];
  }
}
