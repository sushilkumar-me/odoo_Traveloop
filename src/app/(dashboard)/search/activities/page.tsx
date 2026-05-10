"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Clock,
  DollarSign,
  Star,
  MapPin,
  Users,
  Mountain,
  Building2,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { searchActivities, getActivityCategories } from "@/lib/actions/search-actions";

const sortOptions = [
  { value: "rating", label: "Rating" },
  { value: "cost", label: "Cost" },
  { value: "name", label: "Name" },
];

const adventureLevels = ["easy", "moderate", "challenging"];

interface Activity {
  id: string;
  name: string;
  description?: string;
  location?: string;
  duration?: string;
  cost?: number;
  currency: string;
  rating: number;
  isIndoor?: boolean;
  isFamilyFriendly?: boolean;
  adventureLevel?: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
}

export default function ActivitySearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [minCost, setMinCost] = useState<number>(0);
  const [maxCost, setMaxCost] = useState<number>(300);
  const [minRating, setMinRating] = useState<number>(0);
  const [isIndoor, setIsIndoor] = useState<boolean | null>(null);
  const [isFamilyFriendly, setIsFamilyFriendly] = useState<boolean | null>(null);
  const [adventureLevel, setAdventureLevel] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const { data: categoryData } = useQuery({
    queryKey: ["activity-categories"],
    queryFn: getActivityCategories,
  });

  const categories = categoryData?.data || [];

  const { data: searchData, isLoading } = useQuery({
    queryKey: [
      "activities",
      searchQuery,
      selectedLocation,
      selectedCategory,
      minCost,
      maxCost,
      minRating,
      isIndoor,
      isFamilyFriendly,
      adventureLevel,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      searchActivities({
        query: searchQuery || undefined,
        location: selectedLocation || undefined,
        categoryId: selectedCategory || undefined,
        minCost: minCost > 0 ? minCost : undefined,
        maxCost: maxCost < 300 ? maxCost : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        isIndoor: isIndoor ?? undefined,
        isFamilyFriendly: isFamilyFriendly ?? undefined,
        adventureLevel: adventureLevel as any,
        sortBy: sortBy as any,
        sortOrder,
      }),
  });

  const clearFilters = useCallback(() => {
    setSelectedLocation("");
    setSelectedCategory("");
    setMinCost(0);
    setMaxCost(300);
    setMinRating(0);
    setIsIndoor(null);
    setIsFamilyFriendly(null);
    setAdventureLevel(null);
    setSearchQuery("");
  }, []);

  const hasActiveFilters =
    selectedLocation ||
    selectedCategory ||
    minCost > 0 ||
    maxCost < 300 ||
    minRating > 0 ||
    isIndoor !== null ||
    isFamilyFriendly !== null ||
    adventureLevel !== null ||
    searchQuery;

  const activities = searchData?.data?.activities || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Discover Activities</h1>
          <p className="text-slate-400">Find experiences for your next adventure</p>
        </motion.div>

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
                placeholder="Search activities..."
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full lg:w-48 h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900">
                  Sort by: {opt.label}
                </option>
              ))}
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <ArrowUpDown className="h-5 w-5" />
              {sortOrder === "asc" ? "Low to High" : "High to Low"}
            </motion.button>

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
                  {[
                    selectedLocation ? 1 : 0,
                    selectedCategory ? 1 : 0,
                    minCost > 0 || maxCost < 300 ? 1 : 0,
                    minRating > 0 ? 1 : 0,
                    isIndoor !== null ? 1 : 0,
                    isFamilyFriendly !== null ? 1 : 0,
                    adventureLevel ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </h3>
                    <input
                      type="text"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="Filter by city..."
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3">Category</h3>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="" className="bg-slate-900">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-slate-900">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cost Range
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={minCost}
                        onChange={(e) => setMinCost(Number(e.target.value))}
                        placeholder="Min"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="number"
                        value={maxCost}
                        onChange={(e) => setMaxCost(Number(e.target.value))}
                        placeholder="Max"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={300}
                      value={maxCost}
                      onChange={(e) => setMaxCost(Number(e.target.value))}
                      className="w-full mt-2 accent-orange-500"
                    />
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Min Rating
                    </h3>
                    <div className="flex gap-2">
                      {[0, 3, 3.5, 4, 4.5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                          className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                            minRating === rating
                              ? "bg-orange-500 text-white"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                        >
                          {rating === 0 ? "Any" : `${rating}+`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3">Indoor/Outdoor</h3>
                    <div className="flex gap-2">
                      {[
                        { value: null, label: "Any" },
                        { value: true, label: "Indoor" },
                        { value: false, label: "Outdoor" },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setIsIndoor(opt.value)}
                          className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                            isIndoor === opt.value
                              ? "bg-orange-500 text-white"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Family Friendly
                    </h3>
                    <div className="flex gap-2">
                      {[
                        { value: null, label: "Any" },
                        { value: true, label: "Yes" },
                        { value: false, label: "No" },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setIsFamilyFriendly(opt.value)}
                          className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                            isFamilyFriendly === opt.value
                              ? "bg-orange-500 text-white"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Mountain className="h-4 w-4" />
                      Adventure Level
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {adventureLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() => setAdventureLevel(adventureLevel === level ? null : level)}
                          className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all ${
                            adventureLevel === level
                              ? "bg-orange-500 text-white"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                        >
                          {level}
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No activities found</h3>
            <p className="text-slate-400">Try adjusting your filters or search query</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity: Activity, index: number) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {activity.isIndoor ? (
                        <Building2 className="h-5 w-5 text-blue-400" />
                      ) : (
                        <MapPin className="h-5 w-5 text-green-400" />
                      )}
                      <span className="text-xs text-slate-400">{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-white text-sm font-medium">
                        {activity.rating > 0 ? activity.rating.toFixed(1) : "N/A"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{activity.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-white text-sm">{activity.duration || "N/A"}</span>
                    </div>

                    <div className="flex items-center gap-1 text-orange-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-white font-bold">
                        {activity.cost === 0 ? "Free" : `?${activity.cost}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {activity.category && (
                      <span className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs">
                        {activity.category.name}
                      </span>
                    )}
                    {activity.adventureLevel && (
                      <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs capitalize">
                        {activity.adventureLevel}
                      </span>
                    )}
                    {activity.isFamilyFriendly && (
                      <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs">
                        Family Friendly
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setSelectedActivity(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl bg-slate-800 border border-white/10 rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedActivity.name}</h2>
                      <p className="text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {selectedActivity.location}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  <p className="text-slate-300 mb-6">{selectedActivity.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedActivity.duration || "N/A"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Cost</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedActivity.cost === 0 ? "Free" : `?${selectedActivity.cost}`}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {selectedActivity.rating > 0 ? selectedActivity.rating.toFixed(1) : "N/A"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Mountain className="h-4 w-4" />
                        <span className="text-sm">Adventure</span>
                      </div>
                      <p className="text-xl font-bold text-white capitalize">
                        {selectedActivity.adventureLevel || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedActivity.category && (
                      <span className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                        {selectedActivity.category.name}
                      </span>
                    )}
                    {selectedActivity.isIndoor !== undefined && (
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          selectedActivity.isIndoor
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {selectedActivity.isIndoor ? "Indoor" : "Outdoor"}
                      </span>
                    )}
                    {selectedActivity.isFamilyFriendly && (
                      <span className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                        Family Friendly
                      </span>
                    )}
                  </div>

                  <button className="w-full py-3 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add to Itinerary
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
