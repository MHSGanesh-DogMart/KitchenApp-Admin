"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  Globe,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessagesSquare,
  Receipt,
  Settings,
  Star,
  Ticket,
  Users,
  Wallet,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const primary: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Cooks", href: "/cooks", icon: ChefHat },
  { label: "Orders", href: "/orders", icon: Receipt },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Payouts", href: "/payouts", icon: Wallet },
  { label: "City Map", href: "/cities", icon: Globe },
];

const secondary: NavItem[] = [
  { label: "Coupons", href: "/coupons", icon: Ticket },
  { label: "Cuisines", href: "/cuisines", icon: UtensilsCrossed },
  { label: "Reviews", href: "/reviews", icon: Star },
  { label: "Community", href: "/community", icon: MessagesSquare },
  { label: "Broadcasts", href: "/broadcasts", icon: Megaphone },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-ink text-white">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-white/[0.06]"
      >
        <div className="h-10 w-10 rounded-xl bg-primary grid place-items-center text-xl">
          🏠
        </div>
        <div>
          <p className="font-display font-bold leading-none text-[15px] tracking-tight">
            Padosi
          </p>
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-white/45 mt-1">
            Admin
          </p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {primary.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        <p className="px-3 pt-5 pb-2 text-[10px] uppercase tracking-[0.18em] text-white/35 font-display font-bold">
          Operations
        </p>
        {secondary.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* Admin profile + signout */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 px-2 pb-3">
          <div className="h-9 w-9 rounded-full bg-primary text-white grid place-items-center text-[13px] font-display font-bold">
            HM
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium truncate">Hemanth</p>
            <p className="text-[11px] text-white/45 truncate">Super admin</p>
          </div>
        </div>
        <Link
          href="/login"
          className="nav-item w-full justify-between"
        >
          <span className="flex items-center gap-3">
            <LogOut className="h-4 w-4" />
            Sign out
          </span>
        </Link>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn("nav-item", active && "nav-item-active")}
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} />
      <span>{item.label}</span>
    </Link>
  );
}
