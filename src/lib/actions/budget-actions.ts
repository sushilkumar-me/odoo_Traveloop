"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function setTripBudget(tripId: string, amount: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    // Check if budget exists for this trip
    const existingBudget = await db.budget.findFirst({
      where: { tripId },
    });

    if (existingBudget) {
      await db.budget.update({
        where: { id: existingBudget.id },
        data: { totalAmount: amount },
      });
    } else {
      await db.budget.create({
        data: {
          tripId,
          name: "Main Budget",
          totalAmount: amount,
          currency: "USD",
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

    let budget = await db.budget.findFirst({
      where: { tripId },
    });

    if (!budget) {
      budget = await db.budget.create({
        data: {
          tripId,
          name: "Main Budget",
          totalAmount: 0,
        },
      });
    }

    await db.expense.create({
      data: {
        budgetId: budget.id,
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
