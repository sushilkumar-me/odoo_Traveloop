import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BudgetClient from "./budget-client";

export default async function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const trip = await db.trip.findFirst({
    where: { 
      id: tripId,
      user: { email: session.user.email }
    },
    include: {
      budgets: {
        include: { expenses: true },
      },
      cities: true,
    },
  });

  if (!trip) redirect("/dashboard/trips");

  // We wrap the single trip in an array to reuse the existing aggregation logic
  const user = { trips: [trip] };

  let totalBudget = 0;
  let totalCost = 0;
  let totalDays = 0;
  const uniqueCities = new Set<string>();

  const categoryMap: Record<string, number> = {
    Transport: 0,
    Stay: 0,
    Meals: 0,
    Activities: 0,
    Shopping: 0,
    Other: 0,
  };

  const daysMap = new Map<string, any>();
  const overBudgetDays: any[] = [];

  user.trips.forEach((trip) => {
    // calculate trip days
    const tDays = Math.max(
      1,
      Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))
    );
    totalDays += tDays;

    trip.cities.forEach((c) => uniqueCities.add(c.name));

    let tripBudget = 0;
    trip.budgets.forEach((b) => {
      tripBudget += b.totalAmount;
      totalBudget += b.totalAmount;

      b.expenses.forEach((e) => {
        totalCost += e.amount;

        // Category breakdown normalization
        let cat = e.category || "Other";
        const lowerCat = cat.toLowerCase();
        if (lowerCat.includes("transport") || lowerCat.includes("flight") || lowerCat.includes("bus")) cat = "Transport";
        else if (lowerCat.includes("stay") || lowerCat.includes("hotel") || lowerCat.includes("airbnb")) cat = "Stay";
        else if (lowerCat.includes("meal") || lowerCat.includes("food") || lowerCat.includes("dining")) cat = "Meals";
        else if (lowerCat.includes("activit") || lowerCat.includes("tour") || lowerCat.includes("ticket")) cat = "Activities";
        else if (lowerCat.includes("shop")) cat = "Shopping";
        else cat = "Other";

        if (categoryMap[cat] !== undefined) categoryMap[cat] += e.amount;
        else categoryMap.Other += e.amount;

        // Daily breakdown
        const dateStr = new Date(e.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        if (!daysMap.has(dateStr)) {
          // Try to find the active city for this date
          let activeCity = "Multiple / Traveling";
          for (const city of trip.cities) {
            if (new Date(e.date) >= new Date(city.startDate) && new Date(e.date) <= new Date(city.endDate)) {
              activeCity = city.name;
              break;
            }
          }
          if (trip.cities.length === 1) activeCity = trip.cities[0].name;

          daysMap.set(dateStr, {
            day: dateStr,
            city: activeCity,
            transport: 0,
            stay: 0,
            activities: 0,
            meals: 0,
            total: 0,
            dailyBudget: 0, // Assigned below
            tripName: trip.name,
          });
        }

        const dayObj = daysMap.get(dateStr);
        dayObj.total += e.amount;
        dayObj.dailyBudget = tripBudget > 0 ? Math.round(tripBudget / tDays) : 0;

        if (cat === "Transport") dayObj.transport += e.amount;
        else if (cat === "Stay") dayObj.stay += e.amount;
        else if (cat === "Activities") dayObj.activities += e.amount;
        else if (cat === "Meals") dayObj.meals += e.amount;
      });
    });
  });

  const dailyData = Array.from(daysMap.values()).sort(
    (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
  );

  // Over budget
  dailyData.forEach((d) => {
    if (d.dailyBudget > 0 && d.total > d.dailyBudget) {
      overBudgetDays.push(d);
    }
  });

  const sortedByCost = [...dailyData].sort((a, b) => b.total - a.total);
  const mostExpensiveCity = sortedByCost.length > 0 ? sortedByCost[0].city : "—";
  const cheapestDay = sortedByCost.length > 0 ? sortedByCost[sortedByCost.length - 1].day : "—";

  const remainingBudget = totalBudget - totalCost;
  const avgPerDay = totalDays > 0 ? Math.round(totalCost / totalDays) : 0;

  const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#94a3b8"];
  const categoryData = Object.entries(categoryMap)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]) // Sort largest first
    .map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length],
    }));

  return (
    <BudgetClient
      tripId={tripId}
      totalCost={totalCost}
      totalBudget={totalBudget}
      remainingBudget={remainingBudget}
      avgPerDay={avgPerDay}
      totalDays={totalDays}
      uniqueCitiesCount={uniqueCities.size}
      mostExpensiveCity={mostExpensiveCity}
      cheapestDay={cheapestDay}
      categoryData={categoryData}
      dailyData={dailyData}
      overBudgetDays={overBudgetDays}
    />
  );
}
