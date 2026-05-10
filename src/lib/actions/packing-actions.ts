"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const packingItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200),
  quantity: z.number().min(1).default(1),
  category: z.string().default("general"),
  notes: z.string().optional().nullable(),
  priority: z.string().default("medium"),
  isEssential: z.boolean().default(false),
  isPacked: z.boolean().default(false),
});

export type PackingItemInput = z.infer<typeof packingItemSchema>;

const categories = [
  { value: "documents", label: "Documents", icon: "FileText", color: "text-blue-400" },
  { value: "clothing", label: "Clothing", icon: "Shirt", color: "text-purple-400" },
  { value: "electronics", label: "Electronics", icon: "Laptop", color: "text-cyan-400" },
  { value: "toiletries", label: "Toiletries", icon: "Droplet", color: "text-teal-400" },
  { value: "medicines", label: "Medicines", icon: "Pill", color: "text-red-400" },
  { value: "accessories", label: "Accessories", icon: "Watch", color: "text-yellow-400" },
  { value: "food", label: "Food & Snacks", icon: "Coffee", color: "text-orange-400" },
  { value: "other", label: "Other", icon: "Package", color: "text-slate-400" },
];

export const packingCategories = categories;

export async function getPackingItems(userId: string, tripId: string, params?: {
  search?: string;
  category?: string;
  isPacked?: boolean;
  sortBy?: "name" | "priority" | "newest" | "category";
}) {
  try {
    if (!userId || !tripId) {
      return { success: true, data: [] };
    }

    const { search, category, isPacked, sortBy } = params || {};

    const where: any = { userId, tripId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (isPacked !== undefined) {
      where.isPacked = isPacked;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "name") {
      orderBy = { name: "asc" };
    } else if (sortBy === "priority") {
      orderBy = [
        { priority: "desc" },
        { name: "asc" },
      ];
    } else if (sortBy === "category") {
      orderBy = [
        { category: "asc" },
        { name: "asc" },
      ];
    }

    const items = await db.packingItem.findMany({
      where,
      orderBy,
    });

    // Group by category
    const grouped = categories.reduce((acc, cat) => {
      acc[cat.value] = items.filter((item) => item.category === cat.value);
      return acc;
    }, {} as Record<string, typeof items>);

    // Calculate stats
    const totalItems = items.length;
    const packedItems = items.filter((i) => i.isPacked).length;
    const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

    return {
      success: true,
      data: {
        items,
        grouped,
        stats: { totalItems, packedItems, progress },
      },
    };
  } catch (error) {
    console.error("Error fetching packing items:", error);
    return { success: true, data: { items: [], grouped: {}, stats: { totalItems: 0, packedItems: 0, progress: 0 } } };
  }
}

export async function createPackingItem(userId: string, tripId: string, data: PackingItemInput) {
  try {
    const validated = packingItemSchema.parse(data);

    const item = await db.packingItem.create({
      data: {
        ...validated,
        userId,
        tripId,
        notes: validated.notes || null,
      },
    });

    revalidatePath("/packing");
    return { success: true, data: item };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create item" };
  }
}

export async function updatePackingItem(itemId: string, userId: string, data: Partial<PackingItemInput>) {
  try {
    const item = await db.packingItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const updated = await db.packingItem.update({
      where: { id: itemId },
      data,
    });

    revalidatePath("/packing");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Failed to update item" };
  }
}

export async function togglePackedStatus(itemId: string, userId: string) {
  try {
    const item = await db.packingItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const updated = await db.packingItem.update({
      where: { id: itemId },
      data: { isPacked: !item.isPacked },
    });

    revalidatePath("/packing");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Failed to update item" };
  }
}

export async function deletePackingItem(itemId: string, userId: string) {
  try {
    const item = await db.packingItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    await db.packingItem.delete({
      where: { id: itemId },
    });

    revalidatePath("/packing");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete item" };
  }
}

export async function resetChecklist(userId: string, tripId: string) {
  try {
    await db.packingItem.updateMany({
      where: { userId, tripId },
      data: { isPacked: false },
    });

    revalidatePath("/packing");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to reset checklist" };
  }
}

export async function addSuggestedItems(userId: string, tripId: string) {
  try {
    // Add some smart suggestions based on common travel items
    const suggestedItems = [
      { name: "Passport", category: "documents", priority: "high", isEssential: true },
      { name: "Travel Insurance", category: "documents", priority: "high", isEssential: true },
      { name: "Phone Charger", category: "electronics", priority: "medium", isEssential: true },
      { name: "Power Bank", category: "electronics", priority: "medium", isEssential: false },
      { name: "Toothbrush", category: "toiletries", priority: "high", isEssential: true },
      { name: "Toothpaste", category: "toiletries", priority: "high", isEssential: true },
      { name: "Shampoo", category: "toiletries", priority: "medium", isEssential: false },
      { name: "T-Shirts", category: "clothing", priority: "medium", isEssential: false },
      { name: "Underwear", category: "clothing", priority: "high", isEssential: true },
      { name: "Socks", category: "clothing", priority: "high", isEssential: true },
      { name: "First Aid Kit", category: "medicines", priority: "medium", isEssential: true },
      { name: "Sunglasses", category: "accessories", priority: "low", isEssential: false },
    ];

    // Check if items already exist
    const existingItems = await db.packingItem.findMany({
      where: { userId, tripId },
      select: { name: true },
    });

    const existingNames = existingItems.map((i) => i.name.toLowerCase());

    // Filter out items that already exist
    const newItems = suggestedItems.filter((item) => !existingNames.includes(item.name.toLowerCase()));

    // Create new items
    for (const item of newItems) {
      await db.packingItem.create({
        data: {
          ...item,
          userId,
          tripId,
        },
      });
    }

    revalidatePath("/packing");
    return { success: true, data: { added: newItems.length } };
  } catch (error) {
    return { success: false, error: "Failed to add suggested items" };
  }
}

export async function getUserTrips(userId: string) {
  try {
    const trips = await db.trip.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        _count: {
          select: { packingItems: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return { success: true, data: trips };
  } catch (error) {
    return { success: false, error: "Failed to fetch trips" };
  }
}

// Alternative function that gets trips by email (more reliable)
export async function getUserTripsByEmail(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return { success: true, data: { userId: null, trips: [] } };
    }

    const trips = await db.trip.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        _count: {
          select: { packingItems: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return { success: true, data: { userId: user.id, trips } };
  } catch (error) {
    console.error("Error fetching trips by email:", error);
    return { success: false, error: "Failed to fetch trips" };
  }
}

export async function getPackingStats(userId: string, tripId: string) {
  try {
    const [total, packed, byCategory, byPriority] = await Promise.all([
      db.packingItem.count({ where: { userId, tripId } }),
      db.packingItem.count({ where: { userId, tripId, isPacked: true } }),
      db.packingItem.groupBy({
        by: ["category"],
        where: { userId, tripId },
        _count: true,
      }),
      db.packingItem.groupBy({
        by: ["priority"],
        where: { userId, tripId },
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        packed,
        progress: total > 0 ? Math.round((packed / total) * 100) : 0,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch stats" };
  }
}