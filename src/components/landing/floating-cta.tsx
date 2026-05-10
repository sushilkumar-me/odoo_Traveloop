"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export function FloatingCTA() {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 15 }}
      className="fixed bottom-6 right-6 z-40"
      onMouseEnter={() => {
        setIsHovered(true);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setTimeout(() => setShowTooltip(false), 200);
      }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-4 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-xl"
          >
            <p className="text-white text-sm font-medium whitespace-nowrap">
              Create your next adventure
            </p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-3 h-3 bg-slate-900/95 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-6 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/40 flex items-center gap-2"
      >
        {/* Glow rings */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: isHovered
              ? "0 0 30px rgba(249, 115, 22, 0.6), 0 0 60px rgba(249, 115, 22, 0.3)"
              : "0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Icon */}
        <motion.div
          animate={{ rotate: isHovered ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isHovered ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <Plus className="h-5 w-5 text-white" />
          )}
        </motion.div>

        {/* Text */}
        <span className="text-white font-semibold text-sm">
          Plan New Trip
        </span>

        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
            animate={{
              translateX: isHovered ? "200%" : "-200%",
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.button>

      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-orange-400/50 rounded-full"
          style={{
            top: "50%",
            left: "50%",
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * -100 - 20],
            opacity: [0.8, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}