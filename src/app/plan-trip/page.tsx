"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plane,
  MapPin,
  Wallet,
  FileText,
  Loader2,
  Sparkles,
  Globe,
  Compass,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createTrip } from "@/lib/actions/trip-actions";
import { DatePicker } from "@/components/ui/date-picker";

const popularDestinations = [
  {
    id: 1,
    name: "Bali",
    description: "Tropical paradise with temples and beaches",
    cost: "₹1,200",
    color: "from-emerald-400 to-teal-500",
    emoji: "🌴",
  },
  {
    id: 2,
    name: "Paris",
    description: "Romantic city of lights and art",
    cost: "₹2,500",
    color: "from-rose-400 to-pink-500",
    emoji: "🗼",
  },
  {
    id: 3,
    name: "Tokyo",
    description: "Modern culture meets ancient traditions",
    cost: "₹2,800",
    color: "from-red-400 to-orange-500",
    emoji: "🏯",
  },
  {
    id: 4,
    name: "Goa",
    description: "Beaches, nightlife, and Portuguese heritage",
    cost: "₹800",
    color: "from-yellow-400 to-amber-500",
    emoji: "🏖️",
  },
  {
    id: 5,
    name: "Dubai",
    description: "Luxury shopping and futuristic architecture",
    cost: "₹3,000",
    color: "from-amber-400 to-yellow-500",
    emoji: "🏙️",
  },
  {
    id: 6,
    name: "Switzerland",
    description: "Alpine adventures and scenic beauty",
    cost: "₹3,500",
    color: "from-sky-400 to-blue-500",
    emoji: "⛰️",
  },
];

export default function PlanTripPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSelectDestination = (name: string) => {
    setSelectedDestination(name);
    setForm((prev) => ({ ...prev, destination: name, name: prev.name || `${name} Trip` }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!form.name.trim()) {
      setError("Please enter a trip name.");
      return;
    }
    if (!form.startDate) {
      setError("Please select a start date.");
      return;
    }
    if (!form.endDate) {
      setError("Please select an end date.");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date must be after start date.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createTrip({
        name: form.name.trim(),
        description: form.destination
          ? `Trip to ${form.destination}. ${form.notes}`.trim()
          : form.notes || undefined,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        budget: form.budget ? parseFloat(form.budget) : undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to create trip.");
        setIsLoading(false);
        return;
      }

      // Success — show brief confirmation then redirect
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/trips/${result.data!.id}`);
      }, 1200);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-emerald-100/50" />
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <motion.div
          className="absolute top-20 left-20 text-blue-400/20"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Plane size={60} />
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-32 text-emerald-400/20"
          animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <MapPin size={48} />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-20 text-violet-400/20"
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Globe size={40} />
        </motion.div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <Plane className="h-8 w-8 text-blue-600" />
            </motion.div>
            <span className="text-xl font-bold font-serif text-gray-800">Traveloop</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
  <Link href="/dashboard">
    
                Dashboard
              
  </Link>
</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4" />
            Plan Your Next Adventure
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-serif mb-4">
            Create a New Trip
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill in the details below and start building your perfect itinerary.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Trip Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  Trip Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Trip Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Trip Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Summer Adventure 2025"
                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-11 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Destination
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        name="destination"
                        value={form.destination}
                        onChange={(e) => {
                          setSelectedDestination(e.target.value);
                          handleChange(e);
                        }}
                        placeholder="Enter city or country"
                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-11 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        name="startDate"
                        value={form.startDate}
                        onChange={(val) => {
                          setForm((prev) => ({ ...prev, startDate: val }));
                          setError(null);
                        }}
                        placeholder="Pick start date"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        name="endDate"
                        value={form.endDate}
                        onChange={(val) => {
                          setForm((prev) => ({ ...prev, endDate: val }));
                          setError(null);
                        }}
                        placeholder="Pick end date"
                        min={form.startDate}
                        required
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Budget (optional)
                    </label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        name="budget"
                        type="number"
                        min="0"
                        step="1"
                        value={form.budget}
                        onChange={handleChange}
                        placeholder="e.g. 1500"
                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 h-11 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Notes (optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Any special requirements or preferences..."
                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 pt-3 rounded-lg focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Trip created! Redirecting to your itinerary...
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Trip...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Trip Created!
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Create Trip
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Popular Destinations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Popular Destinations
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Click a destination to auto-fill it in your form.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularDestinations.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                >
                  <Card
                    className={`bg-white/95 backdrop-blur-xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                      selectedDestination === dest.name
                        ? "border-blue-500 ring-2 ring-blue-500/30 shadow-blue-500/20"
                        : "border-gray-200/50"
                    }`}
                    onClick={() => handleSelectDestination(dest.name)}
                  >
                    <div
                      className={`h-24 bg-gradient-to-br ${dest.color} flex items-center justify-center`}
                    >
                      <span className="text-5xl">{dest.emoji}</span>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-900">{dest.name}</h3>
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {dest.cost}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{dest.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Traveloop — Plan Your Perfect Journey
        </div>
      </footer>
    </div>
  );
}
