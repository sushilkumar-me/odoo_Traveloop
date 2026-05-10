import { z } from "zod";

// Trip schemas
export const createTripSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  coverImage: z.string().url().optional(),
});

export const updateTripSchema = createTripSchema.partial();

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

// City schemas
export const createCitySchema = z.object({
  name: z.string().min(1, "City name is required"),
  country: z.string().min(1, "Country is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  order: z.number().int().optional(),
});

export type CreateCityInput = z.infer<typeof createCitySchema>;

// Activity schemas
export const createActivitySchema = z.object({
  name: z.string().min(1, "Activity name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.coerce.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  cost: z.number().positive().optional(),
  currency: z.string().default("USD"),
  category: z.string().optional(),
  notes: z.string().optional(),
  cityId: z.string().optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;

// Budget schemas
export const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  totalAmount: z.number().positive("Budget amount must be positive"),
  currency: z.string().default("USD"),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

// Expense schemas
export const createExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().optional(),
  date: z.coerce.date(),
  budgetId: z.string(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

// Packing item schemas
export const createPackingItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().int().positive().default(1),
  category: z.string().optional(),
});

export type CreatePackingItemInput = z.infer<typeof createPackingItemSchema>;

// Note schemas
export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tripId: z.string(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;