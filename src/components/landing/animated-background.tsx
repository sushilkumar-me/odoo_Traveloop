"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Only create particles on client side after mount
  const particles = useMemo(() => {
    if (!isMounted) return [];
    return [...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      duration: Math.random() * 10 + 10,
    }));
  }, [isMounted]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0F172A]">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-orange-500/20 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-gradient-to-l from-teal-500/20 to-transparent blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-600/10 to-teal-500/10 blur-[80px]" />
      </div>

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Mouse-follow glow */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-orange-500/10 to-teal-500/10 blur-[80px] pointer-events-none"
        animate={{
          x: mousePosition.x - 200,
          y: mousePosition.y - 200,
        }}
        transition={{ type: "tween", ease: "linear", duration: 0.2 }}
      />

      {/* Floating particles */}
      {isMounted && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-orange-400/30 rounded-full"
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            y: [null, particle.y + Math.random() * 200 - 100],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Aurora glow layers */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}