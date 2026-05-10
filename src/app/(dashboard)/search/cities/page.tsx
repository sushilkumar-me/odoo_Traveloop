"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Heart,
  MapPin,
  Star,
  Wallet,
  CloudSun,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { searchDestinations, saveDestination, unsaveDestination } from "@/lib/actions/search-actions";

const regions = ["Europe", "Asia", "Americas", "Africa", "Oceania", "Middle East"];
const climates = ["temperate", "tropical", "mediterranean", "oceanic", "continental", "desert", "humid subtropical"];
const travelTypes = ["cultural", "nature", "urban", "luxury", "adventure", "romance", "entertainment"];

const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "dailyBudget", label: "Budget" },
  { value: "name", label: "Name" },
];

interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  description?: string;
  imageUrl?: string;
  dailyBudget?: number;
  popularity: number;
  rating: number;
  climate?: string;
  travelType?: string;
  tags: string[];
  isPopular: boolean;
}

export default function CitySearchPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedClimate, setSelectedClimate] = useState<string | null>(null);
  const [selectedTravelType, setSelectedTravelType] = useState<string | null>(null);
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(500);
  const [minPopularity, setMinPopularity] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCity, setSelectedCity] = useState<Destination | null>(null);

  const userId = "demo-user-id";

  const { data: searchData, isLoading, refetch } = useQuery({
    queryKey: [
      "destinations",
      searchQuery,
      selectedDestination,
      selectedClimate,
      selectedTravelType,
      minBudget,
      maxBudget,
      minPopularity,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      searchDestinations({
        query: searchQuery || undefined,
        region: selectedDestination || undefined,
        climate: selectedClimate || undefined,
        travelType: selectedTravelType || undefined,
        minBudget: minBudget > 0 ? minBudget : undefined,
        maxBudget: maxBudget < 500 ? maxBudget : undefined,
        minPopularity: minPopularity > 0 ? minPopularity : undefined,
        sortBy: sortBy as any,
        sortOrder,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: (destinationId: string) => saveDestination(userId, destinationId),
    onSuccess: () => {
      toast({ title: "Destination saved!", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to save", variant: "destructive" });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (destinationId: string) => unsaveDestination(userId, destinationId),
    onSuccess: () => {
      toast({ title: "Removed from saved", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
  });

  const clearFilters = useCallback(() => {
    setSelectedDestination(null);
    setSelectedClimate(null);
    setSelectedTravelType(null);
    setMinBudget(0);
    setMaxBudget(500);
    setMinPopularity(0);
    setSearchQuery("");
  }, []);

  const hasActiveFilters =
    selectedDestination ||
    selectedClimate ||
    selectedTravelType ||
    minBudget > 0 ||
    maxBudget < 500 ||
    minPopularity > 0 ||
    searchQuery;

  const destinations = searchData?.data?.destinations || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Explore Destinations</h1>
          <p className="text-slate-400">Find your perfect next adventure</p>
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
                placeholder="Search cities..."
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
                    selectedDestination ? 1 : 0,
                    selectedClimate ? 1 : 0,
                    selectedTravelType ? 1 : 0,
                    minBudget > 0 || maxBudget < 500 ? 1 : 0,
                    minPopularity > 0 ? 1 : 0,
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
                      <Globe className="h-4 w-4" />
                      Region
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {regions.map((region) => (
                        <button
                          key={region}
                          onClick={() =>
                            setSelectedDestination(selectedDestination === region ? null : region)
                          }
                          className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                            selectedDestination === region
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
                      <CloudSun className="h-4 w-4" />
                      Climate
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {climates.map((climate) => (
                        <button
                          key={climate}
                          onClick={() =>
                            setSelectedClimate(selectedClimate === climate ? null : climate)
                          }
                          className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all ${
                            selectedClimate === climate
                              ? "bg-orange-500 text-white"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                          }`}
                        >
                          {climate}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Travel Type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {travelTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() =>
                            setSelectedTravelType(selectedTravelType === type ? null : type)
                          }
                          className={`px-3 py-1.5 rounded-xl text-sm capitalize transition-all ${
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

                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Budget (Daily)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={minBudget}
                          onChange={(e) => setMinBudget(Number(e.target.value))}
                          placeholder="Min"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="number"
                          value={maxBudget}
                          onChange={(e) => setMaxBudget(Number(e.target.value))}
                          placeholder="Max"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={500}
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                        className="w-full accent-orange-500"
                      />
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
        ) : destinations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <MapPin className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No destinations found</h3>
            <p className="text-slate-400">Try adjusting your filters or search query</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination: Destination, index: number) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedCity(destination)}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20"
                    style={{
                      backgroundImage: `url('https://source.unsplash.com/800x600/?${destination.name},city')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  {destination.isPopular && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-orange-500/90 text-white text-xs font-medium">
                      Popular
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (destination.isPopular) {
                        unsaveMutation.mutate(destination.id);
                      } else {
                        saveMutation.mutate(destination.id);
                      }
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        destination.isPopular ? "fill-red-500 text-red-500" : "text-white"
                      }`}
                    />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{destination.name}</h3>
                    <p className="text-slate-300 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {destination.country}, {destination.region}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {destination.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-white font-medium">{destination.rating.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <Wallet className="h-4 w-4" />
                      <span className="text-white">${destination.dailyBudget}/day</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <CloudSun className="h-4 w-4" />
                      <span className="text-white capitalize">{destination.climate?.split(" ")[0]}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {destination.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedCity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setSelectedCity(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl bg-slate-800 border border-white/10 rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative h-64">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-purple-500/30"
                    style={{
                      backgroundImage: `url('https://source.unsplash.com/800x600/?${selectedCity.name},city')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-transparent to-transparent" />

                  <button
                    onClick={() => setSelectedCity(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>

                  <div className="absolute bottom-4 left-6">
                    <h2 className="text-3xl font-bold text-white">{selectedCity.name}</h2>
                    <p className="text-slate-300 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedCity.country}, {selectedCity.region}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-300 mb-6">{selectedCity.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{selectedCity.rating.toFixed(1)}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Wallet className="h-4 w-4" />
                        <span className="text-sm">Daily Budget</span>
                      </div>
                      <p className="text-2xl font-bold text-white">${selectedCity.dailyBudget}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <CloudSun className="h-4 w-4" />
                        <span className="text-sm">Climate</span>
                      </div>
                      <p className="text-2xl font-bold text-white capitalize">{selectedCity.climate}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">Popularity</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{selectedCity.popularity}%</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedCity.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 py-3 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">
                      Add to Trip
                    </button>
                    <button
                      onClick={() => {
                        if (selectedCity.isPopular) {
                          unsaveMutation.mutate(selectedCity.id);
                        } else {
                          saveMutation.mutate(selectedCity.id);
                        }
                      }}
                      className="py-3 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                    >
                      {selectedCity.isPopular ? "Remove from Saved" : "Save Destination"}
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