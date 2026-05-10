"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Heart,
  Bookmark,
  Share2,
  Copy,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Users,
  X,
  Loader2,
  TrendingUp,
  Flame,
  Globe,
  Plane,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getCommunityTrips,
  toggleLike,
  toggleBookmark,
  checkLikeStatus,
} from "@/lib/actions/community-actions";

const regions = ["Europe", "Asia", "Americas", "Africa", "Oceania", "Middle East"];
const travelTypes = ["Adventure", "Relaxation", "Cultural", "Budget", "Luxury", "Family", "Solo"];
const sortOptions = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "popular", label: "Popular", icon: Flame },
  { value: "likes", label: "Most Liked", icon: Heart },
  { value: "budget", label: "Budget", icon: DollarSign },
];

interface TripData {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  travelType: string | null;
  user: { id: string; name: string | null; image: string | null };
  cities: Array<{ name: string; country: string }>;
  _count: { likes: number; bookmarks: number; activities: number };
  totalBudget: number;
  destinationCount: number;
  createdAt: Date;
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedTravelType, setSelectedTravelType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "likes" | "budget">("newest");
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const userId = session?.user?.id;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: communityData, isLoading } = useQuery({
    queryKey: ["community-trips", debouncedSearch, selectedRegion, selectedTravelType, sortBy],
    queryFn: () =>
      getCommunityTrips({
        search: debouncedSearch || undefined,
        region: selectedRegion || undefined,
        travelType: selectedTravelType || undefined,
        sortBy,
      }),
  });

  const trips = communityData?.data?.trips || [];

  const likeMutation = useMutation({
    mutationFn: ({ tripId }: { tripId: string }) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      return toggleLike(userId, tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-trips"] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: ({ tripId }: { tripId: string }) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      return toggleBookmark(userId, tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-trips"] });
      toast({ title: "Bookmark updated!", variant: "default" });
    },
  });

  const clearFilters = () => {
    setSelectedRegion(null);
    setSelectedTravelType(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedRegion || selectedTravelType || searchQuery;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDuration = (start: Date, end: Date) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Community Travel Feed</h1>
          <p className="text-slate-400">Discover inspiring itineraries from travelers worldwide</p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trips, destinations, travelers..."
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    sortBy === opt.value
                      ? "bg-orange-500 text-white"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-xs text-white">
                  {(selectedRegion ? 1 : 0) + (selectedTravelType ? 1 : 0)}
                </span>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Region
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {regions.map((region) => (
                        <button
                          key={region}
                          onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
                          className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                            selectedRegion === region
                              ? "bg-orange-500 text-white"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      Travel Style
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {travelTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedTravelType(selectedTravelType === type ? null : type)}
                          className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                            selectedTravelType === type
                              ? "bg-orange-500 text-white"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Globe className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No trips found</h3>
            <p className="text-slate-400">Try adjusting your filters or search query</p>
          </motion.div>
        ) : (
          /* Trip Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip: TripData, index: number) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedTrip(trip)}
              >
                {/* Cover Image */}
                <div className="aspect-[16/9] relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20"
                    style={{
                      backgroundImage: trip.coverImage
                        ? `url(${trip.coverImage})`
                        : `url('https://source.unsplash.com/800x450/?${trip.cities[0]?.name || "travel"},landscape')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  {/* Travel Type Badge */}
                  {trip.travelType && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-orange-500/90 text-white text-xs font-medium">
                      {trip.travelType}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        bookmarkMutation.mutate({ tripId: trip.id });
                      }}
                      className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      <Bookmark className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/shared/${trip.id}`);
                        toast({ title: "Link copied!", variant: "default" });
                      }}
                      className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* Trip Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">
                        {trip.cities.map((c) => c.name).join(" → ") || "No destinations"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="p-4">
                  {/* Creator */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                      {trip.user.image ? (
                        <img src={trip.user.image} alt={trip.user.name || ""} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {(trip.user.name || "T")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-white text-sm">{trip.user.name || "Traveler"}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">{getDuration(trip.startDate, trip.endDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-medium">${trip.totalBudget}</span>
                    </div>
                  </div>

                  {/* Likes */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        likeMutation.mutate({ tripId: trip.id });
                      }}
                      className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{trip._count.likes}</span>
                    </button>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-sm">
                      {trip._count.activities} activities
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-sm">
                      {trip.destinationCount} destinations
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {selectedTrip && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setSelectedTrip(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border border-white/10 rounded-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative h-48">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-purple-500/30"
                    style={{
                      backgroundImage: selectedTrip.coverImage
                        ? `url(${selectedTrip.coverImage})`
                        : `url('https://source.unsplash.com/800x400/?${selectedTrip.cities[0]?.name || "travel"},landscape')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/50 to-transparent" />

                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>

                  <div className="absolute bottom-4 left-6">
                    {selectedTrip.travelType && (
                      <span className="px-3 py-1 rounded-full bg-orange-500/90 text-white text-xs font-medium mb-2 inline-block">
                        {selectedTrip.travelType}
                      </span>
                    )}
                    <h2 className="text-3xl font-bold text-white">{selectedTrip.name}</h2>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Creator */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                      {selectedTrip.user.image ? (
                        <img src={selectedTrip.user.image} alt={selectedTrip.user.name || ""} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-medium">
                          {(selectedTrip.user.name || "T")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedTrip.user.name || "Traveler"}</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(selectedTrip.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedTrip.description && (
                    <p className="text-slate-300 mb-6">{selectedTrip.description}</p>
                  )}

                  {/* Trip Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Dates</span>
                      </div>
                      <p className="text-white font-medium">
                        {formatDate(selectedTrip.startDate)} - {formatDate(selectedTrip.endDate)}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <p className="text-white font-medium">
                        {getDuration(selectedTrip.startDate, selectedTrip.endDate)}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Budget</span>
                      </div>
                      <p className="text-white font-medium">${selectedTrip.totalBudget}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Activities</span>
                      </div>
                      <p className="text-white font-medium">{selectedTrip._count.activities}</p>
                    </div>
                  </div>

                  {/* Destinations */}
                  <div className="mb-6">
                    <h3 className="text-white font-medium mb-3">Destinations</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrip.cities.map((city, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm"
                        >
                          {city.name}, {city.country}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button className="flex-1 py-3 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
                      <Copy className="h-5 w-5" />
                      Copy Trip
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/shared/${selectedTrip.id}`);
                        toast({ title: "Link copied!", variant: "default" });
                      }}
                      className="py-3 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="h-5 w-5" />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}