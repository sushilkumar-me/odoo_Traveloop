"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { deleteTrip, addCityToTrip, addActivityToCity, reorderCities, removeCityFromTrip, removeActivity } from "@/lib/actions/trip-actions";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Wallet,
  Trash2,
  Globe,
  Building,
  Clock,
  TrendingUp,
  Plus,
  Plane,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ── Types inferred from Prisma includes ──────────────────────────────────────
interface Activity {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  duration: string | null;
  cost: number | null;
  date: Date | null;
  time: string | null;
  rating: number;
  createdAt: Date;
}

interface City {
  id: string;
  name: string;
  country: string;
  startDate: Date;
  endDate: Date;
  order: number;
  activities: Activity[];
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  date: Date;
}

interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  currency: string;
  expenses: Expense[];
}

interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  isPublic: boolean;
  cities: City[];
  activities: Activity[];
  budgets: Budget[];
  user: { id: string; name: string | null; email: string };
}

interface SummaryTrip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  cities: { name: string; country: string }[];
  budgets: { totalAmount: number; expenses: { amount: number }[] }[];
}

interface ItineraryViewProps {
  trip: Trip;
  allUserTrips: SummaryTrip[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysBetween(a: Date | string, b: Date | string) {
  return Math.ceil(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getDaysInCity(startDate: Date, endDate: Date) {
  const dates = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// ── Component ────────────────────────────────────────────────────────────────
export function ItineraryView({ trip, allUserTrips }: ItineraryViewProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [cityForm, setCityForm] = useState({ name: "", country: "", startDate: "", endDate: "" });

  // Adding activity state tracking cityId and specifically which date they are adding it to
  const [addingActivityTo, setAddingActivityTo] = useState<{ cityId: string; dateStr: string | "unassigned" } | null>(null);
  const [activityForm, setActivityForm] = useState({ name: "", description: "", location: "", duration: "", cost: "", time: "" });

  const now = new Date();
  const isPast = new Date(trip.endDate) < now;
  const isUpcoming = new Date(trip.startDate) > now;
  const isOngoing = !isPast && !isUpcoming;
  const tripDays = daysBetween(trip.startDate, trip.endDate);

  const totalBudget = trip.budgets.reduce((s, b) => s + b.totalAmount, 0);
  const totalSpent = trip.budgets.reduce(
    (s, b) => s + b.expenses.reduce((es, e) => es + e.amount, 0),
    0
  );
  const remaining = totalBudget - totalSpent;

  const status = isPast ? "Completed" : isOngoing ? "In Progress" : "Upcoming";
  const statusColor = isPast
    ? "bg-gray-500/90 text-white"
    : isOngoing
    ? "bg-yellow-500/90 text-white"
    : "bg-green-500/90 text-white";

  const handleDelete = async () => {
    if (!confirm(`Delete "${trip.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteTrip(trip.id);
    router.push("/dashboard/trips");
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCityToTrip(trip.id, {
      name: cityForm.name,
      country: cityForm.country,
      startDate: new Date(cityForm.startDate),
      endDate: new Date(cityForm.endDate),
    });
    setIsAddingCity(false);
    setCityForm({ name: "", country: "", startDate: "", endDate: "" });
  };

  const handleDeleteCity = async (cityId: string, cityName: string) => {
    if (!confirm(`Delete "${cityName}" and all its activities?`)) return;
    await removeCityFromTrip(cityId, trip.id);
  };

  const handleAddActivity = async (e: React.FormEvent, cityId: string, dateStr: string | "unassigned") => {
    e.preventDefault();
    await addActivityToCity(cityId, trip.id, {
      name: activityForm.name,
      description: activityForm.description,
      location: activityForm.location,
      duration: activityForm.duration,
      cost: activityForm.cost ? Number(activityForm.cost) : undefined,
      date: dateStr !== "unassigned" ? dateStr : undefined,
      time: activityForm.time,
    });
    setAddingActivityTo(null);
    setActivityForm({ name: "", description: "", location: "", duration: "", cost: "", time: "" });
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Remove this activity?")) return;
    await removeActivity(activityId, trip.id);
  };

  const moveCity = async (index: number, direction: 'up' | 'down') => {
    const newCities = [...trip.cities];
    if (direction === 'up' && index > 0) {
      [newCities[index - 1], newCities[index]] = [newCities[index], newCities[index - 1]];
    } else if (direction === 'down' && index < newCities.length - 1) {
      [newCities[index], newCities[index + 1]] = [newCities[index + 1], newCities[index]];
    } else return;
    
    await reorderCities(trip.id, newCities.map(c => c.id));
  };

  const renderActivityList = (activities: Activity[]) => {
    if (activities.length === 0) {
      return (
        <p className="text-sm text-gray-400 italic px-4 py-2">
          No activities planned for this day.
        </p>
      );
    }
    return (
      <ul className="divide-y divide-gray-50">
        {activities.sort((a, b) => (a.time || "").localeCompare(b.time || "")).map((act) => (
          <li
            key={act.id}
            className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-2 h-2 rounded-full bg-[#ff7a1a] mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-900 text-[15px]">{act.name.split('#')[0]}</p>
                <div className="flex items-center gap-2">
                  {act.time && (
                    <Badge variant="outline" className="text-xs text-[#ff7a1a] border-[#ff7a1a]/30">
                      {act.time}
                    </Badge>
                  )}
                  <button 
                    onClick={() => handleDeleteActivity(act.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {act.description && (
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                  {act.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-medium flex-wrap">
                {act.location && (
                  <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {act.location}
                  </span>
                )}
                {act.duration && (
                  <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {act.duration}
                  </span>
                )}
                {act.cost != null && (
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                    <Wallet className="w-3.5 h-3.5" />
                    ${act.cost.toLocaleString("en-US")}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderActivityForm = (cityId: string, dateStr: string | "unassigned") => {
    return (
      <div className="p-4 bg-orange-50/50 border-b border-gray-100">
        <form onSubmit={(e) => handleAddActivity(e, cityId, dateStr)} className="space-y-3">
          <Input required value={activityForm.name} onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })} placeholder="Activity Name (e.g. Louvre Museum)" />
          <Input value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} placeholder="Short description..." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input type="time" value={activityForm.time} onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })} placeholder="Time" />
            <Input value={activityForm.location} onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })} placeholder="Location" />
            <Input value={activityForm.duration} onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })} placeholder="Duration (e.g. 2h)" />
            <Input type="number" value={activityForm.cost} onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })} placeholder="Cost (₹)" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAddingActivityTo(null)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white">Add Activity</Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Back + Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900 -ml-2">
  <Link href="/dashboard/trips">
    
            <ArrowLeft className="w-4 h-4" />
            All Trips
          
  </Link>
</Button>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-2 text-gray-600 hover:text-gray-900">
  <Link href={`/dashboard/trips/${trip.id}/budget`}>
    
              <Wallet className="w-4 h-4" />
              Budget Dashboard
            
  </Link>
</Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting…" : "Delete Trip"}
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden shadow-xl"
      >
        <div className="relative h-64 sm:h-80">
          <img
            src={
              trip.coverImage ||
              "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&h=500&fit=crop"
            }
            alt={trip.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <Badge className={`mb-3 border-0 ${statusColor}`}>{status}</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {trip.name}
            </h1>
            {trip.description && (
              <p className="text-white/80 text-sm max-w-2xl">{trip.description}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Duration",
            value: `${tripDays} day${tripDays !== 1 ? "s" : ""}`,
            sub: `${fmt(trip.startDate)} → ${fmt(trip.endDate)}`,
            icon: Clock,
            gradient: "from-blue-500 to-blue-600",
          },
          {
            label: "Cities",
            value: trip.cities.length || "—",
            sub:
              trip.cities.length > 0
                ? trip.cities.map((c) => c.name).join(", ")
                : "No cities added",
            icon: Building,
            gradient: "from-[#ff7a1a] to-[#ff9f5a]",
          },
          {
            label: "Total Budget",
            value: totalBudget > 0 ? `₹${totalBudget.toLocaleString("en-US")}` : "—",
            sub: totalSpent > 0 ? `₹${totalSpent.toLocaleString("en-US")} spent` : "No expenses yet",
            icon: Wallet,
            gradient: "from-purple-500 to-purple-600",
          },
          {
            label: "Remaining",
            value:
              totalBudget > 0
                ? `₹${Math.abs(remaining).toLocaleString("en-US")}`
                : "—",
            sub:
              totalBudget > 0
                ? remaining >= 0
                  ? "within budget"
                  : "over budget"
                : "No budget set",
            icon: TrendingUp,
            gradient: remaining >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600",
          },
        ].map(({ label, value, sub, icon: Icon, gradient }) => (
          <Card key={label} className="border-0 shadow-lg shadow-gray-200/50">
            <CardContent className="p-5">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cities & Activities — left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#ff7a1a]" />
              Day-by-Day Itinerary
            </h2>
            <Button onClick={() => setIsAddingCity(!isAddingCity)} className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Stop
            </Button>
          </div>

          {/* Add City Form */}
          {isAddingCity && (
            <Card className="border border-[#ff7a1a]/20 shadow-md">
              <CardContent className="p-5">
                <form onSubmit={handleAddCity} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">City Name</label>
                      <Input required value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} placeholder="e.g. Paris" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Country</label>
                      <Input required value={cityForm.country} onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })} placeholder="e.g. France" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <Input type="date" required value={cityForm.startDate} onChange={(e) => setCityForm({ ...cityForm, startDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">End Date</label>
                      <Input type="date" required value={cityForm.endDate} onChange={(e) => setCityForm({ ...cityForm, endDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsAddingCity(false)}>Cancel</Button>
                    <Button type="submit" className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white">Save City</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {trip.cities.length === 0 && !isAddingCity ? (
            <Card className="border-dashed border-2 border-gray-200 shadow-none">
              <CardContent className="p-10 text-center">
                <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No stops added yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Add Stop" to start building your interactive itinerary.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {trip.cities.map((city, idx) => {
                const days = getDaysInCity(city.startDate, city.endDate);
                const activitiesByDate = days.reduce((acc, date) => {
                  const dStr = date.toISOString().split('T')[0];
                  acc[dStr] = city.activities.filter(a => a.date && new Date(a.date).toISOString().split('T')[0] === dStr);
                  return acc;
                }, {} as Record<string, Activity[]>);

                const unassignedActs = city.activities.filter(a => !a.date);

                return (
                  <motion.div
                    key={city.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Card className="border-0 shadow-md shadow-gray-200/50 overflow-hidden mb-6 group/city">
                      <div className="flex items-center gap-4 p-5 border-b border-gray-100 bg-white">
                        <div className="flex flex-col items-center justify-center pr-2 border-r border-gray-100">
                          <button disabled={idx === 0} onClick={() => moveCity(idx, 'up')} className="text-gray-300 hover:text-[#ff7a1a] disabled:opacity-30 disabled:hover:text-gray-300">
                            <ChevronUp className="w-5 h-5" />
                          </button>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center text-white font-bold text-sm my-1">
                            {idx + 1}
                          </div>
                          <button disabled={idx === trip.cities.length - 1} onClick={() => moveCity(idx, 'down')} className="text-gray-300 hover:text-[#ff7a1a] disabled:opacity-30 disabled:hover:text-gray-300">
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0 pl-2">
                          <h3 className="font-bold text-gray-900 text-xl">
                            {city.name},{" "}
                            <span className="text-gray-500 font-normal text-lg">{city.country}</span>
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {fmt(city.startDate)} — {fmt(city.endDate)}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteCity(city.id, city.name)} 
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/city:opacity-100"
                          title="Delete Stop"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>

                      <CardContent className="p-0">
                        {/* Day by Day Breakdown */}
                        {days.map((date, dayIdx) => {
                          const dateStr = date.toISOString().split('T')[0];
                          const dayActivities = activitiesByDate[dateStr] || [];
                          const isAdding = addingActivityTo?.cityId === city.id && addingActivityTo?.dateStr === dateStr;

                          return (
                            <div key={dateStr} className="border-b border-gray-100 last:border-0">
                              <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80">
                                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                  <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200 border-0">Day {dayIdx + 1}</Badge>
                                  {fmt(date)}
                                </h4>
                                <Button variant="ghost" size="sm" onClick={() => setAddingActivityTo({ cityId: city.id, dateStr })} className="text-[#ff7a1a] hover:bg-orange-50 h-8">
                                  <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                              </div>

                              {isAdding && renderActivityForm(city.id, dateStr)}
                              {renderActivityList(dayActivities)}
                            </div>
                          );
                        })}

                        {/* Unassigned / Anytime Activities */}
                        {unassignedActs.length > 0 && (
                          <div className="border-t border-gray-200 bg-orange-50/30">
                            <div className="flex items-center justify-between px-5 py-3">
                              <h4 className="font-semibold text-gray-600 flex items-center gap-2">
                                Anytime / Unscheduled
                              </h4>
                            </div>
                            {renderActivityList(unassignedActs)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Unassigned activities */}
          {trip.activities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Plane className="w-4 h-4 text-gray-400" />
                Other Activities
              </h3>
              <Card className="border-0 shadow-md shadow-gray-200/50">
                <CardContent className="p-5 space-y-3">
                  {trip.activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{act.name}</p>
                        {act.cost != null && (
                          <p className="text-xs text-emerald-600 font-medium mt-0.5">
                            ${act.cost.toLocaleString("en-US")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right sidebar — Budget + Other Trips */}
        <div className="space-y-6">
          {/* Budget breakdown */}
          <Card className="border-0 shadow-lg shadow-gray-200/50">
            <CardContent className="p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-500" />
                Budget Breakdown
              </h3>

              {trip.budgets.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">No budget set for this trip.</p>
                </div>
              ) : (
                trip.budgets.map((budget) => {
                  const spent = budget.expenses.reduce((s, e) => s + e.amount, 0);
                  const pct = budget.totalAmount > 0 ? Math.min((spent / budget.totalAmount) * 100, 100) : 0;
                  return (
                    <div key={budget.id} className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total</span>
                        <span className="font-semibold text-gray-900">
                          {budget.currency} {budget.totalAmount.toLocaleString("en-US")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Spent</span>
                        <span className="font-semibold text-red-500">
                          {budget.currency} {spent.toLocaleString("en-US")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Remaining</span>
                        <span
                          className={`font-semibold ${
                            budget.totalAmount - spent >= 0
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {budget.currency}{" "}
                          {Math.abs(budget.totalAmount - spent).toLocaleString("en-US")}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 100 ? "bg-red-500" : pct > 75 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-right">{pct.toFixed(0)}% used</p>

                      {/* Expenses list */}
                      {budget.expenses.length > 0 && (
                        <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Expenses
                          </p>
                          {budget.expenses.slice(0, 5).map((exp) => (
                            <div key={exp.id} className="flex justify-between text-xs">
                              <span className="text-gray-600 truncate max-w-[60%]">
                                {exp.description}
                              </span>
                              <span className="text-gray-800 font-medium">
                                ${exp.amount.toLocaleString("en-US")}
                              </span>
                            </div>
                          ))}
                          {budget.expenses.length > 5 && (
                            <p className="text-xs text-gray-400 text-center pt-1">
                              +{budget.expenses.length - 5} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Other trips */}
          {allUserTrips.filter((t) => t.id !== trip.id).length > 0 && (
            <Card className="border-0 shadow-lg shadow-gray-200/50">
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#ff7a1a]" />
                  Other Trips
                </h3>
                <div className="space-y-2">
                  {allUserTrips
                    .filter((t) => t.id !== trip.id)
                    .slice(0, 4)
                    .map((t) => (
                      <Link
                        key={t.id}
                        href={`/dashboard/trips/${t.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center shrink-0">
                          <Plane className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-[#ff7a1a] transition-colors truncate">
                            {t.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {fmt(t.startDate)}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
                <Button asChild
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-[#ff7a1a] hover:bg-orange-50"
                  >
  <Link href="/dashboard/trips">
    
                    View all trips
                  
  </Link>
</Button>
              </CardContent>
            </Card>
          )}

          {/* Plan new trip */}
          <Button asChild className="w-full bg-[#ff7a1a] hover:bg-[#e66b15] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 gap-2">
  <Link href="/plan-trip">
    
              <Plus className="w-4 h-4" />
              Plan Another Trip
            
  </Link>
</Button>
        </div>
      </div>
    </div>
  );
}
