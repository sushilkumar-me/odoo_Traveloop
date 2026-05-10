import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Calendar, Wallet, TrendingUp, User } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      trips: {
        orderBy: { startDate: "asc" },
        take: 5,
      },
      notes: {
        orderBy: { updatedAt: "desc" },
        take: 3,
      },
      budgets: {
        include: {
          expenses: true,
        },
      },
    },
  });

  const userName = user?.name || "Traveler";
  const userEmail = user?.email || "";

  // Calculate stats
  const totalTrips = user?.trips.length || 0;
  const now = new Date();
  const upcomingTrips = user?.trips.filter(trip => new Date(trip.startDate) > now).length || 0;
  const totalBudget = user?.budgets.reduce((sum, b) => sum + b.totalAmount, 0) || 0;
  const totalSpent = user?.budgets.reduce((sum, b) => sum + b.expenses.reduce((s, e) => s + e.amount, 0), 0) || 0;
  const placesVisited = totalTrips; // Can be calculated from unique cities later

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userName}! Here&apos;s your travel overview.</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        </div>
        <Link href="/plan-trip">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrips}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTrips}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into your most common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/plan-trip">
              <Button variant="outline" className="w-full gap-2 h-20 flex flex-col">
                <Plus className="h-6 w-6" />
                <span>Create Trip</span>
              </Button>
            </Link>
            <Link href="/dashboard/trips">
              <Button variant="outline" className="w-full gap-2 h-20 flex flex-col">
                <MapPin className="h-6 w-6" />
                <span>View Trips</span>
              </Button>
            </Link>
            <Link href="/dashboard/trips">
              <Button variant="outline" className="w-full gap-2 h-20 flex flex-col">
                <Calendar className="h-6 w-6" />
                <span>Itineraries</span>
              </Button>
            </Link>
            <Link href="/dashboard/trips">
              <Button variant="outline" className="w-full gap-2 h-20 flex flex-col">
                <Wallet className="h-6 w-6" />
                <span>Budgets</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity / Upcoming Trips */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
            <CardDescription>Your next adventures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.trips.filter(trip => new Date(trip.startDate) > now).length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming trips planned.</p>
              ) : (
                user?.trips
                  .filter(trip => new Date(trip.startDate) > now)
                  .slice(0, 3)
                  .map((trip) => (
                    <div key={trip.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <MapPin className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{trip.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>Your latest travel memories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet. Start planning your trips!</p>
              ) : (
                user?.notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg border">
                    <p className="font-medium">{note.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}