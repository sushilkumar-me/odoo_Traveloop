"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plane,
  Globe,
  Wallet,
  Star,
  Settings,
  Shield,
  Bell,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronRight,
  Heart,
  Clock,
  LogOut,
  Moon,
  Sun,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getUserProfile,
  updateProfile,
  updatePreferences,
  deleteAccount,
  removeSavedDestination,
  getUserStats,
} from "@/lib/actions/profile-actions";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
];

const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];

const travelStyles = [
  "Adventure",
  "Relaxation",
  "Cultural",
  "Budget",
  "Luxury",
  "Family",
  "Solo",
  "Business",
];

type TabType = "profile" | "preferences" | "trips" | "saved" | "security" | "privacy";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  language: string;
  currency: string;
  travelStyle: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  createdAt: Date;
  savedDestinations: Array<{
    id: string;
    destination: {
      id: string;
      name: string;
      country: string;
      dailyBudget: number | null;
      imageUrl: string | null;
    };
    createdAt: Date;
  }>;
  trips: Array<{
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    coverImage: string | null;
    cities: Array<{ name: string; country: string }>;
    _count: { activities: number };
  }>;
  _count: {
    trips: number;
    savedDestinations: number;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    tripReminders: boolean;
    marketingEmails: boolean;
    theme: string;
  } | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    image: "",
    language: "en",
    currency: "USD",
    travelStyle: "",
    phone: "",
    city: "",
    country: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    tripReminders: true,
    marketingEmails: false,
    theme: "dark",
  });

  const userId = session?.user?.id;

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  const { data: statsData } = useQuery({
    queryKey: ["user-stats", userId],
    queryFn: () => getUserStats(userId!),
    enabled: !!userId,
  });

  const userData = profileData?.data as UserData | undefined;
  const stats = statsData?.data;

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        bio: userData.bio || "",
        image: userData.image || "",
        language: userData.language || "en",
        currency: userData.currency || "USD",
        travelStyle: userData.travelStyle || "",
        phone: userData.phone || "",
        city: userData.city || "",
        country: userData.country || "",
      });
      if (userData.preferences) {
        setPreferences({
          emailNotifications: userData.preferences.emailNotifications,
          pushNotifications: userData.preferences.pushNotifications,
          tripReminders: userData.preferences.tripReminders,
          marketingEmails: userData.preferences.marketingEmails,
          theme: userData.preferences.theme,
        });
      }
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      return updateProfile(userId, data);
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully!", variant: "default" });
      setIsEditing(false);
      refetch();
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to update profile", variant: "destructive" });
    },
  });

  const preferencesMutation = useMutation({
    mutationFn: (data: typeof preferences) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      return updatePreferences(userId, data);
    },
    onSuccess: () => {
      toast({ title: "Preferences saved!", variant: "default" });
      refetch();
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to save preferences", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      return deleteAccount(userId);
    },
    onSuccess: () => {
      toast({ title: "Account deleted", variant: "default" });
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to delete account", variant: "destructive" });
    },
  });

  const removeDestMutation = useMutation({
    mutationFn: (destinationId: string) => {
      if (!userId) return Promise.reject(new Error("Not authenticated"));
      return removeSavedDestination(userId, destinationId);
    },
    onSuccess: () => {
      toast({ title: "Destination removed", variant: "default" });
      refetch();
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const upcomingTrips = userData?.trips.filter(
    (t) => new Date(t.startDate) > new Date()
  ) || [];

  const previousTrips = userData?.trips.filter(
    (t) => new Date(t.endDate) < new Date()
  ) || [];

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "preferences" as TabType, label: "Preferences", icon: Settings },
    { id: "trips" as TabType, label: "My Trips", icon: Plane },
    { id: "saved" as TabType, label: "Saved Places", icon: Heart },
    { id: "security" as TabType, label: "Security", icon: Shield },
    { id: "privacy" as TabType, label: "Privacy", icon: Bell },
  ];

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 shrink-0"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-6 p-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  {userData?.image ? (
                    <img
                      src={userData.image}
                      alt={userData.name || "User"}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold">{userData?.name || "Traveler"}</h3>
                  <p className="text-slate-400 text-sm">{userData?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Trips Completed",
                        value: stats?.tripsCompleted || 0,
                        icon: Plane,
                        color: "from-orange-500 to-orange-600",
                      },
                      {
                        label: "Countries",
                        value: stats?.countriesVisited || 0,
                        icon: Globe,
                        color: "from-teal-500 to-teal-600",
                      },
                      {
                        label: "Saved Places",
                        value: stats?.savedDestinations || 0,
                        icon: Heart,
                        color: "from-purple-500 to-purple-600",
                      },
                      {
                        label: "Total Budget",
                        value: `?${(stats?.totalBudget || 0).toLocaleString("en-US")}`,
                        icon: Wallet,
                        color: "from-blue-500 to-blue-600",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}
                        >
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-slate-400 text-sm">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Profile Form */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                      <button
                        onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                          isEditing
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {isEditing ? (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4" />
                            Edit Profile
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          />
                        ) : (
                          <p className="text-white py-3">{userData?.name || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </label>
                        <p className="text-white py-3">{userData?.email}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          />
                        ) : (
                          <p className="text-white py-3">{userData?.phone || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </label>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="City"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={formData.country}
                              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                          </div>
                        ) : (
                          <p className="text-white py-3">
                            {userData?.city && userData?.country
                              ? `${userData.city}, ${userData.country}`
                              : "Not set"}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-slate-400 text-sm">Bio</label>
                        {isEditing ? (
                          <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                            placeholder="Tell us about yourself..."
                          />
                        ) : (
                          <p className="text-white py-3">{userData?.bio || "No bio yet"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Language
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          >
                            {languages.map((lang) => (
                              <option key={lang.code} value={lang.code} className="bg-slate-900">
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-white py-3">
                            {languages.find((l) => l.code === userData?.language)?.name || "English"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Currency
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          >
                            {currencies.map((curr) => (
                              <option key={curr} value={curr} className="bg-slate-900">
                                {curr}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-white py-3">{userData?.currency || "USD"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm">Travel Style</label>
                        {isEditing ? (
                          <select
                            value={formData.travelStyle}
                            onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          >
                            <option value="" className="bg-slate-900">Select a style</option>
                            {travelStyles.map((style) => (
                              <option key={style} value={style} className="bg-slate-900">
                                {style}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-white py-3">{userData?.travelStyle || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Joined
                        </label>
                        <p className="text-white py-3">
                          {userData?.createdAt
                            ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Unknown"}
                        </p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                    <div className="space-y-4">
                      {[
                        { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
                        { key: "pushNotifications", label: "Push Notifications", desc: "Receive push notifications" },
                        { key: "tripReminders", label: "Trip Reminders", desc: "Get reminded about upcoming trips" },
                        { key: "marketingEmails", label: "Marketing Emails", desc: "Receive promotional content" },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
                        >
                          <div>
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-slate-400 text-sm">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => {
                              const newPrefs = { ...preferences, [item.key]: !preferences[item.key as keyof typeof preferences] };
                              setPreferences(newPrefs);
                              preferencesMutation.mutate(newPrefs);
                            }}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              preferences[item.key as keyof typeof preferences]
                                ? "bg-orange-500"
                                : "bg-slate-600"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                preferences[item.key as keyof typeof preferences]
                                  ? "translate-x-6"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        {preferences.theme === "dark" ? (
                          <Moon className="h-5 w-5 text-orange-400" />
                        ) : (
                          <Sun className="h-5 w-5 text-yellow-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">Theme</p>
                          <p className="text-slate-400 text-sm">
                            {preferences.theme === "dark" ? "Dark Mode" : "Light Mode"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newTheme = preferences.theme === "dark" ? "light" : "dark";
                          const newPrefs = { ...preferences, theme: newTheme };
                          setPreferences(newPrefs);
                          preferencesMutation.mutate(newPrefs);
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                      >
                        Switch to {preferences.theme === "dark" ? "Light" : "Dark"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trips Tab */}
              {activeTab === "trips" && (
                <motion.div
                  key="trips"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Upcoming Trips */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Clock className="h-6 w-6 text-orange-500" />
                      Upcoming Trips
                    </h2>
                    {upcomingTrips.length === 0 ? (
                      <p className="text-slate-400">No upcoming trips planned.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingTrips.map((trip, index) => (
                          <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                                <Plane className="h-6 w-6 text-orange-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                                  {trip.name}
                                </h3>
                                <p className="text-slate-400 text-sm">
                                  {trip.cities.map((c) => c.name).join(", ") || "No cities added"}
                                </p>
                                <p className="text-slate-500 text-xs mt-1">
                                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                                  {new Date(trip.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Previous Trips */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Star className="h-6 w-6 text-teal-500" />
                      Previous Trips
                    </h2>
                    {previousTrips.length === 0 ? (
                      <p className="text-slate-400">No completed trips yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {previousTrips.map((trip, index) => (
                          <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
                                <Plane className="h-6 w-6 text-teal-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-semibold group-hover:text-teal-400 transition-colors">
                                  {trip.name}
                                </h3>
                                <p className="text-slate-400 text-sm">
                                  {trip.cities.map((c) => c.name).join(", ") || "No cities"}
                                </p>
                                <p className="text-slate-500 text-xs mt-1">
                                  Completed {new Date(trip.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-teal-400 transition-colors" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Saved Tab */}
              {activeTab === "saved" && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Heart className="h-6 w-6 text-red-500" />
                      Saved Destinations
                    </h2>
                    {!userData?.savedDestinations || userData.savedDestinations.length === 0 ? (
                      <p className="text-slate-400">No saved destinations yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.savedDestinations.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group"
                          >
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-purple-500/20">
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="text-white font-bold">{item.destination.name}</h3>
                                <p className="text-slate-300 text-sm">{item.destination.country}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeDestMutation.mutate(item.destination.id)}
                              className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Shield className="h-6 w-6 text-orange-500" />
                      Security Settings
                    </h2>

                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-white font-medium mb-2">Change Password</h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Update your password to keep your account secure
                        </p>
                        <button className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors">
                          Update Password
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-white font-medium mb-2">Two-Factor Authentication</h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Add an extra layer of security to your account
                        </p>
                        <button className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                          Enable 2FA
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-white font-medium mb-2">Active Sessions</h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Manage your active login sessions
                        </p>
                        <button className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                          View Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Bell className="h-6 w-6 text-teal-500" />
                      Privacy & Data
                    </h2>

                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-white font-medium mb-2">Download Your Data</h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Get a copy of all your travel data
                        </p>
                        <button className="px-4 py-2 rounded-xl bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-colors">
                          Request Download
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <h3 className="text-red-400 font-medium mb-2">Delete Account</h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Permanently delete your account and all associated data
                        </p>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-800 border border-white/10 rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Delete Account?</h3>
                <p className="text-slate-400 mb-6">
                  This action cannot be undone. All your data, trips, and saved destinations will be
                  permanently deleted.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 px-6 rounded-2xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    className="flex-1 py-3 px-6 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
