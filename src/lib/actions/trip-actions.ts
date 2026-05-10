"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResponse } from "@/types";

const createTripSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  coverImage: z.string().optional(),
});

export async function createTrip(data: z.infer<typeof createTripSchema>) {
  try {
    // Validate input
    const validated = createTripSchema.parse(data);

    // Check date validity
    if (validated.endDate < validated.startDate) {
      return { success: false, error: "End date must be after start date" };
    }

    // TODO: Get userId from session (better-auth)
    const userId = "demo-user-id";

    // Create trip
    const trip = await db.trip.create({
      data: {
        ...validated,
        userId,
      },
    });

    // Revalidate paths
    revalidatePath("/dashboard/trips");

    return { success: true, data: trip };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create trip" };
  }
}

export async function getTrips(userId: string) {
  try {
    const trips = await db.trip.findMany({
      where: { userId },
      include: {
        cities: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            activities: true,
            notes: true,
            packingItems: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: trips };
  } catch (error) {
    return { success: false, error: "Failed to fetch trips" };
  }
}

export async function getTrip(tripId: string) {
  try {
    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: {
        cities: {
          orderBy: { order: "asc" },
        },
        activities: {
          include: { city: true },
          orderBy: [{ date: "asc" }, { order: "asc" }],
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        packingItems: {
          orderBy: { category: "asc" },
        },
        budgets: {
          include: {
            expenses: {
              orderBy: { date: "desc" },
            },
          },
        },
      },
    });

    if (!trip) {
      return { success: false, error: "Trip not found" };
    }

    return { success: true, data: trip };
  } catch (error) {
    return { success: false, error: "Failed to fetch trip" };
  }
}

export async function deleteTrip(tripId: string) {
  try {
    await db.trip.delete({
      where: { id: tripId },
    });

    revalidatePath("/dashboard/trips");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete trip" };
  }
}

export async function updateTrip(
  tripId: string,
  data: Partial<z.infer<typeof createTripSchema>>
) {
  try {
    const trip = await db.trip.update({
      where: { id: tripId },
      data,
    });

    revalidatePath(`/dashboard/trips/${tripId}`);

    return { success: true, data: trip };
  } catch (error) {
    return { success: false, error: "Failed to update trip" };
  }
}