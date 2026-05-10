"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { useState } from "react";

const destinations = ["Europe", "Asia", "Americas", "Africa", "Oceania"];
const tripTypes = ["Adventure", "Relaxation", "Cultural", "Business", "Budget"];

export function SearchFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedTripType, setSelectedTripType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setSelectedDestination(null);
    setSelectedTripType(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedDestination || selectedTripType || searchQuery;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="max-w-7xl mx-auto px-4 mb-8"
    >
      {/* Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips, activities, destinations..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Group By Dropdown */}
        <div className="relative">
          <select className="w-full lg:w-48 h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50">
            <option value="all" className="bg-slate-900">All Regions</option>
            {destinations.map((dest) => (
              <option key={dest} value={dest} className="bg-slate-900">{dest}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Filter Button */}
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
              {(selectedDestination ? 1 : 0) + (selectedTripType ? 1 : 0) + (searchQuery ? 1 : 0)}
            </span>
          )}
        </motion.button>

        {/* Sort Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <ArrowUpDown className="h-5 w-5" />
          <span className="hidden sm:inline">Sort</span>
        </motion.button>
      </div>

      {/* Expandable Filter Section */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Destination Filter */}
            <div className="flex-1">
              <h3 className="text-white font-medium mb-3">Region</h3>
              <div className="flex flex-wrap gap-2">
                {destinations.map((dest) => (
                  <button
                    key={dest}
                    onClick={() => setSelectedDestination(selectedDestination === dest ? null : dest)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      selectedDestination === dest
                        ? "bg-orange-500 text-white"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Type Filter */}
            <div className="flex-1">
              <h3 className="text-white font-medium mb-3">Trip Style</h3>
              <div className="flex flex-wrap gap-2">
                {tripTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTripType(selectedTripType === type ? null : type)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      selectedTripType === type
                        ? "bg-teal-500 text-white"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}