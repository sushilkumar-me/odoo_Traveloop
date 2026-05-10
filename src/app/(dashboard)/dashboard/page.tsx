import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Wallet,
  Users,
  SlidersHorizontal,
  ArrowUpDown,
  Plane,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      trips: {
        orderBy: { startDate: "asc" },
        take: 10,
      },
      budgets: {
        include: {
          expenses: true,
        },
      },
    },
  });

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // Calculate stats
  const totalTrips = user?.trips.length || 0;
  const now = new Date();
  const upcomingTrips = user?.trips.filter((trip) => new Date(trip.startDate) > now).length || 0;
  const totalBudget = user?.budgets.reduce((sum, b) => sum + b.totalAmount, 0) || 0;
  const totalSpent =
    user?.budgets.reduce((sum, b) => sum + b.expenses.reduce((s, e) => s + e.amount, 0), 0) || 0;

  // Destinations for regional selections
  const destinations = [
    { name: "Bali", image: "https://images.unsplash.com/photo-15379961944714-e7fb7020d54e?w=400&h=300&fit=crop", country: "Indonesia" },
    { name: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91b3b23?w=400&h=300&fit=crop", country: "Switzerland" },
    { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop", country: "France" },
    { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop", country: "UAE" },
    { name: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop", country: "Japan" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-[#ff7a1a] font-medium">Travel Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500 text-lg">
            Welcome back, <span className="font-semibold text-gray-700">{userName}</span>! Here&apos;s your travel overview.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Profile Card */}
          <div className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Avatar className="h-12 w-12 ring-4 ring-orange-100">
              <AvatarFallback className="bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] text-white font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{userName}</p>
              <p className="text-sm text-gray-500">{userEmail}</p>
            </div>
          </div>

          {/* New Trip Button */}
          <Link href="/plan-trip">
            <Button className="h-12 px-6 bg-[#ff7a1a] hover:bg-[#e66b15] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all">
              <Plus className="h-5 w-5 mr-2" />
              New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{totalTrips}</p>
            <p className="text-sm text-gray-500">Total Trips</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{upcomingTrips}</p>
            <p className="text-sm text-gray-500">Upcoming Trips</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">${totalBudget.toLocaleString("en-US")}</p>
            <p className="text-sm text-gray-500">Total Budget</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">${totalSpent.toLocaleString("en-US")}</p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter Row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search destinations..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ff7a1a]/20 focus:border-[#ff7a1a] transition-all"
          />
        </div>

        <Button variant="outline" className="gap-2 px-5 py-3 rounded-xl border-gray-200 hover:border-[#ff7a1a] hover:text-[#ff7a1a] transition-colors">
          <Users className="h-4 w-4" />
          Group By
        </Button>

        <Button variant="outline" className="gap-2 px-5 py-3 rounded-xl border-gray-200 hover:border-[#ff7a1a] hover:text-[#ff7a1a] transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>

        <Button variant="outline" className="gap-2 px-5 py-3 rounded-xl border-gray-200 hover:border-[#ff7a1a] hover:text-[#ff7a1a] transition-colors">
          <ArrowUpDown className="h-4 w-4" />
          Sort By
        </Button>
      </div>

      {/* Top Regional Selections */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Regional Selections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              href={`/plan-trip?destination=${encodeURIComponent(dest.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-square"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-lg">{dest.name}</p>
                <p className="text-white/70 text-sm">{dest.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Previous Trips */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Trips</h2>
        {totalTrips === 0 ? (
          <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-[#ff7a1a]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-500 mb-6">Start planning your first adventure!</p>
              <Link href="/plan-trip">
                <Button className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white font-semibold px-6 py-3 rounded-xl">
                  Plan a Trip
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.trips.slice(0, 6).map((trip) => {
              const isPast = new Date(trip.endDate) < now;
              const tripBudget = user.budgets.find((b) => b.tripId === trip.id);
              return (
                <Link
                  key={trip.id}
                  href={`/dashboard/trips/${trip.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <img
                      src={trip.coverImage || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=250&fit=crop"}
                      alt={trip.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isPast
                            ? "bg-gray-500/90 text-white"
                            : "bg-green-500/90 text-white"
                        }`}
                      >
                        {isPast ? "Completed" : "Upcoming"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#ff7a1a] transition-colors">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {tripBudget && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <Wallet className="h-4 w-4" />
                        <span>${tripBudget.totalAmount.toLocaleString("en-US")}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Plan Trip Button */}
      <Link
        href="/plan-trip"
        className="fixed bottom-8 right-8 z-50 group"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff7a1a] to-[#ff9f5a] rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <Button className="relative bg-[#ff7a1a] hover:bg-[#e66b15] text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-orange-500/30 transition-all hover:scale-105">
            <Plus className="h-5 w-5 mr-2" />
            Plan a trip
          </Button>
        </div>
      </Link>
    </div>
  );
}
