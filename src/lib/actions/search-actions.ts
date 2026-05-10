"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResponse } from "@/types";

const searchDestinationsSchema = z.object({
  query: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  minPopularity: z.number().optional(),
  maxPopularity: z.number().optional(),
  climate: z.string().optional(),
  travelType: z.string().optional(),
  isPopular: z.boolean().optional(),
  sortBy: z.enum(["name", "popularity", "rating", "dailyBudget"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().min(1).max(50).optional(),
  offset: z.number().min(0).optional(),
});

export type SearchDestinationsParams = z.infer<typeof searchDestinationsSchema>;

export async function searchDestinations(params: SearchDestinationsParams) {
  try {
    const validated = searchDestinationsSchema.parse(params);

    const where: any = {};

    if (validated.query) {
      where.OR = [
        { name: { contains: validated.query, mode: "insensitive" } },
        { country: { contains: validated.query, mode: "insensitive" } },
        { description: { contains: validated.query, mode: "insensitive" } },
        { tags: { has: validated.query.toLowerCase() } },
      ];
    }

    if (validated.region) {
      where.region = validated.region;
    }

    if (validated.country) {
      where.country = validated.country;
    }

    if (validated.minBudget || validated.maxBudget) {
      where.dailyBudget = {};
      if (validated.minBudget) where.dailyBudget.gte = validated.minBudget;
      if (validated.maxBudget) where.dailyBudget.lte = validated.maxBudget;
    }

    if (validated.minPopularity) {
      where.popularity = { ...where.popularity, gte: validated.minPopularity };
    }

    if (validated.maxPopularity) {
      where.popularity = { ...where.popularity, lte: validated.maxPopularity };
    }

    if (validated.climate) {
      where.climate = validated.climate;
    }

    if (validated.travelType) {
      where.travelType = validated.travelType;
    }

    if (validated.isPopular !== undefined) {
      where.isPopular = validated.isPopular;
    }

    const orderBy: any = {};
    if (validated.sortBy) {
      orderBy[validated.sortBy] = validated.sortOrder || "desc";
    } else {
      orderBy.popularity = "desc";
    }

    const limit = validated.limit || 20;
    const offset = validated.offset || 0;

    const [destinations, total] = await Promise.all([
      db.destination.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.destination.count({ where }),
    ]);

    return {
      success: true,
      data: {
        destinations,
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to search destinations" };
  }
}

export async function getDestination(destinationId: string) {
  try {
    const destination = await db.destination.findUnique({
      where: { id: destinationId },
    });

    if (!destination) {
      return { success: false, error: "Destination not found" };
    }

    return { success: true, data: destination };
  } catch (error) {
    return { success: false, error: "Failed to fetch destination" };
  }
}

export async function saveDestination(userId: string, destinationId: string) {
  try {
    const saved = await db.savedDestination.create({
      data: {
        userId,
        destinationId,
      },
    });

    revalidatePath("/search/cities");

    return { success: true, data: saved };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Destination already saved" };
    }
    return { success: false, error: "Failed to save destination" };
  }
}

export async function unsaveDestination(userId: string, destinationId: string) {
  try {
    await db.savedDestination.delete({
      where: {
        userId_destinationId: {
          userId,
          destinationId,
        },
      },
    });

    revalidatePath("/search/cities");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to unsave destination" };
  }
}

export async function getSavedDestinations(userId: string) {
  try {
    const saved = await db.savedDestination.findMany({
      where: { userId },
      include: { destination: true },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: saved.map((s) => s.destination) };
  } catch (error) {
    return { success: false, error: "Failed to fetch saved destinations" };
  }
}

export async function isDestinationSaved(userId: string, destinationId: string) {
  try {
    const saved = await db.savedDestination.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId,
        },
      },
    });

    return { success: true, data: !!saved };
  } catch (error) {
    return { success: false, error: "Failed to check saved status" };
  }
}

const searchActivitiesSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  categoryId: z.string().optional(),
  minCost: z.number().optional(),
  maxCost: z.number().optional(),
  minRating: z.number().optional(),
  isIndoor: z.boolean().optional(),
  isFamilyFriendly: z.boolean().optional(),
  adventureLevel: z.enum(["easy", "moderate", "challenging"]).optional(),
  sortBy: z.enum(["name", "cost", "rating"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().min(1).max(50).optional(),
  offset: z.number().min(0).optional(),
});

export type SearchActivitiesParams = z.infer<typeof searchActivitiesSchema>;

export async function searchActivities(params: SearchActivitiesParams) {
  try {
    const validated = searchActivitiesSchema.parse(params);

    const where: any = {};

    if (validated.query) {
      where.OR = [
        { name: { contains: validated.query, mode: "insensitive" } },
        { description: { contains: validated.query, mode: "insensitive" } },
        { location: { contains: validated.query, mode: "insensitive" } },
      ];
    }

    if (validated.location) {
      where.location = { contains: validated.location, mode: "insensitive" };
    }

    if (validated.categoryId) {
      where.categoryId = validated.categoryId;
    }

    if (validated.minCost || validated.maxCost) {
      where.cost = {};
      if (validated.minCost) where.cost.gte = validated.minCost;
      if (validated.maxCost) where.cost.lte = validated.maxCost;
    }

    if (validated.minRating) {
      where.rating = { gte: validated.minRating };
    }

    if (validated.isIndoor !== undefined) {
      where.isIndoor = validated.isIndoor;
    }

    if (validated.isFamilyFriendly !== undefined) {
      where.isFamilyFriendly = validated.isFamilyFriendly;
    }

    if (validated.adventureLevel) {
      where.adventureLevel = validated.adventureLevel;
    }

    const orderBy: any = {};
    if (validated.sortBy) {
      orderBy[validated.sortBy] = validated.sortOrder || "asc";
    } else {
      orderBy.rating = "desc";
    }

    const limit = validated.limit || 20;
    const offset = validated.offset || 0;

    const [activities, total] = await Promise.all([
      db.activity.findMany({
        where,
        include: { category: true },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.activity.count({ where }),
    ]);

    return {
      success: true,
      data: {
        activities,
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to search activities" };
  }
}

export async function getActivity(activityId: string) {
  try {
    const activity = await db.activity.findUnique({
      where: { id: activityId },
      include: { category: true },
    });

    if (!activity) {
      return { success: false, error: "Activity not found" };
    }

    return { success: true, data: activity };
  } catch (error) {
    return { success: false, error: "Failed to fetch activity" };
  }
}

export async function getActivityCategories() {
  try {
    const categories = await db.activityCategory.findMany({
      orderBy: { name: "asc" },
    });

    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getRegions() {
  try {
    const destinations = await db.destination.findMany({
      select: { region: true },
      distinct: ["region"],
      orderBy: { region: "asc" },
    });

    return { success: true, data: destinations.map((d) => d.region) };
  } catch (error) {
    return { success: false, error: "Failed to fetch regions" };
  }
}

export async function getCountries() {
  try {
    const destinations = await db.destination.findMany({
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    });

    return { success: true, data: destinations.map((d) => d.country) };
  } catch (error) {
    return { success: false, error: "Failed to fetch countries" };
  }
}