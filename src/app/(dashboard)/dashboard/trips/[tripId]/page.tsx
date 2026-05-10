import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ItineraryView } from "./itinerary-view";

interface PageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripItineraryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { tripId } = await params;

  const trip = await db.trip.findFirst({
    where: {
      id: tripId,
      user: { email: session.user.email },
    },
    include: {
      cities: {
        orderBy: { order: "asc" },
        include: {
          activities: {
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
          },
        },
      },
      activities: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
      budgets: {
        include: { expenses: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!trip) {
    notFound();
  }

  // Get all user's trips for the summary section
  const allUserTrips = await db.trip.findMany({
    where: { user: { email: session.user.email } },
    include: {
      cities: true,
      budgets: { include: { expenses: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return <ItineraryView trip={trip} allUserTrips={allUserTrips} />;
}