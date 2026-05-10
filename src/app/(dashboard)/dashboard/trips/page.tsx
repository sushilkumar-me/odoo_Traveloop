import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MapPin,
  Calendar,
  Wallet,
  Globe,
  Building,
  Plane,
} from "lucide-react";

export default async function TripsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      trips: {
        orderBy: { createdAt: "desc" },
        include: {
          cities: true,
          budgets: {
            include: { expenses: true },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const trips = user.trips;
  const now = new Date();

  const totalTrips = trips.length;
  const upcomingCount = trips.filter((t) => new Date(t.startDate) > now).length;
  const completedCount = trips.filter((t) => new Date(t.endDate) < now).length;
  const uniqueCountries = new Set(
    trips.flatMap((t) => t.cities.map((c) => c.country))
  ).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff9f5a] flex items-center justify-center">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm text-[#ff7a1a] font-medium">All Journeys</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">My Trips</h1>
          <p className="text-gray-500">
            {totalTrips === 0
              ? "No trips yet — start planning your first adventure!"
              : `${totalTrips} trip${totalTrips !== 1 ? "s" : ""} planned`}
          </p>
        </div>

        <Button asChild className="h-12 px-6 bg-[#ff7a1a] hover:bg-[#e66b15] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25">
  <Link href="/plan-trip">
    
            <Plus className="h-5 w-5 mr-2" />
            New Trip
          
  </Link>
</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Trips",
            value: totalTrips,
            icon: MapPin,
            gradient: "from-[#ff7a1a] to-[#ff9f5a]",
          },
          {
            label: "Upcoming",
            value: upcomingCount,
            icon: Calendar,
            gradient: "from-green-500 to-green-600",
          },
          {
            label: "Completed",
            value: completedCount,
            icon: Globe,
            gradient: "from-cyan-500 to-cyan-600",
          },
          {
            label: "Countries",
            value: uniqueCountries,
            icon: Building,
            gradient: "from-purple-500 to-purple-600",
          },
        ].map(({ label, value, icon: Icon, gradient }) => (
          <Card key={label} className="border-0 shadow-lg shadow-gray-200/50">
            <CardContent className="p-6">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
              <Globe className="h-10 w-10 text-[#ff7a1a]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No trips yet
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start your adventure! Create your first trip and begin exploring
              the world.
            </p>
            <Button asChild className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white font-semibold px-8 py-3 rounded-xl">
  <Link href="/plan-trip">
    
                <Plus className="h-5 w-5 mr-2" />
                Plan Your First Trip
              
  </Link>
</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const isPast = new Date(trip.endDate) < now;
            const isUpcoming = new Date(trip.startDate) > now;
            const isOngoing = !isPast && !isUpcoming;
            const budget = trip.budgets[0]?.totalAmount || 0;
            const spent = trip.budgets[0]?.expenses.reduce(
              (s, e) => s + e.amount,
              0
            ) || 0;

            return (
              <div
                key={trip.id}
                className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Cover Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={
                      trip.coverImage ||
                      "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=400&fit=crop"
                    }
                    alt={trip.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${
                        isPast
                          ? "bg-gray-500/90 text-white"
                          : isOngoing
                          ? "bg-yellow-500/90 text-white"
                          : "bg-green-500/90 text-white"
                      }`}
                    >
                      {isPast ? "Completed" : isOngoing ? "In Progress" : "Upcoming"}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#ff7a1a] transition-colors mb-2">
                    {trip.name}
                  </h3>
                  {trip.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {trip.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        →{" "}
                        {new Date(trip.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {trip.cities.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {trip.cities.map((c) => c.name).join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Wallet className="h-4 w-4 text-[#ff7a1a]" />
                        <span className="font-semibold text-gray-700">
                          {budget > 0 ? `₹${budget.toLocaleString("en-US")}` : "No budget set"}
                        </span>
                        {budget > 0 && <span className="text-gray-400">budget</span>}
                      </div>
                      {spent > 0 && (
                        <span className="text-xs text-gray-400">
                          ₹{spent.toLocaleString("en-US")} spent
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer Actions */}
                  <div className="flex items-center gap-2 mt-4 border-t border-gray-100 pt-4">
                    <Button asChild size="sm" variant="outline" className="w-full gap-2">
  <Link href={`/dashboard/trips/${trip.id}`} className="flex-1">
    
                        View Itinerary
                      
  </Link>
</Button>
                    <Button asChild size="sm" variant="ghost" className="text-gray-500 hover:text-[#ff7a1a] hover:bg-orange-50 p-2">
  <Link href={`/dashboard/trips/${trip.id}/budget`} title="Budget Dashboard">
    
                        <Wallet className="h-4 w-4" />
                      
  </Link>
</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
