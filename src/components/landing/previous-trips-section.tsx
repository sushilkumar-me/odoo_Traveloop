"use client";

import { motion } from "framer-motion";
import { TripCard } from "./trip-card";
import { ArrowRight, Briefcase } from "lucide-react";

const trips = [
  {
    id: "1",
    name: "European Adventure",
    coverImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
    startDate: "Jun 15",
    endDate: "Jun 28",
    cities: 4,
    budget: "$3,200",
    progress: 85,
    status: "upcoming" as const,
  },
  {
    id: "2",
    name: "Japan Discovery",
    coverImage: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
    startDate: "Aug 1",
    endDate: "Aug 12",
    cities: 3,
    budget: "$2,800",
    progress: 60,
    status: "planning" as const,
  },
  {
    id: "3",
    name: "Bali Retreat",
    coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    startDate: "Oct 10",
    endDate: "Oct 17",
    cities: 2,
    budget: "$1,500",
    progress: 100,
    status: "completed" as const,
  },
  {
    id: "4",
    name: "NYC Weekend",
    coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    startDate: "Dec 20",
    endDate: "Dec 23",
    cities: 1,
    budget: "$1,200",
    progress: 40,
    status: "planning" as const,
  },
];

export function PreviousTripsSection() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20">
              <Briefcase className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Your Trips
              </h2>
              <p className="text-slate-400 text-sm">Continue planning or review past adventures</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>

        {/* Trip Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trips.map((trip, index) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              name={trip.name}
              coverImage={trip.coverImage}
              startDate={trip.startDate}
              endDate={trip.endDate}
              cities={trip.cities}
              budget={trip.budget}
              progress={trip.progress}
              status={trip.status}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Empty State (if no trips) */}
        {trips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-4xl">✈️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No trips yet</h3>
            <p className="text-slate-400 mb-6">Start planning your first adventure!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}