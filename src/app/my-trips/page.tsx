import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MyTripsContent } from "./my-trips-content";

export default async function MyTripsPage() {
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
          budgets: {
            include: { expenses: true },
          },
          cities: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <MyTripsContent user={user} />;
}
