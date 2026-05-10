// Application configuration

export const appConfig = {
  name: "Traveloop",
  description: "A personalized travel planning application",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

// Auth configuration
export const authConfig = {
  secret: process.env.BETTER_AUTH_SECRET || "",
  url: process.env.BETTER_AUTH_URL || "http://localhost:3000",
};

// Database configuration
export const dbConfig = {
  url: process.env.DATABASE_URL || "",
};

// Feature flags
export const features = {
  enableSharing: true,
  enableAdmin: true,
  enableBudget: true,
  enablePacking: true,
  enableNotes: true,
};

// Pagination defaults
export const pagination = {
  defaultLimit: 20,
  maxLimit: 100,
};

// Date formats
export const dateFormats = {
  short: "MMM d, yyyy",
  long: "MMMM d, yyyy",
  time: "h:mm a",
  dateTime: "MMM d, yyyy h:mm a",
};

// Currency configuration
export const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"] as const;
export type Currency = (typeof currencies)[number];