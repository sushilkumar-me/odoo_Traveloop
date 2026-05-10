"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Wallet, MoreVertical, Edit, Trash2, Share2, Clock } from "lucide-react";
import { useState } from "react";

interface TripCardProps {
  id: string;
  name: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  cities: number;
  budget: string;
  progress: number;
  status: "planning" | "upcoming" | "completed";
  delay?: number;
}

const statusConfig = {
  planning: { label: "Planning", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  upcoming: { label: "Upcoming", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  completed: { label: "Completed", color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
};

export function TripCard({
  id,
  name,
  coverImage,
  startDate,
  endDate,
  cities,
  budget,
  progress,
  status,
  delay = 0,
}: TripCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const statusStyle = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all"
    >
      {/* Cover Image */}
      <div className="relative h-36 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.color}`}>
            {statusStyle.label}
          </span>
        </div>

        {/* Options Menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 mt-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-10"
            >
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                <Edit className="h-4 w-4" /> Edit
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </motion.div>
          )}
        </div>

        {/* City count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
          <MapPin className="h-3 w-3 text-orange-400" />
          <span className="text-xs text-white font-medium">{cities} {cities === 1 ? "city" : "cities"}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 truncate">{name}</h3>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
          <Calendar className="h-4 w-4" />
          <span>{startDate} - {endDate}</span>
        </div>

        {/* Budget & Progress Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 rounded-lg bg-teal-500/10">
              <Wallet className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <span className="text-white text-sm font-medium">{budget}</span>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: delay + 0.3, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
              />
            </div>
            <span className="text-xs text-slate-400">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}