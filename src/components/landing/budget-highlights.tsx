"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingDown, PiggyBank, DollarSign } from "lucide-react";

const budgetData = {
  totalBudget: 12500,
  spent: 8420,
  remaining: 4080,
  avgDaily: 285,
  tripsCount: 4,
};

const budgetCards = [
  {
    icon: Wallet,
    label: "Total Budget",
    value: `?${budgetData.totalBudget.toLocaleString("en-US")}`,
    subtext: "Across 4 trips",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: TrendingDown,
    label: "Spent",
    value: `?${budgetData.spent.toLocaleString("en-US")}`,
    subtext: "67% used",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  {
    icon: PiggyBank,
    label: "Remaining",
    value: `?${budgetData.remaining.toLocaleString("en-US")}`,
    subtext: "33% left",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: DollarSign,
    label: "Avg Daily",
    value: `?${budgetData.avgDaily}`,
    subtext: "Per trip day",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

function ProgressRing({ progress, color }: { progress: number; color: string }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="56"
          cy="56"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx="56"
          cy="56"
          r="45"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-lg">{progress}%</span>
      </div>
    </div>
  );
}

export function BudgetHighlights() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="py-6"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Budget Overview</h2>
            <p className="text-slate-400">Track your travel spending</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-sm transition-colors">
            View Details
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Progress Ring */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <h3 className="text-white font-medium mb-4">Total Spending</h3>
            <div className="flex items-center justify-center">
              <ProgressRing progress={67} color="orange" />
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-slate-400">Spent: ₹8,420</span>
              <span className="text-slate-400">Left: ₹4,080</span>
            </div>
          </div>

          {/* Budget Cards Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {budgetCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-slate-400 text-sm mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-slate-500 text-xs mt-1">{card.subtext}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
