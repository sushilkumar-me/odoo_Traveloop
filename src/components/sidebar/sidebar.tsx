"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Plane, LayoutDashboard, Map, User, Settings, Search, Globe } from "lucide-react";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Search, label: "Explore Cities", href: "/search/cities" },
  { icon: Globe, label: "Discover Activities", href: "/search/activities" },
  { icon: Map, label: "My Trips", href: "/dashboard/trips" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Logo */}
      <div className="px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Traveloop</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#ff7a1a] text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t">
        <p className="text-xs text-gray-400 text-center">© 2025 Traveloop</p>
      </div>
    </div>
  );
}