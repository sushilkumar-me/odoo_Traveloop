"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Menu, Bell, LogOut } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="border-b bg-card px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search trips, activities..."
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b">
                  <p className="font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="block px-3 py-2 text-sm hover:bg-muted"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-3 py-2 text-sm hover:bg-muted"
                >
                  Settings
                </Link>
                <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}