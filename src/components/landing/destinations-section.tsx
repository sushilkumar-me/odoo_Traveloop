"use client";

import { motion } from "framer-motion";
import { DestinationCard } from "./destination-card";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

const destinations = [
  { city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", price: "1,200", rating: 4.9, isPopular: true },
  { city: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", price: "1,800", rating: 4.8, isPopular: true },
  { city: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", price: "900", rating: 4.7 },
  { city: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80", price: "1,400", rating: 4.9, isPopular: true },
  { city: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", price: "2,000", rating: 4.6 },
  { city: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", price: "1,600", rating: 4.7 },
  { city: "Barcelona", country: "Spain", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80", price: "1,100", rating: 4.8 },
  { city: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", price: "2,500", rating: 4.9, isPopular: true },
];

export function DestinationsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
            <div className="p-2 rounded-xl bg-orange-500/20">
              <Sparkles className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Popular Destinations
              </h2>
              <p className="text-slate-400 text-sm">Get inspired for your next trip</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2.5 rounded-2xl border transition-all ${
                canScrollLeft
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2.5 rounded-2xl border transition-all ${
                canScrollRight
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Scrollable Destination Cards */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {destinations.map((dest, index) => (
            <DestinationCard
              key={dest.city}
              city={dest.city}
              country={dest.country}
              image={dest.image}
              price={dest.price}
              rating={dest.rating}
              isPopular={dest.isPopular}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
}