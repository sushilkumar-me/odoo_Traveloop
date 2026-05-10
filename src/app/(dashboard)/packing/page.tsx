"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  Package,
  Sparkles,
  RotateCcw,
  FileText,
  Shirt,
  Laptop,
  Droplet,
  Pill,
  Watch,
  Coffee,
  Star,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getPackingItems,
  createPackingItem,
  updatePackingItem,
  togglePackedStatus,
  deletePackingItem,
  resetChecklist,
  addSuggestedItems,
  getUserTripsByEmail,
  getPackingStats,
  PackingItemInput,
} from "@/lib/actions/packing-actions";

const packingCategories = [
  { value: "documents", label: "Documents", icon: "FileText", color: "text-blue-400" },
  { value: "clothing", label: "Clothing", icon: "Shirt", color: "text-purple-400" },
  { value: "electronics", label: "Electronics", icon: "Laptop", color: "text-cyan-400" },
  { value: "toiletries", label: "Toiletries", icon: "Droplet", color: "text-teal-400" },
  { value: "medicines", label: "Medicines", icon: "Pill", color: "text-red-400" },
  { value: "accessories", label: "Accessories", icon: "Watch", color: "text-yellow-400" },
  { value: "food", label: "Food & Snacks", icon: "Coffee", color: "text-orange-400" },
  { value: "other", label: "Other", icon: "Package", color: "text-slate-400" },
];

interface PackingItemData {
  id: string;
  name: string;
  quantity: number;
  category: string;
  notes: string | null;
  priority: string;
  isPacked: boolean;
  isEssential: boolean;
  tripId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TripData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  coverImage?: string | null;
  _count?: { packingItems: number };
}

interface PackingGroup {
  [key: string]: PackingItemData[];
}

interface PackingData {
  items: PackingItemData[];
  grouped: PackingGroup;
  stats: {
    totalItems: number;
    packedItems: number;
    progress: number;
  };
}

const priorities = [
  { value: "low", label: "Low", color: "text-slate-400", bg: "bg-slate-500/20" },
  { value: "medium", label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  { value: "high", label: "High", color: "text-red-400", bg: "bg-red-500/20" },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "documents": return FileText;
    case "clothing": return Shirt;
    case "electronics": return Laptop;
    case "toiletries": return Droplet;
    case "medicines": return Pill;
    case "accessories": return Watch;
    case "food": return Coffee;
    default: return Package;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "documents": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "clothing": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "electronics": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "toiletries": return "bg-teal-500/20 text-teal-400 border-teal-500/30";
    case "medicines": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "accessories": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "food": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

export default function PackingPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "priority" | "newest" | "category">("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItemData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(packingCategories.map(c => c.value)));
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: tripsData } = useQuery({
    queryKey: ["user-trips", userEmail],
    queryFn: () => getUserTripsByEmail(userEmail!),
    enabled: !!userEmail,
  });

  const userIdFromEmail = tripsData?.data?.userId || userId;

  const { data: packingData, isLoading, refetch } = useQuery({
    queryKey: ["packing-items", userIdFromEmail, selectedTrip, debouncedSearch, selectedCategory, sortBy],
    queryFn: () => {
      if (!userIdFromEmail || !selectedTrip) return Promise.resolve({ success: true, data: { items: [], grouped: {}, stats: { totalItems: 0, packedItems: 0, progress: 0 } } });
      return getPackingItems(userIdFromEmail, selectedTrip, {
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        sortBy,
      });
    },
    enabled: !!userIdFromEmail && !!selectedTrip,
  });

  const { data: statsData } = useQuery({
    queryKey: ["packing-stats", userIdFromEmail, selectedTrip],
    queryFn: () => {
      if (!userIdFromEmail || !selectedTrip) return Promise.resolve({ success: false });
      return getPackingStats(userIdFromEmail, selectedTrip);
    },
    enabled: !!userIdFromEmail && !!selectedTrip,
  });

  const trips = tripsData?.data?.trips || [];
  const data = packingData?.data as PackingData | undefined;
  const items = data?.items || [];
  const grouped = data?.grouped || {};
  const stats = data?.stats || { totalItems: 0, packedItems: 0, progress: 0 };

  const createMutation = useMutation({
    mutationFn: (data: PackingItemInput) => {
      if (!userIdFromEmail || !selectedTrip) throw new Error("Missing user or trip");
      return createPackingItem(userIdFromEmail, selectedTrip, data);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Item added!", variant: "default" });
        setShowAddModal(false);
        queryClient.invalidateQueries({ queryKey: ["packing-items"] });
        queryClient.invalidateQueries({ queryKey: ["packing-stats"] });
      } else {
        toast({ title: result.error || "Failed to add item", variant: "destructive" });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PackingItemInput> }) => {
      if (!userIdFromEmail) throw new Error("Missing user");
      return updatePackingItem(id, userIdFromEmail, data);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Item updated!", variant: "default" });
        setEditingItem(null);
        queryClient.invalidateQueries({ queryKey: ["packing-items"] });
        queryClient.invalidateQueries({ queryKey: ["packing-stats"] });
      } else {
        toast({ title: result.error || "Failed to update item", variant: "destructive" });
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => {
      if (!userIdFromEmail) throw new Error("Missing user");
      return togglePackedStatus(id, userIdFromEmail);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["packing-items"] });
        queryClient.invalidateQueries({ queryKey: ["packing-stats"] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!userIdFromEmail) throw new Error("Missing user");
      return deletePackingItem(id, userIdFromEmail);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Item deleted", variant: "default" });
        setShowDeleteModal(null);
        queryClient.invalidateQueries({ queryKey: ["packing-items"] });
        queryClient.invalidateQueries({ queryKey: ["packing-stats"] });
      }
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => {
      if (!userIdFromEmail || !selectedTrip) throw new Error("Missing user or trip");
      return resetChecklist(userIdFromEmail, selectedTrip);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Checklist reset!", variant: "default" });
        queryClient.invalidateQueries({ queryKey: ["packing-items"] });
        queryClient.invalidateQueries({ queryKey: ["packing-stats"] });
      }
    },
  });

  const suggestMutation = useMutation({
    mutationFn: () => {
      if (!userIdFromEmail || !selectedTrip) throw new Error("Missing user or trip");
      return addSuggestedItems(userIdFromEmail, selectedTrip);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: `Added ${result.data?.added || 0} suggested items!`, variant: "default" });
        queryClient.invalidateQueries({ queryKey: ["packing-items"] });
        queryClient.invalidateQueries({ queryKey: ["packing-stats"] });
      }
    },
  });

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  if (!userId && !userEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Packing Checklist</h1>
              <p className="text-slate-400">Never forget your essentials again</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => suggestMutation.mutate()}
                disabled={!selectedTrip || suggestMutation.isPending}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 font-medium transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" />
                Smart Suggestions
              </button>
              <button
                onClick={() => resetMutation.mutate()}
                disabled={!selectedTrip || resetMutation.isPending}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!selectedTrip}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                Add Item
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trip Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-slate-400 text-sm mb-2 block">Select Trip</label>
                <select
                  value={selectedTrip || ""}
                  onChange={(e) => setSelectedTrip(e.target.value || null)}
                  className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="" className="bg-slate-900">Choose a trip...</option>
                  {trips.map((trip: TripData) => (
                    <option key={trip.id} value={trip.id} className="bg-slate-900">
                      {trip.name} {trip.startDate ? `(${new Date(trip.startDate).toLocaleDateString()})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTrip && (
                <>
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items..."
                      className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="newest" className="bg-slate-900">Newest</option>
                      <option value="name" className="bg-slate-900">Name</option>
                      <option value="priority" className="bg-slate-900">Priority</option>
                      <option value="category" className="bg-slate-900">Category</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {selectedTrip && hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Progress Bar */}
        {selectedTrip && stats.totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Packing Progress</h3>
                <p className="text-slate-400 text-sm">{stats.packedItems} of {stats.totalItems} items packed</p>
              </div>
              <div className="text-4xl font-bold text-orange-500">{stats.progress}%</div>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Category Filter Pills */}
        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === null
                  ? "bg-orange-500 text-white"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              All Categories
            </button>
            {packingCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.value);
              const catItems = grouped[cat.value] || [];
              const packedCount = catItems.filter(i => i.isPacked).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? "bg-orange-500 text-white"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${cat.color}`} />
                  {cat.label}
                  <span className="text-xs opacity-70">({packedCount}/{catItems.length})</span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && selectedTrip ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : !selectedTrip ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Package className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a trip</h3>
            <p className="text-slate-400">Choose a trip to manage your packing checklist</p>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Package className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No items yet</h3>
            <p className="text-slate-400 mb-4">Start adding items to your packing list</p>
            <button
              onClick={() => suggestMutation.mutate()}
              className="px-6 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors"
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              Add Smart Suggestions
            </button>
          </motion.div>
        ) : (
          /* Categories List */
          <div className="space-y-4">
            {packingCategories.map((cat) => {
              const catItems = grouped[cat.value] || [];
              if (selectedCategory && selectedCategory !== cat.value) return null;
              if (catItems.length === 0) return null;

              const Icon = getCategoryIcon(cat.value);
              const packedCount = catItems.filter(i => i.isPacked).length;
              const isExpanded = expandedCategories.has(cat.value);

              return (
                <motion.div
                  key={cat.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat.value)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(cat.value)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-semibold">{cat.label}</h3>
                        <p className="text-slate-400 text-sm">{packedCount}/{catItems.length} packed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${catItems.length > 0 ? (packedCount / catItems.length) * 100 : 0}%` }}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Items List */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-2">
                          {catItems.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${
                                item.isPacked
                                  ? "bg-green-500/10 border border-green-500/20"
                                  : "bg-white/5 border border-white/10 hover:border-white/20"
                              }`}
                            >
                              {/* Checkbox */}
                              <button
                                onClick={() => toggleMutation.mutate(item.id)}
                                className="shrink-0"
                              >
                                {item.isPacked ? (
                                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                  <Circle className="h-6 w-6 text-slate-500" />
                                )}
                              </button>

                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${item.isPacked ? "text-green-400 line-through" : "text-white"}`}>
                                    {item.name}
                                  </span>
                                  {item.isEssential && (
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  )}
                                </div>
                                {item.notes && (
                                  <p className="text-slate-400 text-sm truncate">{item.notes}</p>
                                )}
                              </div>

                              {/* Quantity & Priority */}
                              <div className="flex items-center gap-3">
                                {item.quantity > 1 && (
                                  <span className="px-2 py-1 rounded-lg bg-white/10 text-slate-400 text-xs">
                                    x{item.quantity}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded-lg ${
                                  priorities.find(p => p.value === item.priority)?.bg || "bg-slate-500/20"
                                } ${
                                  priorities.find(p => p.value === item.priority)?.color || "text-slate-400"
                                }`}>
                                  {priorities.find(p => p.value === item.priority)?.label}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteModal(item.id)}
                                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || editingItem) && (
            <PackingModal
              item={editingItem}
              onClose={() => {
                setShowAddModal(false);
                setEditingItem(null);
              }}
              onSave={(data) => {
                if (editingItem) {
                  updateMutation.mutate({ id: editingItem.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              isSaving={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(null)}
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
                  <h3 className="text-2xl font-bold text-white mb-2">Delete Item?</h3>
                  <p className="text-slate-400 mb-6">This action cannot be undone.</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowDeleteModal(null)}
                      className="flex-1 py-3 px-6 rounded-2xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(showDeleteModal)}
                      className="flex-1 py-3 px-6 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Packing Item Modal
function PackingModal({
  item,
  onClose,
  onSave,
  isSaving,
}: {
  item?: PackingItemData | null;
  onClose: () => void;
  onSave: (data: PackingItemInput) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    quantity: item?.quantity || 1,
    category: item?.category || "general",
    notes: item?.notes || "",
    priority: item?.priority || "medium",
    isEssential: item?.isEssential || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      quantity: formData.quantity,
      category: formData.category as any,
      notes: formData.notes || undefined,
      priority: formData.priority as any,
      isEssential: formData.isEssential,
      isPacked: item?.isPacked || false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-800 border border-white/10 rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{item ? "Edit Item" : "Add New Item"}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Item Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="What do you need to pack?"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {packingCategories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-slate-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value} className="bg-slate-900">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
              />
            </div>

            {/* Essential Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isEssential}
                  onChange={(e) => setFormData({ ...formData, isEssential: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50"
                />
                <span className="text-white">Mark as Essential</span>
              </label>
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-2xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 px-6 rounded-2xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : item ? "Update Item" : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}