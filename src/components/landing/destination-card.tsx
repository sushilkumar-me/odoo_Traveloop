"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { MapPin, DollarSign, Bookmark, Star } from "lucide-react";

interface DestinationCardProps {
  city: string;
  country: string;
  image: string;
  price: string;
  rating?: number;
  isPopular?: boolean;
  delay?: number;
}

export function DestinationCard({ city, country, image, price, rating = 4.8, isPopular = false, delay = 0 }: DestinationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      className="group relative min-w-[260px] w-[260px] h-[340px] rounded-3xl overflow-hidden cursor-pointer"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Top badges */}
        <div className="flex items-start justify-between">
          {isPopular && (
            <div className="px-2.5 py-1 rounded-full bg-orange-500/90 backdrop-blur-md">
              <span className="text-xs text-white font-medium flex items-center gap-1">
                <Star className="h-3 w-3 fill-white" /> Popular
              </span>
            </div>
          )}
          <button className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Info */}
        <div>
          {/* Location */}
          <div className="mb-1">
            <div className="flex items-center gap-1 text-white/80">
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs">{country}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{city}</h3>
          </div>

          {/* Price & Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-teal-400" />
              <span className="text-lg font-bold text-white">{price}</span>
              <span className="text-white/60 text-xs">/person</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-md">
              <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
              <span className="text-xs text-white font-medium">{rating}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}