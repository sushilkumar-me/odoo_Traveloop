import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Calendar, Wallet, CheckSquare, BookOpen, TrendingUp, Users } from "lucide-react";

const quickActions = [
  { icon: Plus, label: "Create Trip", href: "/dashboard/trips/new" },
  { icon: MapPin, label: "View Trips", href: "/dashboard/trips" },
  { icon: Calendar, label: "Itineraries", href: "/dashboard/trips" },
  { icon: Wallet, label: "Budgets", href: "/dashboard/trips" },
];

const stats = [
  { label: "Total Trips", value: "12", icon: MapPin, color: "text-blue-500" },
  { label: "Upcoming", value: "3", icon: Calendar, color: "text-green-500" },
  { label: "Total Budget", value: "$8,450", icon: Wallet, color: "text-purple-500" },
  { label: "Places Visited", value: "28", icon: TrendingUp, color: "text-orange-500" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your travel overview.</p>
        </div>
        <Link href="/dashboard/trips/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into your most common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button variant="outline" className="w-full gap-2 h-20 flex flex-col">
                  <action.icon className="h-6 w-6" />
                  <span>{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity / Upcoming Trips placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
            <CardDescription>Your next adventures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg border">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Paris Adventure</p>
                  <p className="text-sm text-muted-foreground">Jun 15 - Jun 22, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Tokyo Exploration</p>
                  <p className="text-sm text-muted-foreground">Aug 1 - Aug 10, 2025</p>
                </div>
              </div>
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
              <div className="p-3 rounded-lg border">
                <p className="font-medium">Best ramen spot in Tokyo</p>
                <p className="text-sm text-muted-foreground">Found an amazing place in Shibuya...</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="font-medium">Paris itinerary update</p>
                <p className="text-sm text-muted-foreground">Changed museum day to Tuesday...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}