"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between gap-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search trips, activities..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-[#ff7a1a]/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100 rounded-xl"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff7a1a] rounded-full" />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-10 w-10 ring-4 ring-orange-100">
                <AvatarFallback className="bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="font-semibold text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
