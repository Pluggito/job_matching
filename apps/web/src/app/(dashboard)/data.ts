import { Briefcase, Building, FileText, Heart, Home, MessageSquare, Search, User, Users, Package, Bike } from "lucide-react";
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
      { name: "My Hires", href: "/employer/workers", icon: Users },
      { name: "Errands (Alabaru)", href: "/employer/errands", icon: Package },
      { name: "Messages", href: "/employer/messages", icon: MessageSquare },
      { name: "Company Profile", href: "/employer/profile", icon: Building },
    ];
  } else {
    // Worker (Passive flow: receives offers, runs Alabaru errands)
    return [
      { name: "Active Offers", href: "/dashboard", icon: FileText },
      { name: "Errands Hub", href: "/dashboard/errands", icon: Bike },
      { name: "My Profile", href: "/dashboard/profile", icon: User },
    ];
  }
}
