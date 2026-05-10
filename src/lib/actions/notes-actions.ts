"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().optional().nullable(),
  category: z.string().default("general"),
  priority: z.string().default("medium"),
  tags: z.array(z.string()).optional().nullable(),
  isJournal: z.boolean().optional().default(false),
  mood: z.string().optional().nullable(),
  tripId: z.string().optional().nullable(),
  cityId: z.string().optional().nullable(),
  noteDate: z.date().optional().nullable(),
});

export type NoteInput = z.infer<typeof noteSchema>;

export async function getNotes(userId: string, params?: {
  search?: string;
  tripId?: string;
  category?: string;
  priority?: string;
  isArchived?: boolean;
  isJournal?: boolean;
  sortBy?: "newest" | "oldest" | "priority" | "category";
}) {
  try {
    if (!userId) {
      return { success: true, data: [] };
    }

    const { search, tripId, category, priority, isArchived, isJournal, sortBy } = params || {};

    const where: any = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    if (tripId) {
      where.tripId = tripId;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (isArchived !== undefined) {
      where.isArchived = isArchived;
    }

    if (isJournal !== undefined) {
      where.isJournal = isJournal;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "priority") {
      orderBy = [
        { priority: "desc" },
        { createdAt: "desc" },
      ];
    } else if (sortBy === "category") {
      orderBy = [
        { category: "asc" },
        { createdAt: "desc" },
      ];
    }

    const notes = await db.note.findMany({
      where,
      include: {
        trip: { select: { id: true, name: true } },
        city: { select: { id: true, name: true, country: true } },
      },
      orderBy,
    });

    return { success: true, data: notes };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return { success: true, data: [] };
  }
}

export async function getNoteById(noteId: string) {
  try {
    const note = await db.note.findUnique({
      where: { id: noteId },
      include: {
        trip: { select: { id: true, name: true, startDate: true, endDate: true } },
        city: { select: { id: true, name: true, country: true, startDate: true, endDate: true } },
      },
    });

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    return { success: true, data: note };
  } catch (error) {
    return { success: false, error: "Failed to fetch note" };
  }
}

export async function createNote(userId: string, data: NoteInput) {
  try {
    const validated = noteSchema.parse(data);

    // Build note data carefully
    const noteData: any = {
      title: validated.title,
      content: validated.content || "",
      category: validated.category || "general",
      priority: validated.priority || "medium",
      userId,
      tags: validated.tags || [],
      isJournal: validated.isJournal || false,
    };

    // Add optional fields if they have values
    if (validated.mood) noteData.mood = validated.mood;
    if (validated.tripId) noteData.tripId = validated.tripId;
    if (validated.cityId) noteData.cityId = validated.cityId;
    if (validated.noteDate) noteData.noteDate = validated.noteDate;

    const note = await db.note.create({
      data: noteData,
    });

    revalidatePath("/notes");
    return { success: true, data: note };
  } catch (error) {
    console.error("Create note error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create note" };
  }
}

export async function updateNote(noteId: string, userId: string, data: Partial<NoteInput>) {
  try {
    const note = await db.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    const updated = await db.note.update({
      where: { id: noteId },
      data: {
        ...data,
        tags: data.tags || note.tags,
      },
    });

    revalidatePath("/notes");
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update note" };
  }
}

export async function deleteNote(noteId: string, userId: string) {
  try {
    const note = await db.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    await db.note.delete({
      where: { id: noteId },
    });

    revalidatePath("/notes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete note" };
  }
}

export async function archiveNote(noteId: string, userId: string) {
  try {
    const note = await db.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    const updated = await db.note.update({
      where: { id: noteId },
      data: { isArchived: true },
    });

    revalidatePath("/notes");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Failed to archive note" };
  }
}

export async function unarchiveNote(noteId: string, userId: string) {
  try {
    const note = await db.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    const updated = await db.note.update({
      where: { id: noteId },
      data: { isArchived: false },
    });

    revalidatePath("/notes");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Failed to unarchive note" };
  }
}

export async function getNotesByTrip(userId: string, tripId: string) {
  try {
    const notes = await db.note.findMany({
      where: { userId, tripId },
      include: {
        city: { select: { id: true, name: true, country: true } },
      },
      orderBy: [{ noteDate: "asc" }, { createdAt: "asc" }],
    });

    return { success: true, data: notes };
  } catch (error) {
    return { success: false, error: "Failed to fetch trip notes" };
  }
}

export async function getUserTrips(userId: string) {
  try {
    const trips = await db.trip.findMany({
      where: { userId },
      select: { id: true, name: true, startDate: true, endDate: true },
      orderBy: { startDate: "desc" },
    });

    return { success: true, data: trips };
  } catch (error) {
    return { success: false, error: "Failed to fetch trips" };
  }
}

export async function getNoteStats(userId: string) {
  try {
    const [total, byCategory, byPriority, journalCount, archivedCount] = await Promise.all([
      db.note.count({ where: { userId } }),
      db.note.groupBy({
        by: ["category"],
        where: { userId, isArchived: false },
        _count: true,
      }),
      db.note.groupBy({
        by: ["priority"],
        where: { userId, isArchived: false },
        _count: true,
      }),
      db.note.count({ where: { userId, isJournal: true, isArchived: false } }),
      db.note.count({ where: { userId, isArchived: true } }),
    ]);

    return {
      success: true,
      data: {
        total,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {} as Record<string, number>),
        journalCount,
        archivedCount,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch note stats" };
  }
}