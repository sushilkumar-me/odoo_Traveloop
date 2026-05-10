"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function setTripBudget(tripId: string, amount: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");

    // Check if budget exists for this trip
    const existingBudget = await db.budget.findFirst({
      where: { tripId, userId: user.id },
    });

    if (existingBudget) {
      await db.budget.update({
        where: { id: existingBudget.id },
        data: { totalAmount: amount },
      });
    } else {
      await db.budget.create({
        data: {
          trip: { connect: { id: tripId } },
          user: { connect: { id: user.id } },
          name: "Main Budget",
          totalAmount: amount,
          currency: "INR",
        },
      });
    }

    revalidatePath(`/dashboard/trips/${tripId}/budget`);
    revalidatePath(`/dashboard/trips`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addExpense(
  tripId: string,
  data: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");

    let budget = await db.budget.findFirst({
      where: { tripId, userId: user.id },
    });

    if (!budget) {
      budget = await db.budget.create({
        data: {
          trip: { connect: { id: tripId } },
          user: { connect: { id: user.id } },
          name: "Main Budget",
          totalAmount: 0,
        },
      });
    }

    await db.expense.create({
      data: {
        budget: { connect: { id: budget.id } },
        user: { connect: { id: user.id } },
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: new Date(data.date),
      },
    });

    revalidatePath(`/dashboard/trips/${tripId}/budget`);
    revalidatePath(`/dashboard/trips`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
