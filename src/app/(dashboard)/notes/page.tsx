"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  SortAsc,
  BookOpen,
  Hotel,
  Plane,
  Utensils,
  AlertTriangle,
  Bell,
  PenLine,
  Archive,
  Trash2,
  Edit3,
  X,
  Calendar,
  MapPin,
  Tag,
  Smile,
  Loader2,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  archiveNote,
  unarchiveNote,
  getNoteStats,
  getUserTrips,
  NoteInput,
} from "@/lib/actions/notes-actions";

const categories = [
  { value: "general", label: "General", icon: BookOpen },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "transport", label: "Transport", icon: Plane },
  { value: "food", label: "Food & Dining", icon: Utensils },
  { value: "emergency", label: "Emergency", icon: AlertTriangle },
  { value: "reminder", label: "Reminder", icon: Bell },
  { value: "journal", label: "Journal", icon: PenLine },
];

const priorities = [
  { value: "low", label: "Low", color: "text-slate-400", bg: "bg-slate-500/20" },
  { value: "medium", label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  { value: "high", label: "High", color: "text-red-400", bg: "bg-red-500/20" },
];

const moods = [
  { value: "happy", label: "Happy", icon: "😊" },
  { value: "excited", label: "Excited", icon: "🤩" },
  { value: "relaxed", label: "Relaxed", icon: "😌" },
  { value: "tired", label: "Tired", icon: "😴" },
  { value: "adventurous", label: "Adventurous", icon: "🌟" },
];

interface NoteData {
  id: string;
  title: string;
  content: string | null;
  category: string;
  priority: string;
  tags: string[];
  isArchived: boolean;
  isJournal: boolean;
  mood: string | null;
  tripId: string | null;
  cityId: string | null;
  noteDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  trip?: { id: string; name: string } | null;
  city?: { id: string; name: string; country: string } | null;
}

interface TripData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export default function NotesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "category">("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: notesData, isLoading, refetch } = useQuery({
    queryKey: ["notes", userId, debouncedSearch, selectedTrip, selectedCategory, selectedPriority, showArchived, sortBy],
    queryFn: () => {
      if (!userId) return Promise.resolve({ success: true, data: [] });
      return getNotes(userId, {
        search: debouncedSearch || undefined,
        tripId: selectedTrip || undefined,
        category: selectedCategory || undefined,
        priority: selectedPriority || undefined,
        isArchived: showArchived,
        sortBy,
      });
    },
    enabled: !!userId,
  });

  const { data: tripsData } = useQuery({
    queryKey: ["user-trips", userId],
    queryFn: () => getUserTrips(userId!),
    enabled: !!userId,
  });

  const { data: statsData } = useQuery({
    queryKey: ["note-stats", userId],
    queryFn: () => getNoteStats(userId!),
    enabled: !!userId,
  });

  const notes = notesData?.data || [];
  const trips = tripsData?.data || [];
  const stats = statsData?.data;

  const createMutation = useMutation({
    mutationFn: (data: NoteInput) => createNote(userId!, data),
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Note created!", variant: "default" });
        setShowAddModal(false);

        // Invalidate all note queries and refetch
        queryClient.invalidateQueries({ queryKey: ["notes"] });
        queryClient.invalidateQueries({ queryKey: ["note-stats"] });

        // Also force refetch after a short delay
        setTimeout(() => refetch(), 200);
      } else {
        toast({ title: result.error || "Failed to create note", variant: "destructive" });
      }
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to create note", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteInput> }) =>
      updateNote(id, userId!, data),
    onSuccess: () => {
      toast({ title: "Note updated!", variant: "default" });
      setEditingNote(null);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note-stats"] });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to update note", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id, userId!),
    onSuccess: () => {
      toast({ title: "Note deleted", variant: "default" });
      setShowDeleteModal(null);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note-stats"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveNote(id, userId!),
    onSuccess: () => {
      toast({ title: "Note archived", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note-stats"] });
    },
  });

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.icon || BookOpen;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "hotel": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "transport": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "food": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "emergency": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "reminder": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "journal": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getPriorityStyle = (priority: string) => {
    return priorities.find((p) => p.value === priority) || priorities[1];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTrip(null);
    setSelectedCategory(null);
    setSelectedPriority(null);
    setShowArchived(false);
  };

  const hasActiveFilters = searchQuery || selectedTrip || selectedCategory || selectedPriority || showArchived;

  if (!userId) {
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
              <h1 className="text-4xl font-bold text-white mb-2">Travel Notes</h1>
              <p className="text-slate-400">Organize your travel memories and important details</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Note
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">Total Notes</p>
            </div>
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.value} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <p className="text-2xl font-bold text-white">{stats.byCategory[cat.value] || 0}</p>
                <p className="text-slate-400 text-sm">{cat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Trip Filter */}
            <select
              value={selectedTrip || ""}
              onChange={(e) => setSelectedTrip(e.target.value || null)}
              className="h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="" className="bg-slate-900">All Trips</option>
              {trips.map((trip: TripData) => (
                <option key={trip.id} value={trip.id} className="bg-slate-900">
                  {trip.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="newest" className="bg-slate-900">Newest First</option>
              <option value="oldest" className="bg-slate-900">Oldest First</option>
              <option value="priority" className="bg-slate-900">By Priority</option>
              <option value="category" className="bg-slate-900">By Category</option>
            </select>

            {/* Archived Toggle */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border transition-all ${
                showArchived
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Archive className="h-5 w-5" />
              Archived
            </button>
          </div>

          {/* Category & Priority Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
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
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Notes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
            <p className="text-slate-400 mb-4">Create your first travel note</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Add Note
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note: NoteData, index: number) => {
              const Icon = getCategoryIcon(note.category);
              const priorityStyle = getPriorityStyle(note.priority);

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:border-orange-500/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(note.category)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold line-clamp-1">{note.title}</h3>
                        <p className="text-slate-400 text-sm">{formatDate(note.createdAt)}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${priorityStyle.bg}`} />
                  </div>

                  {/* Content Preview */}
                  {note.content && (
                    <p className="text-slate-400 text-sm line-clamp-3 mb-4">{note.content}</p>
                  )}

                  {/* Tags & Trip Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.trip && (
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {note.trip.name}
                      </span>
                    )}
                    {note.city && (
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 text-xs">
                        {note.city.name}
                      </span>
                    )}
                    {note.isJournal && note.mood && (
                      <span className="px-2 py-1 rounded-lg bg-pink-500/20 text-pink-400 text-xs">
                        {moods.find((m) => m.value === note.mood)?.icon} {note.mood}
                      </span>
                    )}
                    {note.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className={`text-xs px-2 py-1 rounded-lg ${priorityStyle.bg} ${priorityStyle.color}`}>
                      {priorityStyle.label} Priority
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => archiveMutation.mutate(note.id)}
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(note.id)}
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || editingNote) && (
            <NoteModal
              note={editingNote}
              trips={trips}
              onClose={() => {
                setShowAddModal(false);
                setEditingNote(null);
              }}
              onSave={(data) => {
                if (editingNote) {
                  updateMutation.mutate({ id: editingNote.id, data });
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
                  <h3 className="text-2xl font-bold text-white mb-2">Delete Note?</h3>
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

// Note Modal Component
function NoteModal({
  note,
  trips,
  onClose,
  onSave,
  isSaving,
}: {
  note?: NoteData | null;
  trips: TripData[];
  onClose: () => void;
  onSave: (data: NoteInput) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    title: note?.title || "",
    content: note?.content || "",
    category: note?.category || "general",
    priority: note?.priority || "medium",
    tags: note?.tags?.join(", ") || "",
    isJournal: note?.isJournal || false,
    mood: note?.mood || "",
    tripId: note?.tripId || "",
    noteDate: note?.noteDate ? new Date(note.noteDate).toISOString().split("T")[0] : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      content: formData.content || undefined,
      category: formData.category as any,
      priority: formData.priority as any,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      isJournal: formData.isJournal,
      mood: formData.mood as any || undefined,
      tripId: formData.tripId || undefined,
      noteDate: formData.noteDate ? new Date(formData.noteDate) : undefined,
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border border-white/10 rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{note ? "Edit Note" : "Add New Note"}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
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
                  {categories.map((cat) => (
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

            {/* Trip & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Trip (Optional)</label>
                <select
                  value={formData.tripId}
                  onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="" className="bg-slate-900">No trip</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id} className="bg-slate-900">
                      {trip.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Note Date</label>
                <input
                  type="date"
                  value={formData.noteDate}
                  onChange={(e) => setFormData({ ...formData, noteDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>

            {/* Journal Mode */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isJournal}
                  onChange={(e) => setFormData({ ...formData, isJournal: e.target.checked, mood: e.target.checked ? formData.mood : "" })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50"
                />
                <span className="text-white">Journal Entry</span>
              </label>
              {formData.isJournal && (
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="" className="bg-slate-900">Select mood</option>
                  {moods.map((mood) => (
                    <option key={mood.value} value={mood.value} className="bg-slate-900">
                      {mood.icon} {mood.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. hotel, check-in, important"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
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
                {isSaving ? "Saving..." : note ? "Update Note" : "Create Note"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}