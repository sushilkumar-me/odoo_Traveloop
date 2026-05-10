"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Plane,
  Utensils,
  Camera,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { getSharedTrip, copyTrip, toggleLike, toggleBookmark } from "@/lib/actions/community-actions";

interface ActivityData {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startDate: Date | null;
  endDate: Date | null;
  cost: number | null;
  category: { name: string } | null;
}

interface CityData {
  id: string;
  name: string;
  country: string;
  startDate: Date;
  endDate: Date;
  activities: ActivityData[];
}

export default function SharedTripPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));
  const [copied, setCopied] = useState(false);

  const { data: tripData, isLoading, error } = useQuery({
    queryKey: ["shared-trip", shareId],
    queryFn: () => getSharedTrip(shareId),
    enabled: !!shareId,
  });

  const trip = tripData?.data;

  const copyMutation = useMutation({
    mutationFn: () => {
      if (!userId || !trip) return Promise.reject(new Error("Not authenticated"));
      return copyTrip(userId, trip.id);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Trip copied to your account!", variant: "default" });
        setCopied(true);
      }
    },
    onError: () => {
      toast({ title: "Failed to copy trip", variant: "destructive" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => {
      if (!userId || !trip) return Promise.reject(new Error("Not authenticated"));
      return toggleLike(userId, trip.id);
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => {
      if (!userId || !trip) return Promise.reject(new Error("Not authenticated"));
      return toggleBookmark(userId, trip.id);
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (start: Date, end: Date) => {
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case "sightseeing":
        return Camera;
      case "food & dining":
        return Utensils;
      case "outdoor":
        return Sun;
      case "nightlife":
        return Moon;
      default:
        return MapPin;
    }
  };

  const toggleDay = (index: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDays(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Trip Not Found</h1>
          <p className="text-slate-400 mb-4">This trip may not exist or is private.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const duration = getDuration(trip.startDate, trip.endDate);
  const totalBudget = trip.budgets[0]?.totalAmount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/40 via-purple-500/30 to-slate-900"
          style={{
            backgroundImage: trip.coverImage
              ? `url(${trip.coverImage})`
              : `url('https://source.unsplash.com/1600x900/?${trip.cities[0]?.name || "travel"},landscape')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copied!", variant: "default" });
                }}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            {trip.travelType && (
              <span className="inline-block px-4 py-1 rounded-full bg-orange-500/90 text-white text-sm font-medium mb-3">
                {trip.travelType}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{trip.name}</h1>

            {/* Creator & Stats */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  {trip.user.image ? (
                    <img src={trip.user.image} alt={trip.user.name || ""} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-medium">
                      {(trip.user.name || "T")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{trip.user.name || "Traveler"}</p>
                  <p className="text-slate-400 text-sm">Trip Creator</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-5 w-5" />
                <span>{duration} days</span>
              </div>

              <div className="flex items-center gap-2 text-orange-400 font-medium">
                <DollarSign className="h-5 w-5" />
                <span>₹{totalBudget}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Heart className="h-5 w-5" />
                <span>{trip._count.likes} likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Itinerary Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Description */}
            {trip.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
              >
                <h2 className="text-xl font-bold text-white mb-3">About This Trip</h2>
                <p className="text-slate-300">{trip.description}</p>
              </motion.div>
            )}

            {/* Destinations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Destinations</h2>
              <div className="flex flex-wrap gap-3">
                {trip.cities.map((city, index) => (
                  <div
                    key={city.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500/20 border border-orange-500/30"
                  >
                    <MapPin className="h-4 w-4 text-orange-400" />
                    <span className="text-white">{city.name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-400">{city.country}</span>
                    {index < trip.cities.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-slate-500 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Day by Day Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-white mb-6">Itinerary</h2>
              <div className="space-y-4">
                {trip.cities.map((city, cityIndex) => {
                  const dayNumber = cityIndex + 1;
                  const isExpanded = expandedDays.has(cityIndex);

                  return (
                    <div
                      key={city.id}
                      className="border border-white/10 rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleDay(cityIndex)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <span className="text-orange-400 font-bold">{dayNumber}</span>
                          </div>
                          <div className="text-left">
                            <h3 className="text-white font-medium">{city.name}</h3>
                            <p className="text-slate-400 text-sm">
                              {formatDate(city.startDate)} - {formatDate(city.endDate)}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 space-y-3">
                              {city.activities.length > 0 ? (
                                city.activities.map((activity, actIndex) => {
                                  const Icon = getCategoryIcon(activity.category?.name || null);
                                  return (
                                    <div
                                      key={activity.id}
                                      className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-blue-400" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-white font-medium">{activity.name}</h4>
                                        {activity.location && (
                                          <p className="text-slate-400 text-sm flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {activity.location}
                                          </p>
                                        )}
                                        {activity.description && (
                                          <p className="text-slate-500 text-sm mt-1">
                                            {activity.description}
                                          </p>
                                        )}
                                        {activity.cost !== null && activity.cost > 0 && (
                                          <p className="text-orange-400 text-sm mt-1">
                                            ₹{activity.cost}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-slate-400 text-sm">No activities planned yet.</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Copy Trip Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl sticky top-8"
            >
              <h3 className="text-lg font-bold text-white mb-4">Save This Trip</h3>

              {userId ? (
                <>
                  <button
                    onClick={() => copyMutation.mutate()}
                    disabled={copied}
                    className={`w-full py-3 px-6 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 mb-3 ${
                      copied
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Copy className="h-5 w-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        Copy to My Trips
                      </>
                    )}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => likeMutation.mutate()}
                      className="flex-1 py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Like
                    </button>
                    <button
                      onClick={() => bookmarkMutation.mutate()}
                      className="flex-1 py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Bookmark className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-slate-400 mb-4">Sign in to copy this trip to your account</p>
                  <Link
                    href="/login"
                    className="block w-full py-3 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors text-center"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Trip Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Trip Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Destinations
                  </span>
                  <span className="text-white font-medium">{trip.cities.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration
                  </span>
                  <span className="text-white font-medium">{duration} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    Activities
                  </span>
                  <span className="text-white font-medium">{trip._count.activities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </span>
                  <span className="text-orange-400 font-medium">₹{totalBudget}</span>
                </div>
              </div>
            </motion.div>

            {/* Budget Breakdown */}
            {trip.budgets[0] && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl"
              >
                <h3 className="text-lg font-bold text-white mb-4">Budget Breakdown</h3>
                <div className="space-y-2">
                  {trip.budgets[0].expenses.map((expense, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <span className="text-slate-400">{expense.description}</span>
                      <span className="text-white font-medium">₹{expense.amount}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-orange-400 font-bold">₹{trip.budgets[0].totalAmount}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}