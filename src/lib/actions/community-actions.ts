"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getCommunityTrips(params: {
  search?: string;
  region?: string;
  travelType?: string;
  minBudget?: number;
  maxBudget?: number;
  sortBy?: "newest" | "popular" | "likes" | "budget";
  limit?: number;
  offset?: number;
}) {
  try {
    const { search, region, travelType, minBudget, maxBudget, sortBy, limit = 20, offset = 0 } = params;

    const where: any = {
      isPublic: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { cities: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (region) {
      where.cities = { some: { country: region } };
    }

    if (travelType) {
      where.travelType = travelType;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "popular") {
      orderBy = { likes: { _count: "desc" } };
    } else if (sortBy === "likes") {
      orderBy = { likes: { _count: "desc" } };
    } else if (sortBy === "budget") {
      orderBy = { budgets: { _sum: { totalAmount: "asc" } } };
    }

    const [trips, total] = await Promise.all([
      db.trip.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          cities: {
            orderBy: { order: "asc" },
            take: 3,
          },
          _count: {
            select: { likes: true, bookmarks: true, activities: true },
          },
          budgets: {
            select: { totalAmount: true },
            take: 1,
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.trip.count({ where }),
    ]);

    return {
      success: true,
      data: {
        trips: trips.map((trip) => ({
          ...trip,
          totalBudget: trip.budgets[0]?.totalAmount || 0,
          destinationCount: trip.cities.length,
        })),
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("Error fetching community trips:", error);
    return { success: false, error: "Failed to fetch trips" };
  }
}

export async function getSharedTrip(shareId: string) {
  try {
    const trip = await db.trip.findUnique({
      where: { shareId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        cities: {
          orderBy: { order: "asc" },
          include: {
            activities: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        activities: {
          include: { category: true },
          orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        budgets: {
          include: {
            expenses: {
              orderBy: { date: "asc" },
            },
          },
        },
        _count: {
          select: { likes: true, bookmarks: true, activities: true },
        },
      },
    });

    if (!trip) {
      return { success: false, error: "Trip not found" };
    }

    // Check if private and user doesn't own it
    if (!trip.isPublic && !trip.shareId) {
      return { success: false, error: "This trip is private" };
    }

    return { success: true, data: trip };
  } catch (error) {
    console.error("Error fetching shared trip:", error);
    return { success: false, error: "Failed to fetch trip" };
  }
}

export async function toggleLike(userId: string, tripId: string) {
  try {
    const existing = await db.tripLike.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (existing) {
      await db.tripLike.delete({
        where: { id: existing.id },
      });
      return { success: true, data: false };
    } else {
      await db.tripLike.create({
        data: { userId, tripId },
      });
      return { success: true, data: true };
    }
  } catch (error) {
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function toggleBookmark(userId: string, tripId: string) {
  try {
    const existing = await db.tripBookmark.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (existing) {
      await db.tripBookmark.delete({
        where: { id: existing.id },
      });
      return { success: true, data: false };
    } else {
      await db.tripBookmark.create({
        data: { userId, tripId },
      });
      return { success: true, data: true };
    }
  } catch (error) {
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

export async function checkLikeStatus(userId: string, tripId: string) {
  try {
    const like = await db.tripLike.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });
    const bookmark = await db.tripBookmark.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });
    return { success: true, data: { isLiked: !!like, isBookmarked: !!bookmark } };
  } catch (error) {
    return { success: false, error: "Failed to check status" };
  }
}

export async function copyTrip(userId: string, tripId: string) {
  try {
    const originalTrip = await db.trip.findUnique({
      where: { id: tripId },
      include: {
        cities: {
          include: { activities: true },
        },
        activities: true,
        notes: true,
        budgets: {
          include: { expenses: true },
        },
        packingItems: true,
      },
    });

    if (!originalTrip) {
      return { success: false, error: "Trip not found" };
    }

    // Create new trip with copied data
    const newTrip = await db.trip.create({
      data: {
        name: `${originalTrip.name} (Copy)`,
        description: originalTrip.description,
        startDate: originalTrip.startDate,
        endDate: originalTrip.endDate,
        coverImage: originalTrip.coverImage,
        isPublic: false,
        userId,
      },
    });

    // Copy cities
    for (const city of originalTrip.cities) {
      await db.city.create({
        data: {
          name: city.name,
          country: city.country,
          startDate: city.startDate,
          endDate: city.endDate,
          order: city.order,
          tripId: newTrip.id,
        },
      });
    }

    // Copy budget
    if (originalTrip.budgets.length > 0) {
      const originalBudget = originalTrip.budgets[0];
      await db.budget.create({
        data: {
          name: originalBudget.name,
          totalAmount: originalBudget.totalAmount,
          currency: originalBudget.currency,
          tripId: newTrip.id,
          userId,
        },
      });
    }

    revalidatePath("/my-trips");
    return { success: true, data: newTrip };
  } catch (error) {
    console.error("Error copying trip:", error);
    return { success: false, error: "Failed to copy trip" };
  }
}

export async function makeTripPublic(tripId: string) {
  try {
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const trip = await db.trip.update({
      where: { id: tripId },
      data: { isPublic: true, shareId },
    });

    revalidatePath("/my-trips");
    return { success: true, data: trip };
  } catch (error) {
    return { success: false, error: "Failed to make trip public" };
  }
}

export async function makeTripPrivate(tripId: string) {
  try {
    const trip = await db.trip.update({
      where: { id: tripId },
      data: { isPublic: false, shareId: null },
    });

    revalidatePath("/my-trips");
    return { success: true, data: trip };
  } catch (error) {
    return { success: false, error: "Failed to make trip private" };
  }
}

export async function getUserLikedTrips(userId: string) {
  try {
    const likes = await db.tripLike.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            cities: { take: 2 },
            _count: { select: { likes: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: likes.map((l) => l.trip) };
  } catch (error) {
    return { success: false, error: "Failed to fetch liked trips" };
  }
}

export async function getUserBookmarkedTrips(userId: string) {
  try {
    const bookmarks = await db.tripBookmark.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            cities: { take: 2 },
            _count: { select: { bookmarks: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: bookmarks.map((b) => b.trip) };
  } catch (error) {
    return { success: false, error: "Failed to fetch bookmarked trips" };
  }
}