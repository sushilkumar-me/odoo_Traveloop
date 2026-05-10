"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Wallet, TrendingUp, Plane } from "lucide-react";
import { useSession } from "next-auth/react";

const stats = [
  { icon: MapPin, label: "Destinations", value: "12", color: "text-orange-400" },
  { icon: Calendar, label: "Upcoming", value: "3", color: "text-teal-400" },
  { icon: Wallet, label: "Total Budget", value: "₹8,450", color: "text-purple-400" },
  { icon: TrendingUp, label: "Planned", value: "28 days", color: "text-blue-400" },
];

export function DashboardHero() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Traveler";

  return (
    <section className="relative py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-slate-400 text-lg">
            Ready for your next adventure?
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-orange-500/30 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/5">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Next Trip Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-orange-500/20 to-teal-500/20 border border-white/10 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Plane className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-orange-400 text-sm font-medium">Next Trip</p>
                <h3 className="text-xl font-bold text-white">Paris Adventure</h3>
                <p className="text-slate-400 text-sm">Jun 15 - Jun 22, 2025 • 4 Cities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-slate-400 text-sm">Budget</p>
                <p className="text-white font-bold text-xl">₹2,400</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
                <span className="text-orange-400 text-sm font-medium">14 days</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
