"use client";

import { motion } from "framer-motion";
import { Plus, Play, Compass, Wallet, Luggage, Calendar } from "lucide-react";

const actions = [
  { icon: Plus, label: "Plan New Trip", color: "from-orange-500 to-orange-600", glow: "orange" },
  { icon: Play, label: "Continue Planning", color: "from-teal-500 to-teal-600", glow: "teal" },
  { icon: Compass, label: "Explore", color: "from-purple-500 to-purple-600", glow: "purple" },
  { icon: Wallet, label: "Budget", color: "from-blue-500 to-blue-600", glow: "blue" },
];

export function QuickActions() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="py-6"
    >
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${action.color}`} />

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-white font-medium text-sm">{action.label}</span>
              </div>

              {/* Glow effect */}
              <div className={`absolute -inset-1 bg-${action.glow}-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}