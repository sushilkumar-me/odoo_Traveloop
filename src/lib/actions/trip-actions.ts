"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const createTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  coverImage: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
});

export async function createTrip(data: z.infer<typeof createTripSchema>) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "You must be logged in to create a trip" };
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate input
    const validated = createTripSchema.parse(data);

    // Check date validity
    if (validated.endDate < validated.startDate) {
      return { success: false, error: "End date must be after start date" };
    }

    // Create trip (and optionally a budget) in a transaction
    const trip = await db.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          name: validated.name,
          description: validated.description,
          startDate: validated.startDate,
          endDate: validated.endDate,
          coverImage: validated.coverImage,
          userId: user.id,
        },
      });

      // Create a budget if amount was provided
      if (validated.budget && validated.budget > 0) {
        await tx.budget.create({
          data: {
            name: `${validated.name} Budget`,
            totalAmount: validated.budget,
            currency: user.currency || "USD",
            tripId: newTrip.id,
            userId: user.id,
          },
        });
      }

      return newTrip;
    });

    revalidatePath("/dashboard/trips");
    revalidatePath("/my-trips");

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

export async function addCityToTrip(
  tripId: string,
  data: { name: string; country: string; startDate: Date; endDate: Date }
) {
  try {
    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: { cities: true },
    });
    if (!trip) throw new Error("Trip not found");

    const order = trip.cities.length;

    await db.city.create({
      data: {
        tripId,
        name: data.name,
        country: data.country,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        order,
      },
    });

    revalidatePath(`/dashboard/trips/${tripId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add city" };
  }
}

export async function addActivityToCity(
  cityId: string,
  tripId: string,
  data: {
    name: string;
    description?: string;
    location?: string;
    cost?: number;
    duration?: string;
    date?: string;
    time?: string;
  }
) {
  try {
    // We add a unique hash because the Activity schema currently enforces @unique on the name field globally.
    const uniqueName = `${data.name}#${Math.random().toString(36).substring(2, 8)}`;

    await db.activity.create({
      data: {
        cityId,
        tripId,
        name: uniqueName,
        description: data.description,
        location: data.location,
        cost: data.cost ? Number(data.cost) : null,
        duration: data.duration,
        date: data.date ? new Date(data.date) : null,
        time: data.time || null,
      },
    });
    revalidatePath(`/dashboard/trips/${tripId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add activity" };
  }
}

export async function reorderCities(tripId: string, orderedCityIds: string[]) {
  try {
    // Run all updates in a transaction
    await db.$transaction(
      orderedCityIds.map((id, index) =>
        db.city.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    revalidatePath(`/dashboard/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to reorder cities" };
  }
}

export async function removeCityFromTrip(cityId: string, tripId: string) {
  try {
    await db.activity.deleteMany({ where: { cityId } });
    await db.city.delete({ where: { id: cityId } });
    revalidatePath(`/dashboard/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete stop" };
  }
}

export async function removeActivity(activityId: string, tripId: string) {
  try {
    await db.activity.delete({ where: { id: activityId } });
    revalidatePath(`/dashboard/trips/${tripId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete activity" };
  }
}