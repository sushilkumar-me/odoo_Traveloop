"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { deleteTrip } from "@/lib/actions/trip-actions";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Wallet,
  Globe,
  Plane,
  Edit2,
  Trash2,
  Eye,
  Filter,
  ChevronDown,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  cities: { id: string; name: string; country: string }[];
  budgets: {
    id: string;
    totalAmount: number;
    expenses: { amount: number }[];
  }[];
}

interface User {
  id: string;
  name: string | null;
  email: string;
  trips: Trip[];
}

interface MyTripsContentProps {
  user: User;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};



export function MyTripsContent({ user }: MyTripsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "completed" | "draft">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const allTrips = user.trips.map((trip) => ({
    ...trip,
    startDate: new Date(trip.startDate),
    endDate: new Date(trip.endDate),
  }));

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] mb-4" />
            <div className="h-10 w-64 bg-gray-200 rounded-xl mb-2" />
            <div className="h-6 w-96 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl shadow" />
          ))}
        </div>
      </div>
    );
  }

  const filteredTrips = allTrips.filter((trip) => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isPast = new Date(trip.endDate) < now;
    const isUpcoming = new Date(trip.startDate) > now;

    if (activeFilter === "upcoming") return matchesSearch && isUpcoming;
    if (activeFilter === "completed") return matchesSearch && isPast;
    if (activeFilter === "draft") return matchesSearch && !isPast && !isUpcoming;
    return matchesSearch;
  });

  const totalTrips = allTrips.length;
  const upcomingCount = allTrips.filter((t) => new Date(t.startDate) > now).length;
  const uniqueCountries = new Set(allTrips.flatMap((t) => t.cities.map((c) => c.country))).size;

  const handleDelete = (tripId: string, tripName: string) => {
    if (!confirm(`Delete "${tripName}"? This cannot be undone.`)) return;
    setDeletingId(tripId);
    startTransition(async () => {
      await deleteTrip(tripId);
      setDeletingId(null);
      router.refresh();
    });
  };
  const totalBudget = allTrips.reduce((sum, t) => sum + (t.budgets[0]?.totalAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-[#ff7a1a] font-medium">Your Travel Journeys</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
          <p className="text-gray-500">Manage, explore, and continue planning your journeys.</p>
        </div>

        <Button asChild className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25">
  <Link href="/plan-trip">
    
            <Plus className="h-5 w-5 mr-2" />
            Create Trip
          
  </Link>
</Button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{totalTrips}</p>
                <p className="text-sm text-gray-500">Total Trips</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{upcomingCount}</p>
                <p className="text-sm text-gray-500">Upcoming Trips</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{uniqueCountries}</p>
                <p className="text-sm text-gray-500">Countries Planned</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">₹{totalBudget.toLocaleString("en-US")}</p>
                <p className="text-sm text-gray-500">Estimated Budget</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Search & Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search your trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#ff7a1a]/20 focus:border-[#ff7a1a] transition-all"
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-[#ff7a1a] transition-all"
          >
            <Filter className="h-4 w-4" />
            {activeFilter === "all" ? "All Trips" : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showFilterDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden"
            >
              {(["all", "upcoming", "completed", "draft"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    activeFilter === filter
                      ? "bg-[#ff7a1a]/10 text-[#ff7a1a]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {filter === "all" ? "All Trips" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Trip Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-gray-100"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
              <Globe className="h-10 w-10 text-[#ff7a1a]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No trips planned yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start your adventure! Create your first trip and begin exploring the world.
            </p>
            <Button asChild className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white font-semibold px-8 py-3 rounded-xl">
  <Link href="/plan-trip">
    
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Trip
              
  </Link>
</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const isPast = new Date(trip.endDate) < now;
              const isUpcoming = new Date(trip.startDate) > now;
              const budget = trip.budgets[0]?.totalAmount || 0;

              return (
                <motion.div
                  key={trip.id}
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={trip.coverImage || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=400&fit=crop"}
                      alt={trip.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isPast
                            ? "bg-gray-500/90 text-white"
                            : isUpcoming
                            ? "bg-green-500/90 text-white"
                            : "bg-yellow-500/90 text-white"
                        }`}
                      >
                        {isPast ? "Completed" : isUpcoming ? "Upcoming" : "In Progress"}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#ff7a1a] transition-colors">
                        {trip.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Wallet className="h-4 w-4 text-[#ff7a1a]" />
                        <span className="text-gray-700 font-semibold">₹{budget.toLocaleString("en-US")}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {trip.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{trip.cities.map((c) => c.name).join(", ") || "TBD"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{trip.cities.length} destination{trip.cities.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <Button asChild size="sm" variant="outline" className="w-full gap-2">
  <Link href={`/dashboard/trips/${trip.id}`} className="flex-1">
    
                          <Eye className="h-4 w-4" />
                          View
                        
  </Link>
</Button>
                      <Button asChild size="sm" variant="ghost" className="text-gray-500 hover:text-[#ff7a1a] hover:bg-orange-50 p-2">
  <Link href={`/dashboard/trips/${trip.id}/budget`} title="Budget Dashboard">
    
                          <Wallet className="h-4 w-4" />
                        
  </Link>
</Button>
                      <Button asChild size="sm" variant="ghost" className="text-gray-500 hover:text-[#ff7a1a] hover:bg-orange-50 p-2">
  <Link href={`/dashboard/trips/${trip.id}/edit`} title="Edit Trip">
    
                          <Edit2 className="h-4 w-4" />
                        
  </Link>
</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deletingId === trip.id || isPending}
                        onClick={() => handleDelete(trip.id, trip.name)}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-2 disabled:opacity-50"
                        title="Delete Trip"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Floating Action Button */}
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
